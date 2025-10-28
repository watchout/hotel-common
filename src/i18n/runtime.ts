import { EventEmitter } from 'events'

import { TranslationConfig } from './config'
import { TranslationKey } from './types'

// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
import type { SupportedLanguage, TranslationData, LanguageChangeEvent } from './types';


/** 実行時翻訳システム */
export class RuntimeTranslationSystem extends EventEmitter {
  private cache = new Map<SupportedLanguage, TranslationData>()
  private currentLanguage: SupportedLanguage
  private config: TranslationConfig
  private fallbackData?: TranslationData

  constructor(config?: TranslationConfig) {
    super()
    this.config = config || new TranslationConfig()
    this.currentLanguage = this.config.defaultLanguage
    this.preloadDefaultLanguages()
  }

  /** 言語を切り替え */
  async setLanguage(language: SupportedLanguage, userId?: string): Promise<void> {
    if (!this.config.isSupported(language)) {
      console.warn(`Unsupported language: ${language}`)
      return
    }

    const previousLanguage = this.currentLanguage

    try {
      await this.loadLanguage(language)
      this.currentLanguage = language

      // 言語変更イベント発行
      const event: LanguageChangeEvent = {
        userId: userId || 'system',
        previousLanguage,
        newLanguage: language,
        timestamp: new Date().toISOString(),
        sourceSystem: 'common'
      }

      this.emit('languageChanged', event)
      
      console.log(`Language changed from ${previousLanguage} to ${language}`)
    } catch (error: unknown) {
      console.error(`Failed to load language ${language}:`, error)
      throw new Error(`Language switching failed: ${language}`)
    }
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  /** 翻訳取得 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  t(key: string, params?: Record<string, any>): string {
    const translation = this.getTranslation(key)
    
    if (!translation) {
      console.warn(`Missing translation: ${key} (${this.currentLanguage})`)
      return this.getFallbackTranslation(key) || key
    }

    return this.interpolate(translation, params)
  }

  /** 現在の言語取得 */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  /** サポート言語一覧取得 */
  getSupportedLanguages(): SupportedLanguage[] {
    return this.config.supportedLanguages
  }

  /** 翻訳データが読み込み済みかチェック */
  isLanguageLoaded(language: SupportedLanguage): boolean {
    return this.cache.has(language)
  }

  /** 言語データを事前読み込み */
  private async preloadDefaultLanguages(): Promise<void> {
    const preloadLanguages = this.config.supportedLanguages.slice(0, 2) // ja, en
    
    for (const language of preloadLanguages) {
      try {
        await this.loadLanguage(language)
      } catch (error: unknown) {
        console.warn(`Failed to preload language ${language}:`, error)
      }
    }
  }

  /** 言語データを読み込み */
  private async loadLanguage(language: SupportedLanguage): Promise<void> {
    if (this.cache.has(language)) {
      return
    }

    try {
      // 翻訳ファイルを読み込み（環境に応じてパスを調整）
      const translations = await this.fetchTranslationData(language)
      this.cache.set(language, translations)
      
      // フォールバック用データ設定
      if (language === this.config.defaultLanguage) {
        this.fallbackData = translations
      }

      console.log(`Loaded translations for ${language}`)
    } catch (error: unknown) {
      console.error(`Failed to load translations for ${language}:`, error)
      throw error
    }
  }

  /** 翻訳データを取得（API/ファイル） */
  private async fetchTranslationData(language: SupportedLanguage): Promise<TranslationData> {
    // 本番環境では CDN から取得
    const url = `/i18n/locales/${language}.json`
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
// eslint-disable-next-line no-return-await
      return await response.json()
    } catch (error: unknown) {
// eslint-disable-next-line no-return-await
      // 開発環境ではローカルファイルから読み込み
      console.warn(`CDN fetch failed, trying local import for ${language}`)
// eslint-disable-next-line no-return-await
      return await import(`../../../i18n/locales/${language}.json`)
    }
  }

  /** 翻訳文字列を取得 */
  private getTranslation(key: string): string | undefined {
    const translations = this.cache.get(this.currentLanguage)
    if (!translations) return undefined

    return this.getNestedValue(translations, key)
  }

  /** フォールバック翻訳を取得 */
  private getFallbackTranslation(key: string): string | undefined {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!this.fallbackData) return undefined
    return this.getNestedValue(this.fallbackData, key)
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  /** ネストされたオブジェクトから値を取得 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => current?.[key], obj)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  /** パラメータ補間 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private interpolate(template: string, params?: Record<string, any>): string {
    if (!params) return template

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match
    })
  }
}

/** JWT統合用：トークンに言語設定を含める */
export interface UserTokenWithLanguage {
  userId: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  language: SupportedLanguage
  tenantId?: string
  roles?: string[]
  exp: number
  iat: number
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}

/** 言語設定をJWTに統合 */
export function createTokenWithLanguage(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseToken: any, 
  language: SupportedLanguage
): UserTokenWithLanguage {
  return {
    ...baseToken,
    language
  }
} 