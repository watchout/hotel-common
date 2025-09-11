"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRefreshSchema = exports.PasswordChangeSchema = exports.UserUpdateSchema = exports.UserCreateSchema = exports.AuthRequestSchema = void 0;
const zod_1 = require("zod");
// 認証リクエストスキーマ
exports.AuthRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('有効なメールアドレスを入力してください'),
    password: zod_1.z.string().min(8, 'パスワードは8文字以上で入力してください').max(128, 'パスワードは128文字以下で入力してください'),
    tenant_id: zod_1.z.string().uuid('有効なテナントIDを入力してください').optional(),
    device_info: zod_1.z.string().optional()
});
// ユーザー作成スキーマ
exports.UserCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email('有効なメールアドレスを入力してください'),
    name: zod_1.z.string().min(1, '氏名は必須です').max(100, '氏名は100文字以下で入力してください'),
    password: zod_1.z.string()
        .min(8, 'パスワードは8文字以上で入力してください')
        .max(128, 'パスワードは128文字以下で入力してください')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字・小文字・数字を含む必要があります'),
    role: zod_1.z.enum(['admin', 'manager', 'staff', 'readonly'], {
        message: '有効な役割を選択してください'
    }),
    level: zod_1.z.number().int().min(1).max(5, 'レベルは1〜5の範囲で入力してください'),
    tenant_id: zod_1.z.string().uuid('有効なテナントIDを入力してください')
});
// ユーザー更新スキーマ
exports.UserUpdateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('有効なユーザーIDを入力してください'),
    email: zod_1.z.string().email().optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    role: zod_1.z.enum(['admin', 'manager', 'staff', 'readonly']).optional(),
    level: zod_1.z.number().int().min(1).max(5).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']).optional()
});
// パスワード変更スキーマ
exports.PasswordChangeSchema = zod_1.z.object({
    current_password: zod_1.z.string().min(1, '現在のパスワードは必須です'),
    new_password: zod_1.z.string()
        .min(8, '新しいパスワードは8文字以上で入力してください')
        .max(128, '新しいパスワードは128文字以下で入力してください')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '新しいパスワードは大文字・小文字・数字を含む必要があります'),
    confirm_password: zod_1.z.string()
}).refine(data => data.new_password === data.confirm_password, {
    message: '新しいパスワードと確認用パスワードが一致しません',
    path: ['confirm_password']
});
// トークンリフレッシュスキーマ
exports.TokenRefreshSchema = zod_1.z.object({
    refresh_token: zod_1.z.string().min(1, 'リフレッシュトークンは必須です')
});
