"use strict";
// hotel-member階層権限管理APIエンドポイント
// FastAPI (Python) からの階層権限要求を処理するREST API
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hierarchy_adapter_stub_1 = require("./hierarchy-adapter-stub");
// 名前の互換性のために別名を使用
const HotelMemberHierarchyAdapter = hierarchy_adapter_stub_1.HotelMemberHierarchyAdapterStub;
const logger_1 = require("../../utils/logger");
const router = express_1.default.Router();
const logger = logger_1.HotelLogger.getInstance();
/**
 * hotel-member専用階層権限管理APIルーター
 */
// 階層JWT検証エンドポイント
router.post('/hierarchy/auth/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'TOKEN_REQUIRED',
                message: 'Token is required'
            });
        }
        const result = await HotelMemberHierarchyAdapter.verifyHierarchicalTokenForPython({
            token
        });
        if (result.success) {
            res.json({
                success: true,
                user: result.user
            });
        }
        else {
            res.status(401).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        logger.error('階層JWT検証エンドポイントエラー:', error);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
// 顧客データアクセス権限チェックエンドポイント
router.post('/hierarchy/permissions/check-customer-access', async (req, res) => {
    try {
        const { token, target_tenant_id, operation = 'READ' } = req.body;
        if (!token || !target_tenant_id) {
            return res.status(400).json({
                error: 'MISSING_PARAMETERS',
                message: 'Token and target_tenant_id are required'
            });
        }
        const result = await HotelMemberHierarchyAdapter.checkCustomerDataAccessForPython({
            token,
            target_tenant_id,
            operation
        });
        res.json(result);
    }
    catch (error) {
        logger.error('顧客データアクセス権限チェックエンドポイントエラー:', error);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Permission check failed'
        });
    }
});
// アクセス可能テナント一覧取得エンドポイント
router.post('/hierarchy/tenants/accessible', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'TOKEN_REQUIRED',
                message: 'Token is required'
            });
        }
        const result = await HotelMemberHierarchyAdapter.getAccessibleTenantsForPython({
            token
        });
        if (result.success) {
            res.json({
                success: true,
                tenants: result.tenants
            });
        }
        else {
            res.status(401).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        logger.error('アクセス可能テナント取得エンドポイントエラー:', error);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Failed to get accessible tenants'
        });
    }
});
// 会員データ階層制限チェックエンドポイント
router.post('/hierarchy/permissions/check-membership-restrictions', async (req, res) => {
    try {
        const { token, operation, data_type } = req.body;
        if (!token || !operation || !data_type) {
            return res.status(400).json({
                error: 'MISSING_PARAMETERS',
                message: 'Token, operation, and data_type are required'
            });
        }
        const result = await HotelMemberHierarchyAdapter.checkMembershipDataRestrictionsForPython({
            token,
            operation,
            data_type
        });
        res.json(result);
    }
    catch (error) {
        logger.error('会員データ階層制限チェックエンドポイントエラー:', error);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Restriction check failed'
        });
    }
});
// グループ分析権限チェックエンドポイント
router.post('/hierarchy/permissions/check-analytics-access', async (req, res) => {
    try {
        const { token, analytics_type } = req.body;
        if (!token || !analytics_type) {
            return res.status(400).json({
                error: 'MISSING_PARAMETERS',
                message: 'Token and analytics_type are required'
            });
        }
        const result = await HotelMemberHierarchyAdapter.checkGroupAnalyticsAccessForPython({
            token,
            analytics_type
        });
        res.json(result);
    }
    catch (error) {
        logger.error('グループ分析権限チェックエンドポイントエラー:', error);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Analytics access check failed'
        });
    }
});
// 階層権限情報取得エンドポイント（詳細）
router.post('/hierarchy/user/permissions-detail', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'TOKEN_REQUIRED',
                message: 'Token is required'
            });
        }
        // JWT検証
        const verifyResult = await HotelMemberHierarchyAdapter.verifyHierarchicalTokenForPython({
            token
        });
        if (!verifyResult.success || !verifyResult.user) {
            return res.status(401).json({
                error: 'INVALID_TOKEN',
                message: 'Invalid or expired token'
            });
        }
        const user = verifyResult.user;
        const hierarchyContext = user.hierarchy_context;
        // アクセス可能テナント取得
        const tenantsResult = await HotelMemberHierarchyAdapter.getAccessibleTenantsForPython({
            token
        });
        // 会員データ制限情報取得
        const membershipRestrictions = {
            tier_management: await HotelMemberHierarchyAdapter.checkMembershipDataRestrictionsForPython({
                token,
                operation: 'update',
                data_type: 'membership_tier'
            }),
            points_transfer: await HotelMemberHierarchyAdapter.checkMembershipDataRestrictionsForPython({
                token,
                operation: 'transfer',
                data_type: 'points_balance'
            }),
            analytics_access: await HotelMemberHierarchyAdapter.checkGroupAnalyticsAccessForPython({
                token,
                analytics_type: 'membership_summary'
            })
        };
        const response = {
            user_info: {
                user_id: user.user_id,
                tenant_id: user.tenant_id,
                email: user.email,
                role: user.role,
                level: user.level,
                permissions: user.permissions
            },
            hierarchy_info: hierarchyContext ? {
                organization_id: hierarchyContext.organization_id,
                organization_level: hierarchyContext.organization_level,
                organization_type: hierarchyContext.organization_type,
                organization_path: hierarchyContext.organization_path,
                has_hierarchy_context: true
            } : {
                has_hierarchy_context: false
            },
            access_scope: {
                accessible_tenants: tenantsResult.tenants || [user.tenant_id],
                tenant_count: (tenantsResult.tenants || [user.tenant_id]).length
            },
            permissions_summary: {
                can_manage_membership_tiers: membershipRestrictions.tier_management.allowed,
                can_transfer_points: membershipRestrictions.points_transfer.allowed,
                can_access_group_analytics: membershipRestrictions.analytics_access.allowed,
                restrictions: [
                    // @ts-ignore - 型定義が不完全
                    ...(membershipRestrictions.tier_management.restrictions || []),
                    ...(membershipRestrictions.points_transfer.restrictions || [])
                ]
            },
            data_access_policies: hierarchyContext?.data_access_policies || {}
        };
        res.json(response);
    }
    catch (error) {
        logger.error('階層権限詳細情報取得エンドポイントエラー:', error);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Failed to get permission details'
        });
    }
});
// ヘルスチェックエンドポイント
router.get('/hierarchy/health', async (req, res) => {
    try {
        const health = await HotelMemberHierarchyAdapter.healthCheckForPython();
        const statusCode = health.status === 'healthy' ? 200 :
            health.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json(health);
    }
    catch (error) {
        logger.error('ヘルスチェックエンドポイントエラー:', error);
        res.status(503).json({
            status: 'unhealthy',
            services: {
                hierarchy_manager: false,
                jwt_verification: false,
                permission_cache: false
            },
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
// バッチ権限チェックエンドポイント
router.post('/hierarchy/permissions/batch-check', async (req, res) => {
    try {
        const { token, checks } = req.body;
        if (!token || !Array.isArray(checks)) {
            return res.status(400).json({
                error: 'MISSING_PARAMETERS',
                message: 'Token and checks array are required'
            });
        }
        const results = [];
        for (const check of checks) {
            const { type, target_tenant_id, operation, data_type, analytics_type } = check;
            let result;
            switch (type) {
                case 'customer_access':
                    result = await HotelMemberHierarchyAdapter.checkCustomerDataAccessForPython({
                        token,
                        target_tenant_id,
                        operation: operation || 'READ'
                    });
                    break;
                case 'membership_restrictions':
                    result = await HotelMemberHierarchyAdapter.checkMembershipDataRestrictionsForPython({
                        token,
                        operation: operation || 'read',
                        data_type: data_type || 'personal_info'
                    });
                    break;
                case 'analytics_access':
                    result = await HotelMemberHierarchyAdapter.checkGroupAnalyticsAccessForPython({
                        token,
                        analytics_type: analytics_type || 'membership_summary'
                    });
                    break;
                default:
                    result = { allowed: false, reason: 'Unknown check type' };
            }
            results.push({
                check_id: check.id || results.length,
                type,
                ...result
            });
        }
        res.json({
            success: true,
            results,
            total_checks: checks.length,
            allowed_count: results.filter(r => r.allowed).length
        });
    }
    catch (error) {
        logger.error('バッチ権限チェックエンドポイントエラー:', error);
        res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Batch permission check failed'
        });
    }
});
exports.default = router;
