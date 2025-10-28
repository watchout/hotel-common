export type OrganizationType = 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT';
export type DataType = 'CUSTOMER' | 'RESERVATION' | 'ANALYTICS' | 'FINANCIAL' | 'STAFF' | 'INVENTORY';
export type SharingScope = 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT' | 'NONE';
export type AccessLevel = 'FULL' | 'READ_ONLY' | 'ANALYTICS_ONLY' | 'SUMMARY_ONLY';
export type HierarchyLevel = 1 | 2 | 3 | 4;
/**
 * 組織階層基本情報
 */
export interface OrganizationHierarchy {
    id: string;
    organization_type: OrganizationType;
    name: string;
    code: string;
    parent_id?: string;
    level: HierarchyLevel;
    path: string;
    settings: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
/**
 * データ共有ポリシー
 */
export interface DataSharingPolicy {
    id: string;
    organization_id: string;
    data_type: DataType;
    sharing_scope: SharingScope;
    access_level: AccessLevel;
    conditions: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
/**
 * 拡張JWT Payload（階層管理対応）
 */
export interface HierarchicalJWTPayload {
    user_id: string;
    tenant_id: string;
    email: string;
    role: 'STAFF' | 'MANAGER' | 'ADMIN' | 'OWNER' | 'SYSTEM' | 'SUPER_ADMIN';
    level: number;
    permissions: string[];
    hierarchy_context: {
        organization_id: string;
        organization_level: HierarchyLevel;
        organization_type: OrganizationType;
        organization_path: string;
        access_scope: string[];
        data_access_policies: {
            [dataType in DataType]?: {
                scope: SharingScope;
                level: AccessLevel;
                conditions?: Record<string, any>;
            };
        };
    };
    accessible_tenants: string[];
    iat: number;
    exp: number;
    jti: string;
}
/**
 * 階層アクセス権限チェック結果
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export interface HierarchyAccessResult {
    allowed: boolean;
    reason?: string;
    effective_scope?: SharingScope;
    effective_level?: AccessLevel;
    restrictions?: Record<string, any>;
}
/**
 * 階層権限チェックパラメータ
 */
export interface HierarchyPermissionCheck {
    user_token: HierarchicalJWTPayload;
    target_resource: {
        tenant_id: string;
        data_type: DataType;
        resource_id?: string;
    };
    operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
    additional_context?: Record<string, any>;
}
/**
 * 組織階層ツリーノード
 */
export interface OrganizationTreeNode extends OrganizationHierarchy {
    children?: OrganizationTreeNode[];
    tenant_count?: number;
    user_count?: number;
    has_data_policies?: boolean;
}
/**
 * 階層変更イベント
 */
export interface HierarchyChangeEvent {
    event_id: string;
    event_type: 'HIERARCHY_CHANGE';
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE';
    organization_id: string;
    user_id: string;
    before_state?: Partial<OrganizationHierarchy>;
    after_state?: Partial<OrganizationHierarchy>;
    affected_children: string[];
    affected_tenants: string[];
    data_access_changes: {
        added: DataSharingPolicy[];
        modified: DataSharingPolicy[];
        removed: DataSharingPolicy[];
    };
    timestamp: Date;
    reason?: string;
}
/**
 * 階層権限設定プリセット
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export interface HierarchyPermissionPreset {
    id: string;
    name: string;
    description: string;
    organization_type: OrganizationType;
    data_policies: {
        [dataType in DataType]: {
            sharing_scope: SharingScope;
            access_level: AccessLevel;
            conditions?: Record<string, any>;
        };
    };
    features: {
        cross_brand_loyalty?: boolean;
        unified_pricing?: boolean;
        brand_independent_pricing?: boolean;
        separate_loyalty_programs?: boolean;
        independent_operation?: boolean;
    };
}
/**
 * よく使用されるプリセット定義
 */
export declare const HIERARCHY_PRESETS: Record<string, HierarchyPermissionPreset>;
