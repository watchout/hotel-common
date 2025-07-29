import { z } from 'zod';
import { ERROR_CODES } from '../types/api';
/**
 * Zodスキーマバリデーション統合ヘルパー
 */
export class ZodValidator {
    /**
     * Zodスキーマバリデーション実行
     */
    static validate(schema, data) {
        try {
            const parsed = schema.parse(data);
            return {
                isValid: true,
                errors: []
            };
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return {
                    isValid: false,
                    errors
                };
            }
            // 予期しないエラー
            return {
                isValid: false,
                errors: [{
                        field: 'unknown',
                        message: 'Validation failed with unexpected error'
                    }]
            };
        }
    }
    /**
     * Zodスキーマバリデーション実行（安全な型付きパース）
     */
    static safeParse(schema, data) {
        const result = schema.safeParse(data);
        if (result.success) {
            return {
                success: true,
                data: result.data
            };
        }
        else {
            const errors = result.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return {
                success: false,
                errors
            };
        }
    }
    /**
     * ZodエラーをAPIエラーに変換
     */
    static toApiError(result) {
        return {
            code: ERROR_CODES.B001, // VALIDATION_ERROR
            message: 'Validation failed',
            details: {
                errors: result.errors
            }
        };
    }
    /**
     * Zodスキーマエラーを直接APIエラーに変換
     */
    static zodErrorToApiError(error) {
        const errors = error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        return {
            code: ERROR_CODES.B001, // VALIDATION_ERROR
            message: 'Validation failed',
            details: { errors }
        };
    }
}
