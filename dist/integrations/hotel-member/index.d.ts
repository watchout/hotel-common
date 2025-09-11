export { HotelMemberHierarchyAdapterStub as HotelMemberHierarchyAdapter } from './hierarchy-adapter-stub';
export { default as hotelMemberApiRouter } from './api-endpoints';
export declare const HOTEL_MEMBER_HIERARCHY_ENDPOINTS: {
    readonly VERIFY_TOKEN: "/api/hotel-member/hierarchy/auth/verify";
    readonly CHECK_CUSTOMER_ACCESS: "/api/hotel-member/hierarchy/permissions/check-customer-access";
    readonly CHECK_MEMBERSHIP_RESTRICTIONS: "/api/hotel-member/hierarchy/permissions/check-membership-restrictions";
    readonly CHECK_ANALYTICS_ACCESS: "/api/hotel-member/hierarchy/permissions/check-analytics-access";
    readonly BATCH_CHECK: "/api/hotel-member/hierarchy/permissions/batch-check";
    readonly GET_ACCESSIBLE_TENANTS: "/api/hotel-member/hierarchy/tenants/accessible";
    readonly GET_PERMISSIONS_DETAIL: "/api/hotel-member/hierarchy/user/permissions-detail";
    readonly HEALTH_CHECK: "/api/hotel-member/hierarchy/health";
};
/**
 * hotel-member階層権限管理統合初期化
 */
export declare function initializeHotelMemberHierarchy(): Promise<void>;
/**
 * hotel-member用階層権限ヘルパー関数
 */
export declare class HotelMemberHierarchyUtils {
    /**
     * FastAPI向け簡易権限チェック
     */
    static quickPermissionCheck(token: string, action: 'read_customer' | 'update_customer' | 'manage_tiers' | 'transfer_points' | 'view_analytics'): Promise<boolean>;
    /**
     * ユーザーの階層レベル取得
     */
    static getUserHierarchyLevel(token: string): Promise<number | null>;
    /**
     * グループ管理者かどうかチェック
     */
    static isGroupManager(token: string): Promise<boolean>;
    /**
     * 店舗レベル以下かどうかチェック
     */
    static isHotelLevelOrBelow(token: string): Promise<boolean>;
}
/**
 * Python FastAPI向けのミドルウェアヘルパー
 */
export declare const PYTHON_MIDDLEWARE_HELPERS: {
    /**
     * FastAPI Dependency用のJSONレスポンス形式
     */
    createAuthDependencyResponse: (user: any) => {
        user_id: any;
        tenant_id: any;
        email: any;
        role: any;
        level: any;
        permissions: any;
        hierarchy_context: any;
        accessible_tenants: any;
    };
    /**
     * FastAPI HTTPException用のエラーレスポンス形式
     */
    createErrorResponse: (status_code: number, detail: string, error_type?: string) => {
        status_code: number;
        detail: string;
        error_type: string;
        timestamp: string;
    };
    /**
     * FastAPI 用の権限チェック結果形式
     */
    createPermissionResponse: (allowed: boolean, reason?: string, metadata?: any) => {
        allowed: boolean;
        reason: string | undefined;
        metadata: any;
        timestamp: string;
    };
};
/**
 * hotel-member設定推奨値
 */
export declare const HOTEL_MEMBER_HIERARCHY_CONFIG: {
    /**
     * 階層レベル別機能制限設定
     */
    FEATURE_RESTRICTIONS: {
        DEPARTMENT: string[];
        HOTEL: string[];
        BRAND: string[];
        GROUP: never[];
    };
    /**
     * データマスキング設定
     */
    DATA_MASKING: {
        DEPARTMENT: {
            phone: string;
            address: string;
            credit_card: string;
            income_level: string;
        };
        HOTEL: {
            credit_card: string;
            income_level: string;
        };
        BRAND: {};
        GROUP: {};
    };
    /**
     * キャッシュ設定
     */
    CACHE_TTL: {
        jwt_verification: number;
        permission_check: number;
        accessible_tenants: number;
        user_restrictions: number;
    };
};
