// Hotel Group階層権限管理 - 型定義

export type OrganizationType = 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT'
export type DataType = 'CUSTOMER' | 'RESERVATION' | 'ANALYTICS' | 'FINANCIAL' | 'STAFF' | 'INVENTORY'
export type SharingScope = 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT' | 'NONE'
export type AccessLevel = 'FULL' | 'READ_ONLY' | 'ANALYTICS_ONLY' | 'SUMMARY_ONLY'
export type HierarchyLevel = 1 | 2 | 3 | 4

/**
 * 組織階層基本情報
 */
export interface OrganizationHierarchy {
  id: string
  organization_type: OrganizationType
  name: string
  code: string
  parent_id?: string
  level: HierarchyLevel
  path: string // "group_id/brand_id/hotel_id"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

/**
 * データ共有ポリシー
 */
export interface DataSharingPolicy {
  id: string
  organization_id: string
  data_type: DataType
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharing_scope: SharingScope
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  access_level: AccessLevel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions: Record<string, any>
  created_at: Date
  updated_at: Date
}

/**
 * 拡張JWT Payload（階層管理対応）
 */
export interface HierarchicalJWTPayload {
  // 既存基本フィールド
  user_id: string
  tenant_id: string
  email: string
  role: 'STAFF' | 'MANAGER' | 'ADMIN' | 'OWNER' | 'SYSTEM' | 'SUPER_ADMIN'
  level: number
  permissions: string[]
  
  // 階層管理拡張フィールド
  hierarchy_context: {
    organization_id: string
    organization_level: HierarchyLevel
    organization_type: OrganizationType
    organization_path: string
    access_scope: string[] // アクセス可能な下位組織ID配列
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    data_access_policies: {
      [dataType in DataType]?: {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        scope: SharingScope
        level: AccessLevel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        conditions?: Record<string, any>
      }
    }
  }
  
  // マルチテナントアクセス（グループ管理者用）
  accessible_tenants: string[]
  
  // JWT標準フィールド
  iat: number
  exp: number
  jti: string
}

/**
 * 階層アクセス権限チェック結果
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export interface HierarchyAccessResult {
  allowed: boolean
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  reason?: string
  effective_scope?: SharingScope
  effective_level?: AccessLevel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  restrictions?: Record<string, any>
}

/**
 * 階層権限チェックパラメータ
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HierarchyPermissionCheck {
  user_token: HierarchicalJWTPayload
  target_resource: {
    tenant_id: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    data_type: DataType
    resource_id?: string
  }
  operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  additional_context?: Record<string, any>
}

/**
 * 組織階層ツリーノード
 */
export interface OrganizationTreeNode extends OrganizationHierarchy {
  children?: OrganizationTreeNode[]
  tenant_count?: number
  user_count?: number
  has_data_policies?: boolean
}

/**
 * 階層変更イベント
 */
export interface HierarchyChangeEvent {
  event_id: string
  event_type: 'HIERARCHY_CHANGE'
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE'
  organization_id: string
  user_id: string
  before_state?: Partial<OrganizationHierarchy>
  after_state?: Partial<OrganizationHierarchy>
  affected_children: string[]
  affected_tenants: string[]
  data_access_changes: {
    added: DataSharingPolicy[]
    modified: DataSharingPolicy[]
    removed: DataSharingPolicy[]
  }
  timestamp: Date
  reason?: string
}

/**
 * 階層権限設定プリセット
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export interface HierarchyPermissionPreset {
  id: string
  name: string
  description: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  organization_type: OrganizationType
  data_policies: {
    [dataType in DataType]: {
      sharing_scope: SharingScope
      access_level: AccessLevel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions?: Record<string, any>
    }
  }
  features: {
    cross_brand_loyalty?: boolean
    unified_pricing?: boolean
    brand_independent_pricing?: boolean
    separate_loyalty_programs?: boolean
    independent_operation?: boolean
  }
}

/**
 * よく使用されるプリセット定義
 */
export const HIERARCHY_PRESETS: Record<string, HierarchyPermissionPreset> = {
  'complete-integration': {
    id: 'complete-integration',
    name: '完全統合型（星野リゾート型）',
    description: 'グループ全体でデータ完全共有、統一運営',
    organization_type: 'GROUP',
    data_policies: {
      CUSTOMER: { sharing_scope: 'GROUP', access_level: 'FULL' },
      RESERVATION: { sharing_scope: 'GROUP', access_level: 'FULL' },
      ANALYTICS: { sharing_scope: 'GROUP', access_level: 'FULL' },
      FINANCIAL: { sharing_scope: 'GROUP', access_level: 'FULL' },
      STAFF: { sharing_scope: 'GROUP', access_level: 'FULL' },
      INVENTORY: { sharing_scope: 'GROUP', access_level: 'FULL' }
    },
    features: {
      cross_brand_loyalty: true,
      unified_pricing: true
    }
  },
  
  'brand-separation': {
    id: 'brand-separation',
    name: 'ブランド別管理型（アパグループ型）',
    description: 'ブランド単位でデータ管理、グループ分析のみ共有',
    organization_type: 'BRAND',
    data_policies: {
      CUSTOMER: { sharing_scope: 'BRAND', access_level: 'FULL' },
      RESERVATION: { sharing_scope: 'BRAND', access_level: 'FULL' },
      ANALYTICS: { sharing_scope: 'GROUP', access_level: 'SUMMARY_ONLY' },
      FINANCIAL: { sharing_scope: 'BRAND', access_level: 'FULL' },
      STAFF: { sharing_scope: 'BRAND', access_level: 'FULL' },
      INVENTORY: { sharing_scope: 'BRAND', access_level: 'FULL' }
    },
    features: {
      brand_independent_pricing: true,
      separate_loyalty_programs: true
    }
  },
  
  'hotel-independence': {
    id: 'hotel-independence',
    name: '完全分離型（単独店舗型）',
    description: '店舗完全独立、最小限のグループ集計のみ',
    organization_type: 'HOTEL',
    data_policies: {
      CUSTOMER: { sharing_scope: 'HOTEL', access_level: 'FULL' },
      RESERVATION: { sharing_scope: 'HOTEL', access_level: 'FULL' },
      ANALYTICS: { sharing_scope: 'HOTEL', access_level: 'FULL' },
      FINANCIAL: { sharing_scope: 'HOTEL', access_level: 'FULL' },
      STAFF: { sharing_scope: 'HOTEL', access_level: 'FULL' },
      INVENTORY: { sharing_scope: 'HOTEL', access_level: 'FULL' }
    },
    features: {
      independent_operation: true
    }
  }
} 