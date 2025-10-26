import type { ApiError } from '../types/common';
export interface ValidationRule {
    field: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'uuid';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: Array<{
        field: string;
        message: string;
    }>;
}
export declare class HotelValidator {
    /**
     * バリデーション実行
     */
    static validate(data: any, rules: ValidationRule[]): ValidationResult;
    /**
     * 単一フィールドバリデーション
     */
    private static validateField;
    /**
     * 型バリデーション
     */
    private static validateType;
    /**
     * 日付文字列バリデーション
     */
    private static isValidDateString;
    /**
     * メールアドレスバリデーション
     */
    private static isValidEmail;
    /**
     * UUIDバリデーション
     */
    private static isValidUUID;
    /**
     * バリデーションエラーをAPIエラーに変換
     */
    static toApiError(result: ValidationResult): ApiError;
}
export declare const CommonValidationRules: {
    tenantId: {
        field: string;
        required: boolean;
        type: "uuid";
    };
    userId: {
        field: string;
        required: boolean;
        type: "uuid";
    };
    email: {
        field: string;
        required: boolean;
        type: "email";
        maxLength: number;
    };
    password: {
        field: string;
        required: boolean;
        type: "string";
        minLength: number;
        maxLength: number;
    };
    name: {
        field: string;
        required: boolean;
        type: "string";
        minLength: number;
        maxLength: number;
    };
    phone: {
        field: string;
        type: "string";
        pattern: RegExp;
    };
    date: {
        field: string;
        required: boolean;
        type: "date";
    };
};
