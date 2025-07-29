declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: string;
                email: string;
                username: string;
                displayName: string;
                adminLevel: 'chainadmin' | 'groupadmin' | 'superadmin';
                accessibleGroupIds: string[];
                accessibleChainIds: string[];
                accessibleTenantIds: string[];
                isActive: boolean;
            };
        }
    }
}
declare const router: import("express-serve-static-core").Router;
export default router;
