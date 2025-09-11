"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservation_service_1 = require("../../../services/reservation.service");
const middleware_1 = require("../../../auth/middleware");
const reservation_1 = require("../../../schemas/reservation");
const api_standards_1 = require("../../../standards/api-standards");
const router = express_1.default.Router();
/**
 * 予約管理APIルーター
 * PMS中心の予約統合管理
 */
// 認証ミドルウェアを適用
router.use(middleware_1.verifyTenantAuth);
/**
 * 予約作成
 * POST /api/v1/reservations
 */
router.post('/api/v1/reservations', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // リクエストデータ検証
        const validationResult = reservation_1.CreateReservationRequestSchema.safeParse({
            ...req.body,
            tenant_id: tenantId
        });
        if (!validationResult.success) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response);
        }
        const reservation = await reservation_service_1.ReservationService.createReservation(validationResult.data);
        return res.status(201).json(api_standards_1.StandardResponseBuilder.success(res, reservation).response);
    }
    catch (error) {
        console.error('予約作成エラー:', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_CREATE_ERROR', error instanceof Error ? error.message : '予約作成に失敗しました').response);
    }
});
/**
 * 予約詳細取得
 * GET /api/v1/reservations/:id
 */
router.get('/api/v1/reservations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const reservation = await reservation_service_1.ReservationService.getReservationById(id, tenantId);
        if (!reservation) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_NOT_FOUND', '指定された予約が見つかりません').response);
        }
        return api_standards_1.StandardResponseBuilder.success(res, reservation);
    }
    catch (error) {
        console.error('予約取得エラー:', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_GET_ERROR', error instanceof Error ? error.message : '予約取得に失敗しました').response);
    }
});
/**
 * 予約一覧取得
 * GET /api/v1/reservations
 */
router.get('/api/v1/reservations', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // クエリパラメータ検証
        const validationResult = reservation_1.ReservationSearchParamsSchema.safeParse({
            ...req.query,
            tenant_id: tenantId
        });
        if (!validationResult.success) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response);
        }
        const result = await reservation_service_1.ReservationService.getReservations(validationResult.data);
        return res.status(200).json(api_standards_1.StandardResponseBuilder.success(res, {
            reservations: result.reservations,
            pagination: {
                page: Math.floor(validationResult.data.offset / validationResult.data.limit) + 1,
                limit: validationResult.data.limit,
                total: result.total,
                has_next: result.hasNext
            }
        }).response);
    }
    catch (error) {
        console.error('予約一覧取得エラー:', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('RESERVATIONS_GET_ERROR', error instanceof Error ? error.message : '予約一覧取得に失敗しました').response);
    }
});
/**
 * 予約更新
 * PUT /api/v1/reservations/:id
 */
router.put('/api/v1/reservations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        // リクエストデータ検証
        const validationResult = reservation_1.UpdateReservationRequestSchema.safeParse({
            ...req.body,
            updated_by: req.user?.user_id
        });
        if (!validationResult.success) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response);
        }
        const reservation = await reservation_service_1.ReservationService.updateReservation(id, tenantId, validationResult.data);
        return res.status(200).json(api_standards_1.StandardResponseBuilder.success(res, reservation).response);
    }
    catch (error) {
        console.error('予約更新エラー:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_NOT_FOUND', '指定された予約が見つかりません').response);
        }
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_UPDATE_ERROR', error instanceof Error ? error.message : '予約更新に失敗しました').response);
    }
});
/**
 * 予約キャンセル
 * DELETE /api/v1/reservations/:id
 */
router.delete('/api/v1/reservations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const reservation = await reservation_service_1.ReservationService.cancelReservation(id, tenantId, req.user?.user_id);
        return res.status(200).json(api_standards_1.StandardResponseBuilder.success(res, reservation).response);
    }
    catch (error) {
        console.error('予約キャンセルエラー:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_NOT_FOUND', '指定された予約が見つかりません').response);
        }
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_CANCEL_ERROR', error instanceof Error ? error.message : '予約キャンセルに失敗しました').response);
    }
});
/**
 * チェックイン処理
 * POST /api/v1/reservations/:id/checkin
 */
router.post('/api/v1/reservations/:id/checkin', async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number } = req.body;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        if (!room_number) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('ROOM_NUMBER_REQUIRED', '部屋番号が必要です').response);
        }
        const reservation = await reservation_service_1.ReservationService.checkIn(id, tenantId, room_number, req.user?.user_id);
        return res.status(200).json(api_standards_1.StandardResponseBuilder.success(res, reservation).response);
    }
    catch (error) {
        console.error('チェックインエラー:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_NOT_FOUND', '指定された予約が見つかりません').response);
        }
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('CHECKIN_ERROR', error instanceof Error ? error.message : 'チェックイン処理に失敗しました').response);
    }
});
/**
 * チェックアウト処理
 * POST /api/v1/reservations/:id/checkout
 */
router.post('/api/v1/reservations/:id/checkout', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const reservation = await reservation_service_1.ReservationService.checkOut(id, tenantId, req.user?.user_id);
        return res.status(200).json(api_standards_1.StandardResponseBuilder.success(res, reservation).response);
    }
    catch (error) {
        console.error('チェックアウトエラー:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_NOT_FOUND', '指定された予約が見つかりません').response);
        }
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('CHECKOUT_ERROR', error instanceof Error ? error.message : 'チェックアウト処理に失敗しました').response);
    }
});
/**
 * 予約統計取得
 * GET /api/v1/reservations/stats
 */
router.get('/api/v1/reservations/stats', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
        }
        const stats = await reservation_service_1.ReservationService.getReservationStats(tenantId);
        return api_standards_1.StandardResponseBuilder.success(res, stats);
    }
    catch (error) {
        console.error('予約統計取得エラー:', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('RESERVATION_STATS_ERROR', error instanceof Error ? error.message : '予約統計取得に失敗しました').response);
    }
});
exports.default = router;
