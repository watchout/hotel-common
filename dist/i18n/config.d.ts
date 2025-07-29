import { SupportedLanguage, LanguageConfig, MultilingualConfig } from './types';
/** 言語設定詳細 */
export declare const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig>;
/** デフォルト多言語設定 */
export declare const DEFAULT_I18N_CONFIG: MultilingualConfig;
/** 翻訳システム設定 */
export declare class TranslationConfig {
    private config;
    constructor(customConfig?: Partial<MultilingualConfig>);
    get defaultLanguage(): SupportedLanguage;
    get supportedLanguages(): SupportedLanguage[];
    get fallbackChain(): SupportedLanguage[];
    isSupported(language: string): language is SupportedLanguage;
    getLanguageConfig(language: SupportedLanguage): LanguageConfig;
    getFallbackLanguage(language: SupportedLanguage): SupportedLanguage;
}
