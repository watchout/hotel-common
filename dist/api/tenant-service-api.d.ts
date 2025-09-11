/**
 * テナントのサービス利用状況を取得
 * @param tenantId テナントID
 */
export declare function getTenantServices(tenantId: string): Promise<{
    success: boolean;
    data: {
        is_active: boolean;
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        service_type: string;
        plan_type: string;
        activated_at: Date;
        expires_at: Date | null;
        service_config: import("../generated/prisma/runtime/library").JsonValue;
    }[];
    error?: undefined;
} | {
    success: boolean;
    error: string;
    data?: undefined;
}>;
/**
 * テナントのサービス利用状況を更新
 * @param tenantId テナントID
 * @param serviceType サービスタイプ ('hotel-saas', 'hotel-pms', 'hotel-member')
 * @param planType プランタイプ ('economy', 'standard', 'premium')
 * @param isActive アクティブ状態
 */
export declare function updateTenantService(tenantId: string, serviceType: string, planType: string, isActive: boolean): Promise<{
    success: boolean;
    data: {
        is_active: boolean;
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        service_type: string;
        plan_type: string;
        activated_at: Date;
        expires_at: Date | null;
        service_config: import("../generated/prisma/runtime/library").JsonValue;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    data?: undefined;
}>;
/**
 * サービスのプラン制限を取得
 * @param serviceType サービスタイプ ('hotel-saas', 'hotel-pms', 'hotel-member')
 * @param planType プランタイプ ('economy', 'standard', 'premium')
 * @param planCategory プランカテゴリ ('omotenasuai', etc.)
 */
export declare function getServicePlanRestrictions(serviceType: string, planType: string, planCategory?: string): Promise<{
    success: boolean;
    error: string;
    data?: undefined;
} | {
    success: boolean;
    data: {
        id: string;
        created_at: Date;
        updated_at: Date;
        service_type: string;
        plan_type: string;
        plan_category: string;
        max_users: number;
        max_devices: number;
        max_monthly_orders: number | null;
        enable_ai_concierge: boolean | null;
        enable_multilingual: boolean | null;
        max_rooms: number | null;
        enable_revenue_management: boolean | null;
        max_monthly_ai_requests: number | null;
        enable_ai_crm: boolean | null;
        monthly_price: number;
    };
    error?: undefined;
}>;
/**
 * テナントのサービス利用統計を記録
 * @param tenantId テナントID
 * @param serviceType サービスタイプ
 * @param month 月 (YYYY-MM形式)
 * @param data 統計データ
 */
export declare function recordServiceUsage(tenantId: string, serviceType: string, month: string, data: {
    activeUsersCount?: number;
    activeDevicesCount?: number;
    usageData?: Record<string, any>;
}): Promise<{
    success: boolean;
    data: {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        service_type: string;
        month: string;
        active_users_count: number;
        active_devices_count: number;
        usage_data: import("../generated/prisma/runtime/library").JsonValue;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    data?: undefined;
}>;
/**
 * テナントのサービス利用状況を確認
 * @param tenantId テナントID
 * @param serviceType サービスタイプ
 */
export declare function checkServiceAccess(tenantId: string, serviceType: string): Promise<{
    success: boolean;
    error: string;
    data?: undefined;
} | {
    success: boolean;
    data: {
        service: {
            is_active: boolean;
            id: string;
            tenant_id: string;
            created_at: Date;
            updated_at: Date;
            service_type: string;
            plan_type: string;
            activated_at: Date;
            expires_at: Date | null;
            service_config: import("../generated/prisma/runtime/library").JsonValue;
        };
        planRestrictions: {
            id: string;
            created_at: Date;
            updated_at: Date;
            service_type: string;
            plan_type: string;
            plan_category: string;
            max_users: number;
            max_devices: number;
            max_monthly_orders: number | null;
            enable_ai_concierge: boolean | null;
            enable_multilingual: boolean | null;
            max_rooms: number | null;
            enable_revenue_management: boolean | null;
            max_monthly_ai_requests: number | null;
            enable_ai_crm: boolean | null;
            monthly_price: number;
        } | null;
    };
    error?: undefined;
}>;
