import type { HierarchicalJWTPayload } from '../../hierarchy/types';
/**
 * hotel-member用階層権限管理アダプター
 *
 * Python FastAPIからの階層権限要求を処理
 */
export declare class HotelMemberHierarchyAdapter {
    private static logger;
    /**
     * 階層JWT検証エンドポイント（FastAPI向け）
     */
    static verifyHierarchicalTokenForPython(request: {
        token: string;
    }): Promise<{
        success: boolean;
        user?: HierarchicalJWTPayload;
        error?: string;
    }>;
    /**
     * 顧客データアクセス権限チェック（FastAPI向け）
     */
    static checkCustomerDataAccessForPython(request: {
        token: string;
        target_tenant_id: string;
        operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
    }): Promise<{
        allowed: boolean;
        reason?: string;
        effective_scope?: string;
        effective_level?: string;
    }>;
    /**
     * アクセス可能テナント一覧取得（FastAPI向け）
     */
    static getAccessibleTenantsForPython(request: {
        token: string;
        scope_level?: 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT';
    }): Promise<{
        success: boolean;
        tenants?: string[];
        error?: string;
    }>;
    /**
     * 会員データ階層制限チェック（FastAPI向け）
     */
    static checkMembershipDataRestrictionsForPython(request: {
        token: string;
        operation: 'read' | 'update' | 'transfer';
        data_type: 'membership_tier' | 'points_balance' | 'credit_limit' | 'personal_info';
    }): Promise<{
        allowed: boolean;
        restrictions?: string[];
        reason?: string;
    }>;
    /**
     * 会員データ制限ルール取得
     */
    private static getMembershipDataRestrictions;
    /**
     * グループ分析権限チェック（FastAPI向け）
     */
    static checkGroupAnalyticsAccessForPython(request: {
        token: string;
        analytics_type: 'membership_summary' | 'cross_brand_activity' | 'revenue_analysis' | 'customer_journey';
    }): Promise<{
        allowed: boolean;
        access_level?: 'FULL' | 'SUMMARY_ONLY' | 'READ_ONLY';
        reason?: string;
    }>;
    /**
     * 分析アクセスレベル取得
     */
    private static getAnalyticsAccessLevel;
    /**
     * FastAPI向けヘルスチェック
     */
    static healthCheckForPython(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        services: {
            hierarchy_manager: boolean;
            jwt_verification: boolean;
            permission_cache: boolean;
        };
        timestamp: string;
    }>;
}
