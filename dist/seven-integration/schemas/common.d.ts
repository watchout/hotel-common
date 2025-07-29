import { z } from 'zod';
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_order: "asc" | "desc";
    sort_by?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
}>;
export declare const SearchSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_order: "asc" | "desc";
    search?: string | undefined;
    filter?: Record<string, string> | undefined;
    sort_by?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}, {
    search?: string | undefined;
    filter?: Record<string, string> | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}>;
export declare const BulkOperationSchema: z.ZodObject<{
    operation: z.ZodEnum<["create", "update", "delete"]>;
    items: z.ZodArray<z.ZodAny, "many">;
    options: z.ZodOptional<z.ZodObject<{
        ignore_errors: z.ZodDefault<z.ZodBoolean>;
        chunk_size: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        ignore_errors: boolean;
        chunk_size: number;
    }, {
        ignore_errors?: boolean | undefined;
        chunk_size?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    operation: "delete" | "create" | "update";
    items: any[];
    options?: {
        ignore_errors: boolean;
        chunk_size: number;
    } | undefined;
}, {
    operation: "delete" | "create" | "update";
    items: any[];
    options?: {
        ignore_errors?: boolean | undefined;
        chunk_size?: number | undefined;
    } | undefined;
}>;
export declare const EventNotificationSchema: z.ZodObject<{
    type: z.ZodString;
    source: z.ZodEnum<["hotel-saas", "hotel-member", "hotel-pms"]>;
    target: z.ZodOptional<z.ZodEnum<["hotel-saas", "hotel-member", "hotel-pms"]>>;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    retry_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: string;
    data: Record<string, any>;
    priority: "low" | "high" | "normal" | "urgent";
    source: "hotel-saas" | "hotel-member" | "hotel-pms";
    retry_count: number;
    target?: "hotel-saas" | "hotel-member" | "hotel-pms" | undefined;
}, {
    type: string;
    data: Record<string, any>;
    source: "hotel-saas" | "hotel-member" | "hotel-pms";
    priority?: "low" | "high" | "normal" | "urgent" | undefined;
    target?: "hotel-saas" | "hotel-member" | "hotel-pms" | undefined;
    retry_count?: number | undefined;
}>;
export declare const TenantCreateSchema: z.ZodObject<{
    name: z.ZodString;
    plan: z.ZodDefault<z.ZodEnum<["basic", "standard", "premium"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    plan: "basic" | "standard" | "premium";
}, {
    name: string;
    plan?: "basic" | "standard" | "premium" | undefined;
}>;
export declare const FileUploadSchema: z.ZodObject<{
    file_name: z.ZodString;
    file_size: z.ZodNumber;
    mime_type: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    file_name: string;
    file_size: number;
    mime_type: string;
    description?: string | undefined;
}, {
    file_name: string;
    file_size: number;
    mime_type: string;
    description?: string | undefined;
}>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type SearchParams = z.infer<typeof SearchSchema>;
export type BulkOperationRequest = z.infer<typeof BulkOperationSchema>;
export type EventNotificationRequest = z.infer<typeof EventNotificationSchema>;
export type TenantCreateRequest = z.infer<typeof TenantCreateSchema>;
export type FileUploadRequest = z.infer<typeof FileUploadSchema>;
//# sourceMappingURL=common.d.ts.map