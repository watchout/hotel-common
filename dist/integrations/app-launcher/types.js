"use strict";
/**
 * Google Playアプリ選択機能の型定義
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutAppBlockUpdateSchema = exports.hotelAppUpdateSchema = exports.hotelAppCreateSchema = exports.googlePlayAppApproveSchema = exports.googlePlayAppUpdateSchema = exports.googlePlayAppCreateSchema = void 0;
const zod_1 = require("zod");
// バリデーションスキーマ
exports.googlePlayAppCreateSchema = zod_1.z.object({
    packageName: zod_1.z.string().min(1, { message: 'パッケージ名は必須です' }),
    displayName: zod_1.z.string().min(1, { message: '表示名は必須です' }),
    description: zod_1.z.string().optional(),
    iconUrl: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, { message: 'カテゴリは必須です' }),
    deepLinkUrl: zod_1.z.string().optional(),
});
exports.googlePlayAppUpdateSchema = exports.googlePlayAppCreateSchema.partial();
exports.googlePlayAppApproveSchema = zod_1.z.object({
    isApproved: zod_1.z.boolean(),
});
exports.hotelAppCreateSchema = zod_1.z.object({
    appId: zod_1.z.string().min(1, { message: 'アプリIDは必須です' }),
    customLabel: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().int().optional(),
    isEnabled: zod_1.z.boolean().optional(),
});
exports.hotelAppUpdateSchema = exports.hotelAppCreateSchema.partial();
exports.layoutAppBlockUpdateSchema = zod_1.z.object({
    appConfig: zod_1.z.record(zod_1.z.any()),
});
