"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const middleware_1 = require("../../../auth/middleware");
const database_1 = require("../../../database");
const api_response_standards_1 = require("../../../standards/api-response-standards");
const router = express_1.default.Router();
// 定義: カテゴリ/可視性/ステータス/優先度
const CategoryEnum = zod_1.z.enum(['reservation', 'handover', 'lost_item', 'maintenance', 'cleaning', 'guest_request', 'other']);
const VisibilityEnum = zod_1.z.enum(['public', 'private', 'role']);
const StatusEnum = zod_1.z.enum(['pending', 'in_progress', 'completed']);
const PriorityEnum = zod_1.z.enum(['low', 'normal', 'high', 'urgent']);
const ListQuery = zod_1.z.object({
    status: StatusEnum.optional(),
    category: CategoryEnum.optional(),
    visibility: VisibilityEnum.optional(),
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('20')
});
const CreateSchema = zod_1.z.object({
    room_number: zod_1.z.string().min(1),
    category: CategoryEnum.default('handover'),
    visibility: VisibilityEnum.default('public'),
    visible_roles: zod_1.z.array(zod_1.z.string()).default([]),
    content: zod_1.z.string().min(1),
    priority: PriorityEnum.default('normal'),
    due_date: zod_1.z.string().datetime().optional(),
    assigned_to_staff_id: zod_1.z.string().optional()
});
const UpdateSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).optional(),
    priority: PriorityEnum.optional(),
    due_date: zod_1.z.string().datetime().optional(),
    visibility: VisibilityEnum.optional(),
    visible_roles: zod_1.z.array(zod_1.z.string()).optional(),
    assigned_to_staff_id: zod_1.z.string().optional()
});
const ChangeStatusSchema = zod_1.z.object({
    status: StatusEnum,
    comment: zod_1.z.string().optional()
});
const CommentCreateSchema = zod_1.z.object({ content: zod_1.z.string().min(1), parent_comment_id: zod_1.z.string().optional() });
// GET /api/v1/admin/room-memos?room_number=101
router.get('/room-memos', middleware_1.authMiddleware, async (req, res) => {
    try {
        const query = ListQuery.extend({
            room_number: zod_1.z.string().optional(),
            room_id: zod_1.z.string().optional()
        }).parse(req.query);
        const { page, limit, status, category, visibility, room_number, room_id } = query;
        // Room取得（room_numberまたはroom_idで検索）
        let room = null;
        if (room_number) {
            room = await database_1.hotelDb.getAdapter().room.findFirst({
                where: { tenantId: req.user?.tenant_id, roomNumber: room_number }
            });
        }
        else if (room_id) {
            room = await database_1.hotelDb.getAdapter().room.findFirst({
                where: { tenantId: req.user?.tenant_id, id: room_id }
            });
        }
        if (!room && (room_number || room_id)) {
            return api_response_standards_1.ResponseHelper.sendNotFound(res, '指定された客室が見つかりません');
        }
        const where = {
            tenant_id: req.user?.tenant_id,
            is_deleted: false
        };
        // 客室指定がある場合のみroom_idを追加
        if (room) {
            where.room_id = room.id;
        }
        if (status)
            where.status = status;
        if (category)
            where.category = category;
        if (visibility)
            where.visibility = visibility;
        const [memos, total] = await Promise.all([
            database_1.hotelDb.getAdapter().roomMemo.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            database_1.hotelDb.getAdapter().roomMemo.count({ where })
        ]);
        const pagination = api_response_standards_1.StandardResponseBuilder.createPagination(page, limit, total);
        // 返却フォーマット（最小）：仕様例に近づける
        const result = memos.map(m => ({
            id: m.id,
            room_id: m.room_id,
            room_number: room?.roomNumber || null, // 客室番号も含める
            category: m.category,
            visibility: m.visibility,
            visible_roles: m.visible_roles,
            content: m.content,
            status: m.status,
            priority: m.priority,
            due_date: m.due_date,
            created_at: m.created_at,
            updated_at: m.updated_at,
            created_by: { id: m.created_by_staff_id },
            assigned_to: m.assigned_to_staff_id ? { id: m.assigned_to_staff_id } : null
        }));
        return api_response_standards_1.ResponseHelper.sendSuccess(res, { memos: result }, 200, pagination);
    }
    catch (e) {
        return api_response_standards_1.ResponseHelper.sendInternalError(res, e?.message || 'メモ一覧の取得に失敗しました');
    }
});
// POST /api/v1/admin/room-memos
router.post('/room-memos', middleware_1.authMiddleware, async (req, res) => {
    try {
        const data = CreateSchema.parse(req.body);
        const room = await database_1.hotelDb.getAdapter().room.findFirst({
            where: { tenantId: req.user?.tenant_id, roomNumber: data.room_number }
        });
        if (!room)
            return api_response_standards_1.ResponseHelper.sendNotFound(res, '指定された客室が見つかりません');
        const created = await database_1.hotelDb.getAdapter().roomMemo.create({
            data: {
                tenant_id: req.user?.tenant_id,
                room_id: room.id,
                category: data.category,
                visibility: data.visibility,
                visible_roles: data.visible_roles,
                content: data.content,
                status: 'pending',
                priority: data.priority,
                due_date: data.due_date ? new Date(data.due_date) : null,
                created_by_staff_id: req.user?.user_id,
                assigned_to_staff_id: data.assigned_to_staff_id || null
            }
        });
        // system_event: MEMO_CREATED
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'room_memo',
                entity_id: created.id,
                action: 'MEMO_CREATED',
                event_data: {
                    room_id: created.room_id,
                    memo_id: created.id,
                    category: created.category,
                    visibility: created.visibility,
                    visible_roles: created.visible_roles,
                    priority: created.priority
                },
                status: 'COMPLETED'
            }
        });
        return api_response_standards_1.ResponseHelper.sendSuccess(res, { memo_id: created.id }, 201);
    }
    catch (e) {
        if (e?.issues)
            return api_response_standards_1.ResponseHelper.sendValidationError(res, '入力が不正です', e.issues);
        return api_response_standards_1.ResponseHelper.sendInternalError(res, e?.message || 'メモ作成に失敗しました');
    }
});
// PUT /api/v1/admin/room-memos/:id
router.put('/room-memos/:id', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const changes = UpdateSchema.parse(req.body);
        const memo = await database_1.hotelDb.getAdapter().roomMemo.findFirst({ where: { id, tenant_id: req.user?.tenant_id, is_deleted: false } });
        if (!memo)
            return api_response_standards_1.ResponseHelper.sendNotFound(res, 'メモが見つかりません');
        const updated = await database_1.hotelDb.getAdapter().roomMemo.update({
            where: { id },
            data: {
                content: changes.content ?? undefined,
                priority: changes.priority ?? undefined,
                due_date: changes.due_date ? new Date(changes.due_date) : undefined,
                visibility: changes.visibility ?? undefined,
                visible_roles: changes.visible_roles ?? undefined,
                assigned_to_staff_id: changes.assigned_to_staff_id ?? undefined,
                updated_by_staff_id: req.user?.user_id
            }
        });
        // system_event: MEMO_UPDATED
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'room_memo',
                entity_id: id,
                action: 'MEMO_UPDATED',
                event_data: {
                    changed: Object.keys(changes)
                },
                status: 'COMPLETED'
            }
        });
        return api_response_standards_1.ResponseHelper.sendSuccess(res, { memo_id: updated.id }, 200);
    }
    catch (e) {
        if (e?.issues)
            return api_response_standards_1.ResponseHelper.sendValidationError(res, '入力が不正です', e.issues);
        return api_response_standards_1.ResponseHelper.sendInternalError(res, e?.message || 'メモ更新に失敗しました');
    }
});
// PUT /api/v1/admin/room-memos/:id/status
router.put('/room-memos/:id/status', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const body = ChangeStatusSchema.parse(req.body);
        const memo = await database_1.hotelDb.getAdapter().roomMemo.findFirst({ where: { id, tenant_id: req.user?.tenant_id, is_deleted: false } });
        if (!memo)
            return api_response_standards_1.ResponseHelper.sendNotFound(res, 'メモが見つかりません');
        await database_1.hotelDb.transaction(async (tx) => {
            await tx.roomMemo.update({ where: { id }, data: { status: body.status, updated_by_staff_id: req.user?.user_id } });
            await tx.roomMemoStatusLog.create({
                data: {
                    tenant_id: req.user?.tenant_id,
                    memo_id: id,
                    status_from: memo.status,
                    status_to: body.status,
                    comment: body.comment || null,
                    changed_by_staff_id: req.user?.user_id
                }
            });
            await tx.systemEvent.create({
                data: {
                    id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    tenant_id: req.user?.tenant_id,
                    user_id: req.user?.user_id,
                    event_type: 'USER_OPERATION',
                    source_system: 'hotel-common',
                    target_system: 'hotel-common',
                    entity_type: 'room_memo',
                    entity_id: id,
                    action: 'MEMO_STATUS_CHANGED',
                    event_data: {
                        from: memo.status,
                        to: body.status,
                        comment: body.comment || null
                    },
                    status: 'COMPLETED'
                }
            });
        });
        return api_response_standards_1.ResponseHelper.sendSuccess(res, { memo_id: id, status: body.status }, 200);
    }
    catch (e) {
        if (e?.issues)
            return api_response_standards_1.ResponseHelper.sendValidationError(res, '入力が不正です', e.issues);
        return api_response_standards_1.ResponseHelper.sendInternalError(res, e?.message || 'ステータス変更に失敗しました');
    }
});
// コメント
router.get('/room-memos/:id/comments', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await database_1.hotelDb.getAdapter().roomMemoComment.findMany({
            where: { tenant_id: req.user?.tenant_id, memo_id: id },
            orderBy: { created_at: 'asc' }
        });
        return api_response_standards_1.ResponseHelper.sendSuccess(res, { comments });
    }
    catch (e) {
        return api_response_standards_1.ResponseHelper.sendInternalError(res, e?.message || 'コメント取得に失敗しました');
    }
});
router.post('/room-memos/:id/comments', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const body = CommentCreateSchema.parse(req.body);
        // 存在確認
        const memo = await database_1.hotelDb.getAdapter().roomMemo.findFirst({ where: { id, tenant_id: req.user?.tenant_id, is_deleted: false } });
        if (!memo)
            return api_response_standards_1.ResponseHelper.sendNotFound(res, 'メモが見つかりません');
        const created = await database_1.hotelDb.getAdapter().roomMemoComment.create({
            data: {
                tenant_id: req.user?.tenant_id,
                memo_id: id,
                parent_comment_id: body.parent_comment_id || null,
                content: body.content,
                created_by_staff_id: req.user?.user_id
            }
        });
        // system_event: MEMO_COMMENT_ADDED
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'room_memo',
                entity_id: id,
                action: 'MEMO_COMMENT_ADDED',
                event_data: { comment_id: created.id },
                status: 'COMPLETED'
            }
        });
        return api_response_standards_1.ResponseHelper.sendSuccess(res, { comment_id: created.id }, 201);
    }
    catch (e) {
        if (e?.issues)
            return api_response_standards_1.ResponseHelper.sendValidationError(res, '入力が不正です', e.issues);
        return api_response_standards_1.ResponseHelper.sendInternalError(res, e?.message || 'コメント作成に失敗しました');
    }
});
// DELETE /api/v1/admin/room-memos/:id
router.delete('/room-memos/:id', middleware_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const memo = await database_1.hotelDb.getAdapter().roomMemo.findFirst({ where: { id, tenant_id: req.user?.tenant_id, is_deleted: false } });
        if (!memo)
            return api_response_standards_1.ResponseHelper.sendNotFound(res, 'メモが見つかりません');
        await database_1.hotelDb.getAdapter().roomMemo.update({ where: { id }, data: { is_deleted: true, deleted_at: new Date() } });
        // system_event: MEMO_DELETED
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'room_memo',
                entity_id: id,
                action: 'MEMO_DELETED',
                event_data: {},
                status: 'COMPLETED'
            }
        });
        return api_response_standards_1.ResponseHelper.sendSuccess(res, { memo_id: id }, 200);
    }
    catch (e) {
        return api_response_standards_1.ResponseHelper.sendInternalError(res, e?.message || 'メモ削除に失敗しました');
    }
});
exports.default = router;
