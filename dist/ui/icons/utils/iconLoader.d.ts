import { IconSetType } from '../types';
/**
 * アイコン名を完全修飾名に変換
 *
 * @param name アイコン名
 * @param set アイコンセット
 * @returns 完全修飾アイコン名
 */
export declare function getFullIconName(name: string, set?: IconSetType): string;
/**
 * アイコンをプリロード
 *
 * @param names アイコン名の配列
 * @param set デフォルトのアイコンセット
 */
export declare function preloadIcons(names: string[], set?: IconSetType): Promise<void>;
/**
 * アイコンが存在するか確認
 *
 * @param name アイコン名
 * @param set アイコンセット
 * @returns アイコンが存在するか
 */
export declare function iconExists(name: string, set?: IconSetType): Promise<boolean>;
