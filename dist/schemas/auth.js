import { z } from 'zod';
// 認証リクエストスキーマ
export const AuthRequestSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください').max(128, 'パスワードは128文字以下で入力してください'),
    tenant_id: z.string().uuid('有効なテナントIDを入力してください').optional(),
    device_info: z.string().optional()
});
// ユーザー作成スキーマ
export const UserCreateSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    name: z.string().min(1, '氏名は必須です').max(100, '氏名は100文字以下で入力してください'),
    password: z.string()
        .min(8, 'パスワードは8文字以上で入力してください')
        .max(128, 'パスワードは128文字以下で入力してください')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字・小文字・数字を含む必要があります'),
    role: z.enum(['admin', 'manager', 'staff', 'readonly'], {
        message: '有効な役割を選択してください'
    }),
    level: z.number().int().min(1).max(5, 'レベルは1〜5の範囲で入力してください'),
    tenant_id: z.string().uuid('有効なテナントIDを入力してください')
});
// ユーザー更新スキーマ
export const UserUpdateSchema = z.object({
    id: z.string().uuid('有効なユーザーIDを入力してください'),
    email: z.string().email().optional(),
    name: z.string().min(1).max(100).optional(),
    role: z.enum(['admin', 'manager', 'staff', 'readonly']).optional(),
    level: z.number().int().min(1).max(5).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional()
});
// パスワード変更スキーマ
export const PasswordChangeSchema = z.object({
    current_password: z.string().min(1, '現在のパスワードは必須です'),
    new_password: z.string()
        .min(8, '新しいパスワードは8文字以上で入力してください')
        .max(128, '新しいパスワードは128文字以下で入力してください')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '新しいパスワードは大文字・小文字・数字を含む必要があります'),
    confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
    message: '新しいパスワードと確認用パスワードが一致しません',
    path: ['confirm_password']
});
// トークンリフレッシュスキーマ
export const TokenRefreshSchema = z.object({
    refresh_token: z.string().min(1, 'リフレッシュトークンは必須です')
});
