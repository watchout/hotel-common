import { z } from 'zod';
// 顧客作成スキーマ
export const CustomerCreateSchema = z.object({
    name: z.string().min(1, '氏名は必須です').max(100, '氏名は100文字以下で入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    phone: z.string().regex(/^[\d\-\+\(\)\s]+$/, '有効な電話番号を入力してください').optional(),
    address: z.string().max(200, '住所は200文字以下で入力してください').optional(),
    birthday: z.string().datetime('有効な生年月日を入力してください').optional(),
    gender: z.enum(['male', 'female', 'other'], {
        message: '性別を選択してください'
    }).optional(),
    preferences: z.record(z.string(), z.any()).optional()
});
// 顧客更新スキーマ
export const CustomerUpdateSchema = z.object({
    id: z.string().uuid('有効な顧客IDを入力してください'),
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^[\d\-\+\(\)\s]+$/).optional(),
    address: z.string().max(200).optional(),
    birthday: z.string().datetime().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    preferences: z.record(z.string(), z.any()).optional()
});
// 顧客検索スキーマ
export const CustomerSearchSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    member_rank: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
    last_stay_from: z.string().datetime().optional(),
    last_stay_to: z.string().datetime().optional()
});
