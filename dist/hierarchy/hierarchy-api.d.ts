import type { OrganizationHierarchy, DataSharingPolicy, OrganizationType, DataType, SharingScope, AccessLevel } from './types';
/**
 * Hotel Group階層管理API操作クラス
 *
 * 機能:
 * - 組織階層のCRUD操作
 * - データ共有ポリシー管理
 * - 階層変更イベント発行
 * - プリセット適用
 */
export declare class HierarchyApiManager {
    private static logger;
    /**
     * 組織作成
     */
    static createOrganization(data: {
        organization_type: OrganizationType;
        name: string;
        code: string;
        parent_id?: string;
        settings?: Record<string, any>;
    }, userId: string): Promise<OrganizationHierarchy>;
    /**
     * 組織更新
     */
    static updateOrganization(organizationId: string, data: {
        name?: string;
        code?: string;
        settings?: Record<string, any>;
    }, userId: string): Promise<OrganizationHierarchy>;
    /**
     * 組織削除（論理削除）
     */
    static deleteOrganization(organizationId: string, userId: string): Promise<void>;
    /**
     * データ共有ポリシー設定
     */
    static setDataSharingPolicy(organizationId: string, policies: {
        data_type: DataType;
        sharing_scope: SharingScope;
        access_level: AccessLevel;
        conditions?: Record<string, any>;
    }[], userId: string): Promise<DataSharingPolicy[]>;
    /**
     * プリセット適用
     */
    static applyPreset(organizationId: string, presetId: string, userId: string): Promise<void>;
    /**
     * テナント-組織関係設定
     */
    static linkTenantToOrganization(tenantId: string, organizationId: string, role?: 'PRIMARY' | 'SECONDARY'): Promise<void>;
    /**
     * デフォルトデータポリシー作成
     */
    private static createDefaultDataPolicies;
    /**
     * 新しいパス計算
     */
    private static calculateNewPath;
    /**
     * 子組織のパス更新
     */
    private static updateChildrenPaths;
    /**
     * 影響を受ける子組織ID取得
     */
    private static getAffectedChildren;
    /**
     * 影響を受けるテナントID取得
     */
    private static getAffectedTenants;
    /**
     * 組織パス取得
     */
    private static getOrganizationPath;
    /**
     * 階層変更イベント発行
     */
    private static publishHierarchyChangeEvent;
}
