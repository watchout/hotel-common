"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCampaignToBasicInfo = mapCampaignToBasicInfo;
exports.mapCampaignToDetailInfo = mapCampaignToDetailInfo;
exports.mapCategoryToInfo = mapCategoryToInfo;
exports.getTranslationByLanguage = getTranslationByLanguage;
exports.getLocalizedCampaignInfo = getLocalizedCampaignInfo;
exports.isCampaignActive = isCampaignActive;
exports.isTimeAllowed = isTimeAllowed;
exports.isDayAllowed = isDayAllowed;
exports.isMinOrderAmountMet = isMinOrderAmountMet;
exports.isUsageLimitNotReached = isUsageLimitNotReached;
exports.calculateDiscount = calculateDiscount;
exports.checkCampaignApplicability = checkCampaignApplicability;
exports.getLanguageFromRequest = getLanguageFromRequest;
const constants_1 = require("./constants");
/**
 * キャンペーンモデルを基本情報に変換
 */
function mapCampaignToBasicInfo(campaign) {
    return {
        id: campaign.id,
        code: campaign.code,
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        displayType: campaign.displayType,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
    };
}
/**
 * キャンペーンモデルを詳細情報に変換
 */
function mapCampaignToDetailInfo(campaign) {
    return {
        id: campaign.id,
        code: campaign.code,
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        displayType: campaign.displayType,
        displayPriority: campaign.displayPriority,
        ctaType: campaign.ctaType,
        ctaText: campaign.ctaText,
        ctaUrl: campaign.ctaUrl,
        discountType: campaign.discountType,
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
            discountType: item.discountType,
            discountValue: item.discountValue
        })),
        categories: campaign.categoryRelations ? campaign.categoryRelations.map((relation) => ({
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
function mapCategoryToInfo(category) {
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
function getTranslationByLanguage(translations, languageCode) {
    return translations.find(t => t.languageCode === languageCode);
}
/**
 * キャンペーン情報をローカライズ
 */
function getLocalizedCampaignInfo(campaign, languageCode) {
    const translation = getTranslationByLanguage(campaign.translations, languageCode);
    return {
        id: campaign.id,
        code: campaign.code,
        name: translation?.name || campaign.name,
        description: translation?.description || campaign.description,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        displayType: campaign.displayType,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
    };
}
/**
 * キャンペーンがアクティブかどうかを判定
 */
function isCampaignActive(campaign) {
    const now = new Date();
    return (campaign.status === 'ACTIVE' &&
        campaign.startDate <= now &&
        campaign.endDate >= now);
}
/**
 * 現在の時間が指定された時間制限内かどうかを判定
 */
function isTimeAllowed(timeRestrictions) {
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
function isDayAllowed(dayRestrictions) {
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
function isMinOrderAmountMet(campaign, orderAmount) {
    if (!campaign.minOrderAmount) {
        return true;
    }
    return orderAmount >= campaign.minOrderAmount;
}
/**
 * ユーザーの使用回数が上限に達していないかを判定
 */
function isUsageLimitNotReached(campaign, userUsageCount) {
    if (!campaign.perUserLimit) {
        return true;
    }
    return userUsageCount < campaign.perUserLimit;
}
/**
 * 割引額を計算
 */
function calculateDiscount(originalPrice, discountType, discountValue) {
    if (discountType === 'PERCENTAGE') {
        return Math.round(originalPrice * (discountValue / 100));
    }
    else if (discountType === 'FIXED') {
        return Math.min(discountValue, originalPrice);
    }
    return 0;
}
/**
 * キャンペーンの適用可否を判定
 */
function checkCampaignApplicability(campaign, orderAmount, userId) {
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
function getLanguageFromRequest(req) {
    // クエリパラメータから言語を取得
    const queryLang = req.query.lang;
    if (queryLang && constants_1.SUPPORTED_LANGUAGES.includes(queryLang)) {
        return queryLang;
    }
    // Accept-Languageヘッダーから言語を取得
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
        const languages = acceptLanguage.split(',')
            .map(lang => lang.trim().split(';')[0])
            .filter(lang => constants_1.SUPPORTED_LANGUAGES.includes(lang));
        if (languages.length > 0) {
            return languages[0];
        }
    }
    // デフォルト言語を返す
    return constants_1.DEFAULT_LANGUAGE;
}
