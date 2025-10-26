interface StaffListParams {
    tenantId: string;
    page: number;
    pageSize: number;
    search?: string;
    email?: string;
    departmentCode?: string;
    role?: string;
    employmentStatus?: string;
    baseLevel?: number;
    isActive?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    lastLoginAfter?: string;
    lastLoginBefore?: string;
    sortBy: 'displayName' | 'staffCode' | 'departmentCode' | 'baseLevel' | 'lastLoginAt' | 'createdAt' | 'email' | 'role';
    sortOrder: 'asc' | 'desc';
}
export declare class StaffRepository {
    private adapter;
    list(params: StaffListParams): Promise<{
        items: import("../../utils/staff-helpers").StaffSummaryResponse[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
        summary: {
            totalStaff: number;
            activeStaff: number;
            inactiveStaff: number;
            departmentCounts: Record<string, number>;
        };
    }>;
}
export {};
