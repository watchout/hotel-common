import { TranslationConfig } from './config'
import { RuntimeTranslationSystem } from './runtime'

import type { SupportedLanguage } from './types'

/** i18nインスタンス作成 */
export function createI18nInstance(options?: {
  defaultLanguage?: SupportedLanguage
  supportedLanguages?: SupportedLanguage[]
  autoDetect?: boolean
}): RuntimeTranslationSystem {
  const config = new TranslationConfig(options)
  return new RuntimeTranslationSystem(config)
}

/** Vue.js統合用コンポーザブル */
export function useI18n() {
  const i18n = createI18nInstance()
  
  return {
    t: i18n.t.bind(i18n),
    setLanguage: i18n.setLanguage.bind(i18n),
    currentLanguage: i18n.getCurrentLanguage.bind(i18n),
    supportedLanguages: i18n.getSupportedLanguages.bind(i18n),
    on: i18n.on.bind(i18n),
    off: i18n.off.bind(i18n)
  }
}

/** React統合用フック */
export function createReactI18nHook() {
  const i18n = createI18nInstance()
  
  return function useReactI18n() {
    return {
      t: i18n.t.bind(i18n),
      setLanguage: i18n.setLanguage.bind(i18n),
      currentLanguage: i18n.getCurrentLanguage(),
      supportedLanguages: i18n.getSupportedLanguages()
    }
  }
}

/** システム間共有インスタンス */
let globalI18nInstance: RuntimeTranslationSystem | null = null

export function getGlobalI18nInstance(): RuntimeTranslationSystem {
  if (!globalI18nInstance) {
    globalI18nInstance = createI18nInstance()
  }
  return globalI18nInstance
}

export function setGlobalI18nInstance(instance: RuntimeTranslationSystem): void {
  globalI18nInstance = instance
} 