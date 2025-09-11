"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonValidationRules = exports.HotelValidator = void 0;
const api_1 = require("../types/api");
class HotelValidator {
    /**
     * バリデーション実行
     */
    static validate(data, rules) {
        const errors = [];
        for (const rule of rules) {
            const value = data[rule.field];
            const fieldErrors = this.validateField(rule.field, value, rule);
            errors.push(...fieldErrors);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * 単一フィールドバリデーション
     */
    static validateField(fieldName, value, rule) {
        const errors = [];
        // 必須チェック
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`
            });
            return errors; // 必須エラーの場合は他のチェックを行わない
        }
        // 値が存在しない場合は以降のチェックをスキップ
        if (value === undefined || value === null) {
            return errors;
        }
        // 型チェック
        if (rule.type) {
            const typeError = this.validateType(fieldName, value, rule.type);
            if (typeError) {
                errors.push(typeError);
            }
        }
        // 長さチェック（文字列・配列）
        if (rule.minLength !== undefined && (typeof value === 'string' || Array.isArray(value))) {
            if (value.length < rule.minLength) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} must be at least ${rule.minLength} characters/items`
                });
            }
        }
        if (rule.maxLength !== undefined && (typeof value === 'string' || Array.isArray(value))) {
            if (value.length > rule.maxLength) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} must be at most ${rule.maxLength} characters/items`
                });
            }
        }
        // 数値範囲チェック
        if (rule.min !== undefined && typeof value === 'number') {
            if (value < rule.min) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} must be at least ${rule.min}`
                });
            }
        }
        if (rule.max !== undefined && typeof value === 'number') {
            if (value > rule.max) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} must be at most ${rule.max}`
                });
            }
        }
        // パターンチェック
        if (rule.pattern && typeof value === 'string') {
            if (!rule.pattern.test(value)) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} format is invalid`
                });
            }
        }
        // カスタムバリデーション
        if (rule.custom) {
            const customResult = rule.custom(value);
            if (typeof customResult === 'string') {
                errors.push({
                    field: fieldName,
                    message: customResult
                });
            }
            else if (customResult === false) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} is invalid`
                });
            }
        }
        return errors;
    }
    /**
     * 型バリデーション
     */
    static validateType(fieldName, value, type) {
        switch (type) {
            case 'string':
                if (typeof value !== 'string') {
                    return { field: fieldName, message: `${fieldName} must be a string` };
                }
                break;
            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    return { field: fieldName, message: `${fieldName} must be a number` };
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    return { field: fieldName, message: `${fieldName} must be a boolean` };
                }
                break;
            case 'array':
                if (!Array.isArray(value)) {
                    return { field: fieldName, message: `${fieldName} must be an array` };
                }
                break;
            case 'object':
                if (typeof value !== 'object' || Array.isArray(value)) {
                    return { field: fieldName, message: `${fieldName} must be an object` };
                }
                break;
            case 'date':
                if (!(value instanceof Date) && !this.isValidDateString(value)) {
                    return { field: fieldName, message: `${fieldName} must be a valid date` };
                }
                break;
            case 'email':
                if (typeof value !== 'string' || !this.isValidEmail(value)) {
                    return { field: fieldName, message: `${fieldName} must be a valid email address` };
                }
                break;
            case 'uuid':
                if (typeof value !== 'string' || !this.isValidUUID(value)) {
                    return { field: fieldName, message: `${fieldName} must be a valid UUID` };
                }
                break;
        }
        return null;
    }
    /**
     * 日付文字列バリデーション
     */
    static isValidDateString(value) {
        if (typeof value !== 'string')
            return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
    }
    /**
     * メールアドレスバリデーション
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * UUIDバリデーション
     */
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    /**
     * バリデーションエラーをAPIエラーに変換
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
}
exports.HotelValidator = HotelValidator;
// 共通バリデーションルール
exports.CommonValidationRules = {
    // テナントID
    tenantId: {
        field: 'tenant_id',
        required: true,
        type: 'uuid'
    },
    // ユーザーID
    userId: {
        field: 'user_id',
        required: true,
        type: 'uuid'
    },
    // メールアドレス
    email: {
        field: 'email',
        required: true,
        type: 'email',
        maxLength: 255
    },
    // パスワード
    password: {
        field: 'password',
        required: true,
        type: 'string',
        minLength: 8,
        maxLength: 128
    },
    // 名前
    name: {
        field: 'name',
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 100
    },
    // 電話番号
    phone: {
        field: 'phone',
        type: 'string',
        pattern: /^[\d\-\+\(\)\s]+$/
    },
    // 日付
    date: {
        field: 'date',
        required: true,
        type: 'date'
    }
};
