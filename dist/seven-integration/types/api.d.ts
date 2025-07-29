export declare const ERROR_CODES: {
    readonly E001: "UNAUTHORIZED";
    readonly E002: "FORBIDDEN";
    readonly E003: "TOKEN_EXPIRED";
    readonly E004: "INVALID_TOKEN";
    readonly B001: "VALIDATION_ERROR";
    readonly B002: "BUSINESS_RULE_VIOLATION";
    readonly B003: "RESOURCE_CONFLICT";
    readonly S001: "INTERNAL_SERVER_ERROR";
    readonly S002: "SERVICE_UNAVAILABLE";
};
export type ErrorCode = keyof typeof ERROR_CODES;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    apiKey?: string;
    tenantId?: string;
    defaultHeaders?: Record<string, string>;
}
export interface RequestConfig {
    url: string;
    method: HttpMethod;
    data?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    timeout?: number;
}
export interface ReservationResponse {
    id: string;
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    room_type: string;
    room_number?: string;
    check_in: Date;
    check_out: Date;
    adults: number;
    children?: number;
    special_requests?: string;
    status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
    origin: string;
    origin_reference?: string;
    total_amount?: number;
    created_at: Date;
    updated_at: Date;
}
export interface CustomerResponse {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    birthday?: Date;
    gender?: 'male' | 'female' | 'other';
    member_rank?: 'bronze' | 'silver' | 'gold' | 'platinum';
    points?: number;
    preferences?: Record<string, any>;
    last_stay?: Date;
    total_stays: number;
    created_at: Date;
    updated_at: Date;
}
export interface RoomAvailabilityResponse {
    room_type: string;
    available_count: number;
    base_price: number;
    total_rooms: number;
}
export interface BulkOperationResponse {
    success_count: number;
    error_count: number;
    errors?: Array<{
        index: number;
        error: string;
    }>;
}
//# sourceMappingURL=api.d.ts.map