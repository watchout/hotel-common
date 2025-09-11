import express, { Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware';
import { hotelDb } from '../database/prisma';
import { StandardResponseBuilder } from '../utils/response-builder';
import { logger } from '../utils/logger';

const router = express.Router();

// セッション作成スキーマ
const CreateSessionSchema = z.object({
  reservationId: z.string(),
  roomId: z.string(),
  guestInfo: z.object({
    primaryGuest: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().optional(),
      phone: z.string().optional()
    }),
    additionalGuests: z.array(z.object({
      firstName: z.string(),
      lastName: z.string(),
      age: z.number().optional(),
      relationship: z.string().optional()
    })).optional(),
    specialNeeds: z.array(z.string()).optional(),
    preferences: z.record(z.any()).optional()
  }),
  adults: z.number().default(1),
  children: z.number().default(0),
  checkInAt: z.string().transform(str => new Date(str)),
  plannedCheckOut: z.string().transform(str => new Date(str)),
  notes: z.string().optional(),
  specialRequests: z.string().optional()
});

// セッション更新スキーマ
const UpdateSessionSchema = z.object({
  status: z.enum(['ACTIVE', 'CHECKED_OUT', 'EXTENDED', 'CANCELED']).optional(),
  checkOutAt: z.string().transform(str => new Date(str)).optional(),
  plannedCheckOut: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional()
});

/**
 * セッション作成（チェックイン時）
 * POST /api/v1/sessions
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validatedData = CreateSessionSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
      return;
    }

    // 予約の存在確認
    const reservation = await hotelDb.getAdapter().reservation.findFirst({
      where: {
        id: validatedData.reservationId,
        tenantId: tenantId
      }
    });

    if (!reservation) {
      return res.status(404).json(
        StandardResponseBuilder.error('RESERVATION_NOT_FOUND', '指定された予約が見つかりません').response
      );
    }

    // セッション番号生成
    const roomNumber = await hotelDb.getAdapter().room.findFirst({
      where: { id: validatedData.roomId },
      select: { roomNumber: true }
    });

    const checkinDate = validatedData.checkInAt.toISOString().split('T')[0].replace(/-/g, '');
    const sessionNumber = `R${roomNumber?.roomNumber}-${checkinDate}-001`;

    // セッション作成
    const session = await hotelDb.getAdapter().checkinSession.create({
      data: {
        tenantId,
        sessionNumber,
        reservationId: validatedData.reservationId,
        roomId: validatedData.roomId,
        guestInfo: validatedData.guestInfo,
        adults: validatedData.adults,
        children: validatedData.children,
        checkInAt: validatedData.checkInAt,
        plannedCheckOut: validatedData.plannedCheckOut,
        status: 'ACTIVE',
        notes: validatedData.notes,
        specialRequests: validatedData.specialRequests,
        updatedAt: new Date()
      }
    });

    // 予約ステータスを更新
    await hotelDb.getAdapter().reservation.update({
      where: { id: validatedData.reservationId },
      data: { 
        status: 'CHECKED_IN',
        updatedAt: new Date()
      }
    });

    // 部屋ステータスを更新
    await hotelDb.getAdapter().room.update({
      where: { id: validatedData.roomId },
      data: { 
        status: 'occupied',
        updatedAt: new Date()
      }
    });

    return res.status(200).json(
      StandardResponseBuilder.success(res, { session }, 'チェックインセッションを作成しました')
    );

    logger.info('チェックインセッション作成完了', {
      sessionId: session.id,
      sessionNumber: session.sessionNumber,
      tenantId,
      roomId: validatedData.roomId
    });

  } catch (error) {
    logger.error('チェックインセッション作成エラー', error as Error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', '入力データが正しくありません').response
      );
    }
    
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'チェックインセッションの作成に失敗しました').response
    );
  }
});

/**
 * セッション詳細取得
 * GET /api/v1/sessions/:sessionId
 */
router.get('/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
      return;
    }

    const session = await hotelDb.getAdapter().checkinSession.findFirst({
      where: {
        id: sessionId,
        tenantId
      },
      include: {
        reservation: true,
        room: true,
        orders: {
          where: { isDeleted: false }
        }
      }
    });

    if (!session) {
      return res.status(404).json(
        StandardResponseBuilder.error('SESSION_NOT_FOUND', '指定されたセッションが見つかりません').response
      );
    }

    return res.status(200).json(
      StandardResponseBuilder.success(res, { session })
    );

    logger.info('セッション詳細取得完了', {
      sessionId,
      sessionNumber: session?.sessionNumber,
      tenantId
    });

  } catch (error) {
    logger.error('セッション詳細取得エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション詳細の取得に失敗しました').response
    );
  }
});

/**
 * セッション番号による取得
 * GET /api/v1/sessions/by-number/:sessionNumber
 */
router.get('/by-number/:sessionNumber', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionNumber } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
      return;
    }

    const session = await hotelDb.getAdapter().checkinSession.findFirst({
      where: {
        sessionNumber,
        tenantId
      },
      include: {
        reservation: true,
        room: true,
        orders: {
          where: { isDeleted: false }
        }
      }
    });

    if (!session) {
      return res.status(404).json(
        StandardResponseBuilder.error('SESSION_NOT_FOUND', '指定されたセッション番号が見つかりません').response
      );
    }

    return res.status(200).json(
      StandardResponseBuilder.success(res, { session })
    );

    logger.info('セッション番号による取得完了', {
      sessionNumber,
      sessionId: session?.id,
      tenantId
    });

  } catch (error) {
    logger.error('セッション番号による取得エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'セッションの取得に失敗しました').response
    );
  }
});

/**
 * 部屋のアクティブセッション取得
 * GET /api/v1/sessions/active-by-room/:roomId
 */
router.get('/active-by-room/:roomId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
      return;
    }

    const session = await hotelDb.getAdapter().checkinSession.findFirst({
      where: {
        roomId,
        tenantId,
        status: 'ACTIVE'
      },
      include: {
        reservation: true,
        room: true,
        orders: {
          where: { isDeleted: false }
        }
      }
    });

    return res.status(200).json(
      StandardResponseBuilder.success(res, { session })
    );

    logger.info('部屋のアクティブセッション取得完了', {
      roomId,
      sessionId: session?.id,
      tenantId
    });

  } catch (error) {
    logger.error('部屋のアクティブセッション取得エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'アクティブセッションの取得に失敗しました').response
    );
  }
});

/**
 * セッション更新
 * PATCH /api/v1/sessions/:sessionId
 */
router.patch('/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const validatedData = UpdateSessionSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
      return;
    }

    const session = await hotelDb.getAdapter().checkinSession.update({
      where: {
        id: sessionId
      },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });

    return res.status(200).json(
      StandardResponseBuilder.success(res, { session }, 'セッションを更新しました')
    );

    logger.info('セッション更新完了', {
      sessionId,
      tenantId,
      updates: validatedData
    });

  } catch (error) {
    logger.error('セッション更新エラー', error as Error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', '更新データが正しくありません').response
      );
      return;
    }
    
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'セッションの更新に失敗しました').response
    );
  }
});

/**
 * チェックアウト処理
 * POST /api/v1/sessions/:sessionId/checkout
 */
router.post('/:sessionId/checkout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
      return;
    }

    const checkoutTime = new Date();

    // セッションをチェックアウト状態に更新
    const session = await hotelDb.getAdapter().checkinSession.update({
      where: { id: sessionId },
      data: {
        status: 'CHECKED_OUT',
        checkOutAt: checkoutTime,
        updatedAt: checkoutTime
      }
    });

    // 予約ステータスを更新
    await hotelDb.getAdapter().reservation.update({
      where: { id: session.reservationId },
      data: { 
        status: 'COMPLETED',
        updatedAt: checkoutTime
      }
    });

    // 部屋ステータスを更新
    await hotelDb.getAdapter().room.update({
      where: { id: session.roomId },
      data: { 
        status: 'cleaning',
        updatedAt: checkoutTime
      }
    });

    return res.status(200).json(
      StandardResponseBuilder.success(res, { session }, 'チェックアウトが完了しました')
    );

    logger.info('チェックアウト処理完了', {
      sessionId,
      sessionNumber: session.sessionNumber,
      tenantId,
      checkoutTime
    });

  } catch (error) {
    logger.error('チェックアウト処理エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'チェックアウト処理に失敗しました').response
    );
  }
});

export default router;
