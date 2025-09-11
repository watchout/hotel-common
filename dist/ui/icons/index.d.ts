/**
 * アイコンモジュールエントリーポイント
 */
export { default as HotelIcon } from './components/Icon';
export { default as SystemIcon } from './components/SystemIcon';
export { ICON_SETS, DEFAULT_ICON_SET, ICON_SIZES, ICON_COLORS } from './constants/iconSets';
export { SYSTEM_ICONS, FEATURE_ICONS } from './constants/systemIcons';
export { getFullIconName, preloadIcons, iconExists } from './utils/iconLoader';
export * from './types';
/**
 * Vue用プラグイン
 */
import { App } from 'vue';
declare const _default: {
    install(app: App): void;
};
export default _default;
