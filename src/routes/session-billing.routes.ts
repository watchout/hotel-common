import express, { Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware';
import { hotelDb } from '../database/prisma';
import { StandardResponseBuilder } from '../utils/response-builder';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

const router = express.Router();

// 請求書作成スキーマ
const CreateBillingSchema = z.object({
  sessionId: z.string(),
  roomCharges: z.record(z.number()).default({}),
  serviceCharges: z.record(z.number()).default({}),
  taxes: z.record(z.number()).default({}),
  discounts: z.record(z.number()).default({}),
  dueDate: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional()
});

// 請求書更新スキーマ
const UpdateBillingSchema = z.object({
  roomCharges: z.record(z.number()).optional(),
  serviceCharges: z.record(z.number()).optional(),
  taxes: z.record(z.number()).optional(),
  discounts: z.record(z.number()).optional(),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL_PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paymentMethod: z.string().optional(),
  paymentDate: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional()
});

/**
 * セッション請求書作成
 * POST /api/v1/session-billing
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validatedData = CreateBillingSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    // セッションの存在確認
    const session = await hotelDb.getAdapter().checkinSession.findFirst({
      where: {
        id: validatedData.sessionId,
        tenantId
      },
      include: {
        orders: {
          where: { isDeleted: false }
        }
      }
    });

    if (!session) {
      return res.status(404).json(StandardResponseBuilder.error('NOT_FOUND', '指定されたセッションが見つかりません').response
      );
    }

    // 請求書番号生成
    const billingNumber = await generateBillingNumber(tenantId, session.sessionNumber);

    // 料金計算
    const calculations = await calculateSessionCharges(session, validatedData);

    // 請求書作成
    const billing = await hotelDb.getAdapter().sessionBilling.create({
      data: {
        tenantId,
        sessionId: validatedData.sessionId,
        billingNumber,
        roomCharges: validatedData.roomCharges,
        serviceCharges: validatedData.serviceCharges,
        taxes: validatedData.taxes,
        discounts: validatedData.discounts,
        subtotalAmount: new Decimal(calculations.subtotal),
        taxAmount: new Decimal(calculations.totalTax),
        totalAmount: new Decimal(calculations.total),
        paidAmount: new Decimal(0),
        status: 'PENDING',
        dueDate: validatedData.dueDate,
        notes: validatedData.notes,
        updatedAt: new Date()
      }
    });

    return res.status(200).json(
      StandardResponseBuilder.success(res, { billing }, 'セッション請求書を作成しました')
    );

    logger.info('セッション請求書作成完了', {
      billingId: billing.id,
      billingNumber: billing.billingNumber,
      sessionId: validatedData.sessionId,
      totalAmount: calculations.total,
      tenantId
    });

  } catch (error) {
    logger.error('セッション請求書作成エラー', error as Error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', '入力データが正しくありません').response
      );
      return;
    }
    
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション請求書の作成に失敗しました').response
    );
  }
});

/**
 * セッション請求書取得
 * GET /api/v1/session-billing/:billingId
 */
router.get('/:billingId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { billingId } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    const billing = await hotelDb.getAdapter().sessionBilling.findFirst({
      where: {
        id: billingId,
        tenantId
      },
      include: {
        session: {
          include: {
            reservation: true,
            room: true,
            orders: {
              where: { isDeleted: false },
              include: {
                OrderItem: true
              }
            }
          }
        }
      }
    });

    if (!billing) {
      return res.status(404).json(StandardResponseBuilder.error('NOT_FOUND', '指定された請求書が見つかりません').response
      );
    }

    // 詳細な請求書情報を構築
    const detailedBilling = {
      ...billing,
      session: {
        ...billing.session,
        guestName: (billing.session.guestInfo as any)?.primaryGuest?.firstName + ' ' + (billing.session.guestInfo as any)?.primaryGuest?.lastName
      },
      breakdown: {
        roomCharges: billing.roomCharges,
        serviceCharges: billing.serviceCharges,
        orderCharges: billing.session.orders.reduce((total: number, order: any) => total + Number(order.total), 0),
        taxes: billing.taxes,
        discounts: billing.discounts,
        subtotal: Number(billing.subtotalAmount),
        totalTax: Number(billing.taxAmount),
        total: Number(billing.totalAmount),
        paid: Number(billing.paidAmount),
        balance: Number(billing.totalAmount) - Number(billing.paidAmount)
      }
    };

    return res.status(200).json(
      StandardResponseBuilder.success(res, { billing: detailedBilling })
    );

    logger.info('セッション請求書取得完了', {
      billingId,
      billingNumber: billing?.billingNumber,
      tenantId
    });

  } catch (error) {
    logger.error('セッション請求書取得エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション請求書の取得に失敗しました').response
    );
  }
});

/**
 * セッション別請求書一覧取得
 * GET /api/v1/session-billing/by-session/:sessionId
 */
router.get('/by-session/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    const billings = await hotelDb.getAdapter().sessionBilling.findMany({
      where: {
        sessionId,
        tenantId
      },
      include: {
        session: {
          select: {
            sessionNumber: true,
            guestInfo: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedBillings = billings.map((billing: any) => ({
      id: billing.id,
      billingNumber: billing.billingNumber,
      status: billing.status,
      totalAmount: Number(billing.totalAmount),
      paidAmount: Number(billing.paidAmount),
      balance: Number(billing.totalAmount) - Number(billing.paidAmount),
      dueDate: billing.dueDate,
      paymentDate: billing.paymentDate,
      createdAt: billing.createdAt,
      session: {
        sessionNumber: billing.session.sessionNumber,
        guestName: (billing.session.guestInfo as any)?.primaryGuest?.firstName + ' ' + (billing.session.guestInfo as any)?.primaryGuest?.lastName,
        status: billing.session.status
      }
    }));

    return res.status(200).json(
      StandardResponseBuilder.success(res, { billings: formattedBillings })
    );

    logger.info('セッション別請求書一覧取得完了', {
      sessionId,
      billingCount: billings.length,
      tenantId
    });

  } catch (error) {
    logger.error('セッション別請求書一覧取得エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション別請求書一覧の取得に失敗しました').response
    );
  }
});

/**
 * 請求書更新
 * PATCH /api/v1/session-billing/:billingId
 */
router.patch('/:billingId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { billingId } = req.params;
    const validatedData = UpdateBillingSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    // 既存請求書の取得
    const existingBilling = await hotelDb.getAdapter().sessionBilling.findFirst({
      where: {
        id: billingId,
        tenantId
      },
      include: {
        session: {
          include: {
            orders: { where: { isDeleted: false } }
          }
        }
      }
    });

    if (!existingBilling) {
      return res.status(404).json(StandardResponseBuilder.error('NOT_FOUND', '指定された請求書が見つかりません').response
      );
    }

    // 料金の再計算（料金項目が更新された場合）
    let calculations = {
      subtotal: Number(existingBilling.subtotalAmount),
      totalTax: Number(existingBilling.taxAmount),
      total: Number(existingBilling.totalAmount)
    };

    if (validatedData.roomCharges || validatedData.serviceCharges || validatedData.taxes || validatedData.discounts) {
      const updatedCharges = {
        roomCharges: validatedData.roomCharges || existingBilling.roomCharges,
        serviceCharges: validatedData.serviceCharges || existingBilling.serviceCharges,
        taxes: validatedData.taxes || existingBilling.taxes,
        discounts: validatedData.discounts || existingBilling.discounts
      };
      calculations = await calculateSessionCharges(existingBilling.session, updatedCharges);
    }

    // 請求書更新
    const updatedBilling = await hotelDb.getAdapter().sessionBilling.update({
      where: { id: billingId },
      data: {
        ...validatedData,
        subtotalAmount: new Decimal(calculations.subtotal),
        taxAmount: new Decimal(calculations.totalTax),
        totalAmount: new Decimal(calculations.total),
        updatedAt: new Date()
      }
    });

    return res.status(200).json(
      StandardResponseBuilder.success(res, { billing: updatedBilling }, '請求書を更新しました')
    );

    logger.info('セッション請求書更新完了', {
      billingId,
      tenantId,
      updates: validatedData
    });

  } catch (error) {
    logger.error('セッション請求書更新エラー', error as Error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', '更新データが正しくありません').response
      );
      return;
    }
    
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', '請求書の更新に失敗しました').response
    );
  }
});

/**
 * 支払い処理
 * POST /api/v1/session-billing/:billingId/payment
 */
router.post('/:billingId/payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { billingId } = req.params;
    const { amount, paymentMethod, notes } = req.body;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    if (!amount || amount <= 0) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', '有効な支払い金額を指定してください').response
      );
    }

    // 請求書の取得
    const billing = await hotelDb.getAdapter().sessionBilling.findFirst({
      where: {
        id: billingId,
        tenantId
      }
    });

    if (!billing) {
      return res.status(404).json(StandardResponseBuilder.error('NOT_FOUND', '指定された請求書が見つかりません').response
      );
    }

    const currentPaid = Number(billing.paidAmount);
    const totalAmount = Number(billing.totalAmount);
    const newPaidAmount = currentPaid + amount;

    // 支払い金額の検証
    if (newPaidAmount > totalAmount) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', '支払い金額が請求金額を超えています').response
      );
    }

    // 支払い状態の決定
    let newStatus = billing.status;
    if (newPaidAmount >= totalAmount) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL_PAID';
    }

    // 請求書更新
    const updatedBilling = await hotelDb.getAdapter().sessionBilling.update({
      where: { id: billingId },
      data: {
        paidAmount: new Decimal(newPaidAmount),
        status: newStatus,
        paymentMethod: paymentMethod || billing.paymentMethod,
        paymentDate: newStatus === 'PAID' ? new Date() : billing.paymentDate,
        notes: notes ? `${billing.notes || ''}\n支払い記録: ${notes}` : billing.notes,
        updatedAt: new Date()
      }
    });

    return res.status(200).json(StandardResponseBuilder.success(res, { 
      billing: updatedBilling,
      payment: {
        amount,
        newPaidAmount,
        balance: totalAmount - newPaidAmount,
        status: newStatus
      }
    }, '支払い処理が完了しました')
    );

    logger.info('セッション請求書支払い処理完了', {
      billingId,
      paymentAmount: amount,
      newPaidAmount,
      status: newStatus,
      tenantId
    });

  } catch (error) {
    logger.error('セッション請求書支払い処理エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', '支払い処理に失敗しました').response
    );
  }
});

/**
 * セッション料金自動計算
 * GET /api/v1/session-billing/calculate/:sessionId
 */
router.get('/calculate/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response
      );
    }

    // セッション情報取得
    const session = await hotelDb.getAdapter().checkinSession.findFirst({
      where: {
        id: sessionId,
        tenantId
      },
      include: {
        reservation: true,
        room: true,
        orders: {
          where: { isDeleted: false },
          include: {
            OrderItem: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json(StandardResponseBuilder.error('NOT_FOUND', '指定されたセッションが見つかりません').response
      );
    }

    // 料金計算
    const calculations = await calculateSessionCharges(session, {});

    return res.status(200).json(StandardResponseBuilder.success(res, { 
      sessionId,
      calculations: {
        roomCharges: calculations.roomCharges,
        serviceCharges: calculations.serviceCharges,
        orderCharges: calculations.orderCharges,
        subtotal: calculations.subtotal,
        taxes: calculations.taxes,
        totalTax: calculations.totalTax,
        discounts: calculations.discounts,
        total: calculations.total
      }
    })
    );

    logger.info('セッション料金計算完了', {
      sessionId,
      totalAmount: calculations.total,
      tenantId
    });

  } catch (error) {
    logger.error('セッション料金計算エラー', error as Error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション料金計算に失敗しました').response
    );
  }
});

/**
 * 請求書番号生成
 */
async function generateBillingNumber(tenantId: string, sessionNumber: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const baseNumber = `BILL-${sessionNumber}-${today}`;
  
  // 同日の連番確認
  const existingCount = await hotelDb.getAdapter().sessionBilling.count({
    where: {
      tenantId,
      billingNumber: {
        startsWith: baseNumber
      }
    }
  });

  return `${baseNumber}-${String(existingCount + 1).padStart(3, '0')}`;
}

/**
 * セッション料金計算
 */
async function calculateSessionCharges(session: any, charges: any) {
  // 部屋料金計算
  const roomCharges = charges.roomCharges || {};
  const baseRoomRate = session.reservation?.totalAmount || 0;
  const totalRoomCharges = Object.values(roomCharges).reduce((sum: number, charge: any) => sum + charge, baseRoomRate);

  // サービス料金計算
  const serviceCharges = charges.serviceCharges || {};
  const totalServiceCharges = Object.values(serviceCharges).reduce((sum: number, charge: any) => sum + charge, 0);

  // 注文料金計算
  const orderCharges = session.orders?.reduce((total: number, order: any) => total + Number(order.total), 0) || 0;

  // 小計
  const subtotal = totalRoomCharges + totalServiceCharges + orderCharges;

  // 税金計算
  const taxes = charges.taxes || {};
  const totalTax = Object.values(taxes).reduce((sum: number, tax: any) => sum + tax, subtotal * 0.1); // デフォルト10%

  // 割引計算
  const discounts = charges.discounts || {};
  const totalDiscounts = Object.values(discounts).reduce((sum: number, discount: any) => sum + discount, 0);

  // 合計
  const total = subtotal + totalTax - totalDiscounts;

  return {
    roomCharges: totalRoomCharges,
    serviceCharges: totalServiceCharges,
    orderCharges,
    subtotal,
    taxes: totalTax,
    totalTax,
    discounts: totalDiscounts,
    total: Math.max(0, total) // 負の値を防ぐ
  };
}

export default router;
