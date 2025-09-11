/**
 * 階層型JWT認証ペイロード
 */
export interface HierarchicalJWTPayload {
    user_id: string;
    id?: string;
    email: string;
    name?: string;
    role: 'STAFF' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'OWNER' | 'SYSTEM';
    tenant_id: string;
    hierarchy_context: {
        organization_id: string;
        organization_level: 1 | 2 | 3 | 4;
        organization_type: 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT';
        level?: number;
        path?: string;
        organization_path: string;
        access_scope: string[];
        data_access_policies: Record<string, any>;
    };
    permissions: string[];
    iat: number;
    exp: number;
    jti: string;
    level: number;
    accessible_tenants: string[];
    type?: 'access' | 'refresh';
}
/**
 * JWT設定オプション
 */
export interface JWTOptions {
    secret: string;
    expiresIn: string | number;
}
