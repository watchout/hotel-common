import express from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../../auth/middleware';
import { hotelDb } from '../../../database';
import { broadcastRoomOperation } from '../../../events/room-operation-broadcaster';
import { ReservationService } from '../../../services/reservation.service';
import { StandardResponseBuilder } from '../../../standards/api-standards';
import { HotelLogger } from '../../../utils/logger';

import type { Request, Response } from 'express';

const router = express.Router();
const logger = HotelLogger.getInstance();

/**
 * ゲスト情報スキーマ
 */
const GuestInfoSchema = z.object({
  name: z.string().min(1, 'ゲスト名は必須です'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  idType: z.enum(['passport', 'license', 'id_card']).optional(),
  idNumber: z.string().optional()
});

/**
 * 統合チェックインリクエストスキーマ
 */
const UnifiedCheckinSchema = z.object({
  // 予約ベースチェックイン用
  reservationId: z.string().optional(),
  
  // ウォークインチェックイン用
  roomNumber: z.string().optional(),
  roomId: z.string().optional(),
  
  // 共通項目
  checkinDate: z.string().datetime().optional(), // ISO 8601形式
  checkoutDate: z.string().datetime().optional(),
  guestCount: z.number().min(1).max(10).default(1),
  guests: z.array(GuestInfoSchema).min(1, '最低1名のゲスト情報が必要です'),
  notes: z.string().optional(),
  specialRequests: z.string().optional(),
  
  // 料金情報（ウォークイン用）
  roomRate: z.number().positive().optional(),
  totalAmount: z.number().positive().optional()
}).refine(
  (data) => data.reservationId || data.roomNumber || data.roomId,
  {
    message: "予約ID、客室番号、または客室IDのいずれかが必要です",
    path: ["reservationId"]
  }
);

/**
 * 統合チェックアウトリクエストスキーマ
 */
const AdditionalChargeSchema = z.object({
  description: z.string().min(1, '料金項目の説明は必須です'),
  amount: z.number().positive('料金は正の数である必要があります'),
  category: z.enum(['minibar', 'laundry', 'phone', 'parking', 'other']).default('other')
});

const UnifiedCheckoutSchema = z.object({
  // 予約ベースチェックアウト用
  reservationId: z.string().optional(),
  
  // 直接チェックアウト用
  roomNumber: z.string().optional(),
  roomId: z.string().optional(),
  
  // 共通項目
  checkoutDate: z.string().datetime().optional(), // ISO 8601形式
  additionalCharges: z.array(AdditionalChargeSchema).default([]),
  finalAmount: z.number().positive().optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'credit']).default('cash'),
  notes: z.string().optional(),
  
  // 客室状態
  roomCondition: z.enum(['clean', 'needs_cleaning', 'maintenance_required']).default('needs_cleaning')
}).refine(
  (data) => data.reservationId || data.roomNumber || data.roomId,
  {
    message: "予約ID、客室番号、または客室IDのいずれかが必要です",
    path: ["reservationId"]
  }
);

/**
 * 統合チェックインAPI
 * POST /api/v1/admin/front-desk/checkin
 * 
 * 予約ベース・ウォークイン両方に対応する統合チェックインエンドポイント
 */
router.post('/checkin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validatedData = UnifiedCheckinSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;
    const staffId = (req as any).user?.user_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    logger.info('統合チェックイン処理開始', {
      data: {
        tenant_id: tenantId,
        staff_id: staffId,
        type: validatedData.reservationId ? 'reservation-based' : 'walk-in',
        reservation_id: validatedData.reservationId,
        room_number: validatedData.roomNumber,
        room_id: validatedData.roomId,
        guest_count: validatedData.guestCount
      }
    });

    let result;

    if (validatedData.reservationId) {
      // 予約ベースチェックイン
      result = await handleReservationBasedCheckin(
        validatedData.reservationId,
        tenantId,
        validatedData,
        staffId
      );
    } else {
      // ウォークインチェックイン
      result = await handleWalkInCheckin(
        tenantId,
        validatedData,
        staffId
      );
    }

    logger.info('統合チェックイン処理完了', {
      data: {
        type: validatedData.reservationId ? 'reservation-based' : 'walk-in',
        reservation_id: result.id,
        room_number: validatedData.roomNumber || result.room?.roomNumber,
        guest_name: validatedData.guests[0].name
      }
    });

    // 明示的な操作ログ（CHECKIN）を記録
    try {
      await hotelDb.getAdapter().systemEvent.create({
        data: {
          id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          tenant_id: tenantId,
          user_id: staffId,
          event_type: 'ROOM_MANAGEMENT',
          source_system: 'hotel-common',
          target_system: 'hotel-common',
          entity_type: 'room',
          entity_id: (result as any).room?.id || validatedData.roomId || (validatedData.roomNumber || ''),
          action: 'CHECKIN',
          event_data: {
            reservation_id: (result as any).id,
            room_number: validatedData.roomNumber || (result as any).room?.roomNumber,
            guest_count: validatedData.guestCount,
            timestamp: new Date().toISOString()
          },
          status: 'COMPLETED'
        }
      })
      // WS配信（CHECKIN）
      try {
        await broadcastRoomOperation({
          tenant_id: tenantId,
          room_id: (result as any).room?.id || validatedData.roomId || '',
          room_number: validatedData.roomNumber || (result as any).room?.roomNumber,
          action: 'CHECKIN',
          details: { guest_count: validatedData.guestCount }
        })
      } catch {}
    } catch (e: unknown) {
      logger.warn('CHECKIN操作ログ記録に失敗（継続）', { error: e instanceof Error ? e.message : e })
    }

    return res.status(200).json(
      StandardResponseBuilder.success(res, {
        checkin: result,
        type: validatedData.reservationId ? 'reservation-based' : 'walk-in',
        message: 'チェックイン処理が完了しました'
      }).response
    );

  } catch (error: unknown) {
    logger.error('統合チェックイン処理エラー:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', 
          `入力データが不正です: ${error.errors.map(e => e.message).join(', ')}`).response
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          StandardResponseBuilder.error('RESOURCE_NOT_FOUND', error.message).response
        );
      }
      if (error.message.includes('already checked in')) {
        return res.status(409).json(
          StandardResponseBuilder.error('ALREADY_CHECKED_IN', error.message).response
        );
      }
    }

    return res.status(500).json(
      StandardResponseBuilder.error('CHECKIN_ERROR',
        error instanceof Error ? error.message : 'チェックイン処理に失敗しました').response
    );
  }
});

/**
 * 予約ベースチェックイン処理
 */
async function handleReservationBasedCheckin(
  reservationId: string,
  tenantId: string,
  data: z.infer<typeof UnifiedCheckinSchema>,
  staffId?: string
) {
  // 既存の予約を取得
  const existingReservation = await hotelDb.getAdapter().reservation.findUnique({
    where: {
      id: reservationId,
      tenantId,
      isDeleted: false
    },
    include: {
      room: true
    }
  });

  if (!existingReservation) {
    throw new Error(`予約が見つかりません: ${reservationId}`);
  }

  if (existingReservation.status === 'checked_in') {
    throw new Error('この予約は既にチェックイン済みです');
  }

  // 予約をチェックイン状態に更新
  const updatedReservation = await hotelDb.getAdapter().reservation.update({
    where: { id: reservationId },
    data: {
      status: 'checked_in',
      // ゲスト情報を更新（必要に応じて）
      guestName: data.guests[0].name,
      guestEmail: data.guests[0].email || existingReservation.guestEmail,
      guestPhone: data.guests[0].phone || existingReservation.guestPhone,
      notes: data.notes || existingReservation.notes,
      specialRequests: data.specialRequests || existingReservation.specialRequests,
      updatedAt: new Date()
    },
    include: {
      room: true
    }
  });

  // チェックインセッションを自動作成
  const session = await createCheckinSession(
    tenantId,
    reservationId,
    existingReservation.roomId,
    data,
    'reservation-based'
  );

  // 客室ステータスを占有中に更新
  if (existingReservation.room) {
    await hotelDb.getAdapter().room.update({
      where: { id: existingReservation.roomId },
      data: {
        status: 'occupied',
        updatedAt: new Date()
      }
    });
  }

  return { ...updatedReservation, session };
}

/**
 * ウォークインチェックイン処理
 */
async function handleWalkInCheckin(
  tenantId: string,
  data: z.infer<typeof UnifiedCheckinSchema>,
  staffId?: string
) {
  // 客室の取得・確認
  let room;
  if (data.roomId) {
    room = await hotelDb.getAdapter().room.findUnique({
      where: { id: data.roomId, tenantId }
    });
  } else if (data.roomNumber) {
    room = await hotelDb.getAdapter().room.findFirst({
      where: { 
        roomNumber: data.roomNumber, 
        tenantId,
        isDeleted: false
      }
    });
  }

  if (!room) {
    throw new Error(`指定された客室が見つかりません: ${data.roomNumber || data.roomId}`);
  }

  if (room.status !== 'available') {
    throw new Error(`客室 ${room.roomNumber} は利用できません（現在のステータス: ${room.status}）`);
  }

  // 確認番号生成
  const confirmationNumber = generateConfirmationNumber();

  // チェックイン日時の設定
  const checkinDate = data.checkinDate ? new Date(data.checkinDate) : new Date();
  const checkoutDate = data.checkoutDate ? new Date(data.checkoutDate) : 
    new Date(checkinDate.getTime() + 24 * 60 * 60 * 1000); // デフォルト1泊

  // 新規予約作成（ウォークイン）
  const newReservation = await hotelDb.getAdapter().reservation.create({
    data: {
      tenantId,
      roomId: room.id,
      guestName: data.guests[0].name,
      guestEmail: data.guests[0].email,
      guestPhone: data.guests[0].phone,
      checkinDate,
      checkoutDate,
      adults: data.guestCount,
      children: 0,
      status: 'checked_in', // 直接チェックイン状態で作成
      confirmationNumber,
      totalAmount: data.totalAmount || data.roomRate || 0,
      paidAmount: 0,
      notes: data.notes,
      specialRequests: data.specialRequests,
      createdBy: staffId
    },
    include: {
      room: true
    }
  });

  // チェックインセッションを自動作成
  const session = await createCheckinSession(
    tenantId,
    newReservation.id,
    room.id,
    data,
    'walk-in'
  );

  // 客室ステータスを占有中に更新
  await hotelDb.getAdapter().room.update({
    where: { id: room.id },
    data: {
      status: 'occupied',
      updatedAt: new Date()
    }
  });

  return { ...newReservation, session };
}

/**
 * 統合チェックアウトAPI
 * POST /api/v1/admin/front-desk/checkout
 * 
 * 予約ベース・直接チェックアウト両方に対応する統合チェックアウトエンドポイント
 */
router.post('/checkout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validatedData = UnifiedCheckoutSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;
    const staffId = (req as any).user?.user_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    logger.info('統合チェックアウト処理開始', {
      data: {
        tenant_id: tenantId,
        staff_id: staffId,
        type: validatedData.reservationId ? 'reservation-based' : 'direct',
        reservation_id: validatedData.reservationId,
        room_number: validatedData.roomNumber,
        room_id: validatedData.roomId,
        additional_charges: validatedData.additionalCharges.length
      }
    });

    let result;

    if (validatedData.reservationId) {
      // 予約ベースチェックアウト
      result = await handleReservationBasedCheckout(
        validatedData.reservationId,
        tenantId,
        validatedData,
        staffId
      );
    } else {
      // 直接チェックアウト
      result = await handleDirectCheckout(
        tenantId,
        validatedData,
        staffId
      );
    }

    logger.info('統合チェックアウト処理完了', {
      data: {
        type: validatedData.reservationId ? 'reservation-based' : 'direct',
        reservation_id: result.id,
        room_number: validatedData.roomNumber || result.room?.roomNumber,
        final_amount: result.totalAmount,
        payment_method: validatedData.paymentMethod
      }
    });

    // 明示的な操作ログ（CHECKOUT）を記録
    try {
      await hotelDb.getAdapter().systemEvent.create({
        data: {
          id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          tenant_id: tenantId,
          user_id: staffId,
          event_type: 'ROOM_MANAGEMENT',
          source_system: 'hotel-common',
          target_system: 'hotel-common',
          entity_type: 'room',
          entity_id: (result as any).room?.id || validatedData.roomId || (validatedData.roomNumber || ''),
          action: 'CHECKOUT',
          event_data: {
            reservation_id: (result as any).id,
            room_number: validatedData.roomNumber || (result as any).room?.roomNumber,
            final_amount: (result as any).totalAmount,
            payment_method: validatedData.paymentMethod,
            timestamp: new Date().toISOString()
          },
          status: 'COMPLETED'
        }
      })
      // WS配信（CHECKOUT）
      try {
        await broadcastRoomOperation({
          tenant_id: tenantId,
          room_id: (result as any).room?.id || validatedData.roomId || '',
          room_number: validatedData.roomNumber || (result as any).room?.roomNumber,
          action: 'CHECKOUT',
          details: { final_amount: (result as any).totalAmount, payment_method: validatedData.paymentMethod }
        })
      } catch {}
    } catch (e: unknown) {
      logger.warn('CHECKOUT操作ログ記録に失敗（継続）', { error: e instanceof Error ? e.message : e })
    }

    return res.status(200).json(
      StandardResponseBuilder.success(res, {
        checkout: result,
        type: validatedData.reservationId ? 'reservation-based' : 'direct',
        message: 'チェックアウト処理が完了しました'
      }).response
    );

  } catch (error: unknown) {
    logger.error('統合チェックアウト処理エラー:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', 
          `入力データが不正です: ${error.errors.map(e => e.message).join(', ')}`).response
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          StandardResponseBuilder.error('RESOURCE_NOT_FOUND', error.message).response
        );
      }
      if (error.message.includes('not checked in')) {
        return res.status(409).json(
          StandardResponseBuilder.error('NOT_CHECKED_IN', error.message).response
        );
      }
    }

    return res.status(500).json(
      StandardResponseBuilder.error('CHECKOUT_ERROR',
        error instanceof Error ? error.message : 'チェックアウト処理に失敗しました').response
    );
  }
});

/**
 * 予約ベースチェックアウト処理
 */
async function handleReservationBasedCheckout(
  reservationId: string,
  tenantId: string,
  data: z.infer<typeof UnifiedCheckoutSchema>,
  staffId?: string
) {
  // 既存の予約を取得
  const existingReservation = await hotelDb.getAdapter().reservation.findUnique({
    where: {
      id: reservationId,
      tenantId,
      isDeleted: false
    },
    include: {
      room: true
    }
  });

  if (!existingReservation) {
    throw new Error(`予約が見つかりません: ${reservationId}`);
  }

  if (existingReservation.status !== 'checked_in') {
    throw new Error('この予約はチェックイン状態ではありません');
  }

  // 追加料金の計算
  const additionalChargesTotal = data.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  const finalAmount = data.finalAmount || (existingReservation.totalAmount || 0) + additionalChargesTotal;

  // 予約をチェックアウト状態に更新
  const updatedReservation = await hotelDb.getAdapter().reservation.update({
    where: { id: reservationId },
    data: {
      status: 'checked_out',
      totalAmount: finalAmount,
      paidAmount: finalAmount, // チェックアウト時に全額支払い済みとする
      notes: data.notes || existingReservation.notes,
      updatedAt: new Date()
    },
    include: {
      room: true
    }
  });

  // チェックインセッションをチェックアウト状態に更新
  await updateSessionOnCheckout(tenantId, reservationId);

  // 客室ステータスを更新
  if (existingReservation.room) {
    const roomStatus = data.roomCondition === 'clean' ? 'available' : 
                      data.roomCondition === 'maintenance_required' ? 'maintenance' : 'cleaning';
    
    await hotelDb.getAdapter().room.update({
      where: { id: existingReservation.roomId },
      data: {
        status: roomStatus,
        updatedAt: new Date()
      }
    });
  }

  return updatedReservation;
}

/**
 * 直接チェックアウト処理
 */
async function handleDirectCheckout(
  tenantId: string,
  data: z.infer<typeof UnifiedCheckoutSchema>,
  staffId?: string
) {
  // 客室の取得・確認
  let room;
  if (data.roomId) {
    room = await hotelDb.getAdapter().room.findUnique({
      where: { id: data.roomId, tenantId }
    });
  } else if (data.roomNumber) {
    room = await hotelDb.getAdapter().room.findFirst({
      where: { 
        roomNumber: data.roomNumber, 
        tenantId,
        isDeleted: false
      }
    });
  }

  if (!room) {
    throw new Error(`指定された客室が見つかりません: ${data.roomNumber || data.roomId}`);
  }

  // 該当客室のチェックイン中の予約を検索
  const activeReservation = await hotelDb.getAdapter().reservation.findFirst({
    where: {
      roomId: room.id,
      tenantId,
      status: 'checked_in',
      isDeleted: false
    },
    include: {
      room: true
    }
  });

  if (!activeReservation) {
    throw new Error(`客室 ${room.roomNumber} にチェックイン中の予約が見つかりません`);
  }

  // 追加料金の計算
  const additionalChargesTotal = data.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  const finalAmount = data.finalAmount || (activeReservation.totalAmount || 0) + additionalChargesTotal;

  // 予約をチェックアウト状態に更新
  const updatedReservation = await hotelDb.getAdapter().reservation.update({
    where: { id: activeReservation.id },
    data: {
      status: 'checked_out',
      totalAmount: finalAmount,
      paidAmount: finalAmount, // チェックアウト時に全額支払い済みとする
      notes: data.notes || activeReservation.notes,
      updatedAt: new Date()
    },
    include: {
      room: true
    }
  });

  // チェックインセッションをチェックアウト状態に更新
  await updateSessionOnCheckout(tenantId, activeReservation.id);

  // 客室ステータスを更新
  const roomStatus = data.roomCondition === 'clean' ? 'available' : 
                    data.roomCondition === 'maintenance_required' ? 'maintenance' : 'cleaning';
  
  await hotelDb.getAdapter().room.update({
    where: { id: room.id },
    data: {
      status: roomStatus,
      updatedAt: new Date()
    }
  });

  return updatedReservation;
}

/**
 * チェックインセッション作成
 */
async function createCheckinSession(
  tenantId: string,
  reservationId: string,
  roomId: string,
  data: z.infer<typeof UnifiedCheckinSchema>,
  checkinType: 'reservation-based' | 'walk-in'
) {
  // 部屋情報取得
  const room = await hotelDb.getAdapter().room.findFirst({
    where: { id: roomId }
  });

  if (!room) {
    throw new Error(`部屋が見つかりません: ${roomId}`);
  }

  // セッション番号生成
  const checkinDate = data.checkinDate ? new Date(data.checkinDate) : new Date();
  const dateStr = checkinDate.toISOString().split('T')[0].replace(/-/g, '');
  const sessionNumber = `R${room.roomNumber}-${dateStr}-001`;

  // ゲスト情報の構築
  const guestInfo = {
    primaryGuest: {
      firstName: data.guests[0].name.split(' ')[0] || data.guests[0].name,
      lastName: data.guests[0].name.split(' ').slice(1).join(' ') || '',
      email: data.guests[0].email,
      phone: data.guests[0].phone,
      nationality: data.guests[0].nationality,
      idType: data.guests[0].idType,
      idNumber: data.guests[0].idNumber
    },
    additionalGuests: data.guests.slice(1).map(guest => ({
      firstName: guest.name.split(' ')[0] || guest.name,
      lastName: guest.name.split(' ').slice(1).join(' ') || '',
      email: guest.email,
      phone: guest.phone
    })),
    checkinType
  };

  // チェックアウト予定日の設定
  const plannedCheckOut = data.checkoutDate ? 
    new Date(data.checkoutDate) : 
    new Date(checkinDate.getTime() + 24 * 60 * 60 * 1000);

  // セッション作成
  const session = await hotelDb.getAdapter().checkinSession.create({
    data: {
      tenantId,
      sessionNumber,
      reservationId,
      roomId,
      guestInfo,
      adults: data.guestCount || 1,
      children: 0,
      checkInAt: checkinDate,
      plannedCheckOut,
      status: 'ACTIVE',
      notes: data.notes,
      specialRequests: data.specialRequests,
      updatedAt: new Date()
    }
  });

  logger.info('チェックインセッション自動作成完了', {
    sessionId: session.id,
    sessionNumber: session.sessionNumber,
    reservationId,
    roomId,
    checkinType,
    tenantId
  });

  return session;
}

/**
 * チェックアウト時のセッション更新
 */
async function updateSessionOnCheckout(tenantId: string, reservationId: string) {
  try {
    const session = await hotelDb.getAdapter().checkinSession.findFirst({
      where: {
        reservationId,
        tenantId,
        status: 'ACTIVE'
      }
    });

    if (session) {
      await hotelDb.getAdapter().checkinSession.update({
        where: { id: session.id },
        data: {
          status: 'CHECKED_OUT',
          checkOutAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info('チェックアウト時セッション更新完了', {
        sessionId: session.id,
        sessionNumber: session.sessionNumber,
        reservationId,
        tenantId
      });
    }
  } catch (error: unknown) {
    logger.error('チェックアウト時セッション更新エラー', error);
    // セッション更新エラーは致命的ではないため、処理を続行
  }
}

/**
 * 確認番号生成
 */
function generateConfirmationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WI${timestamp}${random}`;
}

export default router;
