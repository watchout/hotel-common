// Event-driven連携基盤 - 統一型定義

export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type EventSyncMode = 'realtime' | 'batch'
export type EventDeliveryGuarantee = 'at_most_once' | 'at_least_once' | 'exactly_once'
export type SystemId = 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common'

// ベースイベントインターフェース
export interface BaseHotelEvent {
  event_id: string
  timestamp: Date
  priority: EventPriority
  sync_mode: EventSyncMode
  targets: SystemId[]
  delivery_guarantee: EventDeliveryGuarantee
  
  // ソーストラッキング
  origin_system: SystemId
  updated_by_system: SystemId
  synced_at: Date
  
  // メタデータ
  tenant_id: string
  user_id?: string
  correlation_id?: string
  retry_count?: number
  created_offline?: boolean
}

// 予約イベント
export interface ReservationEvent extends BaseHotelEvent {
  type: 'reservation'
  action: 'created' | 'updated' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
  data: {
    reservation_id: string
    customer_id?: string
    room_type: string
    room_number?: string
    checkin_date: Date
    checkout_date: Date
    total_amount: number
    status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW'
    origin: 'MEMBER' | 'OTA' | 'FRONT' | 'PHONE' | 'WALK_IN'
    guest_name: string
    guest_phone?: string
    guest_email?: string
    confirmation_code: string
  }
}

// 顧客情報イベント
export interface CustomerEvent extends BaseHotelEvent {
  type: 'customer'
  action: 'created' | 'updated' | 'rank_changed' | 'points_changed'
  data: {
    customer_id: string
    name?: string
    email?: string
    phone?: string
    rank_id?: string
    total_points?: number
    updated_fields: string[] // 更新されたフィールドのみ
    // 権限制御
    updatable_by_pms: boolean
  }
}

// 部屋在庫・状態イベント
export interface RoomEvent extends BaseHotelEvent {
  type: 'room'
  action: 'status_changed' | 'maintenance_updated' | 'price_updated'
  data: {
    room_id: string
    room_number: string
    room_type: string
    status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_ORDER'
    availability_date: Date
    base_price?: number
    maintenance_notes?: string
  }
}

// チェックイン/アウトイベント
export interface CheckInOutEvent extends BaseHotelEvent {
  type: 'checkin_checkout'
  action: 'checked_in' | 'checked_out' | 'no_show'
  data: {
    reservation_id: string
    customer_id?: string
    room_number: string
    actual_checkin_time?: Date
    actual_checkout_time?: Date
    additional_charges?: number
    payment_status: 'pending' | 'completed' | 'failed'
  }
}

// 売上・分析イベント
export interface AnalyticsEvent extends BaseHotelEvent {
  type: 'analytics'
  action: 'daily_report' | 'weekly_report' | 'monthly_report'
  sync_mode: 'batch'
  schedule: 'daily_23:00' | 'weekly_sunday_01:00' | 'monthly_1st_02:00'
  data: {
    report_type: string
    period_start: Date
    period_end: Date
    total_revenue: number
    occupancy_rate: number
    customer_count: number
    average_stay_duration: number
    detailed_data: any // 詳細レポートデータ
    generated_by_system: SystemId
    generated_at: Date
  }
}

// システムイベント（内部管理）
export interface SystemEvent extends BaseHotelEvent {
  type: 'system'
  action: 'startup' | 'shutdown' | 'error' | 'health_check' | 'sync_complete'
  data: {
    system_status: 'online' | 'offline' | 'degraded'
    message: string
    error_details?: any
    metrics?: {
      cpu_usage: number
      memory_usage: number
      active_connections: number
    }
  }
}

// 統一イベント型
export type HotelEvent = 
  | ReservationEvent 
  | CustomerEvent 
  | RoomEvent 
  | CheckInOutEvent 
  | AnalyticsEvent 
  | SystemEvent

// イベント配信ログ
export interface EventDeliveryLog {
  event_id: string
  event_type: string
  source_system: SystemId
  target_systems: SystemId[]
  delivery_status: 'success' | 'failed' | 'retrying' | 'pending'
  delivery_time: number // ms
  retry_count: number
  error_message?: string
  timestamp: Date
}

// イベント設定
export interface EventPublisherConfig {
  redis: {
    host: string
    port: number
    password?: string
    db: number
  }
  websocket: {
    port: number
    path: string
  }
  queue: {
    name: string
    max_retries: number
    retry_delay: number
  }
  monitoring: {
    enabled: boolean
    metrics_interval: number
  }
}

// イベントクライアント設定
export interface EventClientConfig {
  system: SystemId
  subscriptions: string[] // パターン（例: 'reservation.*', 'customer.updated'）
  consumer_group: string
  batch_size: number
  auto_ack: boolean
}

// イベントフィルター
export interface EventFilter {
  event_types?: string[]
  actions?: string[]
  priorities?: EventPriority[]
  source_systems?: SystemId[]
  tenant_ids?: string[]
  date_range?: {
    start: Date
    end: Date
  }
}

// イベント統計
export interface EventStats {
  total_events: number
  events_by_type: Record<string, number>
  events_by_priority: Record<EventPriority, number>
  average_delivery_time: number
  success_rate: number
  failed_events: number
  retried_events: number
} 