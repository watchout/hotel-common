"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const middleware_1 = require("../auth/middleware");
const prisma_1 = require("../database/prisma");
const response_builder_1 = require("../utils/response-builder");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
// セッション作成スキーマ
const CreateSessionSchema = zod_1.z.object({
    reservationId: zod_1.z.string(),
    roomId: zod_1.z.string(),
    guestInfo: zod_1.z.object({
        primaryGuest: zod_1.z.object({
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
            email: zod_1.z.string().optional(),
            phone: zod_1.z.string().optional()
        }),
        additionalGuests: zod_1.z.array(zod_1.z.object({
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
            age: zod_1.z.number().optional(),
            relationship: zod_1.z.string().optional()
        })).optional(),
        specialNeeds: zod_1.z.array(zod_1.z.string()).optional(),
        preferences: zod_1.z.record(zod_1.z.any()).optional()
    }),
    adults: zod_1.z.number().default(1),
    children: zod_1.z.number().default(0),
    checkInAt: zod_1.z.string().transform(str => new Date(str)),
    plannedCheckOut: zod_1.z.string().transform(str => new Date(str)),
    notes: zod_1.z.string().optional(),
    specialRequests: zod_1.z.string().optional()
});
// セッション更新スキーマ
const UpdateSessionSchema = zod_1.z.object({
    status: zod_1.z.enum(['ACTIVE', 'CHECKED_OUT', 'EXTENDED', 'CANCELED']).optional(),
    checkOutAt: zod_1.z.string().transform(str => new Date(str)).optional(),
    plannedCheckOut: zod_1.z.string().transform(str => new Date(str)).optional(),
    notes: zod_1.z.string().optional()
});
/**
 * セッション作成（チェックイン時）
 * POST /api/v1/sessions
 */
router.post('/', middleware_1.authMiddleware, async (req, res) => {
    try {
        const validatedData = CreateSessionSchema.parse(req.body);
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
            return;
        }
        // 予約の存在確認
        const reservation = await prisma_1.hotelDb.getAdapter().reservation.findFirst({
            where: {
                id: validatedData.reservationId,
                tenantId: tenantId
            }
        });
        if (!reservation) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('RESERVATION_NOT_FOUND', '指定された予約が見つかりません').response);
        }
        // セッション番号生成
        const roomNumber = await prisma_1.hotelDb.getAdapter().room.findFirst({
            where: { id: validatedData.roomId },
            select: { roomNumber: true }
        });
        const checkinDate = validatedData.checkInAt.toISOString().split('T')[0].replace(/-/g, '');
        const sessionNumber = `R${roomNumber?.roomNumber}-${checkinDate}-001`;
        // セッション作成
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.create({
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
        await prisma_1.hotelDb.getAdapter().reservation.update({
            where: { id: validatedData.reservationId },
            data: {
                status: 'CHECKED_IN',
                updatedAt: new Date()
            }
        });
        // 部屋ステータスを更新
        await prisma_1.hotelDb.getAdapter().room.update({
            where: { id: validatedData.roomId },
            data: {
                status: 'occupied',
                updatedAt: new Date()
            }
        });
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { session }, 'チェックインセッションを作成しました'));
        logger_1.logger.info('チェックインセッション作成完了', {
            sessionId: session.id,
            sessionNumber: session.sessionNumber,
            tenantId,
            roomId: validatedData.roomId
        });
    }
    catch (error) {
        logger_1.logger.error('チェックインセッション作成エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', '入力データが正しくありません').response);
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'チェックインセッションの作成に失敗しました').response);
    }
});
/**
 * セッション詳細取得
 * GET /api/v1/sessions/:sessionId
 */
router.get('/:sessionId', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
            return;
        }
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
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
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('SESSION_NOT_FOUND', '指定されたセッションが見つかりません').response);
        }
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { session }));
        logger_1.logger.info('セッション詳細取得完了', {
            sessionId,
            sessionNumber: session?.sessionNumber,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('セッション詳細取得エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション詳細の取得に失敗しました').response);
    }
});
/**
 * セッション番号による取得
 * GET /api/v1/sessions/by-number/:sessionNumber
 */
router.get('/by-number/:sessionNumber', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { sessionNumber } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
            return;
        }
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
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
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('SESSION_NOT_FOUND', '指定されたセッション番号が見つかりません').response);
        }
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { session }));
        logger_1.logger.info('セッション番号による取得完了', {
            sessionNumber,
            sessionId: session?.id,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('セッション番号による取得エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッションの取得に失敗しました').response);
    }
});
/**
 * 部屋のアクティブセッション取得
 * GET /api/v1/sessions/active-by-room/:roomId
 */
router.get('/active-by-room/:roomId', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
            return;
        }
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
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
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { session }));
        logger_1.logger.info('部屋のアクティブセッション取得完了', {
            roomId,
            sessionId: session?.id,
            tenantId
        });
    }
    catch (error) {
        logger_1.logger.error('部屋のアクティブセッション取得エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'アクティブセッションの取得に失敗しました').response);
    }
});
/**
 * セッション更新
 * PATCH /api/v1/sessions/:sessionId
 */
router.patch('/:sessionId', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const validatedData = UpdateSessionSchema.parse(req.body);
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
            return;
        }
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.update({
            where: {
                id: sessionId
            },
            data: {
                ...validatedData,
                updatedAt: new Date()
            }
        });
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { session }, 'セッションを更新しました'));
        logger_1.logger.info('セッション更新完了', {
            sessionId,
            tenantId,
            updates: validatedData
        });
    }
    catch (error) {
        logger_1.logger.error('セッション更新エラー', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', '更新データが正しくありません').response);
            return;
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッションの更新に失敗しました').response);
    }
});
/**
 * チェックアウト処理
 * POST /api/v1/sessions/:sessionId/checkout
 */
router.post('/:sessionId/checkout', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
            return;
        }
        const checkoutTime = new Date();
        // セッションをチェックアウト状態に更新
        const session = await prisma_1.hotelDb.getAdapter().checkinSession.update({
            where: { id: sessionId },
            data: {
                status: 'CHECKED_OUT',
                checkOutAt: checkoutTime,
                updatedAt: checkoutTime
            }
        });
        // 予約ステータスを更新
        await prisma_1.hotelDb.getAdapter().reservation.update({
            where: { id: session.reservationId },
            data: {
                status: 'COMPLETED',
                updatedAt: checkoutTime
            }
        });
        // 部屋ステータスを更新
        await prisma_1.hotelDb.getAdapter().room.update({
            where: { id: session.roomId },
            data: {
                status: 'cleaning',
                updatedAt: checkoutTime
            }
        });
        return res.status(200).json(response_builder_1.StandardResponseBuilder.success(res, { session }, 'チェックアウトが完了しました'));
        logger_1.logger.info('チェックアウト処理完了', {
            sessionId,
            sessionNumber: session.sessionNumber,
            tenantId,
            checkoutTime
        });
    }
    catch (error) {
        logger_1.logger.error('チェックアウト処理エラー', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'チェックアウト処理に失敗しました').response);
    }
});
exports.default = router;
