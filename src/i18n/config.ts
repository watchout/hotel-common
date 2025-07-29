import { SupportedLanguage, LanguageConfig, MultilingualConfig } from './types'

/** 言語設定詳細 */
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
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
}

/** デフォルト多言語設定 */
export const DEFAULT_I18N_CONFIG: MultilingualConfig = {
  defaultLanguage: 'ja',
  supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
  fallbackChain: ['ja', 'en'],
  cacheStrategy: 'memory',
  autoDetect: true,
  preload: ['ja', 'en']
}

/** 翻訳システム設定 */
export class TranslationConfig {
  private config: MultilingualConfig

  constructor(customConfig?: Partial<MultilingualConfig>) {
    this.config = { ...DEFAULT_I18N_CONFIG, ...customConfig }
  }

  get defaultLanguage(): SupportedLanguage {
    return this.config.defaultLanguage
  }

  get supportedLanguages(): SupportedLanguage[] {
    return this.config.supportedLanguages
  }

  get fallbackChain(): SupportedLanguage[] {
    return this.config.fallbackChain
  }

  isSupported(language: string): language is SupportedLanguage {
    return this.config.supportedLanguages.includes(language as SupportedLanguage)
  }

  getLanguageConfig(language: SupportedLanguage): LanguageConfig {
    return LANGUAGE_CONFIGS[language]
  }

  getFallbackLanguage(language: SupportedLanguage): SupportedLanguage {
    const index = this.config.fallbackChain.indexOf(language)
    return index >= 0 && index < this.config.fallbackChain.length - 1
      ? this.config.fallbackChain[index + 1]
      : this.config.defaultLanguage
  }
} 