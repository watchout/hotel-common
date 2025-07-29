import { RuntimeTranslationSystem } from './runtime';
import { TranslationConfig } from './config';
/** i18nインスタンス作成 */
export function createI18nInstance(options) {
    const config = new TranslationConfig(options);
    return new RuntimeTranslationSystem(config);
}
/** Vue.js統合用コンポーザブル */
export function useI18n() {
    const i18n = createI18nInstance();
    return {
        t: i18n.t.bind(i18n),
        setLanguage: i18n.setLanguage.bind(i18n),
        currentLanguage: i18n.getCurrentLanguage.bind(i18n),
        supportedLanguages: i18n.getSupportedLanguages.bind(i18n),
        on: i18n.on.bind(i18n),
        off: i18n.off.bind(i18n)
    };
}
/** React統合用フック */
export function createReactI18nHook() {
    const i18n = createI18nInstance();
    return function useReactI18n() {
        return {
            t: i18n.t.bind(i18n),
            setLanguage: i18n.setLanguage.bind(i18n),
            currentLanguage: i18n.getCurrentLanguage(),
            supportedLanguages: i18n.getSupportedLanguages()
        };
    };
}
/** システム間共有インスタンス */
let globalI18nInstance = null;
export function getGlobalI18nInstance() {
    if (!globalI18nInstance) {
        globalI18nInstance = createI18nInstance();
    }
    return globalI18nInstance;
}
export function setGlobalI18nInstance(instance) {
    globalI18nInstance = instance;
}
