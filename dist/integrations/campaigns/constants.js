"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.CTA_TYPES = exports.DISPLAY_TYPES = exports.CAMPAIGN_TYPES = exports.SUPPORTED_LANGUAGES = exports.DEFAULT_LANGUAGE = exports.DISPLAY_PRIORITY = exports.PAGINATION = exports.CACHE_TTL = void 0;
// キャッシュの有効期限（秒）
exports.CACHE_TTL = {
    ACTIVE_CAMPAIGNS: 300, // 5分
    CAMPAIGN_DETAIL: 300, // 5分
    WELCOME_SCREEN: 300, // 5分
    CATEGORIES: 600 // 10分
};
// ページネーションのデフォルト値
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
};
// 表示優先度の値
exports.DISPLAY_PRIORITY = {
    HIGHEST: 100,
    HIGH: 75,
    MEDIUM: 50,
    LOW: 25,
    LOWEST: 0
};
// 言語設定
exports.DEFAULT_LANGUAGE = 'ja';
exports.SUPPORTED_LANGUAGES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
// キャンペーンタイプ
exports.CAMPAIGN_TYPES = {
    DISCOUNT: 'DISCOUNT',
    PROMOTION: 'PROMOTION',
    WELCOME: 'WELCOME'
};
// 表示タイプ
exports.DISPLAY_TYPES = {
    BANNER: 'BANNER',
    POPUP: 'POPUP',
    INLINE: 'INLINE',
    WELCOME_SCREEN: 'WELCOME_SCREEN'
};
// CTAタイプ
exports.CTA_TYPES = {
    BUTTON: 'BUTTON',
    LINK: 'LINK',
    NONE: 'NONE'
};
// エラーコード
exports.ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};
