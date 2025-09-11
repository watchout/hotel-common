import { Request, Response, NextFunction } from 'express';
/**
 * X-Tenant-ID検証ミドルウェア
 * X-Tenant-IDヘッダーがJWTのtenant_idと一致するかチェック
 */
export declare const validateTenantIdHeader: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * JWT整合性検証ミドルウェア
 * tenant_id ∈ accessible_tenants を検証
 */
export declare const validateJwtIntegrity: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
