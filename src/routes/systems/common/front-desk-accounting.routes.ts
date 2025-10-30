import express from 'express';
import { z } from 'zod';

import { authMiddleware } from '../../../auth/middleware';
import { hotelDb } from '../../../database';
import { ResponseHelper, StandardResponseBuilder } from '../../../standards/api-response-standards';
import { HotelLogger } from '../../../utils/logger';

import type { Request, Response } from 'express';

const router = express.Router();
const logger = HotelLogger.getInstance();

/**
 * 会計クエリスキーマ
 */
const AccountingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(20),
  type: z.enum(['invoice', 'payment', 'refund']).optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  guest_id: z.string().optional(),
  room_number: z.string().optional()
});

/**
 * 決済処理スキーマ
 */
const PaymentProcessSchema = z.object({
  invoice_id: z.string(),
  payment_method: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet']),
  amount: z.number().positive(),
  payment_reference: z.string().optional(),
  notes: z.string().optional()
});

/**
 * フロントデスク - 会計取引一覧取得
 * GET /api/v1/admin/front-desk/accounting
 */
router.get('/accounting', authMiddleware, async (req: Request, res: Response) => {
  try {
    const query = AccountingQuerySchema.parse(req.query);
    const { page, limit, type, status, start_date, end_date, guest_id, room_number } = query;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
      return;
    }

    // データベースから取引データを取得
    const whereClause: any = {
      tenantId,
      isDeleted: false
    };

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (start_date && end_date) {
      whereClause.createdAt = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    }

    const [totalCount, transactions] = await Promise.all([
      hotelDb.getAdapter().transaction.count({ where: whereClause }),
      hotelDb.getAdapter().transaction.findMany({
        where: whereClause,
        include: {
          invoice: true,
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    // レスポンス形式に変換
    const filteredTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      invoice_number: transaction.invoice?.invoiceNumber || transaction.reference || '',
      guest_name: transaction.invoice?.customerName || '不明',
      room_number: (transaction.metadata as any)?.roomNumber || '不明',
      amount: transaction.amount,
      tax_amount: transaction.taxAmount,
      total_amount: transaction.totalAmount,
      status: transaction.status,
      payment_method: transaction.payment?.paymentMethod || null,
      created_at: transaction.createdAt,
      completed_at: transaction.payment?.processedAt || null,
      items: transaction.invoice?.items || []
    }));

    const pagination = StandardResponseBuilder.createPagination(page, limit, totalCount);

    // サマリー計算（データベースから）
    const [statusCounts, paymentMethodCounts, revenueSums] = await Promise.all([
      hotelDb.getAdapter().transaction.groupBy({
        by: ['status'],
        where: { tenantId, isDeleted: false },
        _count: { id: true }
      }),
      hotelDb.getAdapter().payment.groupBy({
        by: ['paymentMethod'],
        where: { tenantId, isDeleted: false },
        _count: { id: true }
      }),
      hotelDb.getAdapter().transaction.aggregate({
        where: { tenantId, isDeleted: false },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    const summary = {
      total_transactions: totalCount,
      total_revenue: transactions
        .filter(txn => txn.status === 'completed' && txn.totalAmount > 0)
        .reduce((sum, txn) => sum + txn.totalAmount, 0),
      total_refunds: Math.abs(transactions
        .filter(txn => txn.status === 'completed' && txn.totalAmount < 0)
        .reduce((sum, txn) => sum + txn.totalAmount, 0)),
      pending_amount: transactions
        .filter(txn => txn.status === 'pending')
        .reduce((sum, txn) => sum + txn.totalAmount, 0),
      by_status: {
        pending: statusCounts.find(s => s.status === 'pending')?._count?.id || 0,
        completed: statusCounts.find(s => s.status === 'completed')?._count?.id || 0,
        cancelled: statusCounts.find(s => s.status === 'cancelled')?._count?.id || 0
      },
      by_payment_method: {
        cash: paymentMethodCounts.find(p => p.paymentMethod === 'cash')?._count?.id || 0,
        credit_card: paymentMethodCounts.find(p => p.paymentMethod === 'credit_card')?._count?.id || 0,
        bank_transfer: paymentMethodCounts.find(p => p.paymentMethod === 'bank_transfer')?._count?.id || 0
      }
    };

    ResponseHelper.sendSuccess(res, {
      transactions: filteredTransactions,
      summary
    }, 200, pagination);

    logger.info('フロントデスク会計取引一覧取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      query_params: query,
      result_count: filteredTransactions.length
    });

  } catch (error: unknown) {
    logger.error('フロントデスク会計取引一覧取得エラー', error as Error);

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, 'クエリパラメータが正しくありません', error.errors);
      return;
    }

    ResponseHelper.sendInternalError(res, '会計取引一覧の取得に失敗しました');
  }
});

/**
 * フロントデスク - 会計取引詳細取得
 * GET /api/v1/admin/front-desk/accounting/:id
 */
router.get('/accounting/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
      return;
    }

    // データベースから取引詳細を取得
    const transaction = await hotelDb.getAdapter().transaction.findFirst({
      where: {
        id: transactionId,
        tenantId,
        isDeleted: false
      },
      include: {
        invoice: true,
        payment: true
      }
    });

    if (!transaction) {
      ResponseHelper.sendNotFound(res, '指定された取引が見つかりません');
      return;
    }

    // レスポンス形式に変換
    const transactionDetail = {
      id: transaction.id,
      type: transaction.type,
      invoice_number: transaction.invoice?.invoiceNumber || transaction.reference || '',
      guest_name: transaction.invoice?.customerName || '不明',
      guest_email: transaction.invoice?.customerEmail || null,
      room_number: (transaction.metadata as any)?.roomNumber || '不明',
      check_in: (transaction.metadata as any)?.checkIn ? new Date((transaction.metadata as any).checkIn) : null,
      check_out: (transaction.metadata as any)?.checkOut ? new Date((transaction.metadata as any).checkOut) : null,
      amount: transaction.amount,
      tax_amount: transaction.taxAmount,
      total_amount: transaction.totalAmount,
      status: transaction.status,
      payment_method: transaction.payment?.paymentMethod || null,
      payment_reference: ((transaction.payment?.metadata as unknown as { paymentReference?: string })?.paymentReference) || null,
      created_at: transaction.createdAt,
      completed_at: transaction.payment?.processedAt || null,
      items: transaction.invoice?.items || [],
      payment_history: transaction.payment ? [{
        date: transaction.payment.processedAt,
        method: transaction.payment.paymentMethod,
        amount: transaction.payment.amount,
        reference: ((transaction.payment.metadata as unknown as { paymentReference?: string })?.paymentReference) || null,
        status: transaction.payment.status
      }] : []
    };

    ResponseHelper.sendSuccess(res, { transaction: transactionDetail });

    logger.info('フロントデスク会計取引詳細取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      transaction_id: transactionId
    });

  } catch (error: unknown) {
    logger.error('フロントデスク会計取引詳細取得エラー', error as Error);
    ResponseHelper.sendInternalError(res, '会計取引詳細の取得に失敗しました');
  }
});

/**
 * フロントデスク - 決済処理
 * POST /api/v1/admin/front-desk/accounting/process-payment
 */
router.post('/accounting/process-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paymentData = PaymentProcessSchema.parse(req.body);
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
      return;
    }

    // ダミー決済処理
    const processedPayment = {
      id: `pay-${Date.now()}`,
      invoice_id: paymentData.invoice_id,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_reference: paymentData.payment_reference || `REF-${Date.now()}`,
      status: 'completed',
      processed_at: new Date(),
      processed_by: (req as any).user?.user_id,
      notes: paymentData.notes
    };

    // システムイベントログ記録
    await hotelDb.getAdapter().systemEvent.create({
      data: {
        id: `payment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        tenant_id: tenantId,
        user_id: (req as any).user?.user_id,
        event_type: 'PAYMENT_PROCESSING',
        source_system: 'hotel-common',
        target_system: 'hotel-common',
        entity_type: 'payment',
        entity_id: processedPayment.id,
        action: 'PROCESS_PAYMENT',
        event_data: {
          invoice_id: paymentData.invoice_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          payment_reference: processedPayment.payment_reference,
          timestamp: new Date().toISOString()
        },
        status: 'COMPLETED'
      }
    });

    ResponseHelper.sendSuccess(res, {
      payment: processedPayment,
      message: '決済処理が完了しました'
    }, 201);

    logger.info('フロントデスク決済処理完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      payment_id: processedPayment.id,
      amount: paymentData.amount
    });

  } catch (error: unknown) {
    logger.error('フロントデスク決済処理エラー', error as Error);

    if (error instanceof z.ZodError) {
      ResponseHelper.sendValidationError(res, '決済データが正しくありません', error.errors);
      return;
    }

    ResponseHelper.sendInternalError(res, '決済処理に失敗しました');
  }
});

/**
 * フロントデスク - 日次売上レポート
 * GET /api/v1/admin/front-desk/accounting/daily-report
 */
router.get('/accounting/daily-report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です')
      );
      return;
    }

    const reportDate = date ? new Date(date as string) : new Date();

    // ダミーレポートデータ
    const dailyReport = {
      date: reportDate.toISOString().split('T')[0],
      summary: {
        total_revenue: 125000,
        total_tax: 12500,
        total_transactions: 8,
        completed_transactions: 6,
        pending_transactions: 2,
        refunds: 1,
        refund_amount: 3300
      },
      by_payment_method: {
        cash: { count: 2, amount: 35000 },
        credit_card: { count: 4, amount: 87200 },
        bank_transfer: { count: 0, amount: 0 },
        digital_wallet: { count: 0, amount: 0 }
      },
      by_room_type: {
        standard: { count: 3, amount: 45000 },
        deluxe: { count: 2, amount: 50000 },
        suite: { count: 1, amount: 30000 }
      },
      hourly_breakdown: [
        { hour: '09:00', transactions: 1, amount: 15000 },
        { hour: '10:00', transactions: 2, amount: 35000 },
        { hour: '11:00', transactions: 1, amount: 25000 },
        { hour: '14:00', transactions: 2, amount: 50000 }
      ]
    };

    ResponseHelper.sendSuccess(res, { report: dailyReport });

    logger.info('フロントデスク日次売上レポート取得完了', {
      user_id: (req as any).user?.user_id,
      tenant_id: tenantId,
      report_date: reportDate.toISOString().split('T')[0]
    });

  } catch (error: unknown) {
    logger.error('フロントデスク日次売上レポート取得エラー', error as Error);
    ResponseHelper.sendInternalError(res, '日次売上レポートの取得に失敗しました');
  }
});

export default router;
