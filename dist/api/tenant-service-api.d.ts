/**
 * テナントのサービス利用状況を取得
 * @param tenantId テナントID
 */
export declare function getTenantServices(tenantId: string): Promise<{
    success: boolean;
    data: any;
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
    data: any;
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
 * @param planCategory プランカテゴリ ('omotenasuai', etc.)
 */
export declare function getServicePlanRestrictions(serviceType: string, planType: string, planCategory?: string): Promise<{
    success: boolean;
    error: string;
    data?: undefined;
} | {
    success: boolean;
    data: any;
    error?: undefined;
}>;
/**
 * テナントのサービス利用統計を記録
 * @param tenantId テナントID
 * @param serviceType サービスタイプ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * @param month 月 (YYYY-MM形式)
 * @param data 統計データ
 */
export declare function recordServiceUsage(tenantId: string, serviceType: string, month: string, data: {
    activeUsersCount?: number;
    activeDevicesCount?: number;
    usageData?: Record<string, any>;
}): Promise<{
    success: boolean;
    data: any;
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
        service: any;
        planRestrictions: any;
    };
    error?: undefined;
}>;
