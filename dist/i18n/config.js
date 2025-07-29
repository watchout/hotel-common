/** 言語設定詳細 */
export const LANGUAGE_CONFIGS = {
    ja: {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        direction: 'ltr',
        dateFormat: 'YYYY年MM月DD日',
        currencyFormat: '¥{amount}',
        flag: '🇯🇵'
    },
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        dateFormat: 'MM/DD/YYYY',
        currencyFormat: '${amount}',
        flag: '🇺🇸'
    },
    'zh-CN': {
        code: 'zh-CN',
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        direction: 'ltr',
        dateFormat: 'YYYY年MM月DD日',
        currencyFormat: '¥{amount}',
        flag: '🇨🇳'
    },
    'zh-TW': {
        code: 'zh-TW',
        name: 'Chinese (Traditional)',
        nativeName: '繁體中文',
        direction: 'ltr',
        dateFormat: 'YYYY年MM月DD日',
        currencyFormat: 'NT${amount}',
        flag: '🇹🇼'
    },
    ko: {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        direction: 'ltr',
        dateFormat: 'YYYY년 MM월 DD일',
        currencyFormat: '₩{amount}',
        flag: '🇰🇷'
    }
};
/** デフォルト多言語設定 */
export const DEFAULT_I18N_CONFIG = {
    defaultLanguage: 'ja',
    supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
    fallbackChain: ['ja', 'en'],
    cacheStrategy: 'memory',
    autoDetect: true,
    preload: ['ja', 'en']
};
/** 翻訳システム設定 */
export class TranslationConfig {
    config;
    constructor(customConfig) {
        this.config = { ...DEFAULT_I18N_CONFIG, ...customConfig };
    }
    get defaultLanguage() {
        return this.config.defaultLanguage;
    }
    get supportedLanguages() {
        return this.config.supportedLanguages;
    }
    get fallbackChain() {
        return this.config.fallbackChain;
    }
    isSupported(language) {
        return this.config.supportedLanguages.includes(language);
    }
    getLanguageConfig(language) {
        return LANGUAGE_CONFIGS[language];
    }
    getFallbackLanguage(language) {
        const index = this.config.fallbackChain.indexOf(language);
        return index >= 0 && index < this.config.fallbackChain.length - 1
            ? this.config.fallbackChain[index + 1]
            : this.config.defaultLanguage;
    }
}
