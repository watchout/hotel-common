"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createI18nInstance = createI18nInstance;
exports.useI18n = useI18n;
exports.createReactI18nHook = createReactI18nHook;
exports.getGlobalI18nInstance = getGlobalI18nInstance;
exports.setGlobalI18nInstance = setGlobalI18nInstance;
const config_1 = require("./config");
const runtime_1 = require("./runtime");
/** i18nインスタンス作成 */
function createI18nInstance(options) {
    const config = new config_1.TranslationConfig(options);
    return new runtime_1.RuntimeTranslationSystem(config);
}
/** Vue.js統合用コンポーザブル */
function useI18n() {
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
function createReactI18nHook() {
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
function getGlobalI18nInstance() {
    if (!globalI18nInstance) {
        globalI18nInstance = createI18nInstance();
    }
    return globalI18nInstance;
}
function setGlobalI18nInstance(instance) {
    globalI18nInstance = instance;
}
