export type SystemType = 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common';
export interface TenantInfo {
    id: string;
    name: string;
    plan: 'basic' | 'standard' | 'premium';
    status: 'active' | 'suspended' | 'inactive';
    created_at: Date;
    updated_at: Date;
}
export interface UserInfo {
    id: string;
    tenant_id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'staff' | 'readonly';
    level: 1 | 2 | 3 | 4 | 5;
    status: 'active' | 'inactive' | 'suspended';
    created_at: Date;
    updated_at: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
    meta?: Record<string, any>;
    timestamp: Date;
    request_id: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
export interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}
export interface BaseEntity {
    id: string;
    tenant_id: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
export interface SystemEvent {
    id: string;
    type: string;
    source: SystemType;
    target?: SystemType;
    tenant_id: string;
    user_id?: string;
    data: Record<string, any>;
    timestamp: Date;
}
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: Date;
    request_id?: string;
}
