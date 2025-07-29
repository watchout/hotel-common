"use strict";
// API関連型定義
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = void 0;
// 標準エラーコード
exports.ERROR_CODES = {
    // 認証エラー (E001-E004)
    E001: 'UNAUTHORIZED',
    E002: 'FORBIDDEN',
    E003: 'TOKEN_EXPIRED',
    E004: 'INVALID_TOKEN',
    // ビジネスロジックエラー (B001-B003)
    B001: 'VALIDATION_ERROR',
    B002: 'BUSINESS_RULE_VIOLATION',
    B003: 'RESOURCE_CONFLICT',
    // システムエラー (S001-S002)
    S001: 'INTERNAL_SERVER_ERROR',
    S002: 'SERVICE_UNAVAILABLE'
};
//# sourceMappingURL=api.js.map