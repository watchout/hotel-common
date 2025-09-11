import { Tenant } from '@prisma/client';
interface customers {
    id: string;
    tenant_id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    member_id?: string;
    origin_system: string;
    updated_by_system: string;
    updated_at: Date;
    pms_updatable_fields?: string[];
    [key: string]: any;
}
interface Reservation {
    id: string;
    tenant_id: string;
    customer_id?: string;
    guest_name: string;
    guest_phone?: string;
    guest_email?: string;
    checkin_date: Date;
    checkout_date: Date;
    room_type: string;
    total_amount: number;
    origin: string;
    origin_system: string;
    updated_by_system: string;
    status: string;
    confirmation_code: string;
    [key: string]: any;
}
export interface UnifiedApiClientConfig {
    tenantId: string;
    userId?: string;
    source: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common';
}
export declare class HotelUnifiedApiClient {
    private logger;
    private config;
    private db;
    constructor(config: UnifiedApiClientConfig);
    getTenant(): Promise<Tenant | null>;
    getCustomers(filters?: {
        search?: string;
        memberOnly?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<any>;
    createCustomer(data: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
        member_id?: string;
    }): Promise<customers | null>;
    updateCustomer(customerId: string, data: Partial<customers>, restrictUpdatableFields?: boolean): Promise<customers | null>;
    getReservations(filters?: {
        status?: string[];
        dateFrom?: Date;
        dateTo?: Date;
        customerId?: string;
        limit?: number;
        offset?: number;
    }): Promise<any>;
    createReservation(data: {
        customer_id?: string;
        guest_name: string;
        guest_phone?: string;
        guest_email?: string;
        checkin_date: Date;
        checkout_date: Date;
        room_type: string;
        total_amount: number;
        origin: string;
        special_requests?: string;
    }): Promise<Reservation | null>;
    private logSystemEvent;
    private updateSystemAccess;
    private getEventType;
    private generateConfirmationCode;
}
export declare function createUnifiedClient(config: UnifiedApiClientConfig): HotelUnifiedApiClient;
export {};
