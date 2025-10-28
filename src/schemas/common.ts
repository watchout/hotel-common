import { z } from 'zod'

// ページネーションパラメータスキーマ
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'ページ番号は1以上で入力してください').default(1),
  limit: z.number().int().min(1, '取得件数は1以上で入力してください').max(100, '取得件数は100以下で入力してください').default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

// 検索パラメータスキーマ
export const SearchSchema = z.object({
  search: z.string().optional(),
  filter: z.record(z.string(), z.string()).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional()
}).merge(PaginationSchema)

// バルク操作スキーマ
export const BulkOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete'], {
    message: '有効な操作を選択してください'
  }),
  items: z.array(z.any()).min(1, '操作対象のアイテムは1つ以上必要です').max(1000, '一度に処理できるアイテムは1000件までです'),
  options: z.object({
    ignore_errors: z.boolean().default(false),
    chunk_size: z.number().int().min(1).max(100).default(50)
  }).optional()
})

// イベント通知スキーマ
export const EventNotificationSchema = z.object({
  type: z.string().min(1, 'イベントタイプは必須です'),
  source: z.enum(['hotel-saas', 'hotel-member', 'hotel-pms'], {
    message: '有効な送信元を選択してください'
  }),
  target: z.enum(['hotel-saas', 'hotel-member', 'hotel-pms']).optional(),
  data: z.record(z.string(), z.any()),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  retry_count: z.number().int().min(0).max(5).default(0)
})

// テナント作成スキーマ
export const TenantCreateSchema = z.object({
  name: z.string().min(1, 'テナント名は必須です').max(100, 'テナント名は100文字以下で入力してください'),
  plan: z.enum(['basic', 'standard', 'premium'], {
    message: '有効なプランを選択してください'
  }).default('basic')
})

// ファイルアップロードスキーマ
export const FileUploadSchema = z.object({
  file_name: z.string().min(1, 'ファイル名は必須です'),
  file_size: z.number().int().min(1, 'ファイルサイズは1バイト以上必要です').max(10 * 1024 * 1024, 'ファイルサイズは10MB以下である必要があります'),
// eslint-disable-next-line no-useless-escape
// eslint-disable-next-line no-useless-escape
  mime_type: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/, '有効なMIMEタイプを入力してください'),
  description: z.string().max(200, '説明は200文字以下で入力してください').optional()
})

// 型推論
export type PaginationParams = z.infer<typeof PaginationSchema>
export type SearchParams = z.infer<typeof SearchSchema>
export type BulkOperationRequest = z.infer<typeof BulkOperationSchema>
export type EventNotificationRequest = z.infer<typeof EventNotificationSchema>
export type TenantCreateRequest = z.infer<typeof TenantCreateSchema>
export type FileUploadRequest = z.infer<typeof FileUploadSchema> 