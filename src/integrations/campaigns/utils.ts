import type { Request } from 'express';
// Prismaクライアントから生成される型
interface Campaign {
  id: string;
  code: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  displayType: string;
  displayPriority: number;
  ctaType: string;
  ctaText: string;
  ctaUrl: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUsageCount: number | null;
  perUserLimit: number | null;
  timeRestrictions: any;
  dayRestrictions: any;
  welcomeSettings: any;
  createdAt: Date;
  updatedAt: Date;
}

// 列挙型の定義
import type { CampaignStatus, CampaignDisplayType, CampaignCtaType } from './types';

interface CampaignTranslation {
  id: string;
  campaignId: string;
  languageCode: string;
  name: string;
  description: string;
  ctaText: string;
  createdAt: Date;
  updatedAt: Date;
}
import type { CampaignBasicInfo, CampaignDetailInfo, CampaignCategoryInfo } from './types';

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './constants';

/**
 * キャンペーンモデルを基本情報に変換
 */
export function mapCampaignToBasicInfo(campaign: Campaign): CampaignBasicInfo {
  return {
    id: campaign.id,
    code: campaign.code,
    name: campaign.name,
    description: campaign.description,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status as CampaignStatus,
    displayType: campaign.displayType as CampaignDisplayType,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt
  };
}

/**
 * キャンペーンモデルを詳細情報に変換
 */
export function mapCampaignToDetailInfo(
  campaign: Campaign & {
    translations: CampaignTranslation[];
    items: any[];
    categoryRelations: any[];
  }
): CampaignDetailInfo {
  return {
    id: campaign.id,
    code: campaign.code,
    name: campaign.name,
    description: campaign.description,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status as CampaignStatus,
    displayType: campaign.displayType as CampaignDisplayType,
    displayPriority: campaign.displayPriority,
    ctaType: campaign.ctaType as CampaignCtaType,
    ctaText: campaign.ctaText,
    ctaUrl: campaign.ctaUrl,
    discountType: campaign.discountType as 'PERCENTAGE' | 'FIXED' | null,
    discountValue: campaign.discountValue,
    minOrderAmount: campaign.minOrderAmount,
    maxUsageCount: campaign.maxUsageCount,
    perUserLimit: campaign.perUserLimit,
    timeRestrictions: campaign.timeRestrictions,
    dayRestrictions: campaign.dayRestrictions,
    welcomeSettings: campaign.welcomeSettings,
    translations: campaign.translations.map(t => ({
      id: t.id,
      languageCode: t.languageCode,
      name: t.name,
      description: t.description,
      ctaText: t.ctaText
    })),
    items: campaign.items.map(item => ({
      id: item.id,
      productId: item.productId,
      discountType: item.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: item.discountValue
    })),
    categories: campaign.categoryRelations ? campaign.categoryRelations.map((relation: any) => ({
      id: relation.category.id,
      code: relation.category.code,
      name: relation.category.name
    })) : [],
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt
  };
}

/**
 * カテゴリーモデルを情報に変換
 */
export function mapCategoryToInfo(category: any): CampaignCategoryInfo {
  return {
    id: category.id,
    code: category.code,
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
}

/**
 * 言語コードに対応する翻訳を取得
 */
export function getTranslationByLanguage(
  translations: CampaignTranslation[],
  languageCode: string
): CampaignTranslation | undefined {
  return translations.find(t => t.languageCode === languageCode);
}

/**
 * キャンペーン情報をローカライズ
 */
export function getLocalizedCampaignInfo(
  campaign: Campaign & { translations: CampaignTranslation[] },
  languageCode: string
): CampaignBasicInfo {
  const translation = getTranslationByLanguage(campaign.translations, languageCode);
  
  return {
    id: campaign.id,
    code: campaign.code,
    name: translation?.name || campaign.name,
    description: translation?.description || campaign.description,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.status as CampaignStatus,
    displayType: campaign.displayType as CampaignDisplayType,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt
  };
}

/**
 * キャンペーンがアクティブかどうかを判定
 */
export function isCampaignActive(campaign: Campaign): boolean {
  const now = new Date();
  return (
    campaign.status === 'ACTIVE' &&
    campaign.startDate <= now &&
    campaign.endDate >= now
  );
}

/**
 * 現在の時間が指定された時間制限内かどうかを判定
 */
export function isTimeAllowed(timeRestrictions: any): boolean {
  if (!timeRestrictions || !timeRestrictions.enabled) {
    return true;
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [startHour, startMinute] = timeRestrictions.startTime.split(':').map(Number);
  const [endHour, endMinute] = timeRestrictions.endTime.split(':').map(Number);
  
  const currentTime = currentHour * 60 + currentMinute;
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  return currentTime >= startTime && currentTime < endTime;
}

/**
 * 現在の曜日が指定された曜日制限内かどうかを判定
 */
export function isDayAllowed(dayRestrictions: any): boolean {
  if (!dayRestrictions || !dayRestrictions.enabled) {
    return true;
  }
  
  const now = new Date();
  const currentDay = now.getDay(); // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayMap[currentDay];
  
  return dayRestrictions.days[currentDayName] === true;
}

/**
 * 注文金額が最低注文金額を満たすかどうかを判定
 */
export function isMinOrderAmountMet(campaign: Campaign, orderAmount: number): boolean {
  if (!campaign.minOrderAmount) {
    return true;
  }
  
  return orderAmount >= campaign.minOrderAmount;
}

/**
 * ユーザーの使用回数が上限に達していないかを判定
 */
export function isUsageLimitNotReached(
  campaign: Campaign,
  userUsageCount: number
): boolean {
  if (!campaign.perUserLimit) {
    return true;
  }
  
  return userUsageCount < campaign.perUserLimit;
}

/**
 * 割引額を計算
 */
export function calculateDiscount(
  originalPrice: number,
  discountType: string,
  discountValue: number
): number {
  if (discountType === 'PERCENTAGE') {
    return Math.round(originalPrice * (discountValue / 100));
  } else if (discountType === 'FIXED') {
    return Math.min(discountValue, originalPrice);
  }
  
  return 0;
}

/**
 * キャンペーンの適用可否を判定
 */
export function checkCampaignApplicability(
  campaign: Campaign & { usageLogs?: any[] },
  orderAmount: number,
  userId?: string
): boolean {
  // アクティブ状態チェック
  if (!isCampaignActive(campaign)) {
    return false;
  }
  
  // 時間制限チェック
  if (!isTimeAllowed(campaign.timeRestrictions)) {
    return false;
  }
  
  // 曜日制限チェック
  if (!isDayAllowed(campaign.dayRestrictions)) {
    return false;
  }
  
  // 最低注文金額チェック
  if (!isMinOrderAmountMet(campaign, orderAmount)) {
    return false;
  }
  
  // ユーザー使用制限チェック
  if (userId && campaign.usageLogs) {
    const userUsageCount = campaign.usageLogs.length;
    if (!isUsageLimitNotReached(campaign, userUsageCount)) {
      return false;
    }
  }
  
  return true;
}

/**
 * リクエストから言語コードを取得
 */
export function getLanguageFromRequest(req: Request): string {
  // クエリパラメータから言語を取得
  const queryLang = req.query.lang as string;
  if (queryLang && SUPPORTED_LANGUAGES.includes(queryLang)) {
    return queryLang;
  }
  
  // Accept-Languageヘッダーから言語を取得
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',')
      .map(lang => lang.trim().split(';')[0])
      .filter(lang => SUPPORTED_LANGUAGES.includes(lang));
    
    if (languages.length > 0) {
      return languages[0];
    }
  }
  
  // デフォルト言語を返す
  return DEFAULT_LANGUAGE;
}
