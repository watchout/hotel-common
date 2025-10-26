import { z } from 'zod';

import { CAMPAIGN_TYPES, DISPLAY_TYPES, CTA_TYPES } from './constants';

// キャンペーンタイプ
export type CampaignType = 'DISCOUNT' | 'PROMOTION' | 'WELCOME';

// 表示タイプ
export type CampaignDisplayType = 'BANNER' | 'POPUP' | 'INLINE' | 'WELCOME_SCREEN';

// CTAタイプ
export type CampaignCtaType = 'BUTTON' | 'LINK' | 'NONE';

// キャンペーンステータス
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

// キャンペーン基本情報
export interface CampaignBasicInfo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  displayType: CampaignDisplayType;
  createdAt: Date;
  updatedAt: Date;
}

// キャンペーン詳細情報
export interface CampaignDetailInfo extends CampaignBasicInfo {
  displayPriority: number;
  ctaType: CampaignCtaType;
  ctaText: string | null;
  ctaUrl: string | null;
  discountType: 'PERCENTAGE' | 'FIXED' | null;
  discountValue: number | null;
  minOrderAmount: number | null;
  maxUsageCount: number | null;
  perUserLimit: number | null;
  timeRestrictions: any | null;
  dayRestrictions: any | null;
  welcomeSettings: any | null;
  translations: CampaignTranslationInfo[];
  items: CampaignItemInfo[];
  categories: CampaignCategoryInfo[];
}

// ウェルカムスクリーン設定
export interface CampaignWelcomeSettings {
  enabled: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  buttonText?: string;
  showOnce?: boolean;
}

// 時間制限設定
export interface CampaignTimeRestrictions {
  enabled: boolean;
  startTime: string; // HH:MM形式
  endTime: string; // HH:MM形式
}

// 曜日制限設定
export interface CampaignDayRestrictions {
  enabled: boolean;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

// キャンペーンカテゴリー情報
export interface CampaignCategoryInfo {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// キャンペーン翻訳情報
export interface CampaignTranslationInfo {
  id: string;
  languageCode: string;
  name: string;
  description: string | null;
  ctaText: string | null;
}

// キャンペーンアイテム情報
export interface CampaignItemInfo {
  id: string;
  productId: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
}

// キャンペーン使用ログ情報
export interface CampaignUsageLogInfo {
  id: string;
  campaignId: string;
  userId: string | null;
  orderId: string | null;
  usedAt: Date;
}

// ウェルカムスクリーン設定
export interface WelcomeScreenConfig {
  enabled: boolean;
  title: string;
  message: string;
  imageUrl: string | null;
  videoUrl: string | null;
  buttonText: string;
  showOnce: boolean;
}

// デバイス情報
export interface DeviceInfo {
  deviceId: string;
  deviceType: 'TABLET' | 'SMARTPHONE' | 'TV' | 'OTHER';
  osType?: string;
  osVersion?: string;
  appVersion?: string;
}

// キャンペーン一覧取得パラメータ
export interface CampaignsQueryParams {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  type?: CampaignType;
  displayType?: CampaignDisplayType;
  search?: string;
}

// キャンペーン作成入力
export interface CampaignCreateInput {
  code: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  displayType: CampaignDisplayType;
  displayPriority: number;
  ctaType: CampaignCtaType;
  ctaText: string | null;
  ctaUrl: string | null;
  discountType: 'PERCENTAGE' | 'FIXED' | null;
  discountValue: number | null;
  minOrderAmount: number | null;
  maxUsageCount: number | null;
  perUserLimit: number | null;
  timeRestrictions: CampaignTimeRestrictions | null;
  dayRestrictions: CampaignDayRestrictions | null;
  welcomeSettings: CampaignWelcomeSettings | null;
  translations: {
    languageCode: string;
    name: string;
    description: string | null;
    ctaText: string | null;
  }[];
  items: {
    productId: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
  }[];
  categories: string[]; // カテゴリーID配列
}

// キャンペーン更新入力
export interface CampaignUpdateInput {
  name?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  status?: CampaignStatus;
  displayType?: CampaignDisplayType;
  displayPriority?: number;
  ctaType?: CampaignCtaType;
  ctaText?: string | null;
  ctaUrl?: string | null;
  discountType?: 'PERCENTAGE' | 'FIXED' | null;
  discountValue?: number | null;
  minOrderAmount?: number | null;
  maxUsageCount?: number | null;
  perUserLimit?: number | null;
  timeRestrictions?: CampaignTimeRestrictions | null;
  dayRestrictions?: CampaignDayRestrictions | null;
  welcomeSettings?: CampaignWelcomeSettings | null;
  translations?: {
    languageCode: string;
    name: string;
    description: string | null;
    ctaText: string | null;
  }[];
  items?: {
    productId: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
  }[];
  categories?: string[]; // カテゴリーID配列
}

// キャンペーン作成スキーマ
export const campaignCreateSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED']),
  displayType: z.enum(['BANNER', 'POPUP', 'INLINE', 'WELCOME_SCREEN']),
  displayPriority: z.number().int().min(0).max(100),
  ctaType: z.enum(['BUTTON', 'LINK', 'NONE']),
  ctaText: z.string().max(50).nullable().optional(),
  ctaUrl: z.string().url().max(2000).nullable().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).nullable().optional(),
  discountValue: z.number().min(0).nullable().optional(),
  minOrderAmount: z.number().min(0).nullable().optional(),
  maxUsageCount: z.number().int().min(0).nullable().optional(),
  perUserLimit: z.number().int().min(0).nullable().optional(),
  timeRestrictions: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
  }).nullable().optional(),
  dayRestrictions: z.object({
    enabled: z.boolean(),
    days: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean()
    })
  }).nullable().optional(),
  welcomeSettings: z.object({
    enabled: z.boolean(),
    imageUrl: z.string().url().max(2000).nullable().optional(),
    videoUrl: z.string().url().max(2000).nullable().optional(),
    buttonText: z.string().max(50).optional(),
    showOnce: z.boolean().optional()
  }).nullable().optional(),
  translations: z.array(
    z.object({
      languageCode: z.string().min(2).max(5),
      name: z.string().min(1).max(100),
      description: z.string().max(500).nullable().optional(),
      ctaText: z.string().max(50).nullable().optional()
    })
  ).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      discountType: z.enum(['PERCENTAGE', 'FIXED']),
      discountValue: z.number().min(0)
    })
  ).optional(),
  categories: z.array(z.string()).optional()
});

// キャンペーン更新スキーマ
export const campaignUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
  displayType: z.enum(['BANNER', 'POPUP', 'INLINE', 'WELCOME_SCREEN']).optional(),
  displayPriority: z.number().int().min(0).max(100).optional(),
  ctaType: z.enum(['BUTTON', 'LINK', 'NONE']).optional(),
  ctaText: z.string().max(50).nullable().optional(),
  ctaUrl: z.string().url().max(2000).nullable().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).nullable().optional(),
  discountValue: z.number().min(0).nullable().optional(),
  minOrderAmount: z.number().min(0).nullable().optional(),
  maxUsageCount: z.number().int().min(0).nullable().optional(),
  perUserLimit: z.number().int().min(0).nullable().optional(),
  timeRestrictions: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
  }).nullable().optional(),
  dayRestrictions: z.object({
    enabled: z.boolean(),
    days: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean()
    })
  }).nullable().optional(),
  welcomeSettings: z.object({
    enabled: z.boolean(),
    imageUrl: z.string().url().max(2000).nullable().optional(),
    videoUrl: z.string().url().max(2000).nullable().optional(),
    buttonText: z.string().max(50).optional(),
    showOnce: z.boolean().optional()
  }).nullable().optional(),
  translations: z.array(
    z.object({
      languageCode: z.string().min(2).max(5),
      name: z.string().min(1).max(100),
      description: z.string().max(500).nullable().optional(),
      ctaText: z.string().max(50).nullable().optional()
    })
  ).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      discountType: z.enum(['PERCENTAGE', 'FIXED']),
      discountValue: z.number().min(0)
    })
  ).optional(),
  categories: z.array(z.string()).optional()
});

// キャンペーンカテゴリー作成スキーマ
export const campaignCategoryCreateSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional()
});

// キャンペーンカテゴリー更新スキーマ
export const campaignCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional()
});

// キャンペーン適用チェックスキーマ
export const checkCampaignSchema = z.object({
  productId: z.string().optional(),
  categoryCode: z.string().optional(),
  orderAmount: z.coerce.number().min(0).default(0)
}).refine(data => data.productId || data.categoryCode, {
  message: "Either productId or categoryCode must be provided",
  path: ["productId"]
});

// ウェルカムスクリーン完了マークスキーマ
export const welcomeScreenMarkCompletedSchema = z.object({
  deviceId: z.string().min(1)
});
