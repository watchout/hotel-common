"use strict";
/**
 * エラーヘルパー関数
 *
 * エラーオブジェクトの処理を統一するためのユーティリティ関数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toError = toError;
exports.getErrorMessage = getErrorMessage;
exports.createErrorLogOption = createErrorLogOption;
exports.getErrorStack = getErrorStack;
exports.getErrorDetails = getErrorDetails;
/**
 * 任意の値をErrorオブジェクトに変換する
 * @param error 変換する値
 * @returns Errorオブジェクト
 */
function toError(error) {
    if (error instanceof Error) {
        return error;
    }
    return new Error(String(error));
}
/**
 * エラーからメッセージを抽出する
 * @param error エラーオブジェクトまたは任意の値
 * @returns エラーメッセージ
 */
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
/**
 * ロガー用のエラーオプションオブジェクトを作成する
 * @param error エラーオブジェクトまたは任意の値
 * @returns ロガーオプションオブジェクト
 */
function createErrorLogOption(error) {
    return {
        error: toError(error)
    };
}
/**
 * エラーのスタックトレースを取得する（存在する場合）
 * @param error エラーオブジェクトまたは任意の値
 * @returns スタックトレース（存在しない場合はundefined）
 */
function getErrorStack(error) {
    if (error instanceof Error) {
        return error.stack;
    }
    return undefined;
}
/**
 * エラーオブジェクトの詳細情報を取得する
 * @param error エラーオブジェクトまたは任意の値
 * @returns エラーの詳細情報
 */
function getErrorDetails(error) {
    if (error instanceof Error) {
        const details = {
            message: error.message,
            name: error.name
        };
        if (error.stack) {
            details.stack = error.stack;
        }
        // カスタムプロパティの追加
        for (const key in error) {
            if (key !== 'message' && key !== 'name' && key !== 'stack') {
                details[key] = error[key];
            }
        }
        return details;
    }
    return { message: String(error) };
}
