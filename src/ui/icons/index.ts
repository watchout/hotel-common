/**
 * アイコンモジュールエントリーポイント
 */

// コンポーネント
export { default as HotelIcon } from './components/Icon';
export { default as SystemIcon } from './components/SystemIcon';

// 定数
export { ICON_SETS, DEFAULT_ICON_SET, ICON_SIZES, ICON_COLORS } from './constants/iconSets';
export { SYSTEM_ICONS, FEATURE_ICONS } from './constants/systemIcons';

// ユーティリティ
export { getFullIconName, preloadIcons, iconExists } from './utils/iconLoader';

// 型定義
export * from './types';

/**
 * Vue用プラグイン
 */

import HotelIcon from './components/Icon';
import SystemIcon from './components/SystemIcon';

import type { App } from 'vue';

export default {
  install(app: App) {
    app.component('HotelIcon', HotelIcon);
    app.component('SystemIcon', SystemIcon);
  }
};