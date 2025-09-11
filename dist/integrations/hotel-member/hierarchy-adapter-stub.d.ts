/**
 * hotel-member階層権限管理アダプタースタブ
 *
 * hotel-member FastAPIサーバーとの連携
 * - JWT検証
 * - 階層権限チェック
 * - 顧客データアクセス制御
 */
interface HierarchicalJWTPayload {
    user_id: string;
    tenant_id: string;
    email?: string;
    role: string;
    level: number;
    permissions: string[];
    hierarchy_context: {
        organization_id: string;
        organization_level: 1 | 2 | 3 | 4;
        organization_type: 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT';
        organization_path: string;
        access_scope: string[];
        data_access_policies: Record<string, any>;
    };
    accessible_tenants: string[];
}
interface VerifyTokenResult {
    success: boolean;
    user?: HierarchicalJWTPayload;
    error?: string;
}
interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
    effective_scope?: string;
    effective_level?: string;
    restrictions?: Record<string, any>;
}
export declare class HotelMemberHierarchyAdapterStub {
    private static logger;
    /**
     * 階層JWTトークン検証（Python向け）
     */
    static verifyHierarchicalTokenForPython(params: {
        token: string;
    }): Promise<VerifyTokenResult>;
    /**
     * 顧客データアクセスチェック（Python向け）
     */
    static checkCustomerDataAccessForPython(params: {
        token: string;
        target_tenant_id: string;
        operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
        customer_id?: string;
    }): Promise<PermissionCheckResult>;
    /**
     * 会員制限チェック（Python向け）
     */
    static checkMembershipDataRestrictionsForPython(params: {
        token: string;
        operation: string;
        data_type: string;
        tier_id?: string;
    }): Promise<PermissionCheckResult>;
    /**
     * グループ分析アクセスチェック（Python向け）
     */
    static checkGroupAnalyticsAccessForPython(params: {
        token: string;
        analytics_type: string;
        target_brand_id?: string;
    }): Promise<PermissionCheckResult>;
    /**
     * アクセス可能テナント取得（Python向け）
     */
    static getAccessibleTenantsForPython(params: {
        token: string;
        scope_level?: string;
    }): Promise<{
        success?: boolean;
        tenants: string[];
        error?: string;
    }>;
    /**
     * ヘルスチェック（Python向け）
     */
    static healthCheckForPython(): Promise<{
        status: 'healthy' | 'degraded' | 'error';
        message?: string;
        details?: Record<string, any>;
    }>;
}
export {};
