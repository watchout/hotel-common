// 共通型定義

// システム識別子
export type SystemType = 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common'

// テナント情報
export interface TenantInfo {
  id: string // UUID
  name: string
  plan: 'basic' | 'standard' | 'premium'
  status: 'active' | 'suspended' | 'inactive'
  created_at: Date
  updated_at: Date
}

// ユーザー情報
export interface UserInfo {
  id: string // UUID
  tenant_id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'staff' | 'readonly'
  level: 1 | 2 | 3 | 4 | 5 // レベルベース権限システム
  status: 'active' | 'inactive' | 'suspended'
  created_at: Date
  updated_at: Date
}

// 統一レスポンス形式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  meta?: Record<string, any> // メタデータ（ページネーション等）
  timestamp: Date
  request_id: string
}

// エラー情報
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// ページネーション
// 注：PaginationParamsはZodスキーマ由来の型を使用（src/schemas/から export）

export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// データベース共通フィールド
export interface BaseEntity {
  id: string
  tenant_id: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

// イベント型定義 (Event-driven基盤)
export interface SystemEvent {
  id: string
  type: string
  source: SystemType
  target?: SystemType
  tenant_id: string
  user_id?: string
  data: Record<string, any>
  timestamp: Date
}

// WebSocket メッセージ型
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: Date
  request_id?: string
} 