import { RuntimeTranslationSystem } from './runtime';
import { SupportedLanguage } from './types';
/** i18nインスタンス作成 */
export declare function createI18nInstance(options?: {
    defaultLanguage?: SupportedLanguage;
    supportedLanguages?: SupportedLanguage[];
    autoDetect?: boolean;
}): RuntimeTranslationSystem;
/** Vue.js統合用コンポーザブル */
export declare function useI18n(): {
    t: (key: string, params?: Record<string, any>) => string;
    setLanguage: (language: SupportedLanguage, userId?: string) => Promise<void>;
    currentLanguage: () => SupportedLanguage;
    supportedLanguages: () => SupportedLanguage[];
    on: <K>(eventName: string | symbol, listener: (...args: any[]) => void) => RuntimeTranslationSystem;
    off: <K>(eventName: string | symbol, listener: (...args: any[]) => void) => RuntimeTranslationSystem;
};
/** React統合用フック */
export declare function createReactI18nHook(): () => {
    t: (key: string, params?: Record<string, any>) => string;
    setLanguage: (language: SupportedLanguage, userId?: string) => Promise<void>;
    currentLanguage: SupportedLanguage;
    supportedLanguages: SupportedLanguage[];
};
export declare function getGlobalI18nInstance(): RuntimeTranslationSystem;
export declare function setGlobalI18nInstance(instance: RuntimeTranslationSystem): void;
