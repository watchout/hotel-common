/**
 * アイコンローダーユーティリティ
 * 
 * Iconifyを使用してアイコンを効率的にロードするためのユーティリティ関数
 */
import { loadIcon } from '@iconify/vue';

import { DEFAULT_ICON_SET, ICON_SETS } from '../constants/iconSets';

import type { IconSetType } from '../types';

/**
 * アイコン名を完全修飾名に変換
 * 
 * @param name アイコン名
 * @param set アイコンセット
 * @returns 完全修飾アイコン名
 */
export function getFullIconName(name: string, set: IconSetType = DEFAULT_ICON_SET): string {
  // すでに完全修飾名の場合はそのまま返す
  if (name.includes(':')) {
    return name;
  }
  
  // アイコンセットのプレフィックスを取得
  const iconSet = ICON_SETS[set as keyof typeof ICON_SETS];
  const prefix = iconSet?.prefix || set;
  
  // 完全修飾名を返す
  return `${prefix}:${name}`;
}

/**
 * アイコンをプリロード
 * 
 * @param names アイコン名の配列
 * @param set デフォルトのアイコンセット
 */
export async function preloadIcons(
  names: string[], 
  set: IconSetType = DEFAULT_ICON_SET
): Promise<void> {
  const promises = names.map(name => {
    const fullName = getFullIconName(name, set);
    return loadIcon(fullName).catch(err => {
      console.warn(`Failed to preload icon: ${fullName}`, err);
    });
  });
  
  await Promise.all(promises);
}

/**
 * アイコンが存在するか確認
 * 
 * @param name アイコン名
 * @param set アイコンセット
 * @returns アイコンが存在するか
 */
export async function iconExists(
  name: string, 
  set: IconSetType = DEFAULT_ICON_SET
): Promise<boolean> {
  const fullName = getFullIconName(name, set);
  
  try {
    await loadIcon(fullName);
    return true;
  } catch (error: Error) {
    return false;
  }
}