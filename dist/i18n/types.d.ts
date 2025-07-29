/** サポート対象言語 */
export type SupportedLanguage = 'ja' | 'en' | 'zh-CN' | 'zh-TW' | 'ko';
/** 翻訳データ構造 */
export interface TranslationData {
    ui: {
        buttons: Record<string, string>;
        labels: Record<string, string>;
        navigation: Record<string, string>;
        titles: Record<string, string>;
        placeholders: Record<string, string>;
    };
    messages: {
        success: Record<string, string>;
        error: Record<string, string>;
        warning: Record<string, string>;
        info: Record<string, string>;
    };
    content: {
        descriptions: Record<string, string>;
        instructions: Record<string, string>;
        help: Record<string, string>;
        legal: Record<string, string>;
    };
    business: {
        hotel: Record<string, string>;
        reservation: Record<string, string>;
        guest: Record<string, string>;
        service: Record<string, string>;
    };
}
/** 翻訳キー型 */
export type TranslationKey = keyof TranslationData | `${keyof TranslationData}.${string}`;
/** 言語設定 */
export interface LanguageConfig {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    dateFormat: string;
    currencyFormat: string;
    flag: string;
}
/** 言語変更イベント */
export interface LanguageChangeEvent {
    userId: string;
    previousLanguage: SupportedLanguage;
    newLanguage: SupportedLanguage;
    timestamp: string;
    sourceSystem: 'saas' | 'member' | 'pms' | 'common';
}
/** 翻訳結果 */
export interface TranslationResult {
    original: string;
    translated: string;
    language: SupportedLanguage;
    confidence: number;
    cached: boolean;
}
/** 多言語設定 */
export interface MultilingualConfig {
    defaultLanguage: SupportedLanguage;
    supportedLanguages: SupportedLanguage[];
    fallbackChain: SupportedLanguage[];
    cacheStrategy: 'memory' | 'redis' | 'file';
    autoDetect: boolean;
    preload: SupportedLanguage[];
}
/** 品質チェック結果 */
export interface QualityReport {
    score: number;
    issues: QualityIssue[];
    recommendations: string[];
    lastChecked: string;
}
export interface QualityIssue {
    type: 'missing' | 'inconsistent' | 'too_long' | 'cultural';
    key: string;
    language: SupportedLanguage;
    description: string;
    severity: 'low' | 'medium' | 'high';
}
