import { SupportedLanguage } from './types';
import { TranslationConfig } from './config';
import { EventEmitter } from 'events';
/** 実行時翻訳システム */
export declare class RuntimeTranslationSystem extends EventEmitter {
    private cache;
    private currentLanguage;
    private config;
    private fallbackData?;
    constructor(config?: TranslationConfig);
    /** 言語を切り替え */
    setLanguage(language: SupportedLanguage, userId?: string): Promise<void>;
    /** 翻訳取得 */
    t(key: string, params?: Record<string, any>): string;
    /** 現在の言語取得 */
    getCurrentLanguage(): SupportedLanguage;
    /** サポート言語一覧取得 */
    getSupportedLanguages(): SupportedLanguage[];
    /** 翻訳データが読み込み済みかチェック */
    isLanguageLoaded(language: SupportedLanguage): boolean;
    /** 言語データを事前読み込み */
    private preloadDefaultLanguages;
    /** 言語データを読み込み */
    private loadLanguage;
    /** 翻訳データを取得（API/ファイル） */
    private fetchTranslationData;
    /** 翻訳文字列を取得 */
    private getTranslation;
    /** フォールバック翻訳を取得 */
    private getFallbackTranslation;
    /** ネストされたオブジェクトから値を取得 */
    private getNestedValue;
    /** パラメータ補間 */
    private interpolate;
}
/** JWT統合用：トークンに言語設定を含める */
export interface UserTokenWithLanguage {
    userId: string;
    language: SupportedLanguage;
    tenantId?: string;
    roles?: string[];
    exp: number;
    iat: number;
}
/** 言語設定をJWTに統合 */
export declare function createTokenWithLanguage(baseToken: any, language: SupportedLanguage): UserTokenWithLanguage;
