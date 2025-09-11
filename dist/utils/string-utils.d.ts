/**
 * ランダムな文字列を生成する
 * @param length 生成する文字列の長さ
 * @param chars 使用する文字セット（デフォルトはアルファベット大文字と数字）
 * @returns ランダムな文字列
 */
export declare function generateRandomString(length: number, chars?: string): string;
/**
 * 文字列を指定された長さに切り詰める
 * @param str 対象の文字列
 * @param maxLength 最大長
 * @param suffix 切り詰めた場合に末尾に付加する文字列
 * @returns 切り詰められた文字列
 */
export declare function truncateString(str: string, maxLength: number, suffix?: string): string;
/**
 * 文字列をスラッグ形式に変換する
 * @param str 対象の文字列
 * @returns スラッグ形式の文字列
 */
export declare function slugify(str: string): string;
