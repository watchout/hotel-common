"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationSearchParamsSchema = exports.UpdateReservationRequestSchema = exports.CreateReservationRequestSchema = exports.ReservationSchema = exports.RoomType = exports.PaymentStatus = exports.ReservationOrigin = exports.ReservationStatus = void 0;
const zod_1 = require("zod");
/**
 * 予約管理スキーマ定義
 * PMS中心の予約統合管理用
 */
// 予約ステータス
exports.ReservationStatus = zod_1.z.enum([
    'pending', // 予約待ち
    'confirmed', // 予約確定
    'checked_in', // チェックイン済み
    'completed', // 宿泊完了
    'cancelled', // キャンセル
    'no_show' // 無断キャンセル
]);
// 予約元
exports.ReservationOrigin = zod_1.z.enum([
    'member', // 会員サイト
    'ota', // OTA
    'front', // フロント
    'phone', // 電話
    'walk_in' // 当日来店
]);
// 支払いステータス
exports.PaymentStatus = zod_1.z.enum([
    'pending', // 支払い待ち
    'partial', // 一部支払い
    'paid', // 支払い完了
    'refunded' // 返金済み
]);
// 部屋タイプ
exports.RoomType = zod_1.z.enum([
    'standard', // スタンダード
    'deluxe', // デラックス
    'suite', // スイート
    'premium', // プレミアム
    'executive' // エグゼクティブ
]);
// 予約データスキーマ
exports.ReservationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenant_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    // 宿泊情報
    checkin_date: zod_1.z.string().datetime(),
    checkout_date: zod_1.z.string().datetime(),
    room_type: exports.RoomType,
    room_number: zod_1.z.string().optional(),
    room_grade_id: zod_1.z.string().uuid().optional(),
    guest_count: zod_1.z.number().int().min(1).max(10),
    // 料金情報
    total_amount: zod_1.z.number().positive(),
    base_rate: zod_1.z.number().positive(),
    tax_amount: zod_1.z.number().min(0),
    service_charge: zod_1.z.number().min(0),
    discount_amount: zod_1.z.number().min(0),
    // ステータス
    status: exports.ReservationStatus,
    payment_status: exports.PaymentStatus,
    origin: exports.ReservationOrigin,
    // 追加情報
    special_requests: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    confirmation_number: zod_1.z.string().optional(),
    // システム情報
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
    created_by: zod_1.z.string().optional(),
    updated_by: zod_1.z.string().optional(),
    created_by_system: zod_1.z.string().default('hotel-common'),
    updated_by_system: zod_1.z.string().optional()
});
// 予約作成リクエスト
exports.CreateReservationRequestSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    checkin_date: zod_1.z.string().datetime(),
    checkout_date: zod_1.z.string().datetime(),
    room_type: exports.RoomType,
    room_grade_id: zod_1.z.string().uuid().optional(),
    guest_count: zod_1.z.number().int().min(1).max(10),
    total_amount: zod_1.z.number().positive(),
    base_rate: zod_1.z.number().positive(),
    tax_amount: zod_1.z.number().min(0).default(0),
    service_charge: zod_1.z.number().min(0).default(0),
    discount_amount: zod_1.z.number().min(0).default(0),
    origin: exports.ReservationOrigin,
    special_requests: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    created_by: zod_1.z.string().optional()
});
// 予約更新リクエスト
exports.UpdateReservationRequestSchema = zod_1.z.object({
    checkin_date: zod_1.z.string().datetime().optional(),
    checkout_date: zod_1.z.string().datetime().optional(),
    room_type: exports.RoomType.optional(),
    room_number: zod_1.z.string().optional(),
    room_grade_id: zod_1.z.string().uuid().optional(),
    guest_count: zod_1.z.number().int().min(1).max(10).optional(),
    total_amount: zod_1.z.number().positive().optional(),
    base_rate: zod_1.z.number().positive().optional(),
    tax_amount: zod_1.z.number().min(0).optional(),
    service_charge: zod_1.z.number().min(0).optional(),
    discount_amount: zod_1.z.number().min(0).optional(),
    status: exports.ReservationStatus.optional(),
    payment_status: exports.PaymentStatus.optional(),
    special_requests: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    updated_by: zod_1.z.string().optional()
});
// 予約検索パラメータ
exports.ReservationSearchParamsSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().uuid(),
    status: exports.ReservationStatus.optional(),
    payment_status: exports.PaymentStatus.optional(),
    checkin_date_from: zod_1.z.string().datetime().optional(),
    checkin_date_to: zod_1.z.string().datetime().optional(),
    checkout_date_from: zod_1.z.string().datetime().optional(),
    checkout_date_to: zod_1.z.string().datetime().optional(),
    guest_name: zod_1.z.string().optional(),
    room_number: zod_1.z.string().optional(),
    room_type: exports.RoomType.optional(),
    origin: exports.ReservationOrigin.optional(),
    user_id: zod_1.z.string().uuid().optional(),
    confirmation_number: zod_1.z.string().optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0)
});
