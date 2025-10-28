"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSearchSchema = exports.CustomerUpdateSchema = exports.CustomerCreateSchema = void 0;
const zod_1 = require("zod");
// 顧客作成スキーマ
exports.CustomerCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, '氏名は必須です').max(100, '氏名は100文字以下で入力してください'),
    email: zod_1.z.string().email('有効なメールアドレスを入力してください'),
    // eslint-disable-next-line no-useless-escape
    // eslint-disable-next-line no-useless-escape
    phone: zod_1.z.string().regex(/^[\d\-\+\(\)\s]+$/, '有効な電話番号を入力してください').optional(),
    address: zod_1.z.string().max(200, '住所は200文字以下で入力してください').optional(),
    birthday: zod_1.z.string().datetime('有効な生年月日を入力してください').optional(),
    gender: zod_1.z.enum(['male', 'female', 'other'], {
        message: '性別を選択してください'
    }).optional(),
    preferences: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
});
// 顧客更新スキーマ
exports.CustomerUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('有効な顧客IDを入力してください'),
    name: zod_1.z.string().min(1).max(100).optional(),
    // eslint-disable-next-line no-useless-escape
    email: zod_1.z.string().email().optional(),
    // eslint-disable-next-line no-useless-escape
    phone: zod_1.z.string().regex(/^[\d\-\+\(\)\s]+$/).optional(),
    address: zod_1.z.string().max(200).optional(),
    birthday: zod_1.z.string().datetime().optional(),
    gender: zod_1.z.enum(['male', 'female', 'other']).optional(),
    preferences: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
});
// 顧客検索スキーマ
exports.CustomerSearchSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    member_rank: zod_1.z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
    last_stay_from: zod_1.z.string().datetime().optional(),
    last_stay_to: zod_1.z.string().datetime().optional()
});
