export type { OrganizationType, DataType, SharingScope, AccessLevel, HierarchyLevel, OrganizationHierarchy, DataSharingPolicy, HierarchicalJWTPayload, HierarchyAccessResult, HierarchyPermissionCheck, OrganizationTreeNode, HierarchyChangeEvent, HierarchyPermissionPreset } from './types';
export { HIERARCHY_PRESETS } from './types';
export { HierarchyPermissionManager } from './permission-manager';
export { HierarchicalJwtManager } from './jwt-extension';
export { HierarchyApiManager } from './hierarchy-api';
export { HierarchyService } from './hierarchy-service';
export { HierarchyMiddleware } from './hierarchy-middleware';
/**
 * 階層権限管理システム初期化
 */
export declare function initializeHierarchySystem(): Promise<void>;
/**
 * よく使用される階層権限チェック関数のショートカット
 */
export declare class HierarchyUtils {
    /**
     * 顧客データアクセス権限チェック
     */
    static canAccessCustomerData(userToken: any, targetTenantId: string, operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'): Promise<boolean>;
    /**
     * 予約データアクセス権限チェック
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    static canAccessReservationData(userToken: any, targetTenantId: string, operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'): Promise<boolean>;
    /**
     * 分析データアクセス権限チェック
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    static canAccessAnalyticsData(userToken: any, targetTenantId: string, operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'): Promise<boolean>;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * 財務データアクセス権限チェック
     */
    static canAccessFinancialData(userToken: any, targetTenantId: string, operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'): Promise<boolean>;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * ユーザーのアクセス可能テナント一覧取得
     */
    static getAccessibleTenants(userToken: any): string[];
    /**
     * ユーザーの組織レベル取得
     */
    static getOrganizationLevel(userToken: any): any;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * ユーザーの組織タイプ取得
     */
    static getOrganizationType(userToken: any): any;
    /**
     * 簡易権限チェック（よく使用される組み合わせ）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    static checkQuickPermission(userToken: any, check: {
        tenantId: string;
        dataType: any;
        operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
        requireLevel?: any;
        requireType?: any;
    }): Promise<{
        allowed: boolean;
        reason?: string;
        details?: {
            hierarchy_check: boolean;
            data_access: boolean;
            level_check: boolean;
            type_check: boolean;
        };
    }>;
}
/**
 * Express.js Router用のファクトリー関数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export declare function createHierarchyRouter(): any;
