"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomAvailabilitySchema = exports.ReservationUpdateSchema = exports.ReservationCreateSchema = void 0;
const zod_1 = require("zod");
// 予約作成スキーマ
exports.ReservationCreateSchema = zod_1.z.object({
    guest_name: zod_1.z.string().min(1, '宿泊者名は必須です').max(100, '宿泊者名は100文字以下で入力してください'),
    guest_email: zod_1.z.string().email('有効なメールアドレスを入力してください'),
    guest_phone: zod_1.z.string().regex(/^[\d\-\+\(\)\s]+$/, '有効な電話番号を入力してください').optional(),
    room_type: zod_1.z.string().min(1, '部屋タイプは必須です'),
    check_in: zod_1.z.string().datetime('有効なチェックイン日時を入力してください'),
    check_out: zod_1.z.string().datetime('有効なチェックアウト日時を入力してください'),
    adults: zod_1.z.number().int().min(1, '大人の人数は1人以上必須です').max(10, '大人の人数は10人以下で入力してください'),
    children: zod_1.z.number().int().min(0, '子供の人数は0人以上で入力してください').max(10, '子供の人数は10人以下で入力してください').optional(),
    special_requests: zod_1.z.string().max(500, '特別要望は500文字以下で入力してください').optional(),
    origin: zod_1.z.enum(['hotel-member', 'hotel-pms', 'ota', 'phone', 'walk-in'], {
        message: '有効な予約元を選択してください'
    }),
    origin_reference: zod_1.z.string().optional()
}).refine(data => {
    const checkIn = new Date(data.check_in);
    const checkOut = new Date(data.check_out);
    return checkOut > checkIn;
}, {
    message: 'チェックアウト日時はチェックイン日時より後である必要があります',
    path: ['check_out']
});
// 予約更新スキーマ
exports.ReservationUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('有効な予約IDを入力してください'),
    guest_name: zod_1.z.string().min(1).max(100).optional(),
    guest_email: zod_1.z.string().email().optional(),
    guest_phone: zod_1.z.string().regex(/^[\d\-\+\(\)\s]+$/).optional(),
    room_type: zod_1.z.string().min(1).optional(),
    check_in: zod_1.z.string().datetime().optional(),
    check_out: zod_1.z.string().datetime().optional(),
    adults: zod_1.z.number().int().min(1).max(10).optional(),
    children: zod_1.z.number().int().min(0).max(10).optional(),
    special_requests: zod_1.z.string().max(500).optional(),
    status: zod_1.z.enum(['confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).optional()
}).refine(data => {
    if (data.check_in && data.check_out) {
        const checkIn = new Date(data.check_in);
        const checkOut = new Date(data.check_out);
        return checkOut > checkIn;
    }
    return true;
}, {
    message: 'チェックアウト日時はチェックイン日時より後である必要があります',
    path: ['check_out']
});
// 部屋空室確認スキーマ
exports.RoomAvailabilitySchema = zod_1.z.object({
    check_in: zod_1.z.string().datetime('有効なチェックイン日時を入力してください'),
    check_out: zod_1.z.string().datetime('有効なチェックアウト日時を入力してください'),
    room_type: zod_1.z.string().optional()
}).refine(data => {
    const checkIn = new Date(data.check_in);
    const checkOut = new Date(data.check_out);
    return checkOut > checkIn;
}, {
    message: 'チェックアウト日時はチェックイン日時より後である必要があります',
    path: ['check_out']
});
//# sourceMappingURL=reservation.js.map