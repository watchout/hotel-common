/**
 * Google Playアプリ選択機能の型定義
 */
import { z } from 'zod';
export declare const googlePlayAppCreateSchema: z.ZodObject<{
    packageName: z.ZodString;
    displayName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    deepLinkUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    category: string;
    packageName: string;
    displayName: string;
    description?: string | undefined;
    iconUrl?: string | undefined;
    deepLinkUrl?: string | undefined;
}, {
    category: string;
    packageName: string;
    displayName: string;
    description?: string | undefined;
    iconUrl?: string | undefined;
    deepLinkUrl?: string | undefined;
}>;
export declare const googlePlayAppUpdateSchema: z.ZodObject<{
    packageName: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    iconUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    category: z.ZodOptional<z.ZodString>;
    deepLinkUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    category?: string | undefined;
    packageName?: string | undefined;
    displayName?: string | undefined;
    iconUrl?: string | undefined;
    deepLinkUrl?: string | undefined;
}, {
    description?: string | undefined;
    category?: string | undefined;
    packageName?: string | undefined;
    displayName?: string | undefined;
    iconUrl?: string | undefined;
    deepLinkUrl?: string | undefined;
}>;
export declare const googlePlayAppApproveSchema: z.ZodObject<{
    isApproved: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isApproved: boolean;
}, {
    isApproved: boolean;
}>;
export declare const hotelAppCreateSchema: z.ZodObject<{
    appId: z.ZodString;
    customLabel: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isEnabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    appId: string;
    customLabel?: string | undefined;
    sortOrder?: number | undefined;
    isEnabled?: boolean | undefined;
}, {
    appId: string;
    customLabel?: string | undefined;
    sortOrder?: number | undefined;
    isEnabled?: boolean | undefined;
}>;
export declare const hotelAppUpdateSchema: z.ZodObject<{
    appId: z.ZodOptional<z.ZodString>;
    customLabel: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isEnabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    appId?: string | undefined;
    customLabel?: string | undefined;
    sortOrder?: number | undefined;
    isEnabled?: boolean | undefined;
}, {
    appId?: string | undefined;
    customLabel?: string | undefined;
    sortOrder?: number | undefined;
    isEnabled?: boolean | undefined;
}>;
export declare const layoutAppBlockUpdateSchema: z.ZodObject<{
    appConfig: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    appConfig: Record<string, any>;
}, {
    appConfig: Record<string, any>;
}>;
export interface GooglePlayAppListQuery {
    category?: string;
    approved?: boolean;
    page?: number;
    limit?: number;
}
export interface HotelAppListQuery {
    isEnabled?: boolean;
}
export interface GooglePlayAppCreateInput {
    packageName: string;
    displayName: string;
    description?: string;
    iconUrl?: string;
    category: string;
    deepLinkUrl?: string;
}
export interface GooglePlayAppUpdateInput extends Partial<GooglePlayAppCreateInput> {
    isApproved?: boolean;
    priority?: number;
}
export interface HotelAppCreateInput {
    placeId: number;
    appId: string;
    customLabel?: string;
    sortOrder?: number;
    isEnabled?: boolean;
}
export interface HotelAppUpdateInput extends Partial<Omit<HotelAppCreateInput, 'placeId' | 'appId'>> {
}
export interface LayoutAppBlockUpdateInput {
    layoutId: number;
    blockId: string;
    appConfig: Record<string, any>;
}
