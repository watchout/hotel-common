import { z } from 'zod'

/**
 * 部屋管理スキーマ定義
 * PMS基本機能の部屋管理用
 */

// 部屋ステータス
export const RoomStatus = z.enum([
  'available',    // 利用可能
  'occupied',     // 使用中
  'cleaning',     // 清掃中
  'maintenance',  // メンテナンス中
  'out_of_order', // 故障・利用不可
  'reserved'      // 予約済み
])

// 部屋タイプ
export const RoomType = z.enum([
  'standard',     // スタンダード
  'deluxe',       // デラックス
  'suite',        // スイート
  'premium',      // プレミアム
  'executive',    // エグゼクティブ
  'penthouse'     // ペントハウス
])

// 部屋データスキーマ
export const RoomSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  
  // 基本情報
  room_number: z.string().min(1).max(20),
  room_type: RoomType,
  floor_number: z.number().int().min(1).max(100),
  capacity: z.number().int().min(1).max(20),
  
  // 料金・グレード
  base_rate: z.number().positive(),
  room_grade_id: z.string().uuid().optional(),
  
  // 設備・特徴
  room_size_sqm: z.number().positive().optional(),
  amenities: z.array(z.string()).default([]),
  is_smoking: z.boolean().default(false),
  is_accessible: z.boolean().default(false),
  bed_configuration: z.string().optional(),
  bathroom_type: z.string().optional(),
  view_type: z.string().optional(),
  
  // ステータス
  status: RoomStatus.default('available'),
  is_active: z.boolean().default(true),
  
  // 追加情報
  notes: z.string().optional(),
  maintenance_notes: z.string().optional(),
  last_cleaned_at: z.string().datetime().optional(),
  last_maintenance_at: z.string().datetime().optional(),
  
  // システム情報
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  created_by_system: z.string().default('hotel-common'),
  updated_by_system: z.string().optional()
})

// 部屋作成リクエスト
export const CreateRoomRequestSchema = z.object({
  tenant_id: z.string().uuid(),
  room_number: z.string().min(1).max(20),
  room_type: RoomType,
  floor_number: z.number().int().min(1).max(100),
  capacity: z.number().int().min(1).max(20),
  base_rate: z.number().positive(),
  room_grade_id: z.string().uuid().optional(),
  room_size_sqm: z.number().positive().optional(),
  amenities: z.array(z.string()).default([]),
  is_smoking: z.boolean().default(false),
  is_accessible: z.boolean().default(false),
  bed_configuration: z.string().optional(),
  bathroom_type: z.string().optional(),
  view_type: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.string().optional()
})

// 部屋更新リクエスト
export const UpdateRoomRequestSchema = z.object({
  room_number: z.string().min(1).max(20).optional(),
  room_type: RoomType.optional(),
  floor_number: z.number().int().min(1).max(100).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  base_rate: z.number().positive().optional(),
  room_grade_id: z.string().uuid().optional(),
  room_size_sqm: z.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
  is_smoking: z.boolean().optional(),
  is_accessible: z.boolean().optional(),
  bed_configuration: z.string().optional(),
  bathroom_type: z.string().optional(),
  view_type: z.string().optional(),
  status: RoomStatus.optional(),
  is_active: z.boolean().optional(),
  notes: z.string().optional(),
  maintenance_notes: z.string().optional(),
  updated_by: z.string().optional()
})

// 部屋ステータス更新リクエスト
export const UpdateRoomStatusRequestSchema = z.object({
  status: RoomStatus,
  notes: z.string().optional(),
  maintenance_notes: z.string().optional(),
  updated_by: z.string().optional()
})

// 部屋検索パラメータ
export const RoomSearchParamsSchema = z.object({
  tenant_id: z.string().uuid(),
  status: RoomStatus.optional(),
  room_type: RoomType.optional(),
  floor_number: z.number().int().min(1).max(100).optional(),
  capacity_min: z.number().int().min(1).optional(),
  capacity_max: z.number().int().max(20).optional(),
  is_smoking: z.boolean().optional(),
  is_accessible: z.boolean().optional(),
  is_active: z.boolean().optional(),
  room_grade_id: z.string().uuid().optional(),
  include_grade: z.boolean().default(false),
  available_from: z.string().datetime().optional(),
  available_to: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
})

// 部屋空室検索パラメータ
export const RoomAvailabilitySearchSchema = z.object({
  tenant_id: z.string().uuid(),
  checkin_date: z.string().datetime(),
  checkout_date: z.string().datetime(),
  guest_count: z.number().int().min(1).max(20),
  room_type: RoomType.optional(),
  is_smoking: z.boolean().optional(),
  is_accessible: z.boolean().optional(),
  room_grade_id: z.string().uuid().optional()
})

// 型定義のエクスポート
export type Room = z.infer<typeof RoomSchema>
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>
export type UpdateRoomRequest = z.infer<typeof UpdateRoomRequestSchema>
export type UpdateRoomStatusRequest = z.infer<typeof UpdateRoomStatusRequestSchema>
export type RoomSearchParams = z.infer<typeof RoomSearchParamsSchema>
export type RoomAvailabilitySearch = z.infer<typeof RoomAvailabilitySearchSchema>