import { z } from 'zod';
export declare const CustomerCreateSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    birthday: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone?: string | undefined;
    address?: string | undefined;
    birthday?: string | undefined;
    gender?: "other" | "male" | "female" | undefined;
    preferences?: Record<string, any> | undefined;
}, {
    name: string;
    email: string;
    phone?: string | undefined;
    address?: string | undefined;
    birthday?: string | undefined;
    gender?: "other" | "male" | "female" | undefined;
    preferences?: Record<string, any> | undefined;
}>;
export declare const CustomerUpdateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    birthday: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    birthday?: string | undefined;
    gender?: "other" | "male" | "female" | undefined;
    preferences?: Record<string, any> | undefined;
}, {
    id: string;
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    birthday?: string | undefined;
    gender?: "other" | "male" | "female" | undefined;
    preferences?: Record<string, any> | undefined;
}>;
export declare const CustomerSearchSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    member_rank: z.ZodOptional<z.ZodEnum<["bronze", "silver", "gold", "platinum"]>>;
    last_stay_from: z.ZodOptional<z.ZodString>;
    last_stay_to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    member_rank?: "bronze" | "silver" | "gold" | "platinum" | undefined;
    last_stay_from?: string | undefined;
    last_stay_to?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    member_rank?: "bronze" | "silver" | "gold" | "platinum" | undefined;
    last_stay_from?: string | undefined;
    last_stay_to?: string | undefined;
}>;
export type CustomerCreateRequest = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdateRequest = z.infer<typeof CustomerUpdateSchema>;
export type CustomerSearchRequest = z.infer<typeof CustomerSearchSchema>;
