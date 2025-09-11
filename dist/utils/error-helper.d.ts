/**
 * エラーヘルパー関数
 *
 * エラーオブジェクトの処理を統一するためのユーティリティ関数
 */
/**
 * 任意の値をErrorオブジェクトに変換する
 * @param error 変換する値
 * @returns Errorオブジェクト
 */
export declare function toError(error: unknown): Error;
/**
 * エラーからメッセージを抽出する
 * @param error エラーオブジェクトまたは任意の値
 * @returns エラーメッセージ
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * ロガー用のエラーオプションオブジェクトを作成する
 * @param error エラーオブジェクトまたは任意の値
 * @returns ロガーオプションオブジェクト
 */
export declare function createErrorLogOption(error: unknown): {
    error: Error;
};
/**
 * エラーのスタックトレースを取得する（存在する場合）
 * @param error エラーオブジェクトまたは任意の値
 * @returns スタックトレース（存在しない場合はundefined）
 */
export declare function getErrorStack(error: unknown): string | undefined;
/**
 * エラーオブジェクトの詳細情報を取得する
 * @param error エラーオブジェクトまたは任意の値
 * @returns エラーの詳細情報
 */
export declare function getErrorDetails(error: unknown): Record<string, any>;
