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
export function toError(error: unknown): Error {
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
export function getErrorMessage(error: unknown): string {
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
export function createErrorLogOption(error: unknown): { error: Error } {
  return {
    error: toError(error)
  };
}

/**
 * エラーのスタックトレースを取得する（存在する場合）
 * @param error エラーオブジェクトまたは任意の値
 * @returns スタックトレース（存在しない場合はundefined）
 */
export function getErrorStack(error: unknown): string | undefined {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorDetails(error: unknown): Record<string, any> {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (error instanceof Error) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const details: Record<string, any> = {
      message: error.message,
      name: error.name
    };
    
    if (error.stack) {
      details.stack = error.stack;
    }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    
    // カスタムプロパティの追加
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const key in error) {
      if (key !== 'message' && key !== 'name' && key !== 'stack') {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        details[key] = (error as any)[key];
      }
    }
    
    return details;
  }
  
  return { message: String(error) };
}

