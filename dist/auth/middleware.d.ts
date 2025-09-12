import { Request, Response, NextFunction } from 'express';
export declare const verifyAdminAuth: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const verifyTenantAuth: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authMiddleware: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const adminMiddleware: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const tenantAccessMiddleware: (tenantId: string) => (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const roleMiddleware: (allowedRoles: string[]) => (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const permissionMiddleware: (requiredPermission: string) => (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
