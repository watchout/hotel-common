import { Tenant, customers, Reservation } from '../generated/prisma';
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
    }): Promise<{
        name: string;
        id: string;
        tenant_id: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        preferences: import("../generated/prisma/runtime/library").JsonValue;
        birth_date: Date | null;
        member_id: string | null;
        rank_id: string | null;
        total_points: number;
        total_stays: number;
        pms_updatable_fields: string[];
        origin_system: string;
        synced_at: Date;
        updated_by_system: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[]>;
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
    }): Promise<{
        id: string;
        status: string;
        tenant_id: string;
        guest_name: string;
        special_requests: string | null;
        origin: string;
        created_at: Date;
        updated_at: Date;
        customer_id: string | null;
        room_id: string;
        check_in_date: Date;
        check_out_date: Date;
        guest_count: number;
        total_amount: import("../generated/prisma/runtime/library").Decimal | null;
        paid_amount: import("../generated/prisma/runtime/library").Decimal | null;
        internal_notes: string | null;
        checked_in_at: Date | null;
        checked_out_at: Date | null;
        cancelled_at: Date | null;
    }[]>;
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
