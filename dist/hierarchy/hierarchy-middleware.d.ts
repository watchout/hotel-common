import type { HierarchicalJWTPayload, DataType, OrganizationType, HierarchyLevel } from './types';
import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: HierarchicalJWTPayload;
            hierarchy?: HierarchicalJWTPayload['hierarchy_context'];
            accessibleTenants?: string[];
        }
    }
}
/**
 * Hotel Group階層権限チェックミドルウェア
 */
export declare class HierarchyMiddleware {
    private static logger;
    /**
     * 階層JWT認証ミドルウェア
     */
    static authenticate(): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * データアクセス権限チェック
     */
    static requireDataAccess(dataType: DataType, operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * 組織レベル制限
     */
    static requireOrganizationLevel(minLevel: HierarchyLevel, maxLevel?: HierarchyLevel): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    /**
     * 組織タイプ制限
     */
    static requireOrganizationType(...allowedTypes: OrganizationType[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    /**
     * テナントアクセス権限チェック
     */
    static requireTenantAccess(): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    /**
     * 管理者権限チェック
     */
    static requireAdminRole(): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    /**
     * 複合権限チェック（複数条件を組み合わせ）
     */
    static requireCombinedPermissions(options: {
        dataAccess?: {
            dataType: DataType;
            operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
        };
        organizationLevel?: {
            min?: HierarchyLevel;
            max?: HierarchyLevel;
        };
        organizationType?: OrganizationType[];
        adminRole?: boolean;
        tenantAccess?: boolean;
    }): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
declare module 'express-serve-static-core' {
    interface Request {
        accessPermission?: {
            data_type: DataType;
            operation: string;
            effective_scope?: string;
            effective_level?: string;
            restrictions?: Record<string, any>;
        };
    }
}
