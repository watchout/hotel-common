export interface JwtPayload {
    user_id: string;
    tenant_id: string;
    email: string;
    role: 'admin' | 'manager' | 'staff' | 'readonly';
    level: 1 | 2 | 3 | 4 | 5;
    permissions: string[];
    iat: number;
    exp: number;
    jti: string;
}
export interface RefreshToken {
    id: string;
    user_id: string;
    tenant_id: string;
    token_hash: string;
    expires_at: Date;
    created_at: Date;
    last_used?: Date;
    device_info?: string;
}
export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'Bearer';
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        level: number;
        tenant_id: string;
    };
}
export interface SessionInfo {
    session_id: string;
    user_id: string;
    tenant_id: string;
    access_token: string;
    refresh_token: string;
    expires_at: Date;
    created_at: Date;
    last_activity: Date;
    ip_address: string;
    user_agent: string;
}
export interface PermissionCheck {
    allowed: boolean;
    reason?: string;
    missing_permissions?: string[];
}
export interface AuthHeaders {
    authorization: string;
    'x-tenant-id'?: string;
    'x-api-key'?: string;
}
