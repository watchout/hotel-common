"use strict";
/**
 * スタッフ管理API（管理者用）
 * 既存staffテーブル構造を活用した実装
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const session_auth_middleware_1 = require("../../../auth/session-auth.middleware");
const database_1 = require("../../../database");
const admin_permission_1 = require("../../../middleware/admin-permission");
const staff_repository_1 = require("../../../repositories/staff/staff.repository");
const logger_1 = require("../../../utils/logger");
const response_builder_1 = require("../../../utils/response-builder");
const staff_helpers_1 = require("../../../utils/staff-helpers");
const router = express_1.default.Router();
const logger = logger_1.HotelLogger.getInstance();
// バリデーションスキーマ
const StaffListQuerySchema = zod_1.z.object({
    // 基本パラメータ
    page: zod_1.z.string().transform(Number).default('1'),
    pageSize: zod_1.z.string().transform(Number).default('20'),
    // 検索パラメータ
    search: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    // フィルタリングパラメータ
    departmentCode: zod_1.z.string().optional(), // カンマ区切りで複数部門対応
    role: zod_1.z.string().optional(), // カンマ区切りで複数役職対応
    employmentStatus: zod_1.z.enum(['active', 'inactive']).optional(),
    baseLevel: zod_1.z.string().transform(Number).optional(),
    isActive: zod_1.z.string().transform((val) => val === 'true').optional(),
    // 日付範囲フィルタ
    createdAfter: zod_1.z.string().datetime().optional(),
    createdBefore: zod_1.z.string().datetime().optional(),
    lastLoginAfter: zod_1.z.string().datetime().optional(),
    lastLoginBefore: zod_1.z.string().datetime().optional(),
    // ソートパラメータ
    sortBy: zod_1.z.enum(['displayName', 'staffCode', 'departmentCode', 'baseLevel', 'lastLoginAt', 'createdAt', 'email', 'role']).default('displayName'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc')
});
const StaffCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email('有効なメールアドレスを入力してください'),
    password: zod_1.z.string().min(8, 'パスワードは8文字以上である必要があります'),
    name: zod_1.z.string().min(1, '名前は必須です'),
    role: zod_1.z.enum(['staff', 'supervisor', 'manager', 'admin', 'super_admin']).default('staff'),
    department: zod_1.z.string().optional()
});
const StaffUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, '名前は必須です').optional(),
    role: zod_1.z.enum(['staff', 'supervisor', 'manager', 'admin', 'super_admin']).optional(),
    department: zod_1.z.string().optional(),
    is_active: zod_1.z.boolean().optional()
});
const StaffBulkUpdateSchema = zod_1.z.object({
    staffIds: zod_1.z.array(zod_1.z.string()).min(1, '更新対象のスタッフIDが必要です'),
    updates: zod_1.z.object({
        role: zod_1.z.enum(['staff', 'supervisor', 'manager', 'admin', 'super_admin']).optional(),
        department: zod_1.z.string().optional(),
        is_active: zod_1.z.boolean().optional()
    })
});
const StaffBulkDeleteSchema = zod_1.z.object({
    staffIds: zod_1.z.array(zod_1.z.string()).min(1, '削除対象のスタッフIDが必要です'),
    soft: zod_1.z.boolean().default(true)
});
/**
 * スタッフ一覧取得（管理者用）
 * GET /admin/staff
 */
router.get('/staff', session_auth_middleware_1.sessionAuthMiddleware, admin_permission_1.requireStaffManagementPermission, async (req, res) => {
    try {
        // UTF-8エンコーディング対応
        if (req.query.search && typeof req.query.search === 'string') {
            try {
                // URLデコードされていない場合の対応
                req.query.search = decodeURIComponent(req.query.search);
            }
            catch (e) {
                // 既にデコード済みの場合はそのまま使用
            }
        }
        const query = StaffListQuerySchema.parse(req.query);
        const { page, pageSize, search, email, departmentCode, role, employmentStatus, baseLevel, isActive, createdAfter, createdBefore, lastLoginAfter, lastLoginBefore, sortBy, sortOrder } = query;
        // ページサイズ制限
        const limitedPageSize = Math.min(pageSize, 100);
        logger.info('Staff list request', {
            userId: req.user?.user_id,
            tenantId: req.user?.tenant_id,
            query: {
                page, pageSize: limitedPageSize, search, email, departmentCode,
                role, employmentStatus, baseLevel, isActive, createdAfter,
                createdBefore, lastLoginAfter, lastLoginBefore, sortBy, sortOrder
            }
        });
        // 拡張検索条件構築
        const where = (0, staff_helpers_1.buildStaffSearchWhere)({
            tenantId: req.user?.tenant_id,
            search,
            email,
            departmentCode,
            role,
            employmentStatus,
            baseLevel,
            isActive,
            createdAfter,
            createdBefore,
            lastLoginAfter,
            lastLoginBefore
        });
        // 拡張ソート条件構築（DB実在カラムに限定）
        let orderBy = {};
        switch (sortBy) {
            case 'displayName':
                orderBy = { name: sortOrder };
                break;
            case 'email':
                orderBy = { email: sortOrder };
                break;
            case 'lastLoginAt':
                orderBy = { last_login_at: sortOrder };
                break;
            case 'createdAt':
                orderBy = { created_at: sortOrder };
                break;
            case 'staffCode':
                orderBy = { id: sortOrder };
                break;
            // role / departmentCode / baseLevel はスキーマにないため name へフォールバック
            case 'role':
            case 'departmentCode':
            case 'baseLevel':
            default:
                orderBy = { name: 'asc' };
        }
        // Repository経由で取得
        const repo = new staff_repository_1.StaffRepository();
        const result = await repo.list({
            tenantId: req.user?.tenant_id,
            page,
            pageSize: limitedPageSize,
            search,
            email,
            departmentCode,
            role,
            employmentStatus,
            baseLevel,
            isActive,
            createdAfter,
            createdBefore,
            lastLoginAfter,
            lastLoginBefore,
            sortBy,
            sortOrder
        });
        const response = {
            data: result.items,
            pagination: result.pagination,
            summary: result.summary
        };
        logger.info('Staff list response', {
            userId: req.user?.user_id,
            totalStaff: result?.pagination?.total,
            returnedCount: result.items.length
        });
        return response_builder_1.StandardResponseBuilder.success(res, response);
    }
    catch (error) {
        logger.error('Staff list error', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'リクエストパラメータが不正です', error.issues).response);
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_LIST_ERROR', error instanceof Error ? error.message : 'スタッフ一覧取得に失敗しました').response);
    }
});
/**
 * スタッフ一括更新（管理者用）
 * PATCH /admin/staff/bulk
 */
router.patch('/staff/bulk', session_auth_middleware_1.sessionAuthMiddleware, admin_permission_1.requireStaffAdminPermission, async (req, res) => {
    try {
        const data = StaffBulkUpdateSchema.parse(req.body);
        const { staffIds, updates } = data;
        logger.info('Staff bulk update request', {
            userId: req.user?.user_id,
            tenantId: req.user?.tenant_id,
            targetCount: staffIds.length,
            updates: Object.keys(updates)
        });
        // 対象スタッフの存在確認と権限チェック
        const existingStaff = await database_1.hotelDb.getAdapter().staff.findMany({
            where: {
                id: { in: staffIds },
                tenant_id: req.user?.tenant_id,
                is_deleted: false
            }
        });
        if (existingStaff.length !== staffIds.length) {
            const foundIds = existingStaff.map(s => s.id);
            const notFoundIds = staffIds.filter(id => !foundIds.includes(id));
            logger.warn('Staff not found for bulk update', {
                requestedIds: staffIds,
                foundIds: foundIds,
                notFoundIds: notFoundIds,
                tenantId: req.user?.tenant_id
            });
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('STAFF_NOT_FOUND', `一部のスタッフが見つかりません: ${notFoundIds.join(', ')}`).response);
        }
        // 権限チェック
        const managerRole = req.user?.role || 'staff';
        const unauthorizedStaff = existingStaff.filter(staff => !(0, staff_helpers_1.canManageStaff)(managerRole, staff?.role ?? 'staff') ||
            (updates.role && !(0, staff_helpers_1.canManageStaff)(managerRole, updates.role)));
        if (unauthorizedStaff.length > 0) {
            return res.status(403).json(response_builder_1.StandardResponseBuilder.error('INSUFFICIENT_PERMISSIONS', `権限不足により更新できないスタッフがあります: ${unauthorizedStaff.map(s => s.name).join(', ')}`).response);
        }
        // 一括更新実行
        const updateData = { updated_at: new Date() };
        if (updates.role !== undefined)
            updateData.role = updates.role;
        if (updates.department !== undefined)
            updateData.department = updates.department;
        if (updates.is_active !== undefined)
            updateData.is_active = updates.is_active;
        const updateResult = await database_1.hotelDb.getAdapter().staff.updateMany({
            where: { id: { in: staffIds } },
            data: updateData
        });
        // システムイベント記録
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `staff-bulk-update-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'staff',
                entity_id: 'bulk',
                action: 'STAFF_BULK_UPDATED',
                event_data: {
                    affectedStaffIds: staffIds,
                    affectedCount: updateResult.count,
                    updates: updateData
                },
                status: 'COMPLETED'
            }
        });
        logger.info('Staff bulk update completed', {
            userId: req.user?.user_id,
            affectedCount: updateResult.count,
            targetCount: staffIds.length
        });
        return response_builder_1.StandardResponseBuilder.success(res, {
            success: true,
            message: `${updateResult.count}件のスタッフを更新しました`,
            affectedCount: updateResult.count,
            targetCount: staffIds.length
        });
    }
    catch (error) {
        logger.error('Staff bulk update error', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'リクエストデータが不正です', error.issues).response);
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_BULK_UPDATE_ERROR', error instanceof Error ? error.message : 'スタッフ一括更新に失敗しました').response);
    }
});
/**
 * スタッフ一括削除（管理者用）
 * DELETE /admin/staff/bulk
 */
router.delete('/staff/bulk', session_auth_middleware_1.sessionAuthMiddleware, admin_permission_1.requireStaffAdminPermission, async (req, res) => {
    try {
        const data = StaffBulkDeleteSchema.parse(req.body);
        const { staffIds, soft } = data;
        logger.info('Staff bulk delete request', {
            userId: req.user?.user_id,
            tenantId: req.user?.tenant_id,
            targetCount: staffIds.length,
            softDelete: soft
        });
        // 自分自身が含まれていないかチェック
        if (staffIds.includes(req.user?.user_id)) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('CANNOT_DELETE_SELF', '自分自身を削除対象に含めることはできません').response);
        }
        // 対象スタッフの存在確認と権限チェック
        const existingStaff = await database_1.hotelDb.getAdapter().staff.findMany({
            where: {
                id: { in: staffIds },
                tenant_id: req.user?.tenant_id,
                is_deleted: false
            }
        });
        if (existingStaff.length !== staffIds.length) {
            const foundIds = existingStaff.map(s => s.id);
            const notFoundIds = staffIds.filter(id => !foundIds.includes(id));
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('STAFF_NOT_FOUND', `一部のスタッフが見つかりません: ${notFoundIds.join(', ')}`).response);
        }
        // 権限チェック
        const managerRole = req.user?.role || 'staff';
        const unauthorizedStaff = existingStaff.filter(staff => !(0, staff_helpers_1.canManageStaff)(managerRole, staff.role));
        if (unauthorizedStaff.length > 0) {
            return res.status(403).json(response_builder_1.StandardResponseBuilder.error('INSUFFICIENT_PERMISSIONS', `権限不足により削除できないスタッフがあります: ${unauthorizedStaff.map(s => s.name).join(', ')}`).response);
        }
        let deleteResult;
        const deletedAt = new Date();
        if (soft) {
            // ソフト削除
            deleteResult = await database_1.hotelDb.getAdapter().staff.updateMany({
                where: { id: { in: staffIds } },
                data: {
                    is_deleted: true,
                    deleted_at: deletedAt,
                    deleted_by: req.user?.user_id,
                    updated_at: deletedAt
                }
            });
        }
        else {
            // ハード削除
            deleteResult = await database_1.hotelDb.getAdapter().staff.deleteMany({
                where: { id: { in: staffIds } }
            });
        }
        // システムイベント記録
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `staff-bulk-delete-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'staff',
                entity_id: 'bulk',
                action: soft ? 'STAFF_BULK_SOFT_DELETED' : 'STAFF_BULK_HARD_DELETED',
                event_data: {
                    affectedStaffIds: staffIds,
                    affectedCount: deleteResult.count,
                    softDelete: soft,
                    deletedStaff: existingStaff.map(s => ({
                        id: s.id,
                        email: s.email,
                        name: s.name,
                        role: s?.role ?? null
                    }))
                },
                status: 'COMPLETED'
            }
        });
        logger.info('Staff bulk delete completed', {
            userId: req.user?.user_id,
            affectedCount: deleteResult.count,
            targetCount: staffIds.length,
            softDelete: soft
        });
        return response_builder_1.StandardResponseBuilder.success(res, {
            success: true,
            message: `${deleteResult.count}件のスタッフを${soft ? '削除' : '完全に削除'}しました`,
            affectedCount: deleteResult.count,
            targetCount: staffIds.length,
            deletedAt: soft ? deletedAt.toISOString() : null
        });
    }
    catch (error) {
        logger.error('Staff bulk delete error', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'リクエストデータが不正です', error.issues).response);
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_BULK_DELETE_ERROR', error instanceof Error ? error.message : 'スタッフ一括削除に失敗しました').response);
    }
});
/**
 * スタッフ詳細取得（管理者用）
 * GET /admin/staff/:id
 */
router.get('/staff/:id', session_auth_middleware_1.sessionAuthMiddleware, admin_permission_1.requireStaffManagementPermission, async (req, res) => {
    try {
        const { id } = req.params;
        logger.info('Staff detail request', {
            userId: req.user?.user_id,
            tenantId: req.user?.tenant_id,
            targetStaffId: id
        });
        // スタッフ取得
        const staff = await database_1.hotelDb.getAdapter().staff.findFirst({
            where: {
                id,
                tenant_id: req.user?.tenant_id,
                is_deleted: false
            }
        });
        if (!staff) {
            logger.warn('Staff not found', {
                userId: req.user?.user_id,
                targetStaffId: id
            });
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('STAFF_NOT_FOUND', 'スタッフが見つかりません').response);
        }
        // レスポンス構築
        const response = (0, staff_helpers_1.mapStaffToApiResponse)(staff);
        logger.info('Staff detail response', {
            userId: req.user?.user_id,
            targetStaffId: id,
            staffEmail: staff.email
        });
        return response_builder_1.StandardResponseBuilder.success(res, response);
    }
    catch (error) {
        logger.error('Staff detail error', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_DETAIL_ERROR', error instanceof Error ? error.message : 'スタッフ詳細取得に失敗しました').response);
    }
});
/**
 * スタッフ作成（管理者用）
 * POST /admin/staff
 */
router.post('/staff', session_auth_middleware_1.sessionAuthMiddleware, admin_permission_1.requireStaffAdminPermission, async (req, res) => {
    try {
        const data = StaffCreateSchema.parse(req.body);
        logger.info('Staff create request', {
            userId: req.user?.user_id,
            tenantId: req.user?.tenant_id,
            email: data.email,
            role: data.role
        });
        // 権限チェック（自分より上位レベルのスタッフは作成不可）
        const managerRole = req.user?.role || 'staff';
        if (!(0, staff_helpers_1.canManageStaff)(managerRole, data.role)) {
            logger.warn('Insufficient permission to create staff with higher level', {
                managerRole,
                targetRole: data.role,
                userId: req.user?.user_id
            });
            return res.status(403).json(response_builder_1.StandardResponseBuilder.error('INSUFFICIENT_PERMISSIONS', '自分より上位レベルのスタッフは作成できません').response);
        }
        // メールアドレス重複チェック
        const emailExists = await (0, staff_helpers_1.checkEmailExists)(database_1.hotelDb.getAdapter(), data.email, req.user?.tenant_id);
        if (emailExists) {
            logger.warn('Email already exists', {
                email: data.email,
                tenantId: req.user?.tenant_id
            });
            return res.status(409).json(response_builder_1.StandardResponseBuilder.error('EMAIL_ALREADY_EXISTS', 'このメールアドレスは既に使用されています').response);
        }
        // スタッフデータ準備
        const staffData = await (0, staff_helpers_1.prepareStaffCreateData)({
            email: data.email,
            password: data.password,
            name: data.name,
            role: data.role,
            department: data.department,
            tenantId: req.user?.tenant_id,
            createdBy: req.user?.user_id
        });
        // スタッフ作成
        const createdStaff = await database_1.hotelDb.getAdapter().staff.create({
            data: staffData
        });
        // システムイベント記録
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `staff-create-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'staff',
                entity_id: createdStaff.id,
                action: 'STAFF_CREATED',
                event_data: {
                    email: createdStaff.email,
                    name: createdStaff.name,
                    role: createdStaff.role,
                    department: createdStaff.department
                },
                status: 'COMPLETED'
            }
        });
        const response = (0, staff_helpers_1.mapStaffToApiResponse)(createdStaff);
        logger.info('Staff created successfully', {
            userId: req.user?.user_id,
            createdStaffId: createdStaff.id,
            email: createdStaff.email
        });
        return response_builder_1.StandardResponseBuilder.success(res, response, {}, 201);
    }
    catch (error) {
        logger.error('Staff create error', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'リクエストデータが不正です', error.issues).response);
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_CREATE_ERROR', error instanceof Error ? error.message : 'スタッフ作成に失敗しました').response);
    }
});
/**
 * スタッフ更新（管理者用）
 * PATCH /admin/staff/:id
 */
router.patch('/staff/:id', session_auth_middleware_1.sessionAuthMiddleware, admin_permission_1.requireStaffManagementPermission, async (req, res) => {
    try {
        const { id } = req.params;
        const data = StaffUpdateSchema.parse(req.body);
        logger.info('Staff update request', {
            userId: req.user?.user_id,
            tenantId: req.user?.tenant_id,
            targetStaffId: id,
            updateData: Object.keys(data)
        });
        // 対象スタッフの存在確認
        const existingStaff = await database_1.hotelDb.getAdapter().staff.findFirst({
            where: {
                id,
                tenant_id: req.user?.tenant_id,
                is_deleted: false
            }
        });
        if (!existingStaff) {
            logger.warn('Staff not found for update', {
                userId: req.user?.user_id,
                targetStaffId: id
            });
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('STAFF_NOT_FOUND', 'スタッフが見つかりません').response);
        }
        // 権限チェック（自分より上位レベルのスタッフは更新不可）
        const managerRole = req.user?.role || 'staff';
        if (!(0, staff_helpers_1.canManageStaff)(managerRole, existingStaff?.role ?? 'staff')) {
            logger.warn('Insufficient permission to update higher level staff', {
                managerRole,
                targetRole: existingStaff.role,
                userId: req.user?.user_id,
                targetStaffId: id
            });
            return res.status(403).json(response_builder_1.StandardResponseBuilder.error('INSUFFICIENT_PERMISSIONS', '自分より上位レベルのスタッフは更新できません').response);
        }
        // roleが変更される場合の権限チェック
        if (data.role && !(0, staff_helpers_1.canManageStaff)(managerRole, data.role)) {
            logger.warn('Insufficient permission to assign higher level role', {
                managerRole,
                targetRole: data.role,
                userId: req.user?.user_id
            });
            return res.status(403).json(response_builder_1.StandardResponseBuilder.error('INSUFFICIENT_PERMISSIONS', '自分より上位レベルの権限は付与できません').response);
        }
        // 更新データ準備
        const updateData = {
            updated_at: new Date()
        };
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.department !== undefined)
            updateData.department = data.department;
        if (data.is_active !== undefined)
            updateData.is_active = data.is_active;
        // スタッフ更新
        const updatedStaff = await database_1.hotelDb.getAdapter().staff.update({
            where: { id },
            data: updateData
        });
        // システムイベント記録
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `staff-update-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'staff',
                entity_id: updatedStaff.id,
                action: 'STAFF_UPDATED',
                event_data: {
                    updatedFields: Object.keys(data),
                    previousData: {
                        name: existingStaff.name,
                        role: existingStaff?.role ?? null,
                        department: existingStaff?.department ?? null,
                        is_active: existingStaff.is_active
                    },
                    newData: updateData
                },
                status: 'COMPLETED'
            }
        });
        const response = (0, staff_helpers_1.mapStaffToApiResponse)(updatedStaff);
        logger.info('Staff updated successfully', {
            userId: req.user?.user_id,
            targetStaffId: id,
            updatedFields: Object.keys(data)
        });
        return response_builder_1.StandardResponseBuilder.success(res, response);
    }
    catch (error) {
        logger.error('Staff update error', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'リクエストデータが不正です', error.issues).response);
        }
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_UPDATE_ERROR', error instanceof Error ? error.message : 'スタッフ更新に失敗しました').response);
    }
});
/**
 * スタッフ削除（管理者用）
 * DELETE /admin/staff/:id
 */
router.delete('/staff/:id', session_auth_middleware_1.sessionAuthMiddleware, admin_permission_1.requireStaffAdminPermission, async (req, res) => {
    try {
        const { id } = req.params;
        const { soft = 'true' } = req.query;
        const isSoftDelete = soft === 'true';
        logger.info('Staff delete request', {
            userId: req.user?.user_id,
            tenantId: req.user?.tenant_id,
            targetStaffId: id,
            softDelete: isSoftDelete
        });
        // 対象スタッフの存在確認
        const existingStaff = await database_1.hotelDb.getAdapter().staff.findFirst({
            where: {
                id,
                tenant_id: req.user?.tenant_id,
                is_deleted: false
            }
        });
        if (!existingStaff) {
            logger.warn('Staff not found for deletion', {
                userId: req.user?.user_id,
                targetStaffId: id
            });
            return res.status(404).json(response_builder_1.StandardResponseBuilder.error('STAFF_NOT_FOUND', 'スタッフが見つかりません').response);
        }
        // 自分自身の削除を防ぐ
        if (existingStaff.id === req.user?.user_id) {
            logger.warn('Attempted self-deletion', {
                userId: req.user?.user_id,
                targetStaffId: id
            });
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('CANNOT_DELETE_SELF', '自分自身を削除することはできません').response);
        }
        // 権限チェック（自分より上位レベルのスタッフは削除不可）
        const managerRole = req.user?.role || 'staff';
        if (!(0, staff_helpers_1.canManageStaff)(managerRole, existingStaff.role)) {
            logger.warn('Insufficient permission to delete higher level staff', {
                managerRole,
                targetRole: existingStaff.role,
                userId: req.user?.user_id,
                targetStaffId: id
            });
            return res.status(403).json(response_builder_1.StandardResponseBuilder.error('INSUFFICIENT_PERMISSIONS', '自分より上位レベルのスタッフは削除できません').response);
        }
        let deletedAt = null;
        if (isSoftDelete) {
            // ソフト削除
            deletedAt = new Date();
            await database_1.hotelDb.getAdapter().staff.update({
                where: { id },
                data: {
                    is_deleted: true,
                    deleted_at: deletedAt,
                    deleted_by: req.user?.user_id,
                    updated_at: new Date()
                }
            });
        }
        else {
            // ハード削除（通常は使用しない）
            await database_1.hotelDb.getAdapter().staff.delete({
                where: { id }
            });
        }
        // システムイベント記録
        await database_1.hotelDb.getAdapter().systemEvent.create({
            data: {
                id: `staff-delete-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                tenant_id: req.user?.tenant_id,
                user_id: req.user?.user_id,
                event_type: 'USER_OPERATION',
                source_system: 'hotel-common',
                target_system: 'hotel-common',
                entity_type: 'staff',
                entity_id: id,
                action: isSoftDelete ? 'STAFF_SOFT_DELETED' : 'STAFF_HARD_DELETED',
                event_data: {
                    deletedStaff: {
                        email: existingStaff.email,
                        name: existingStaff.name,
                        role: existingStaff.role,
                        department: existingStaff.department
                    },
                    softDelete: isSoftDelete
                },
                status: 'COMPLETED'
            }
        });
        logger.info('Staff deleted successfully', {
            userId: req.user?.user_id,
            targetStaffId: id,
            softDelete: isSoftDelete
        });
        return response_builder_1.StandardResponseBuilder.success(res, {
            success: true,
            message: isSoftDelete ? 'スタッフを削除しました' : 'スタッフを完全に削除しました',
            deletedAt: deletedAt?.toISOString() || null
        });
    }
    catch (error) {
        logger.error('Staff delete error', error);
        return res.status(500).json(response_builder_1.StandardResponseBuilder.error('STAFF_DELETE_ERROR', error instanceof Error ? error.message : 'スタッフ削除に失敗しました').response);
    }
});
exports.default = router;
