import type { OrganizationHierarchy, DataSharingPolicy, HierarchicalJWTPayload, OrganizationType, DataType, SharingScope, AccessLevel, OrganizationTreeNode } from './types';
/**
 * Hotel Group階層管理統合サービス
 *
 * 機能統合・高レベルAPI提供
 */
export declare class HierarchyService {
    private static logger;
    /**
     * 組織階層の完全セットアップ
     */
    static setupOrganizationHierarchy(setupData: {
        group: {
            name: string;
            code: string;
            settings?: Record<string, any>;
        };
        brands?: Array<{
            name: string;
            code: string;
            settings?: Record<string, any>;
        }>;
        hotels?: Array<{
            name: string;
            code: string;
            brand_code?: string;
            settings?: Record<string, any>;
        }>;
        departments?: Array<{
            name: string;
            code: string;
            hotel_code: string;
            settings?: Record<string, any>;
        }>;
        preset_id?: string;
    }, userId: string): Promise<{
        group: OrganizationHierarchy;
        brands: OrganizationHierarchy[];
        hotels: OrganizationHierarchy[];
        departments: OrganizationHierarchy[];
    }>;
    /**
     * 階層権限付きユーザー登録
     */
    static createHierarchicalUser(userData: {
        email: string;
        username?: string;
        password: string;
        role: 'STAFF' | 'MANAGER' | 'ADMIN' | 'OWNER';
        level: number;
        tenant_id: string;
        organization_id: string;
        permissions?: string[];
    }): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    /**
     * 組織階層ツリーの完全情報取得
     */
    static getCompleteOrganizationTree(rootOrganizationId?: string, includeStats?: boolean): Promise<OrganizationTreeNode[]>;
    /**
     * ユーザーの実効権限情報取得
     */
    static getUserEffectivePermissions(userToken: HierarchicalJWTPayload): Promise<{
        organization: OrganizationHierarchy;
        accessible_tenants: string[];
        data_permissions: {
            [dataType in DataType]: {
                scope: SharingScope;
                level: AccessLevel;
                can_read: boolean;
                can_create: boolean;
                can_update: boolean;
                can_delete: boolean;
            };
        };
        hierarchy_summary: {
            level: number;
            type: OrganizationType;
            path: string;
            children_count: number;
            parent_count: number;
        };
    }>;
    /**
     * 権限診断・推奨設定
     */
    static diagnosePermissions(organizationId: string): Promise<{
        current_settings: {
            organization: OrganizationHierarchy;
            data_policies: DataSharingPolicy[];
            tenant_count: number;
            user_count: number;
        };
        recommendations: Array<{
            type: 'SECURITY' | 'PERFORMANCE' | 'COMPLIANCE' | 'EFFICIENCY';
            priority: 'HIGH' | 'MEDIUM' | 'LOW';
            title: string;
            description: string;
            suggested_action: string;
        }>;
        preset_suggestions: Array<{
            preset_id: string;
            match_score: number;
            benefits: string[];
            considerations: string[];
        }>;
    }>;
    /**
     * 権限推奨事項分析
     */
    private static analyzePermissionRecommendations;
    /**
     * プリセット適合度分析
     */
    private static analyzePresetMatch;
    /**
     * プリセットのメリット取得
     */
    private static getPresetBenefits;
    /**
     * プリセットの考慮事項取得
     */
    private static getPresetConsiderations;
    private static getTenantCount;
    private static getUserCount;
    private static hasDataPolicies;
    private static getChildrenCount;
}
