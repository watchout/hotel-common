"use strict";
/**
 * 管理者権限チェックミドルウェア
 * baseLevelベースの権限管理（既存roleフィールドから計算）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTenantAdmin = exports.preventHigherLevelStaffOperation = exports.requireSystemAdminPermission = exports.requireStaffAdminPermission = exports.requireStaffManagementPermission = exports.requireAdminLevel = void 0;
const staff_helpers_1 = require("../utils/staff-helpers");
const logger_1 = require("../utils/logger");
const response_builder_1 = require("../utils/response-builder");
const logger = logger_1.HotelLogger.getInstance();
/**
 * 管理者権限レベルチェックミドルウェア
 */
const requireAdminLevel = (requiredLevel) => {
    return (req, res, next) => {
        try {
            // 認証チェック
            if (!req.user) {
                return res.status(401).json(response_builder_1.StandardResponseBuilder.error('UNAUTHORIZED', '認証が必要です').response);
            }
            // ユーザーの権限レベル取得
            const userRole = req.user.role || 'staff';
            const userLevel = (0, staff_helpers_1.getRoleLevel)(userRole);
            logger.debug('Admin permission check', {
                userId: req.user.user_id,
                userRole,
                userLevel,
                requiredLevel,
                path: req.path
            });
            // 権限レベルチェック
            if (userLevel < requiredLevel) {
                logger.warn('Insufficient admin permissions', {
                    userId: req.user.user_id,
                    userRole,
                    userLevel,
                    requiredLevel,
                    path: req.path
                });
                return res.status(403).json(response_builder_1.StandardResponseBuilder.error('INSUFFICIENT_PERMISSIONS', `管理者権限（レベル${requiredLevel}以上）が必要です。現在のレベル: ${userLevel}`).response);
            }
            // 権限チェック通過
            logger.info('Admin permission granted', {
                userId: req.user.user_id,
                userLevel,
                requiredLevel,
                path: req.path
            });
            next();
        }
        catch (error) {
            logger.error('Admin permission check error', error);
            return res.status(500).json(response_builder_1.StandardResponseBuilder.error('PERMISSION_CHECK_ERROR', '権限チェック中にエラーが発生しました').response);
        }
    };
};
exports.requireAdminLevel = requireAdminLevel;
/**
 * スタッフ管理権限チェック（レベル3以上）
 */
exports.requireStaffManagementPermission = (0, exports.requireAdminLevel)(3);
/**
 * スタッフ作成・削除権限チェック（レベル4以上）
 */
exports.requireStaffAdminPermission = (0, exports.requireAdminLevel)(4);
/**
 * システム管理権限チェック（レベル5）
 */
exports.requireSystemAdminPermission = (0, exports.requireAdminLevel)(5);
/**
 * 自分より上位レベルのスタッフ操作を防ぐミドルウェア
 */
const preventHigherLevelStaffOperation = () => {
    return (req, res, next) => {
        // このミドルウェアは個別スタッフ操作時に使用
        // 実際のレベルチェックは各エンドポイント内で実装
        next();
    };
};
exports.preventHigherLevelStaffOperation = preventHigherLevelStaffOperation;
/**
 * テナント管理者権限チェック
 */
const requireTenantAdmin = (req, res, next) => {
    if (!req.user?.tenant_id) {
        return res.status(400).json(response_builder_1.StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response);
    }
    const userLevel = (0, staff_helpers_1.getRoleLevel)(req.user.role || 'staff');
    if (userLevel < 3) {
        return res.status(403).json(response_builder_1.StandardResponseBuilder.error('TENANT_ADMIN_REQUIRED', 'テナント管理者権限が必要です').response);
    }
    next();
};
exports.requireTenantAdmin = requireTenantAdmin;
