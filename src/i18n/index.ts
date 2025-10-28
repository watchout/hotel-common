// hotel-common多言語基盤システム
// eslint-disable-next-line import/export
// eslint-disable-next-line import/export
// eslint-disable-next-line import/export
export * from './types'
// eslint-disable-next-line import/export
// eslint-disable-next-line import/export
export * from './runtime'
// eslint-disable-next-line import/export
// eslint-disable-next-line import/export
export * from './config'
// eslint-disable-next-line import/export

// メイン翻訳システム
// eslint-disable-next-line import/export
// eslint-disable-next-line import/export
export { RuntimeTranslationSystem } from './runtime'
// eslint-disable-next-line import/export
// eslint-disable-next-line import/export
export { TranslationConfig } from './config'
// eslint-disable-next-line import/export
export { createI18nInstance } from './factory'
// eslint-disable-next-line import/export

// eslint-disable-next-line import/export
// 型定義
export type { 
// eslint-disable-next-line import/export
  SupportedLanguage, 
// eslint-disable-next-line import/export
  TranslationData, 
// eslint-disable-next-line import/export
  TranslationKey,
// eslint-disable-next-line import/export
  LanguageChangeEvent 
} from './types' 