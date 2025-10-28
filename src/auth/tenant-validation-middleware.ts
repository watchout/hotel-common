import { StandardResponseBuilder } from '../utils/response-builder';

import type { Request, Response, NextFunction } from 'express';


/**
 * X-Tenant-ID検証ミドルウェア
 * X-Tenant-IDヘッダーがJWTのtenant_idと一致するかチェック
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateTenantIdHeader = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  const headerTenantId = req.headers['x-tenant-id'] as string;
  
  // X-Tenant-IDが送信されている場合のみ検証
  if (headerTenantId && req.user) {
    if (headerTenantId !== req.user.tenant_id) {
      const errorResponse = StandardResponseBuilder.error(
        'TENANT_MISMATCH', 
        'X-Tenant-ID must match JWT tenant_id',
        {
          jwt_tenant_id: req.user.tenant_id,
          header_tenant_id: headerTenantId
        }
      );
      return res.status(errorResponse.status).json(errorResponse.response);
    }
  }
  
  next();
};

/**
 * JWT整合性検証ミドルウェア
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * tenant_id ∈ accessible_tenants を検証
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateJwtIntegrity = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  if (req.user) {
    const accessibleTenants = req.user.accessible_tenants || [req.user.tenant_id];
    if (!accessibleTenants.includes(req.user.tenant_id)) {
      const errorResponse = StandardResponseBuilder.error(
        'INTEGRITY_VIOLATION',
        'Token integrity violation: tenant_id not in accessible_tenants'
      );
      return res.status(errorResponse.status).json(errorResponse.response);
    }
  }
  
  next();
};

