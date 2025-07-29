import { ApiError } from '../types/common'
import { ERROR_CODES } from '../types/api'

export interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'uuid'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
  }>
}

export class HotelValidator {
  /**
   * バリデーション実行
   */
  static validate(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: Array<{ field: string; message: string }> = []

    for (const rule of rules) {
      const value = data[rule.field]
      const fieldErrors = this.validateField(rule.field, value, rule)
      errors.push(...fieldErrors)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 単一フィールドバリデーション
   */
  private static validateField(fieldName: string, value: any, rule: ValidationRule): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = []

    // 必須チェック
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`
      })
      return errors // 必須エラーの場合は他のチェックを行わない
    }

    // 値が存在しない場合は以降のチェックをスキップ
    if (value === undefined || value === null) {
      return errors
    }

    // 型チェック
    if (rule.type) {
      const typeError = this.validateType(fieldName, value, rule.type)
      if (typeError) {
        errors.push(typeError)
      }
    }

    // 長さチェック（文字列・配列）
    if (rule.minLength !== undefined && (typeof value === 'string' || Array.isArray(value))) {
      if (value.length < rule.minLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${rule.minLength} characters/items`
        })
      }
    }

    if (rule.maxLength !== undefined && (typeof value === 'string' || Array.isArray(value))) {
      if (value.length > rule.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${rule.maxLength} characters/items`
        })
      }
    }

    // 数値範囲チェック
    if (rule.min !== undefined && typeof value === 'number') {
      if (value < rule.min) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${rule.min}`
        })
      }
    }

    if (rule.max !== undefined && typeof value === 'number') {
      if (value > rule.max) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${rule.max}`
        })
      }
    }

    // パターンチェック
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} format is invalid`
        })
      }
    }

    // カスタムバリデーション
    if (rule.custom) {
      const customResult = rule.custom(value)
      if (typeof customResult === 'string') {
        errors.push({
          field: fieldName,
          message: customResult
        })
      } else if (customResult === false) {
        errors.push({
          field: fieldName,
          message: `${fieldName} is invalid`
        })
      }
    }

    return errors
  }

  /**
   * 型バリデーション
   */
  private static validateType(fieldName: string, value: any, type: string): { field: string; message: string } | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { field: fieldName, message: `${fieldName} must be a string` }
        }
        break
      
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { field: fieldName, message: `${fieldName} must be a number` }
        }
        break
      
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { field: fieldName, message: `${fieldName} must be a boolean` }
        }
        break
      
      case 'array':
        if (!Array.isArray(value)) {
          return { field: fieldName, message: `${fieldName} must be an array` }
        }
        break
      
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          return { field: fieldName, message: `${fieldName} must be an object` }
        }
        break
      
      case 'date':
        if (!(value instanceof Date) && !this.isValidDateString(value)) {
          return { field: fieldName, message: `${fieldName} must be a valid date` }
        }
        break
      
      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return { field: fieldName, message: `${fieldName} must be a valid email address` }
        }
        break
      
      case 'uuid':
        if (typeof value !== 'string' || !this.isValidUUID(value)) {
          return { field: fieldName, message: `${fieldName} must be a valid UUID` }
        }
        break
    }
    
    return null
  }

  /**
   * 日付文字列バリデーション
   */
  private static isValidDateString(value: any): boolean {
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  /**
   * メールアドレスバリデーション
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * UUIDバリデーション
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * バリデーションエラーをAPIエラーに変換
   */
  static toApiError(result: ValidationResult): ApiError {
    return {
      code: ERROR_CODES.B001, // VALIDATION_ERROR
      message: 'Validation failed',
      details: {
        errors: result.errors
      }
    }
  }
}

// 共通バリデーションルール
export const CommonValidationRules = {
  // テナントID
  tenantId: {
    field: 'tenant_id',
    required: true,
    type: 'uuid' as const
  },

  // ユーザーID
  userId: {
    field: 'user_id',
    required: true,
    type: 'uuid' as const
  },

  // メールアドレス
  email: {
    field: 'email',
    required: true,
    type: 'email' as const,
    maxLength: 255
  },

  // パスワード
  password: {
    field: 'password',
    required: true,
    type: 'string' as const,
    minLength: 8,
    maxLength: 128
  },

  // 名前
  name: {
    field: 'name',
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 100
  },

  // 電話番号
  phone: {
    field: 'phone',
    type: 'string' as const,
    pattern: /^[\d\-\+\(\)\s]+$/
  },

  // 日付
  date: {
    field: 'date',
    required: true,
    type: 'date' as const
  }
} 