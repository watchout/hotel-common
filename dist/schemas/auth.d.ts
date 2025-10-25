import { z } from 'zod';
export declare const AuthRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    tenant_id: z.ZodOptional<z.ZodString>;
    device_info: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    tenant_id?: string | undefined;
    device_info?: string | undefined;
}, {
    email: string;
    password: string;
    tenant_id?: string | undefined;
    device_info?: string | undefined;
}>;
export declare const UserCreateSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["admin", "manager", "staff", "readonly"]>;
    level: z.ZodNumber;
    tenant_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "admin" | "staff" | "manager" | "readonly";
    name: string;
    level: number;
    tenant_id: string;
    email: string;
    password: string;
}, {
    role: "admin" | "staff" | "manager" | "readonly";
    name: string;
    level: number;
    tenant_id: string;
    email: string;
    password: string;
}>;
export declare const UserUpdateSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "manager", "staff", "readonly"]>>;
    level: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    role?: "admin" | "staff" | "manager" | "readonly" | undefined;
    name?: string | undefined;
    level?: number | undefined;
    status?: "inactive" | "active" | "suspended" | undefined;
    email?: string | undefined;
}, {
    id: string;
    role?: "admin" | "staff" | "manager" | "readonly" | undefined;
    name?: string | undefined;
    level?: number | undefined;
    status?: "inactive" | "active" | "suspended" | undefined;
    email?: string | undefined;
}>;
export declare const PasswordChangeSchema: z.ZodEffects<z.ZodObject<{
    current_password: z.ZodString;
    new_password: z.ZodString;
    confirm_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    current_password: string;
    new_password: string;
    confirm_password: string;
}, {
    current_password: string;
    new_password: string;
    confirm_password: string;
}>, {
    current_password: string;
    new_password: string;
    confirm_password: string;
}, {
    current_password: string;
    new_password: string;
    confirm_password: string;
}>;
export declare const TokenRefreshSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refresh_token: string;
}, {
    refresh_token: string;
}>;
export type AuthRequest = z.infer<typeof AuthRequestSchema>;
export type UserCreateRequest = z.infer<typeof UserCreateSchema>;
export type UserUpdateRequest = z.infer<typeof UserUpdateSchema>;
export type PasswordChangeRequest = z.infer<typeof PasswordChangeSchema>;
export type TokenRefreshRequest = z.infer<typeof TokenRefreshSchema>;
