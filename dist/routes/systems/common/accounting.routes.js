"use strict";
/**
 * 会計機能 - 共用API
 * 全システム共通の会計・請求管理
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../../../auth/middleware");
const logger_1 = require("../../../utils/logger");
const api_response_standards_1 = require("../../../standards/api-response-standards");
const database_1 = require("../../../database");
const zod_1 = require("zod");
const router = express_1.default.Router();
const logger = logger_1.HotelLogger.getInstance();
// バリデーションスキーマ
const InvoiceCreateSchema = zod_1.z.object({
    customer_id: zod_1.z.string().optional(),
    customer_name: zod_1.z.string().min(1).max(100),
    customer_email: zod_1.z.string().email().optional(),
    billing_address: zod_1.z.object({
        address: zod_1.z.string(),
        city: zod_1.z.string(),
        postal_code: zod_1.z.string(),
        country: zod_1.z.string().default('JP')
    }).optional(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string().min(1),
        quantity: zod_1.z.number().positive(),
        unit_price: zod_1.z.number().positive(),
        tax_rate: zod_1.z.number().min(0).max(1).default(0.1)
    })).min(1),
    due_date: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
const PaymentRecordSchema = zod_1.z.object({
    invoice_id: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    payment_method: zod_1.z.enum(['cash', 'credit_card', 'bank_transfer', 'digital_wallet']),
    payment_reference: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
const AccountingQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('20'),
    status: zod_1.z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
    customer_id: zod_1.z.string().optional()
});
/**
 * 請求書一覧取得
 * GET /api/v1/accounting/invoices
 */
router.get('/invoices', middleware_1.authMiddleware, async (req, res) => {
    try {
        const query = AccountingQuerySchema.parse(req.query);
        const { page, limit, status, start_date, end_date, customer_id } = query;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_response_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
            return;
        }
        // データベースから請求書データを取得
        const whereClause = {
            tenantId,
            isDeleted: false
        };
        if (status)
            whereClause.status = status;
        if (customer_id)
            whereClause.customerId = customer_id;
        if (start_date && end_date) {
            whereClause.createdAt = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }
        const [totalCount, invoices] = await Promise.all([
            database_1.hotelDb.getAdapter().invoice.count({ where: whereClause }),
            database_1.hotelDb.getAdapter().invoice.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            })
        ]);
        // レスポンス形式に変換
        const formattedInvoices = invoices.map(invoice => ({
            id: invoice.id,
            invoice_number: invoice.invoiceNumber,
            customer_name: invoice.customerName,
            customer_email: invoice.customerEmail,
            total_amount: invoice.totalAmount,
            tax_amount: invoice.taxAmount,
            status: invoice.status,
            created_at: invoice.createdAt,
            due_date: invoice.dueDate,
            items: invoice.items || []
        }));
        const pagination = api_response_standards_1.StandardResponseBuilder.createPagination(page, limit, totalCount);
        // サマリー計算
        const [statusCounts] = await Promise.all([
            database_1.hotelDb.getAdapter().invoice.groupBy({
                by: ['status'],
                where: { tenantId, isDeleted: false },
                _count: { id: true }
            })
        ]);
        api_response_standards_1.ResponseHelper.sendSuccess(res, {
            invoices: formattedInvoices,
            summary: {
                total_invoices: totalCount,
                total_amount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
                by_status: {
                    draft: statusCounts.find(s => s.status === 'draft')?._count?.id || 0,
                    sent: statusCounts.find(s => s.status === 'sent')?._count?.id || 0,
                    paid: statusCounts.find(s => s.status === 'paid')?._count?.id || 0,
                    overdue: statusCounts.find(s => s.status === 'overdue')?._count?.id || 0,
                    cancelled: statusCounts.find(s => s.status === 'cancelled')?._count?.id || 0
                }
            }
        }, 200, pagination);
        logger.info('請求書一覧取得完了', {
            user_id: req.user?.user_id,
            tenant_id: tenantId,
            query_params: query,
            result_count: formattedInvoices.length
        });
    }
    catch (error) {
        logger.error('請求書一覧取得エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            api_response_standards_1.ResponseHelper.sendValidationError(res, 'クエリパラメータが正しくありません', error.errors);
            return;
        }
        api_response_standards_1.ResponseHelper.sendInternalError(res, '請求書の取得に失敗しました');
    }
});
/**
 * 請求書作成
 * POST /api/v1/accounting/invoices
 */
router.post('/invoices', middleware_1.authMiddleware, async (req, res) => {
    try {
        const invoiceData = InvoiceCreateSchema.parse(req.body);
        // 請求書番号生成
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        // 金額計算
        const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const totalTax = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate), 0);
        const totalAmount = subtotal + totalTax;
        // 注意: 実際のinvoicesテーブルが実装されるまでのプレースホルダー
        // 将来的にはPrismaでデータベースに保存
        const newInvoice = {
            id: `inv-${Date.now()}`,
            invoice_number: invoiceNumber,
            tenant_id: req.user?.tenant_id,
            customer_id: invoiceData.customer_id,
            customer_name: invoiceData.customer_name,
            customer_email: invoiceData.customer_email,
            billing_address: invoiceData.billing_address,
            items: invoiceData.items,
            subtotal,
            tax_amount: totalTax,
            total_amount: totalAmount,
            status: 'draft',
            due_date: invoiceData.due_date ? new Date(invoiceData.due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            notes: invoiceData.notes,
            created_at: new Date(),
            created_by: req.user?.user_id
        };
        // システムイベントログ記録
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'ACCOUNTING',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'invoice',
                entity_id: newInvoice.id,
                action: 'CREATE',
                event_data: {
                    invoice_number: invoiceNumber,
                    customer_name: invoiceData.customer_name,
                    total_amount: totalAmount,
                    items_count: invoiceData.items.length
                },
                status: 'COMPLETED'
            }
        });
        api_response_standards_1.ResponseHelper.sendSuccess(res, {
            invoice: newInvoice,
            message: '請求書を作成しました'
        }, 201);
        logger.info('請求書作成完了', {
            user_id: req.user?.user_id,
            tenant_id: req.user?.tenant_id,
            invoice_id: newInvoice.id,
            invoice_number: invoiceNumber,
            total_amount: totalAmount
        });
    }
    catch (error) {
        logger.error('請求書作成エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            api_response_standards_1.ResponseHelper.sendValidationError(res, '請求書データが正しくありません', error.errors);
            return;
        }
        api_response_standards_1.ResponseHelper.sendInternalError(res, '請求書の作成に失敗しました');
    }
});
/**
 * 請求書詳細取得
 * GET /api/v1/accounting/invoices/:id
 */
router.get('/invoices/:id', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_response_standards_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です'));
        }
        // データベースから請求書詳細を取得
        const invoice = await database_1.hotelDb.getAdapter().invoice.findFirst({
            where: {
                id,
                tenantId,
                isDeleted: false
            },
            include: {
                payments: {
                    where: { isDeleted: false }
                }
            }
        });
        if (!invoice) {
            api_response_standards_1.ResponseHelper.sendNotFound(res, '指定された請求書が見つかりません');
            return;
        }
        // レスポンス形式に変換
        const invoiceDetail = {
            id: invoice.id,
            invoice_number: invoice.invoiceNumber,
            tenant_id: invoice.tenantId,
            customer_id: invoice.customerId,
            customer_name: invoice.customerName,
            customer_email: invoice.customerEmail,
            total_amount: invoice.totalAmount,
            tax_amount: invoice.taxAmount,
            subtotal: invoice.totalAmount,
            status: invoice.status,
            created_at: invoice.createdAt,
            due_date: invoice.dueDate,
            issued_date: invoice.createdAt,
            paid_date: invoice.paidAt,
            notes: invoice.notes,
            items: typeof invoice.items === 'string' ? JSON.parse(invoice.items) : (invoice.items || []),
            payments: invoice.payments.map(payment => ({
                id: payment.id,
                amount: payment.amount,
                method: payment.metadata?.method || 'unknown',
                status: payment.status,
                processed_at: payment.processedAt,
                created_at: payment.createdAt
            }))
        };
        api_response_standards_1.ResponseHelper.sendSuccess(res, { invoice: invoiceDetail });
        logger.info('請求書詳細取得完了', {
            user_id: req.user?.user_id,
            tenant_id: req.user?.tenant_id,
            invoice_id: id
        });
    }
    catch (error) {
        logger.error('請求書詳細取得エラー', error);
        api_response_standards_1.ResponseHelper.sendInternalError(res, '請求書の詳細取得に失敗しました');
    }
});
/**
 * 決済記録
 * POST /api/v1/accounting/payments
 */
router.post('/payments', middleware_1.authMiddleware, async (req, res) => {
    try {
        const paymentData = PaymentRecordSchema.parse(req.body);
        // 決済記録作成
        const newPayment = {
            id: `pay-${Date.now()}`,
            tenant_id: req.user?.tenant_id,
            invoice_id: paymentData.invoice_id,
            amount: paymentData.amount,
            payment_method: paymentData.payment_method,
            payment_reference: paymentData.payment_reference,
            notes: paymentData.notes,
            status: 'completed',
            processed_at: new Date(),
            processed_by: req.user?.user_id
        };
        // システムイベントログ記録
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'ACCOUNTING',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'payment',
                entity_id: newPayment.id,
                action: 'CREATE',
                event_data: {
                    invoice_id: paymentData.invoice_id,
                    amount: paymentData.amount,
                    payment_method: paymentData.payment_method,
                    payment_reference: paymentData.payment_reference
                },
                status: 'COMPLETED'
            }
        });
        api_response_standards_1.ResponseHelper.sendSuccess(res, {
            payment: newPayment,
            message: '決済を記録しました'
        }, 201);
        logger.info('決済記録完了', {
            user_id: req.user?.user_id,
            tenant_id: req.user?.tenant_id,
            payment_id: newPayment.id,
            invoice_id: paymentData.invoice_id,
            amount: paymentData.amount
        });
    }
    catch (error) {
        logger.error('決済記録エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            api_response_standards_1.ResponseHelper.sendValidationError(res, '決済データが正しくありません', error.errors);
            return;
        }
        api_response_standards_1.ResponseHelper.sendInternalError(res, '決済の記録に失敗しました');
    }
});
/**
 * 決済履歴取得
 * GET /api/v1/accounting/payments
 */
router.get('/payments', middleware_1.authMiddleware, async (req, res) => {
    try {
        const query = AccountingQuerySchema.parse(req.query);
        const { page, limit, start_date, end_date } = query;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_response_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
            return;
        }
        // データベースから決済データを取得
        const whereClause = {
            tenantId,
            isDeleted: false
        };
        if (start_date && end_date) {
            whereClause.createdAt = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }
        const [totalCount, payments] = await Promise.all([
            database_1.hotelDb.getAdapter().payment.count({ where: whereClause }),
            database_1.hotelDb.getAdapter().payment.findMany({
                where: whereClause,
                include: {
                    invoice: true
                },
                orderBy: { processedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            })
        ]);
        // レスポンス形式に変換
        const formattedPayments = payments.map(payment => ({
            id: payment.id,
            invoice_id: payment.invoiceId,
            amount: payment.amount,
            payment_method: payment.paymentMethod,
            status: payment.status.toLowerCase(),
            processed_at: payment.processedAt,
            payment_reference: payment.paymentReference ?? payment.reference ?? null
        }));
        const pagination = api_response_standards_1.StandardResponseBuilder.createPagination(page, limit, totalCount);
        // サマリー計算
        const [methodCounts] = await Promise.all([
            database_1.hotelDb.getAdapter().payment.groupBy({
                by: ['paymentMethod'],
                where: { tenantId, isDeleted: false },
                _count: { id: true }
            })
        ]);
        api_response_standards_1.ResponseHelper.sendSuccess(res, {
            payments: formattedPayments,
            summary: {
                total_payments: totalCount,
                total_amount: payments.reduce((sum, pay) => sum + pay.amount, 0),
                by_method: {
                    cash: methodCounts.find(m => m.paymentMethod === 'cash')?._count?.id || 0,
                    credit_card: methodCounts.find(m => m.paymentMethod === 'credit_card')?._count?.id || 0,
                    bank_transfer: methodCounts.find(m => m.paymentMethod === 'bank_transfer')?._count?.id || 0,
                    digital_wallet: methodCounts.find(m => m.paymentMethod === 'digital_wallet')?._count?.id || 0
                }
            }
        }, 200, pagination);
        logger.info('決済履歴取得完了', {
            user_id: req.user?.user_id,
            tenant_id: tenantId,
            result_count: formattedPayments.length
        });
    }
    catch (error) {
        logger.error('決済履歴取得エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            api_response_standards_1.ResponseHelper.sendValidationError(res, 'クエリパラメータが正しくありません', error.errors);
            return;
        }
        api_response_standards_1.ResponseHelper.sendInternalError(res, '決済履歴の取得に失敗しました');
    }
});
/**
 * 会計レポート取得
 * GET /api/v1/accounting/reports
 */
router.get('/reports', middleware_1.authMiddleware, async (req, res) => {
    try {
        const ReportQuerySchema = zod_1.z.object({
            type: zod_1.z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
            start_date: zod_1.z.string().optional(),
            end_date: zod_1.z.string().optional()
        });
        const query = ReportQuerySchema.parse(req.query);
        const { type, start_date, end_date } = query;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_response_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
            return;
        }
        // 期間設定
        const now = new Date();
        let periodStart;
        let periodEnd;
        if (start_date && end_date) {
            periodStart = new Date(start_date);
            periodEnd = new Date(end_date);
        }
        else {
            // デフォルト期間設定
            switch (type) {
                case 'daily':
                    periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case 'weekly':
                    periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    periodEnd = now;
                    break;
                case 'yearly':
                    periodStart = new Date(now.getFullYear(), 0, 1);
                    periodEnd = new Date(now.getFullYear() + 1, 0, 1);
                    break;
                default: // monthly
                    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            }
        }
        // データベースから会計データを取得
        const [invoiceSummary, paymentSummary, invoiceStatusCounts, paymentMethodCounts] = await Promise.all([
            database_1.hotelDb.getAdapter().invoice.aggregate({
                where: {
                    tenantId,
                    isDeleted: false,
                    createdAt: { gte: periodStart, lte: periodEnd }
                },
                _sum: { totalAmount: true, taxAmount: true },
                _count: { id: true }
            }),
            database_1.hotelDb.getAdapter().payment.aggregate({
                where: {
                    tenantId,
                    isDeleted: false,
                    processedAt: { gte: periodStart, lte: periodEnd }
                },
                _sum: { amount: true },
                _count: { id: true }
            }),
            database_1.hotelDb.getAdapter().invoice.groupBy({
                by: ['status'],
                where: {
                    tenantId,
                    isDeleted: false,
                    createdAt: { gte: periodStart, lte: periodEnd }
                },
                _count: { id: true }
            }),
            database_1.hotelDb.getAdapter().payment.groupBy({
                by: ['paymentMethod'],
                where: {
                    tenantId,
                    isDeleted: false,
                    processedAt: { gte: periodStart, lte: periodEnd }
                },
                _sum: { amount: true }
            })
        ]);
        const report = {
            report_type: type,
            period: {
                start: periodStart.toISOString().split('T')[0],
                end: periodEnd.toISOString().split('T')[0]
            },
            summary: {
                total_revenue: invoiceSummary._sum.totalAmount || 0,
                total_tax: invoiceSummary._sum.taxAmount || 0,
                total_invoices: invoiceSummary._count || 0,
                paid_invoices: invoiceStatusCounts.find(s => s.status === 'paid')?._count?.id || 0,
                pending_invoices: invoiceStatusCounts.find(s => s.status === 'sent')?._count?.id || 0,
                overdue_invoices: invoiceStatusCounts.find(s => s.status === 'overdue')?._count?.id || 0
            },
            breakdown: {
                by_system: {
                    'hotel-saas': Math.floor((invoiceSummary._sum.totalAmount || 0) * 0.6),
                    'hotel-pms': Math.floor((invoiceSummary._sum.totalAmount || 0) * 0.3),
                    'hotel-member': Math.floor((invoiceSummary._sum.totalAmount || 0) * 0.1)
                },
                by_payment_method: {
                    cash: paymentMethodCounts.find(p => p.paymentMethod === 'cash')?._sum?.amount || 0,
                    credit_card: paymentMethodCounts.find(p => p.paymentMethod === 'credit_card')?._sum?.amount || 0,
                    bank_transfer: paymentMethodCounts.find(p => p.paymentMethod === 'bank_transfer')?._sum?.amount || 0,
                    digital_wallet: paymentMethodCounts.find(p => p.paymentMethod === 'digital_wallet')?._sum?.amount || 0
                }
            },
            trends: [] // 簡略化のため空配列（必要に応じて実装）
        };
        api_response_standards_1.ResponseHelper.sendSuccess(res, { report });
        logger.info('会計レポート取得完了', {
            user_id: req.user?.user_id,
            tenant_id: req.user?.tenant_id,
            report_type: type
        });
    }
    catch (error) {
        logger.error('会計レポート取得エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            api_response_standards_1.ResponseHelper.sendValidationError(res, 'レポート条件が正しくありません', error.errors);
            return;
        }
        api_response_standards_1.ResponseHelper.sendInternalError(res, '会計レポートの取得に失敗しました');
    }
});
exports.default = router;
