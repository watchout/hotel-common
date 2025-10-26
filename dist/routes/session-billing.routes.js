"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const library_1 = require("@prisma/client/runtime/library");
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const middleware_1 = require("../auth/middleware");
const prisma_1 = require("../database/prisma");
const logger_1 = require("../utils/logger");
const response_builder_1 = require("../utils/response-builder");
const router = express_1.default.Router();
// 請求書作成スキーマ
const CreateBillingSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    roomCharges: zod_1.z.record(zod_1.z.number()).default({}),
    serviceCharges: zod_1.z.record(zod_1.z.number()).default({}),
    taxes: zod_1.z.record(zod_1.z.number()).default({}),
    discounts: zod_1.z.record(zod_1.z.number()).default({}),
    dueDate: zod_1.z.string().transform(str => new Date(str)).optional(),
    notes: zod_1.z.string().optional()
});
// 請求書更新スキーマ
const UpdateBillingSchema = zod_1.z.object({
    roomCharges: zod_1.z.record(zod_1.z.number()).optional(),
    serviceCharges: zod_1.z.record(zod_1.z.number()).optional(),
    taxes: zod_1.z.record(zod_1.z.number()).optional(),
    discounts: zod_1.z.record(zod_1.z.number()).optional(),
    status: zod_1.z.enum(['PENDING', 'PAID', 'PARTIAL_PAID', 'OVERDUE', 'CANCELLED']).optional(),
    paymentMethod: zod_1.z.string().optional(),
    paymentDate: zod_1.z.string().transform(str => new Date(str)).optional(),
    notes: zod_1.z.string().optional()
});
/**
 * セッション請求書作成
 * POST /api/v1/session-billing
 */
router.post('/', middleware_1.authMiddleware, async (req, res) => {
    try {
        const validatedData = CreateBillingSchema.parse(req.body);
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        // セッションの存在確認
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
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
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('NOT_FOUND', '指定されたセッションが見つかりません').response);
        }
        // 請求書番号生成
        const billingNumber = await generateBillingNumber(tenantId, session.sessionNumber);
        // 料金計算
        const calculations = await calculateSessionCharges(session, validatedData);
        // 請求書作成
        const billing = await prisma_1.hotelDb.getAdapter().sessionBilling.create({
            data: {
                tenantId,
                sessionId: validatedData.sessionId,
                billingNumber,
                roomCharges: validatedData.roomCharges,
                serviceCharges: validatedData.serviceCharges,
                taxes: validatedData.taxes,
                discounts: validatedData.discounts,
                subtotalAmount: new library_1.Decimal(calculations.subtotal),
                taxAmount: new library_1.Decimal(calculations.totalTax),
                totalAmount: new library_1.Decimal(calculations.total),
                paidAmount: new library_1.Decimal(0),
                status: 'PENDING',
                dueDate: validatedData.dueDate,
                notes: validatedData.notes,
                updatedAt: new Date()
            }
        });
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { billing }, 'セッション請求書を作成しました'));
        logger_1.logger.info('セッション請求書作成完了', {
            billingId: billing.id,
            billingNumber: billing.billingNumber,
            sessionId: validatedData.sessionId,
            totalAmount: calculations.total,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('セッション請求書作成エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', '入力データが正しくありません').response);
            return;
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション請求書の作成に失敗しました').response);
    }
});
/**
 * セッション請求書取得
 * GET /api/v1/session-billing/:billingId
 */
router.get('/:billingId', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { billingId } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        const billing = await prisma_1.hotelDb.getAdapter().sessionBilling.findFirst({
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
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('NOT_FOUND', '指定された請求書が見つかりません').response);
        }
        // 詳細な請求書情報を構築
        const detailedBilling = {
            ...billing,
            session: {
                ...billing.session,
                guestName: billing.session.guestInfo?.primaryGuest?.firstName + ' ' + billing.session.guestInfo?.primaryGuest?.lastName
            },
            breakdown: {
                roomCharges: billing.roomCharges,
                serviceCharges: billing.serviceCharges,
                orderCharges: billing.session.orders.reduce((total, order) => total + Number(order.total), 0),
                taxes: billing.taxes,
                discounts: billing.discounts,
                subtotal: Number(billing.subtotalAmount),
                totalTax: Number(billing.taxAmount),
                total: Number(billing.totalAmount),
                paid: Number(billing.paidAmount),
                balance: Number(billing.totalAmount) - Number(billing.paidAmount)
            }
        };
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { billing: detailedBilling }));
        logger_1.logger.info('セッション請求書取得完了', {
            billingId,
            billingNumber: billing?.billingNumber,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('セッション請求書取得エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション請求書の取得に失敗しました').response);
    }
});
/**
 * セッション別請求書一覧取得
 * GET /api/v1/session-billing/by-session/:sessionId
 */
router.get('/by-session/:sessionId', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        const billings = await prisma_1.hotelDb.getAdapter().sessionBilling.findMany({
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
        const formattedBillings = billings.map((billing) => ({
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
                guestName: billing.session.guestInfo?.primaryGuest?.firstName + ' ' + billing.session.guestInfo?.primaryGuest?.lastName,
                status: billing.session.status
            }
        }));
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { billings: formattedBillings }));
        logger_1.logger.info('セッション別請求書一覧取得完了', {
            sessionId,
            billingCount: billings.length,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('セッション別請求書一覧取得エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション別請求書一覧の取得に失敗しました').response);
    }
});
/**
 * 請求書更新
 * PATCH /api/v1/session-billing/:billingId
 */
router.patch('/:billingId', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { billingId } = req.params;
        const validatedData = UpdateBillingSchema.parse(req.body);
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        // 既存請求書の取得
        const existingBilling = await prisma_1.hotelDb.getAdapter().sessionBilling.findFirst({
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
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('NOT_FOUND', '指定された請求書が見つかりません').response);
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
        const updatedBilling = await prisma_1.hotelDb.getAdapter().sessionBilling.update({
            where: { id: billingId },
            data: {
                ...validatedData,
                subtotalAmount: new library_1.Decimal(calculations.subtotal),
                taxAmount: new library_1.Decimal(calculations.totalTax),
                totalAmount: new library_1.Decimal(calculations.total),
                updatedAt: new Date()
            }
        });
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { billing: updatedBilling }, '請求書を更新しました'));
        logger_1.logger.info('セッション請求書更新完了', {
            billingId,
            tenantId,
            updates: validatedData
        });
    }
    catch (error) {
        logger_1.logger.error('セッション請求書更新エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', '更新データが正しくありません').response);
            return;
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', '請求書の更新に失敗しました').response);
    }
});
/**
 * 支払い処理
 * POST /api/v1/session-billing/:billingId/payment
 */
router.post('/:billingId/payment', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { billingId } = req.params;
        const { amount, paymentMethod, notes } = req.body;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        if (!amount || amount <= 0) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', '有効な支払い金額を指定してください').response);
        }
        // 請求書の取得
        const billing = await prisma_1.hotelDb.getAdapter().sessionBilling.findFirst({
            where: {
                id: billingId,
                tenantId
            }
        });
        if (!billing) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('NOT_FOUND', '指定された請求書が見つかりません').response);
        }
        const currentPaid = Number(billing.paidAmount);
        const totalAmount = Number(billing.totalAmount);
        const newPaidAmount = currentPaid + amount;
        // 支払い金額の検証
        if (newPaidAmount > totalAmount) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', '支払い金額が請求金額を超えています').response);
        }
        // 支払い状態の決定
        let newStatus = billing.status;
        if (newPaidAmount >= totalAmount) {
            newStatus = 'PAID';
        }
        else if (newPaidAmount > 0) {
            newStatus = 'PARTIAL_PAID';
        }
        // 請求書更新
        const updatedBilling = await prisma_1.hotelDb.getAdapter().sessionBilling.update({
            where: { id: billingId },
            data: {
                paidAmount: new library_1.Decimal(newPaidAmount),
                status: newStatus,
                paymentMethod: paymentMethod || billing.paymentMethod,
                paymentDate: newStatus === 'PAID' ? new Date() : billing.paymentDate,
                notes: notes ? `${billing.notes || ''}\n支払い記録: ${notes}` : billing.notes,
                updatedAt: new Date()
            }
        });
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, {
            billing: updatedBilling,
            payment: {
                amount,
                newPaidAmount,
                balance: totalAmount - newPaidAmount,
                status: newStatus
            }
        }, '支払い処理が完了しました'));
        logger_1.logger.info('セッション請求書支払い処理完了', {
            billingId,
            paymentAmount: amount,
            newPaidAmount,
            status: newStatus,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('セッション請求書支払い処理エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', '支払い処理に失敗しました').response);
    }
});
/**
 * セッション料金自動計算
 * GET /api/v1/session-billing/calculate/:sessionId
 */
router.get('/calculate/:sessionId', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        // セッション情報取得
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
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
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('NOT_FOUND', '指定されたセッションが見つかりません').response);
        }
        // 料金計算
        const calculations = await calculateSessionCharges(session, {});
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, {
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
        }));
        logger_1.logger.info('セッション料金計算完了', {
            sessionId,
            totalAmount: calculations.total,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('セッション料金計算エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション料金計算に失敗しました').response);
    }
});
/**
 * 請求書番号生成
 */
async function generateBillingNumber(tenantId, sessionNumber) {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const baseNumber = `BILL-${sessionNumber}-${today}`;
    // 同日の連番確認
    const existingCount = await prisma_1.hotelDb.getAdapter().sessionBilling.count({
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
async function calculateSessionCharges(session, charges) {
    // 部屋料金計算
    const roomCharges = charges.roomCharges || {};
    const baseRoomRate = session.reservation?.totalAmount || 0;
    const totalRoomCharges = Object.values(roomCharges).reduce((sum, charge) => sum + charge, baseRoomRate);
    // サービス料金計算
    const serviceCharges = charges.serviceCharges || {};
    const totalServiceCharges = Object.values(serviceCharges).reduce((sum, charge) => sum + charge, 0);
    // 注文料金計算
    const orderCharges = session.orders?.reduce((total, order) => total + Number(order.total), 0) || 0;
    // 小計
    const subtotal = totalRoomCharges + totalServiceCharges + orderCharges;
    // 税金計算
    const taxes = charges.taxes || {};
    const totalTax = Object.values(taxes).reduce((sum, tax) => sum + tax, subtotal * 0.1); // デフォルト10%
    // 割引計算
    const discounts = charges.discounts || {};
    const totalDiscounts = Object.values(discounts).reduce((sum, discount) => sum + discount, 0);
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
exports.default = router;
