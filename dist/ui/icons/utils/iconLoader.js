"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullIconName = getFullIconName;
exports.preloadIcons = preloadIcons;
exports.iconExists = iconExists;
/**
 * アイコンローダーユーティリティ
 *
 * Iconifyを使用してアイコンを効率的にロードするためのユーティリティ関数
 */
const vue_1 = require("@iconify/vue");
const iconSets_1 = require("../constants/iconSets");
/**
 * アイコン名を完全修飾名に変換
 *
 * @param name アイコン名
 * @param set アイコンセット
 * @returns 完全修飾アイコン名
 */
function getFullIconName(name, set = iconSets_1.DEFAULT_ICON_SET) {
    // すでに完全修飾名の場合はそのまま返す
    if (name.includes(':')) {
        return name;
    }
    // アイコンセットのプレフィックスを取得
    const iconSet = iconSets_1.ICON_SETS[set];
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
async function preloadIcons(names, set = iconSets_1.DEFAULT_ICON_SET) {
    const promises = names.map(name => {
        const fullName = getFullIconName(name, set);
        return (0, vue_1.loadIcon)(fullName).catch(err => {
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
async function iconExists(name, set = iconSets_1.DEFAULT_ICON_SET) {
    const fullName = getFullIconName(name, set);
    try {
        await (0, vue_1.loadIcon)(fullName);
        return true;
    }
    catch (error) {
        return false;
    }
}
