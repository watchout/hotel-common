// キャッシュの有効期限（秒）
export const CACHE_TTL = {
  ACTIVE_CAMPAIGNS: 300, // 5分
  CAMPAIGN_DETAIL: 300, // 5分
  WELCOME_SCREEN: 300, // 5分
  CATEGORIES: 600 // 10分
};

// ページネーションのデフォルト値
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// 表示優先度の値
export const DISPLAY_PRIORITY = {
  HIGHEST: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
  LOWEST: 0
};

// 言語設定
export const DEFAULT_LANGUAGE = 'ja';
export const SUPPORTED_LANGUAGES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];

// キャンペーンタイプ
export const CAMPAIGN_TYPES = {
  DISCOUNT: 'DISCOUNT',
  PROMOTION: 'PROMOTION',
  WELCOME: 'WELCOME'
};

// 表示タイプ
export const DISPLAY_TYPES = {
  BANNER: 'BANNER',
  POPUP: 'POPUP',
  INLINE: 'INLINE',
  WELCOME_SCREEN: 'WELCOME_SCREEN'
};

// CTAタイプ
export const CTA_TYPES = {
  BUTTON: 'BUTTON',
  LINK: 'LINK',
  NONE: 'NONE'
};

// エラーコード
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};
