"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadSchema = exports.TenantCreateSchema = exports.EventNotificationSchema = exports.BulkOperationSchema = exports.SearchSchema = exports.PaginationSchema = void 0;
const zod_1 = require("zod");
// ページネーションパラメータスキーマ
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1, 'ページ番号は1以上で入力してください').default(1),
    limit: zod_1.z.number().int().min(1, '取得件数は1以上で入力してください').max(100, '取得件数は100以下で入力してください').default(20),
    sort_by: zod_1.z.string().optional(),
    sort_order: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// 検索パラメータスキーマ
exports.SearchSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    filter: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    date_from: zod_1.z.string().datetime().optional(),
    date_to: zod_1.z.string().datetime().optional()
}).merge(exports.PaginationSchema);
// バルク操作スキーマ
exports.BulkOperationSchema = zod_1.z.object({
    operation: zod_1.z.enum(['create', 'update', 'delete'], {
        message: '有効な操作を選択してください'
    }),
    items: zod_1.z.array(zod_1.z.any()).min(1, '操作対象のアイテムは1つ以上必要です').max(1000, '一度に処理できるアイテムは1000件までです'),
    options: zod_1.z.object({
        ignore_errors: zod_1.z.boolean().default(false),
        chunk_size: zod_1.z.number().int().min(1).max(100).default(50)
    }).optional()
});
// イベント通知スキーマ
exports.EventNotificationSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, 'イベントタイプは必須です'),
    source: zod_1.z.enum(['hotel-saas', 'hotel-member', 'hotel-pms'], {
        message: '有効な送信元を選択してください'
    }),
    target: zod_1.z.enum(['hotel-saas', 'hotel-member', 'hotel-pms']).optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    retry_count: zod_1.z.number().int().min(0).max(5).default(0)
});
// テナント作成スキーマ
exports.TenantCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'テナント名は必須です').max(100, 'テナント名は100文字以下で入力してください'),
    plan: zod_1.z.enum(['basic', 'standard', 'premium'], {
        message: '有効なプランを選択してください'
    }).default('basic')
});
// ファイルアップロードスキーマ
exports.FileUploadSchema = zod_1.z.object({
    file_name: zod_1.z.string().min(1, 'ファイル名は必須です'),
    file_size: zod_1.z.number().int().min(1, 'ファイルサイズは1バイト以上必要です').max(10 * 1024 * 1024, 'ファイルサイズは10MB以下である必要があります'),
    mime_type: zod_1.z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/, '有効なMIMEタイプを入力してください'),
    description: zod_1.z.string().max(200, '説明は200文字以下で入力してください').optional()
});
//# sourceMappingURL=common.js.map