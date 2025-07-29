// API関連型定義

import { ApiResponse, PaginationResponse } from './common'

// 標準エラーコード
export const ERROR_CODES = {
  // 認証エラー (E001-E004)
  E001: 'UNAUTHORIZED',
  E002: 'FORBIDDEN', 
  E003: 'TOKEN_EXPIRED',
  E004: 'INVALID_TOKEN',
  
  // ビジネスロジックエラー (B001-B003)
  B001: 'VALIDATION_ERROR',
  B002: 'BUSINESS_RULE_VIOLATION',
  B003: 'RESOURCE_CONFLICT',
  
  // システムエラー (S001-S002)
  S001: 'INTERNAL_SERVER_ERROR',
  S002: 'SERVICE_UNAVAILABLE'
} as const

export type ErrorCode = keyof typeof ERROR_CODES

// HTTP メソッド
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// APIクライアント設定
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  apiKey?: string
  tenantId?: string
  defaultHeaders?: Record<string, string>
}

// リクエスト設定
export interface RequestConfig {
  url: string
  method: HttpMethod
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
}

// システム間連携用API型定義
// 注：ReservationCreateRequest、ReservationUpdateRequest、CustomerCreateRequest、CustomerUpdateRequestは
// Zodスキーマ由来の型を使用（src/schemas/から export）

export interface ReservationResponse {
  id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  room_type: string
  room_number?: string
  check_in: Date
  check_out: Date
  adults: number
  children?: number
  special_requests?: string
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
  origin: string
  origin_reference?: string
  total_amount?: number
  created_at: Date
  updated_at: Date
}

export interface CustomerResponse {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  birthday?: Date
  gender?: 'male' | 'female' | 'other'
  member_rank?: 'bronze' | 'silver' | 'gold' | 'platinum'
  points?: number
  preferences?: Record<string, any>
  last_stay?: Date
  total_stays: number
  created_at: Date
  updated_at: Date
}

// 部屋・在庫関連API
// 注：RoomAvailabilityRequestはZodスキーマ由来の型を使用（src/schemas/から export）

export interface RoomAvailabilityResponse {
  room_type: string
  available_count: number
  base_price: number
  total_rooms: number
}

// イベント通知API・バルク操作API
// 注：EventNotificationRequest、BulkOperationRequestはZodスキーマ由来の型を使用（src/schemas/から export）

export interface BulkOperationResponse {
  success_count: number
  error_count: number
  errors?: Array<{
    index: number
    error: string
  }>
} 