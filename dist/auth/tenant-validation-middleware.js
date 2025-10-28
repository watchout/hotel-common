"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJwtIntegrity = exports.validateTenantIdHeader = void 0;
const response_builder_1 = require("../utils/response-builder");
/**
 * X-Tenant-ID検証ミドルウェア
 * X-Tenant-IDヘッダーがJWTのtenant_idと一致するかチェック
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateTenantIdHeader = (req, res, next) => {
    const headerTenantId = req.headers['x-tenant-id'];
    // X-Tenant-IDが送信されている場合のみ検証
    if (headerTenantId && req.user) {
        if (headerTenantId !== req.user.tenant_id) {
            const errorResponse = response_builder_1.StandardResponseBuilder.error('TENANT_MISMATCH', 'X-Tenant-ID must match JWT tenant_id', {
                jwt_tenant_id: req.user.tenant_id,
                header_tenant_id: headerTenantId
            });
            return res.status(errorResponse.status).json(errorResponse.response);
        }
    }
    next();
};
exports.validateTenantIdHeader = validateTenantIdHeader;
/**
 * JWT整合性検証ミドルウェア
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * tenant_id ∈ accessible_tenants を検証
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateJwtIntegrity = (req, res, next) => {
    if (req.user) {
        const accessibleTenants = req.user.accessible_tenants || [req.user.tenant_id];
        if (!accessibleTenants.includes(req.user.tenant_id)) {
            const errorResponse = response_builder_1.StandardResponseBuilder.error('INTEGRITY_VIOLATION', 'Token integrity violation: tenant_id not in accessible_tenants');
            return res.status(errorResponse.status).json(errorResponse.response);
        }
    }
    next();
};
exports.validateJwtIntegrity = validateJwtIntegrity;
