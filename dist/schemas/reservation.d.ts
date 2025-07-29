import { z } from 'zod';
export declare const ReservationCreateSchema: z.ZodEffects<z.ZodObject<{
    guest_name: z.ZodString;
    guest_email: z.ZodString;
    guest_phone: z.ZodOptional<z.ZodString>;
    room_type: z.ZodString;
    check_in: z.ZodString;
    check_out: z.ZodString;
    adults: z.ZodNumber;
    children: z.ZodOptional<z.ZodNumber>;
    special_requests: z.ZodOptional<z.ZodString>;
    origin: z.ZodEnum<["hotel-member", "hotel-pms", "ota", "phone", "walk-in"]>;
    origin_reference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    guest_name: string;
    guest_email: string;
    room_type: string;
    check_in: string;
    check_out: string;
    adults: number;
    origin: "hotel-member" | "hotel-pms" | "phone" | "ota" | "walk-in";
    guest_phone?: string | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
    origin_reference?: string | undefined;
}, {
    guest_name: string;
    guest_email: string;
    room_type: string;
    check_in: string;
    check_out: string;
    adults: number;
    origin: "hotel-member" | "hotel-pms" | "phone" | "ota" | "walk-in";
    guest_phone?: string | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
    origin_reference?: string | undefined;
}>, {
    guest_name: string;
    guest_email: string;
    room_type: string;
    check_in: string;
    check_out: string;
    adults: number;
    origin: "hotel-member" | "hotel-pms" | "phone" | "ota" | "walk-in";
    guest_phone?: string | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
    origin_reference?: string | undefined;
}, {
    guest_name: string;
    guest_email: string;
    room_type: string;
    check_in: string;
    check_out: string;
    adults: number;
    origin: "hotel-member" | "hotel-pms" | "phone" | "ota" | "walk-in";
    guest_phone?: string | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
    origin_reference?: string | undefined;
}>;
export declare const ReservationUpdateSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    guest_name: z.ZodOptional<z.ZodString>;
    guest_email: z.ZodOptional<z.ZodString>;
    guest_phone: z.ZodOptional<z.ZodString>;
    room_type: z.ZodOptional<z.ZodString>;
    check_in: z.ZodOptional<z.ZodString>;
    check_out: z.ZodOptional<z.ZodString>;
    adults: z.ZodOptional<z.ZodNumber>;
    children: z.ZodOptional<z.ZodNumber>;
    special_requests: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["confirmed", "checked_in", "checked_out", "cancelled", "no_show"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status?: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show" | undefined;
    guest_name?: string | undefined;
    guest_email?: string | undefined;
    guest_phone?: string | undefined;
    room_type?: string | undefined;
    check_in?: string | undefined;
    check_out?: string | undefined;
    adults?: number | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
}, {
    id: string;
    status?: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show" | undefined;
    guest_name?: string | undefined;
    guest_email?: string | undefined;
    guest_phone?: string | undefined;
    room_type?: string | undefined;
    check_in?: string | undefined;
    check_out?: string | undefined;
    adults?: number | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
}>, {
    id: string;
    status?: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show" | undefined;
    guest_name?: string | undefined;
    guest_email?: string | undefined;
    guest_phone?: string | undefined;
    room_type?: string | undefined;
    check_in?: string | undefined;
    check_out?: string | undefined;
    adults?: number | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
}, {
    id: string;
    status?: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show" | undefined;
    guest_name?: string | undefined;
    guest_email?: string | undefined;
    guest_phone?: string | undefined;
    room_type?: string | undefined;
    check_in?: string | undefined;
    check_out?: string | undefined;
    adults?: number | undefined;
    children?: number | undefined;
    special_requests?: string | undefined;
}>;
export declare const RoomAvailabilitySchema: z.ZodEffects<z.ZodObject<{
    check_in: z.ZodString;
    check_out: z.ZodString;
    room_type: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    check_in: string;
    check_out: string;
    room_type?: string | undefined;
}, {
    check_in: string;
    check_out: string;
    room_type?: string | undefined;
}>, {
    check_in: string;
    check_out: string;
    room_type?: string | undefined;
}, {
    check_in: string;
    check_out: string;
    room_type?: string | undefined;
}>;
export type ReservationCreateRequest = z.infer<typeof ReservationCreateSchema>;
export type ReservationUpdateRequest = z.infer<typeof ReservationUpdateSchema>;
export type RoomAvailabilityRequest = z.infer<typeof RoomAvailabilitySchema>;
