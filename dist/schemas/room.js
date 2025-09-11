"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomAvailabilitySearchSchema = exports.RoomSearchParamsSchema = exports.UpdateRoomStatusRequestSchema = exports.UpdateRoomRequestSchema = exports.CreateRoomRequestSchema = exports.RoomSchema = exports.RoomType = exports.RoomStatus = void 0;
const zod_1 = require("zod");
/**
 * 部屋管理スキーマ定義
 * PMS基本機能の部屋管理用
 */
// 部屋ステータス
exports.RoomStatus = zod_1.z.enum([
    'available', // 利用可能
    'occupied', // 使用中
    'cleaning', // 清掃中
    'maintenance', // メンテナンス中
    'out_of_order', // 故障・利用不可
    'reserved' // 予約済み
]);
// 部屋タイプ
exports.RoomType = zod_1.z.enum([
    'standard', // スタンダード
    'deluxe', // デラックス
    'suite', // スイート
    'premium', // プレミアム
    'executive', // エグゼクティブ
    'penthouse' // ペントハウス
]);
// 部屋データスキーマ
exports.RoomSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenant_id: zod_1.z.string().uuid(),
    // 基本情報
    room_number: zod_1.z.string().min(1).max(20),
    room_type: exports.RoomType,
    floor_number: zod_1.z.number().int().min(1).max(100),
    capacity: zod_1.z.number().int().min(1).max(20),
    // 料金・グレード
    base_rate: zod_1.z.number().positive(),
    room_grade_id: zod_1.z.string().uuid().optional(),
    // 設備・特徴
    room_size_sqm: zod_1.z.number().positive().optional(),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    is_smoking: zod_1.z.boolean().default(false),
    is_accessible: zod_1.z.boolean().default(false),
    bed_configuration: zod_1.z.string().optional(),
    bathroom_type: zod_1.z.string().optional(),
    view_type: zod_1.z.string().optional(),
    // ステータス
    status: exports.RoomStatus.default('available'),
    is_active: zod_1.z.boolean().default(true),
    // 追加情報
    notes: zod_1.z.string().optional(),
    maintenance_notes: zod_1.z.string().optional(),
    last_cleaned_at: zod_1.z.string().datetime().optional(),
    last_maintenance_at: zod_1.z.string().datetime().optional(),
    // システム情報
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
    created_by: zod_1.z.string().optional(),
    updated_by: zod_1.z.string().optional(),
    created_by_system: zod_1.z.string().default('hotel-common'),
    updated_by_system: zod_1.z.string().optional()
});
// 部屋作成リクエスト
exports.CreateRoomRequestSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().uuid(),
    room_number: zod_1.z.string().min(1).max(20),
    room_type: exports.RoomType,
    floor_number: zod_1.z.number().int().min(1).max(100),
    capacity: zod_1.z.number().int().min(1).max(20),
    base_rate: zod_1.z.number().positive(),
    room_grade_id: zod_1.z.string().uuid().optional(),
    room_size_sqm: zod_1.z.number().positive().optional(),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    is_smoking: zod_1.z.boolean().default(false),
    is_accessible: zod_1.z.boolean().default(false),
    bed_configuration: zod_1.z.string().optional(),
    bathroom_type: zod_1.z.string().optional(),
    view_type: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    created_by: zod_1.z.string().optional()
});
// 部屋更新リクエスト
exports.UpdateRoomRequestSchema = zod_1.z.object({
    room_number: zod_1.z.string().min(1).max(20).optional(),
    room_type: exports.RoomType.optional(),
    floor_number: zod_1.z.number().int().min(1).max(100).optional(),
    capacity: zod_1.z.number().int().min(1).max(20).optional(),
    base_rate: zod_1.z.number().positive().optional(),
    room_grade_id: zod_1.z.string().uuid().optional(),
    room_size_sqm: zod_1.z.number().positive().optional(),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
    is_smoking: zod_1.z.boolean().optional(),
    is_accessible: zod_1.z.boolean().optional(),
    bed_configuration: zod_1.z.string().optional(),
    bathroom_type: zod_1.z.string().optional(),
    view_type: zod_1.z.string().optional(),
    status: exports.RoomStatus.optional(),
    is_active: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
    maintenance_notes: zod_1.z.string().optional(),
    updated_by: zod_1.z.string().optional()
});
// 部屋ステータス更新リクエスト
exports.UpdateRoomStatusRequestSchema = zod_1.z.object({
    status: exports.RoomStatus,
    notes: zod_1.z.string().optional(),
    maintenance_notes: zod_1.z.string().optional(),
    updated_by: zod_1.z.string().optional()
});
// 部屋検索パラメータ
exports.RoomSearchParamsSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().uuid(),
    status: exports.RoomStatus.optional(),
    room_type: exports.RoomType.optional(),
    floor_number: zod_1.z.number().int().min(1).max(100).optional(),
    capacity_min: zod_1.z.number().int().min(1).optional(),
    capacity_max: zod_1.z.number().int().max(20).optional(),
    is_smoking: zod_1.z.boolean().optional(),
    is_accessible: zod_1.z.boolean().optional(),
    is_active: zod_1.z.boolean().optional(),
    room_grade_id: zod_1.z.string().uuid().optional(),
    include_grade: zod_1.z.boolean().default(false),
    available_from: zod_1.z.string().datetime().optional(),
    available_to: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0)
});
// 部屋空室検索パラメータ
exports.RoomAvailabilitySearchSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().uuid(),
    checkin_date: zod_1.z.string().datetime(),
    checkout_date: zod_1.z.string().datetime(),
    guest_count: zod_1.z.number().int().min(1).max(20),
    room_type: exports.RoomType.optional(),
    is_smoking: zod_1.z.boolean().optional(),
    is_accessible: zod_1.z.boolean().optional(),
    room_grade_id: zod_1.z.string().uuid().optional()
});
