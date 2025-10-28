import { z } from 'zod';
import type { ValidationResult } from './validation';
import type { ApiError } from '../types/common';
/**
 * Zodスキーマバリデーション統合ヘルパー
 */
export declare class ZodValidator {
    /**
     * Zodスキーマバリデーション実行
     */
    static validate<T>(schema: z.ZodSchema<T>, data: any): ValidationResult;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * Zodスキーマバリデーション実行（安全な型付きパース）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    static safeParse<T>(schema: z.ZodSchema<T>, data: any): {
        success: boolean;
        data?: T;
        errors?: Array<{
            field: string;
            message: string;
        }>;
    };
    /**
     * ZodエラーをAPIエラーに変換
     */
    static toApiError(result: ValidationResult): ApiError;
    /**
     * Zodスキーマエラーを直接APIエラーに変換
     */
    static zodErrorToApiError(error: z.ZodError): ApiError;
}
