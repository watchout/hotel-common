import { z } from 'zod';
/**
 * 客室ランク管理スキーマ
 * SaaS管理画面での客室グレード設定用
 */
export declare const RoomGradeSchema: z.ZodObject<{
    id: z.ZodString;
    tenant_id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
    code: string;
    description?: string | undefined;
}, {
    name: string;
    id: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
    code: string;
    description?: string | undefined;
}>;
export declare const CreateRoomGradeRequestSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    tenant_id: string;
    description?: string | undefined;
}, {
    name: string;
    tenant_id: string;
    description?: string | undefined;
}>;
export declare const UpdateRoomGradeRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
}>;
export type RoomGrade = z.infer<typeof RoomGradeSchema>;
export type CreateRoomGradeRequest = z.infer<typeof CreateRoomGradeRequestSchema>;
export type UpdateRoomGradeRequest = z.infer<typeof UpdateRoomGradeRequestSchema>;
