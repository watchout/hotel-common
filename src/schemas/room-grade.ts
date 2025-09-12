import { z } from 'zod'

/**
 * 客室ランク管理スキーマ
 * SaaS管理画面での客室グレード設定用
 */

// 客室ランクスキーマ（既存テーブル構造に合わせる）
export const RoomGradeSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().min(1), // UUIDまたは文字列ID（defaultなど）
  code: z.string().min(1), // 既存フィールド
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// 客室ランク作成リクエスト（既存テーブル構造に合わせる）
export const CreateRoomGradeRequestSchema = z.object({
  tenant_id: z.string().min(1), // UUIDまたは文字列ID（defaultなど）
  name: z.string().min(1).max(100),
  description: z.string().optional()
})

// 客室ランク更新リクエスト（既存テーブル構造に合わせる）
export const UpdateRoomGradeRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional()
})

// 型エクスポート
export type RoomGrade = z.infer<typeof RoomGradeSchema>
export type CreateRoomGradeRequest = z.infer<typeof CreateRoomGradeRequestSchema>
export type UpdateRoomGradeRequest = z.infer<typeof UpdateRoomGradeRequestSchema>
