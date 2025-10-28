import type { Request } from 'express';
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
/**
 * キャンペーンモデルを基本情報に変換
 */
export declare function mapCampaignToBasicInfo(campaign: Campaign): CampaignBasicInfo;
/**
 * キャンペーンモデルを詳細情報に変換
 */
export declare function mapCampaignToDetailInfo(campaign: Campaign & {
    translations: CampaignTranslation[];
    items: any[];
    categoryRelations: any[];
}): CampaignDetailInfo;
/**
 * カテゴリーモデルを情報に変換
 */
export declare function mapCategoryToInfo(category: any): CampaignCategoryInfo;
/**
 * 言語コードに対応する翻訳を取得
 */
export declare function getTranslationByLanguage(translations: CampaignTranslation[], languageCode: string): CampaignTranslation | undefined;
/**
 * キャンペーン情報をローカライズ
 */
export declare function getLocalizedCampaignInfo(campaign: Campaign & {
    translations: CampaignTranslation[];
}, languageCode: string): CampaignBasicInfo;
/**
 * キャンペーンがアクティブかどうかを判定
 */
export declare function isCampaignActive(campaign: Campaign): boolean;
/**
 * 現在の時間が指定された時間制限内かどうかを判定
 */
export declare function isTimeAllowed(timeRestrictions: any): boolean;
/**
 * 現在の曜日が指定された曜日制限内かどうかを判定
 */
export declare function isDayAllowed(dayRestrictions: any): boolean;
/**
 * 注文金額が最低注文金額を満たすかどうかを判定
 */
export declare function isMinOrderAmountMet(campaign: Campaign, orderAmount: number): boolean;
/**
 * ユーザーの使用回数が上限に達していないかを判定
 */
export declare function isUsageLimitNotReached(campaign: Campaign, userUsageCount: number): boolean;
/**
 * 割引額を計算
 */
export declare function calculateDiscount(originalPrice: number, discountType: string, discountValue: number): number;
/**
 * キャンペーンの適用可否を判定
 */
export declare function checkCampaignApplicability(campaign: Campaign & {
    usageLogs?: any[];
}, orderAmount: number, userId?: string): boolean;
/**
 * リクエストから言語コードを取得
 */
export declare function getLanguageFromRequest(req: Request): string;
export {};
