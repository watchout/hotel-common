"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoomGradeRequestSchema = exports.CreateRoomGradeRequestSchema = exports.RoomGradeSchema = void 0;
const zod_1 = require("zod");
/**
 * 客室ランク管理スキーマ
 * SaaS管理画面での客室グレード設定用
 */
// 客室ランクスキーマ（既存テーブル構造に合わせる）
exports.RoomGradeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenant_id: zod_1.z.string().min(1), // UUIDまたは文字列ID（defaultなど）
    code: zod_1.z.string().min(1), // 既存フィールド
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime()
});
// 客室ランク作成リクエスト（既存テーブル構造に合わせる）
exports.CreateRoomGradeRequestSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().min(1), // UUIDまたは文字列ID（defaultなど）
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional()
});
// 客室ランク更新リクエスト（既存テーブル構造に合わせる）
exports.UpdateRoomGradeRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional()
});
