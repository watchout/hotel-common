// hotel-common多言語基盤システム
export * from './types';
export * from './runtime';
export * from './config';
// メイン翻訳システム
export { RuntimeTranslationSystem } from './runtime';
export { TranslationConfig } from './config';
export { createI18nInstance } from './factory';
