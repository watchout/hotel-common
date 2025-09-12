"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const room_grade_service_1 = require("../../../services/room-grade.service");
const middleware_1 = require("../../../auth/middleware");
const room_grade_1 = require("../../../schemas/room-grade");
const response_builder_1 = require("../../../utils/response-builder");
const router = express_1.default.Router();
/**
 * 客室ランク管理APIルーター
 * 複数システム共通の基幹データ管理
 */
// 認証ミドルウェアを適用
router.use(middleware_1.verifyTenantAuth);
/**
 * 客室ランク作成
 * POST /api/v1/room-grades
 */
router.post('/api/v1/room-grades', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
        }
        // リクエストデータ検証
        const validationResult = room_grade_1.CreateRoomGradeRequestSchema.safeParse({
            ...req.body,
            tenant_id: tenantId
        });
        if (!validationResult.success) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー', validationResult.error.issues));
        }
        const roomGrade = await room_grade_service_1.RoomGradeService.createRoomGrade(validationResult.data);
        return response_builder_1.StandardResponseBuilder.success(res.status(201), roomGrade);
    }
    catch (error) {
        console.error('客室ランク作成エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_CREATE_ERROR', error instanceof Error ? error.message : '客室ランク作成に失敗しました'));
    }
});
/**
 * 客室ランク一覧取得
 * GET /api/v1/room-grades
 */
router.get('/api/v1/room-grades', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
        }
        const roomGrades = await room_grade_service_1.RoomGradeService.getRoomGrades(tenantId);
        return response_builder_1.StandardResponseBuilder.success(res, roomGrades);
    }
    catch (error) {
        console.error('客室ランク一覧取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_LIST_ERROR', error instanceof Error ? error.message : '客室ランク一覧取得に失敗しました'));
    }
});
/**
 * 客室ランク詳細取得
 * GET /api/v1/room-grades/:id
 */
router.get('/api/v1/room-grades/:id', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_ID_REQUIRED', '客室ランクIDが必要です'));
        }
        const roomGrade = await room_grade_service_1.RoomGradeService.getRoomGradeById(id, tenantId);
        if (!roomGrade) {
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_NOT_FOUND', '客室ランクが見つかりません'));
        }
        return response_builder_1.StandardResponseBuilder.success(res, roomGrade);
    }
    catch (error) {
        console.error('客室ランク詳細取得エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_GET_ERROR', error instanceof Error ? error.message : '客室ランク詳細取得に失敗しました'));
    }
});
/**
 * 客室ランク更新
 * PUT /api/v1/room-grades/:id
 */
router.put('/api/v1/room-grades/:id', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_ID_REQUIRED', '客室ランクIDが必要です'));
        }
        // リクエストデータ検証
        const validationResult = room_grade_1.UpdateRoomGradeRequestSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー', validationResult.error.issues));
        }
        const updatedRoomGrade = await room_grade_service_1.RoomGradeService.updateRoomGrade(id, tenantId, validationResult.data);
        return response_builder_1.StandardResponseBuilder.success(res, updatedRoomGrade);
    }
    catch (error) {
        console.error('客室ランク更新エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_UPDATE_ERROR', error instanceof Error ? error.message : '客室ランク更新に失敗しました'));
    }
});
/**
 * 客室ランク削除
 * DELETE /api/v1/room-grades/:id
 */
router.delete('/api/v1/room-grades/:id', async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'));
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_ID_REQUIRED', '客室ランクIDが必要です'));
        }
        const deletedBy = req.user?.user_id || req.user?.email || 'system';
        await room_grade_service_1.RoomGradeService.deleteRoomGrade(id, tenantId, deletedBy);
        return response_builder_1.StandardResponseBuilder.success(res, { message: '客室ランクを削除しました' });
    }
    catch (error) {
        console.error('客室ランク削除エラー:', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('ROOM_GRADE_DELETE_ERROR', error instanceof Error ? error.message : '客室ランク削除に失敗しました'));
    }
});
exports.default = router;
