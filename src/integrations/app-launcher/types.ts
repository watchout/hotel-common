/**
 * Google Playアプリ選択機能の型定義
 */

import { z } from 'zod';

// バリデーションスキーマ
export const googlePlayAppCreateSchema = z.object({
  packageName: z.string().min(1, { message: 'パッケージ名は必須です' }),
  displayName: z.string().min(1, { message: '表示名は必須です' }),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  category: z.string().min(1, { message: 'カテゴリは必須です' }),
  deepLinkUrl: z.string().optional(),
});

export const googlePlayAppUpdateSchema = googlePlayAppCreateSchema.partial();

export const googlePlayAppApproveSchema = z.object({
  isApproved: z.boolean(),
});

export const hotelAppCreateSchema = z.object({
  appId: z.string().min(1, { message: 'アプリIDは必須です' }),
  customLabel: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isEnabled: z.boolean().optional(),
});

export const hotelAppUpdateSchema = hotelAppCreateSchema.partial();

export const layoutAppBlockUpdateSchema = z.object({
  appConfig: z.record(z.any()),
});

// リクエスト・レスポンス型
export interface GooglePlayAppListQuery {
  category?: string;
  approved?: boolean;
  page?: number;
  limit?: number;
}

export interface HotelAppListQuery {
  isEnabled?: boolean;
}

// サービス用型
export interface GooglePlayAppCreateInput {
  packageName: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  category: string;
  deepLinkUrl?: string;
}

export interface GooglePlayAppUpdateInput extends Partial<GooglePlayAppCreateInput> {
  isApproved?: boolean;
  priority?: number;
}

export interface HotelAppCreateInput {
  placeId: number;
  appId: string;
  customLabel?: string;
  sortOrder?: number;
  isEnabled?: boolean;
}

export type HotelAppUpdateInput = Partial<Omit<HotelAppCreateInput, 'placeId' | 'appId'>>

export interface LayoutAppBlockUpdateInput {
  layoutId: number;
  blockId: string;
  appConfig: Record<string, any>;
}