// 認証関連型定義

// JWT ペイロード
export interface JwtPayload {
  user_id: string
  tenant_id: string
  email: string
  role: 'admin' | 'manager' | 'staff' | 'readonly'
  level: 1 | 2 | 3 | 4 | 5
  permissions: string[]
  iat: number
  exp: number
  jti: string // JWT ID
}

// リフレッシュトークン情報
export interface RefreshToken {
  id: string
  user_id: string
  tenant_id: string
  token_hash: string
  expires_at: Date
  created_at: Date
  last_used?: Date
  device_info?: string
}

// 認証リクエスト
// 注：AuthRequestはZodスキーマ由来の型を使用（src/schemas/から export）

// 認証レスポンス
export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number // 8時間 = 28800秒
  token_type: 'Bearer'
  user: {
    id: string
    email: string
    name: string
    role: string
    level: number
    tenant_id: string
  }
}

// セッション情報
export interface SessionInfo {
  session_id: string
  user_id: string
  tenant_id: string
  access_token: string
  refresh_token: string
  expires_at: Date
  created_at: Date
  last_activity: Date
  ip_address: string
  user_agent: string
}

// 権限チェック結果
export interface PermissionCheck {
  allowed: boolean
  reason?: string
  missing_permissions?: string[]
}

// API認証ヘッダー
export interface AuthHeaders {
  authorization: string // Bearer token
  'x-tenant-id'?: string
  'x-api-key'?: string
} 