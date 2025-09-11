import { z } from 'zod'

/**
 * 予約管理スキーマ定義
 * PMS中心の予約統合管理用
 */

// 予約ステータス
export const ReservationStatus = z.enum([
  'pending',      // 予約待ち
  'confirmed',    // 予約確定
  'checked_in',   // チェックイン済み
  'completed',    // 宿泊完了
  'cancelled',    // キャンセル
  'no_show'       // 無断キャンセル
])

// 予約元
export const ReservationOrigin = z.enum([
  'member',       // 会員サイト
  'ota',          // OTA
  'front',        // フロント
  'phone',        // 電話
  'walk_in'       // 当日来店
])

// 支払いステータス
export const PaymentStatus = z.enum([
  'pending',      // 支払い待ち
  'partial',      // 一部支払い
  'paid',         // 支払い完了
  'refunded'      // 返金済み
])

// 部屋タイプ
export const RoomType = z.enum([
  'standard',     // スタンダード
  'deluxe',       // デラックス
  'suite',        // スイート
  'premium',      // プレミアム
  'executive'     // エグゼクティブ
])

// 予約データスキーマ
export const ReservationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  
  // 宿泊情報
  checkin_date: z.string().datetime(),
  checkout_date: z.string().datetime(),
  room_type: RoomType,
  room_number: z.string().optional(),
  room_grade_id: z.string().uuid().optional(),
  guest_count: z.number().int().min(1).max(10),
  
  // 料金情報
  total_amount: z.number().positive(),
  base_rate: z.number().positive(),
  tax_amount: z.number().min(0),
  service_charge: z.number().min(0),
  discount_amount: z.number().min(0),
  
  // ステータス
  status: ReservationStatus,
  payment_status: PaymentStatus,
  origin: ReservationOrigin,
  
  // 追加情報
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  confirmation_number: z.string().optional(),
  
  // システム情報
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  created_by_system: z.string().default('hotel-common'),
  updated_by_system: z.string().optional()
})

// 予約作成リクエスト
export const CreateReservationRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  checkin_date: z.string().datetime(),
  checkout_date: z.string().datetime(),
  room_type: RoomType,
  room_grade_id: z.string().uuid().optional(),
  guest_count: z.number().int().min(1).max(10),
  total_amount: z.number().positive(),
  base_rate: z.number().positive(),
  tax_amount: z.number().min(0).default(0),
  service_charge: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  origin: ReservationOrigin,
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.string().optional()
})

// 予約更新リクエスト
export const UpdateReservationRequestSchema = z.object({
  checkin_date: z.string().datetime().optional(),
  checkout_date: z.string().datetime().optional(),
  room_type: RoomType.optional(),
  room_number: z.string().optional(),
  room_grade_id: z.string().uuid().optional(),
  guest_count: z.number().int().min(1).max(10).optional(),
  total_amount: z.number().positive().optional(),
  base_rate: z.number().positive().optional(),
  tax_amount: z.number().min(0).optional(),
  service_charge: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  status: ReservationStatus.optional(),
  payment_status: PaymentStatus.optional(),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  updated_by: z.string().optional()
})

// 予約検索パラメータ
export const ReservationSearchParamsSchema = z.object({
  tenant_id: z.string().uuid(),
  status: ReservationStatus.optional(),
  payment_status: PaymentStatus.optional(),
  checkin_date_from: z.string().datetime().optional(),
  checkin_date_to: z.string().datetime().optional(),
  checkout_date_from: z.string().datetime().optional(),
  checkout_date_to: z.string().datetime().optional(),
  guest_name: z.string().optional(),
  room_number: z.string().optional(),
  room_type: RoomType.optional(),
  origin: ReservationOrigin.optional(),
  user_id: z.string().uuid().optional(),
  confirmation_number: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
})

// 型定義のエクスポート
export type Reservation = z.infer<typeof ReservationSchema>
export type CreateReservationRequest = z.infer<typeof CreateReservationRequestSchema>
export type UpdateReservationRequest = z.infer<typeof UpdateReservationRequestSchema>
export type ReservationSearchParams = z.infer<typeof ReservationSearchParamsSchema>