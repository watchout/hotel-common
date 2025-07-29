import { TranslationConfig } from './config';
import { EventEmitter } from 'events';
/** 実行時翻訳システム */
export class RuntimeTranslationSystem extends EventEmitter {
    cache = new Map();
    currentLanguage;
    config;
    fallbackData;
    constructor(config) {
        super();
        this.config = config || new TranslationConfig();
        this.currentLanguage = this.config.defaultLanguage;
        this.preloadDefaultLanguages();
    }
    /** 言語を切り替え */
    async setLanguage(language, userId) {
        if (!this.config.isSupported(language)) {
            console.warn(`Unsupported language: ${language}`);
            return;
        }
        const previousLanguage = this.currentLanguage;
        try {
            await this.loadLanguage(language);
            this.currentLanguage = language;
            // 言語変更イベント発行
            const event = {
                userId: userId || 'system',
                previousLanguage,
                newLanguage: language,
                timestamp: new Date().toISOString(),
                sourceSystem: 'common'
            };
            this.emit('languageChanged', event);
            console.log(`Language changed from ${previousLanguage} to ${language}`);
        }
        catch (error) {
            console.error(`Failed to load language ${language}:`, error);
            throw new Error(`Language switching failed: ${language}`);
        }
    }
    /** 翻訳取得 */
    t(key, params) {
        const translation = this.getTranslation(key);
        if (!translation) {
            console.warn(`Missing translation: ${key} (${this.currentLanguage})`);
            return this.getFallbackTranslation(key) || key;
        }
        return this.interpolate(translation, params);
    }
    /** 現在の言語取得 */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    /** サポート言語一覧取得 */
    getSupportedLanguages() {
        return this.config.supportedLanguages;
    }
    /** 翻訳データが読み込み済みかチェック */
    isLanguageLoaded(language) {
        return this.cache.has(language);
    }
    /** 言語データを事前読み込み */
    async preloadDefaultLanguages() {
        const preloadLanguages = this.config.supportedLanguages.slice(0, 2); // ja, en
        for (const language of preloadLanguages) {
            try {
                await this.loadLanguage(language);
            }
            catch (error) {
                console.warn(`Failed to preload language ${language}:`, error);
            }
        }
    }
    /** 言語データを読み込み */
    async loadLanguage(language) {
        if (this.cache.has(language)) {
            return;
        }
        try {
            // 翻訳ファイルを読み込み（環境に応じてパスを調整）
            const translations = await this.fetchTranslationData(language);
            this.cache.set(language, translations);
            // フォールバック用データ設定
            if (language === this.config.defaultLanguage) {
                this.fallbackData = translations;
            }
            console.log(`Loaded translations for ${language}`);
        }
        catch (error) {
            console.error(`Failed to load translations for ${language}:`, error);
            throw error;
        }
    }
    /** 翻訳データを取得（API/ファイル） */
    async fetchTranslationData(language) {
        // 本番環境では CDN から取得
        const url = `/i18n/locales/${language}.json`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            // 開発環境ではローカルファイルから読み込み
            console.warn(`CDN fetch failed, trying local import for ${language}`);
            return await import(`../../../i18n/locales/${language}.json`);
        }
    }
    /** 翻訳文字列を取得 */
    getTranslation(key) {
        const translations = this.cache.get(this.currentLanguage);
        if (!translations)
            return undefined;
        return this.getNestedValue(translations, key);
    }
    /** フォールバック翻訳を取得 */
    getFallbackTranslation(key) {
        if (!this.fallbackData)
            return undefined;
        return this.getNestedValue(this.fallbackData, key);
    }
    /** ネストされたオブジェクトから値を取得 */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    /** パラメータ補間 */
    interpolate(template, params) {
        if (!params)
            return template;
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key]?.toString() || match;
        });
    }
}
/** 言語設定をJWTに統合 */
export function createTokenWithLanguage(baseToken, language) {
    return {
        ...baseToken,
        language
    };
}
