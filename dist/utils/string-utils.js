"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = generateRandomString;
exports.truncateString = truncateString;
exports.slugify = slugify;
/**
 * ランダムな文字列を生成する
 * @param length 生成する文字列の長さ
 * @param chars 使用する文字セット（デフォルトはアルファベット大文字と数字）
 * @returns ランダムな文字列
 */
function generateRandomString(length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let result = '';
    const charsLength = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}
/**
 * 文字列を指定された長さに切り詰める
 * @param str 対象の文字列
 * @param maxLength 最大長
 * @param suffix 切り詰めた場合に末尾に付加する文字列
 * @returns 切り詰められた文字列
 */
function truncateString(str, maxLength, suffix = '...') {
    if (!str)
        return '';
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
}
/**
 * 文字列をスラッグ形式に変換する
 * @param str 対象の文字列
 * @returns スラッグ形式の文字列
 */
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 英数字、アンダースコア、ハイフン、スペース以外を削除
        .replace(/\s+/g, '-') // スペースをハイフンに変換
        .replace(/--+/g, '-') // 連続するハイフンを単一のハイフンに変換
        .replace(/^-+|-+$/g, ''); // 先頭と末尾のハイフンを削除
}
