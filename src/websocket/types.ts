// WebSocket機能用の型定義（再エクスポート）
export * from '../types/common'

// 追加のWebSocket特化型定義
export interface WebSocketEventData {
  type: 'reservation' | 'customer' | 'room' | 'system' | 'auth' | 'notification'
  action: 'create' | 'update' | 'delete' | 'status_change'
  entity_id: string
  entity_data: any
  tenant_id: string
  user_id?: string
}

export interface WebSocketChannelConfig {
  name: string
  tenant_id: string
  permissions: string[]
  auto_join?: boolean
} 