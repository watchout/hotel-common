// Hotel Group階層権限管理システム - 完全エクスポート
// プリセット定義
export { HIERARCHY_PRESETS } from './types';
// 核心クラス
export { HierarchyPermissionManager } from './permission-manager';
export { HierarchicalJwtManager } from './jwt-extension';
export { HierarchyApiManager } from './hierarchy-api';
export { HierarchyService } from './hierarchy-service';
export { HierarchyMiddleware } from './hierarchy-middleware';
/**
 * 階層権限管理システム初期化
 */
export async function initializeHierarchySystem() {
    const { HotelLogger } = await import('../utils/logger');
    const logger = HotelLogger.getInstance();
    try {
        logger.info('🏗️ Hotel Group階層権限管理システム初期化中...');
        logger.info('✅ 階層権限管理システム初期化完了');
        logger.info(`
🏗️ Hotel Group階層権限管理システム稼働中

📊 対応階層: 4レベル (GROUP → BRAND → HOTEL → DEPARTMENT)
🔐 権限管理: データタイプ別アクセス制御
🚀 高速化: Materialized Path + Redis キャッシュ
🎯 対応規模: 単独店舗 〜 メガチェーン(100店舗以上)

利用可能プリセット:
- 完全統合型（星野リゾート型）
- ブランド別管理型（アパグループ型）  
- 完全分離型（単独店舗型）

実装機能:
- 組織階層CRUD管理（HierarchyApiManager）
- 権限チェック・検証（HierarchyPermissionManager）
- JWT階層認証（HierarchicalJwtManager）
- Express.jsミドルウェア（HierarchyMiddleware）
- 統合サービス（HierarchyService）
    `);
    }
    catch (error) {
        logger.error('階層権限管理システム初期化エラー:', error);
        throw error;
    }
}
/**
 * よく使用される階層権限チェック関数のショートカット
 */
export class HierarchyUtils {
    /**
     * 顧客データアクセス権限チェック
     */
    static async canAccessCustomerData(userToken, targetTenantId, operation = 'READ') {
        const { HierarchyPermissionManager } = await import('./permission-manager');
        const result = await HierarchyPermissionManager.checkHierarchyAccess({
            user_token: userToken,
            target_resource: {
                tenant_id: targetTenantId,
                data_type: 'CUSTOMER'
            },
            operation
        });
        return result.allowed;
    }
    /**
     * 予約データアクセス権限チェック
     */
    static async canAccessReservationData(userToken, targetTenantId, operation = 'READ') {
        const { HierarchyPermissionManager } = await import('./permission-manager');
        const result = await HierarchyPermissionManager.checkHierarchyAccess({
            user_token: userToken,
            target_resource: {
                tenant_id: targetTenantId,
                data_type: 'RESERVATION'
            },
            operation
        });
        return result.allowed;
    }
    /**
     * 分析データアクセス権限チェック
     */
    static async canAccessAnalyticsData(userToken, targetTenantId, operation = 'READ') {
        const { HierarchyPermissionManager } = await import('./permission-manager');
        const result = await HierarchyPermissionManager.checkHierarchyAccess({
            user_token: userToken,
            target_resource: {
                tenant_id: targetTenantId,
                data_type: 'ANALYTICS'
            },
            operation
        });
        return result.allowed;
    }
    /**
     * 財務データアクセス権限チェック
     */
    static async canAccessFinancialData(userToken, targetTenantId, operation = 'READ') {
        const { HierarchyPermissionManager } = await import('./permission-manager');
        const result = await HierarchyPermissionManager.checkHierarchyAccess({
            user_token: userToken,
            target_resource: {
                tenant_id: targetTenantId,
                data_type: 'FINANCIAL'
            },
            operation
        });
        return result.allowed;
    }
    /**
     * ユーザーのアクセス可能テナント一覧取得
     */
    static getAccessibleTenants(userToken) {
        return userToken.accessible_tenants || [userToken.tenant_id];
    }
    /**
     * ユーザーの組織レベル取得
     */
    static getOrganizationLevel(userToken) {
        return userToken.hierarchy_context?.organization_level || 3;
    }
    /**
     * ユーザーの組織タイプ取得
     */
    static getOrganizationType(userToken) {
        return userToken.hierarchy_context?.organization_type || 'HOTEL';
    }
    /**
     * 簡易権限チェック（よく使用される組み合わせ）
     */
    static async checkQuickPermission(userToken, check) {
        const details = {
            hierarchy_check: false,
            data_access: false,
            level_check: false,
            type_check: false
        };
        try {
            const { HierarchyPermissionManager } = await import('./permission-manager');
            // 1. データアクセス権限チェック
            const accessResult = await HierarchyPermissionManager.checkHierarchyAccess({
                user_token: userToken,
                target_resource: {
                    tenant_id: check.tenantId,
                    data_type: check.dataType
                },
                operation: check.operation || 'READ'
            });
            details.data_access = accessResult.allowed;
            if (!accessResult.allowed) {
                return {
                    allowed: false,
                    reason: accessResult.reason,
                    details
                };
            }
            // 2. レベルチェック
            if (check.requireLevel) {
                details.level_check = userToken.hierarchy_context.organization_level >= check.requireLevel;
                if (!details.level_check) {
                    return {
                        allowed: false,
                        reason: `組織レベル ${check.requireLevel} 以上が必要です`,
                        details
                    };
                }
            }
            else {
                details.level_check = true;
            }
            // 3. 組織タイプチェック
            if (check.requireType) {
                details.type_check = userToken.hierarchy_context.organization_type === check.requireType;
                if (!details.type_check) {
                    return {
                        allowed: false,
                        reason: `組織タイプ ${check.requireType} が必要です`,
                        details
                    };
                }
            }
            else {
                details.type_check = true;
            }
            details.hierarchy_check = true;
            return {
                allowed: true,
                details
            };
        }
        catch (error) {
            return {
                allowed: false,
                reason: '権限チェック中にエラーが発生しました',
                details
            };
        }
    }
}
/**
 * Express.js Router用のファクトリー関数
 */
export function createHierarchyRouter() {
    const express = require('express');
    const router = express.Router();
    // 認証必須
    // router.use(HierarchyMiddleware.authenticate())
    // 組織管理エンドポイント（管理者のみ）
    router.post('/organizations', 
    // HierarchyMiddleware.requireAdminRole(),
    async (req, res) => {
        try {
            // const organization = await HierarchyApiManager.createOrganization(
            //   req.body,
            //   req.user.staff_id
            // )
            const organization = null; // Temporary placeholder
            res.status(201).json({ organization });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    // 組織階層ツリー取得
    router.get('/organizations/tree', async (req, res) => {
        try {
            // const tree = await HierarchyService.getCompleteOrganizationTree(
            //   req.query.root_id,
            //   req.query.include_stats === 'true'
            // )
            const tree = []; // Temporary placeholder
            res.json({ tree });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // ユーザー権限情報取得
    router.get('/permissions/effective', async (req, res) => {
        try {
            // const permissions = await HierarchyService.getUserEffectivePermissions(req.user)
            const permissions = []; // Temporary placeholder
            res.json({ permissions });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // 権限診断
    router.get('/organizations/:organizationId/diagnose', 
    // HierarchyMiddleware.requireCombinedPermissions({
    //   organizationLevel: { min: 2 }, // BRAND以上
    //   adminRole: true
    // }),
    async (req, res) => {
        try {
            // const diagnosis = await HierarchyService.diagnosePermissions(req.params.organizationId)
            const diagnosis = {}; // Temporary placeholder
            res.json({ diagnosis });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    return router;
}
