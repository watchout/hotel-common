"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodValidator = void 0;
const zod_1 = require("zod");
const api_1 = require("../types/api");
/**
 * Zodスキーマバリデーション統合ヘルパー
 */
class ZodValidator {
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
            if (error instanceof zod_1.z.ZodError) {
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
            code: api_1.ERROR_CODES.B001, // VALIDATION_ERROR
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
            code: api_1.ERROR_CODES.B001, // VALIDATION_ERROR
            message: 'Validation failed',
            details: { errors }
        };
    }
}
exports.ZodValidator = ZodValidator;
