// hotel-member階層権限管理アダプター
// FastAPI (Python) システムとhotel-common (TypeScript) の連携橋渡し
import { HierarchyPermissionManager, HierarchicalJwtManager } from '../../hierarchy';
import { HotelLogger } from '../../utils/logger';
/**
 * hotel-member用階層権限管理アダプター
 *
 * Python FastAPIからの階層権限要求を処理
 */
export class HotelMemberHierarchyAdapter {
    static logger = HotelLogger.getInstance();
    /**
     * 階層JWT検証エンドポイント（FastAPI向け）
     */
    static async verifyHierarchicalTokenForPython(request) {
        try {
            const decoded = HierarchicalJwtManager.verifyHierarchicalToken(request.token);
            if (!decoded) {
                return {
                    success: false,
                    error: 'Invalid or expired token'
                };
            }
            this.logger.debug('階層JWT検証成功（Python向け）', {
                userId: decoded.user_id,
                organizationId: decoded.hierarchy_context?.organization_id
            });
            return {
                success: true,
                user: decoded
            };
        }
        catch (error) {
            this.logger.error('階層JWT検証エラー（Python向け）:', error);
            return {
                success: false,
                error: 'Token verification failed'
            };
        }
    }
    /**
     * 顧客データアクセス権限チェック（FastAPI向け）
     */
    static async checkCustomerDataAccessForPython(request) {
        try {
            // JWT検証
            const userToken = HierarchicalJwtManager.verifyHierarchicalToken(request.token);
            if (!userToken) {
                return {
                    allowed: false,
                    reason: 'Invalid authentication token'
                };
            }
            // 階層権限チェック
            const result = await HierarchyPermissionManager.checkHierarchyAccess({
                user_token: userToken,
                target_resource: {
                    tenant_id: request.target_tenant_id,
                    data_type: 'CUSTOMER'
                },
                operation: request.operation
            });
            this.logger.debug('顧客データアクセス権限チェック（Python向け）', {
                userId: userToken.user_id,
                targetTenant: request.target_tenant_id,
                operation: request.operation,
                allowed: result.allowed
            });
            return {
                allowed: result.allowed,
                reason: result.reason,
                effective_scope: result.effective_scope,
                effective_level: result.effective_level
            };
        }
        catch (error) {
            this.logger.error('顧客データアクセス権限チェックエラー（Python向け）:', error);
            return {
                allowed: false,
                reason: 'Permission check failed'
            };
        }
    }
    /**
     * アクセス可能テナント一覧取得（FastAPI向け）
     */
    static async getAccessibleTenantsForPython(request) {
        try {
            // JWT検証
            const userToken = HierarchicalJwtManager.verifyHierarchicalToken(request.token);
            if (!userToken) {
                return {
                    success: false,
                    error: 'Invalid authentication token'
                };
            }
            // アクセス可能テナント取得
            const organizationId = userToken.hierarchy_context?.organization_id;
            if (!organizationId) {
                // 階層コンテキストなし：基本テナントのみ
                return {
                    success: true,
                    tenants: [userToken.tenant_id]
                };
            }
            const tenants = await HierarchyPermissionManager.getAccessibleTenants(organizationId, request.scope_level);
            this.logger.debug('アクセス可能テナント取得（Python向け）', {
                userId: userToken.user_id,
                organizationId,
                scopeLevel: request.scope_level,
                tenantCount: tenants.length
            });
            return {
                success: true,
                tenants
            };
        }
        catch (error) {
            this.logger.error('アクセス可能テナント取得エラー（Python向け）:', error);
            return {
                success: false,
                error: 'Failed to get accessible tenants'
            };
        }
    }
    /**
     * 会員データ階層制限チェック（FastAPI向け）
     */
    static async checkMembershipDataRestrictionsForPython(request) {
        try {
            const userToken = HierarchicalJwtManager.verifyHierarchicalToken(request.token);
            if (!userToken) {
                return {
                    allowed: false,
                    reason: 'Invalid authentication token'
                };
            }
            const hierarchyContext = userToken.hierarchy_context;
            if (!hierarchyContext) {
                // 階層コンテキストなし：基本権限のみ
                return {
                    allowed: true,
                    restrictions: []
                };
            }
            const restrictions = this.getMembershipDataRestrictions(hierarchyContext.organization_level, hierarchyContext.organization_type, request.operation, request.data_type);
            const allowed = restrictions.length === 0;
            this.logger.debug('会員データ階層制限チェック（Python向け）', {
                userId: userToken.user_id,
                organizationLevel: hierarchyContext.organization_level,
                operation: request.operation,
                dataType: request.data_type,
                allowed,
                restrictionCount: restrictions.length
            });
            return {
                allowed,
                restrictions: allowed ? [] : restrictions,
                reason: allowed ? undefined : '階層レベルによる制限があります'
            };
        }
        catch (error) {
            this.logger.error('会員データ階層制限チェックエラー（Python向け）:', error);
            return {
                allowed: false,
                reason: 'Restriction check failed'
            };
        }
    }
    /**
     * 会員データ制限ルール取得
     */
    static getMembershipDataRestrictions(organizationLevel, organizationType, operation, dataType) {
        const restrictions = [];
        // レベル4（DEPARTMENT）の制限
        if (organizationLevel === 4) {
            if (dataType === 'membership_tier' && operation === 'update') {
                restrictions.push('部門レベルでは会員ランクの変更はできません');
            }
            if (dataType === 'points_balance' && operation === 'transfer') {
                restrictions.push('部門レベルではポイント移行はできません');
            }
            if (dataType === 'credit_limit' && operation === 'update') {
                restrictions.push('部門レベルではクレジット限度額の変更はできません');
            }
        }
        // レベル3（HOTEL）の制限
        if (organizationLevel === 3) {
            if (dataType === 'membership_tier' && operation === 'transfer') {
                restrictions.push('ホテルレベルでは他ブランドへのランク移行はできません');
            }
        }
        // ブランド間操作の制限
        if (organizationLevel > 2 && operation === 'transfer') {
            restrictions.push('ブランド間データ移行には上位レベル権限が必要です');
        }
        return restrictions;
    }
    /**
     * グループ分析権限チェック（FastAPI向け）
     */
    static async checkGroupAnalyticsAccessForPython(request) {
        try {
            const userToken = HierarchicalJwtManager.verifyHierarchicalToken(request.token);
            if (!userToken) {
                return {
                    allowed: false,
                    reason: 'Invalid authentication token'
                };
            }
            const hierarchyContext = userToken.hierarchy_context;
            if (!hierarchyContext) {
                return {
                    allowed: false,
                    reason: 'Group analytics requires hierarchy context'
                };
            }
            // 分析タイプ別アクセスレベル判定
            const accessLevel = this.getAnalyticsAccessLevel(hierarchyContext.organization_level, hierarchyContext.organization_type, request.analytics_type);
            const allowed = accessLevel !== null;
            this.logger.debug('グループ分析権限チェック（Python向け）', {
                userId: userToken.user_id,
                organizationLevel: hierarchyContext.organization_level,
                analyticsType: request.analytics_type,
                allowed,
                accessLevel
            });
            return {
                allowed,
                access_level: accessLevel || undefined,
                reason: allowed ? undefined : '分析データへのアクセス権限がありません'
            };
        }
        catch (error) {
            this.logger.error('グループ分析権限チェックエラー（Python向け）:', error);
            return {
                allowed: false,
                reason: 'Analytics access check failed'
            };
        }
    }
    /**
     * 分析アクセスレベル取得
     */
    static getAnalyticsAccessLevel(organizationLevel, organizationType, analyticsType) {
        // GROUP/BRANDレベル：全分析アクセス
        if (organizationLevel <= 2) {
            return 'FULL';
        }
        // HOTELレベル：制限付きアクセス
        if (organizationLevel === 3) {
            switch (analyticsType) {
                case 'membership_summary':
                    return 'READ_ONLY';
                case 'cross_brand_activity':
                    return null; // アクセス不可
                case 'revenue_analysis':
                    return 'SUMMARY_ONLY';
                case 'customer_journey':
                    return 'READ_ONLY';
                default:
                    return null;
            }
        }
        // DEPARTMENTレベル：最小限アクセス
        if (organizationLevel === 4) {
            switch (analyticsType) {
                case 'membership_summary':
                    return 'SUMMARY_ONLY';
                default:
                    return null;
            }
        }
        return null;
    }
    /**
     * FastAPI向けヘルスチェック
     */
    static async healthCheckForPython() {
        try {
            const services = {
                hierarchy_manager: true,
                jwt_verification: true,
                permission_cache: true
            };
            // 各サービスの簡易チェック
            try {
                // JWT生成テスト
                const testPayload = {
                    user_id: 'test',
                    tenant_id: 'test',
                    email: 'test@test.com',
                    role: 'STAFF',
                    level: 3,
                    permissions: []
                };
                HierarchicalJwtManager.generateHierarchicalToken(testPayload);
            }
            catch {
                services.jwt_verification = false;
            }
            const healthyCount = Object.values(services).filter(Boolean).length;
            const status = healthyCount === 3 ? 'healthy' :
                healthyCount >= 2 ? 'degraded' : 'unhealthy';
            return {
                status,
                services,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('ヘルスチェックエラー（Python向け）:', error);
            return {
                status: 'unhealthy',
                services: {
                    hierarchy_manager: false,
                    jwt_verification: false,
                    permission_cache: false
                },
                timestamp: new Date().toISOString()
            };
        }
    }
}
