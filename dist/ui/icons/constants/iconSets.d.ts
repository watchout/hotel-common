/**
 * アイコンセット定義
 *
 * Iconifyで利用可能な主要アイコンセットの定義
 * 詳細: https://icon-sets.iconify.design/
 */
import { IconSetType } from '../types';
/**
 * アイコンセット設定
 */
export declare const ICON_SETS: Record<IconSetType, {
    prefix: string;
    name: string;
    url: string;
}>;
/**
 * デフォルトアイコンセット
 */
export declare const DEFAULT_ICON_SET: IconSetType;
/**
 * アイコンサイズ（px）
 */
export declare const ICON_SIZES: Record<string, number>;
/**
 * アイコンカラー（CSS変数）
 */
export declare const ICON_COLORS: Record<string, string>;
