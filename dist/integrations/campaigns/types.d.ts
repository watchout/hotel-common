import { z } from 'zod';
export type CampaignType = 'DISCOUNT' | 'PROMOTION' | 'WELCOME';
export type CampaignDisplayType = 'BANNER' | 'POPUP' | 'INLINE' | 'WELCOME_SCREEN';
export type CampaignCtaType = 'BUTTON' | 'LINK' | 'NONE';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export interface CampaignBasicInfo {
    id: string;
    code: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    status: CampaignStatus;
    displayType: CampaignDisplayType;
    createdAt: Date;
    updatedAt: Date;
}
export interface CampaignDetailInfo extends CampaignBasicInfo {
    displayPriority: number;
    ctaType: CampaignCtaType;
    ctaText: string | null;
    ctaUrl: string | null;
    discountType: 'PERCENTAGE' | 'FIXED' | null;
    discountValue: number | null;
    minOrderAmount: number | null;
    maxUsageCount: number | null;
    perUserLimit: number | null;
    timeRestrictions: any | null;
    dayRestrictions: any | null;
    welcomeSettings: any | null;
    translations: CampaignTranslationInfo[];
    items: CampaignItemInfo[];
    categories: CampaignCategoryInfo[];
}
export interface CampaignWelcomeSettings {
    enabled: boolean;
    imageUrl?: string | null;
    videoUrl?: string | null;
    buttonText?: string;
    showOnce?: boolean;
}
export interface CampaignTimeRestrictions {
    enabled: boolean;
    startTime: string;
    endTime: string;
}
export interface CampaignDayRestrictions {
    enabled: boolean;
    days: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
}
export interface CampaignCategoryInfo {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CampaignTranslationInfo {
    id: string;
    languageCode: string;
    name: string;
    description: string | null;
    ctaText: string | null;
}
export interface CampaignItemInfo {
    id: string;
    productId: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
}
export interface CampaignUsageLogInfo {
    id: string;
    campaignId: string;
    userId: string | null;
    orderId: string | null;
    usedAt: Date;
}
export interface WelcomeScreenConfig {
    enabled: boolean;
    title: string;
    message: string;
    imageUrl: string | null;
    videoUrl: string | null;
    buttonText: string;
    showOnce: boolean;
}
export interface DeviceInfo {
    deviceId: string;
    deviceType: 'TABLET' | 'SMARTPHONE' | 'TV' | 'OTHER';
    osType?: string;
    osVersion?: string;
    appVersion?: string;
}
export interface CampaignsQueryParams {
    page?: number;
    limit?: number;
    status?: CampaignStatus;
    type?: CampaignType;
    displayType?: CampaignDisplayType;
    search?: string;
}
export interface CampaignCreateInput {
    code: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    status: CampaignStatus;
    displayType: CampaignDisplayType;
    displayPriority: number;
    ctaType: CampaignCtaType;
    ctaText: string | null;
    ctaUrl: string | null;
    discountType: 'PERCENTAGE' | 'FIXED' | null;
    discountValue: number | null;
    minOrderAmount: number | null;
    maxUsageCount: number | null;
    perUserLimit: number | null;
    timeRestrictions: CampaignTimeRestrictions | null;
    dayRestrictions: CampaignDayRestrictions | null;
    welcomeSettings: CampaignWelcomeSettings | null;
    translations: {
        languageCode: string;
        name: string;
        description: string | null;
        ctaText: string | null;
    }[];
    items: {
        productId: string;
        discountType: 'PERCENTAGE' | 'FIXED';
        discountValue: number;
    }[];
    categories: string[];
}
export interface CampaignUpdateInput {
    name?: string;
    description?: string | null;
    startDate?: Date;
    endDate?: Date;
    status?: CampaignStatus;
    displayType?: CampaignDisplayType;
    displayPriority?: number;
    ctaType?: CampaignCtaType;
    ctaText?: string | null;
    ctaUrl?: string | null;
    discountType?: 'PERCENTAGE' | 'FIXED' | null;
    discountValue?: number | null;
    minOrderAmount?: number | null;
    maxUsageCount?: number | null;
    perUserLimit?: number | null;
    timeRestrictions?: CampaignTimeRestrictions | null;
    dayRestrictions?: CampaignDayRestrictions | null;
    welcomeSettings?: CampaignWelcomeSettings | null;
    translations?: {
        languageCode: string;
        name: string;
        description: string | null;
        ctaText: string | null;
    }[];
    items?: {
        productId: string;
        discountType: 'PERCENTAGE' | 'FIXED';
        discountValue: number;
    }[];
    categories?: string[];
}
export declare const campaignCreateSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    status: z.ZodEnum<["DRAFT", "ACTIVE", "INACTIVE", "EXPIRED"]>;
    displayType: z.ZodEnum<["BANNER", "POPUP", "INLINE", "WELCOME_SCREEN"]>;
    displayPriority: z.ZodNumber;
    ctaType: z.ZodEnum<["BUTTON", "LINK", "NONE"]>;
    ctaText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ctaUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    discountType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["PERCENTAGE", "FIXED"]>>>;
    discountValue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    minOrderAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxUsageCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perUserLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    timeRestrictions: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        enabled: z.ZodBoolean;
        startTime: z.ZodString;
        endTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        startTime: string;
        endTime: string;
    }, {
        enabled: boolean;
        startTime: string;
        endTime: string;
    }>>>;
    dayRestrictions: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        enabled: z.ZodBoolean;
        days: z.ZodObject<{
            monday: z.ZodBoolean;
            tuesday: z.ZodBoolean;
            wednesday: z.ZodBoolean;
            thursday: z.ZodBoolean;
            friday: z.ZodBoolean;
            saturday: z.ZodBoolean;
            sunday: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        }, {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    }, {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    }>>>;
    welcomeSettings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        enabled: z.ZodBoolean;
        imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        videoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        buttonText: z.ZodOptional<z.ZodString>;
        showOnce: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    }, {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    }>>>;
    translations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        languageCode: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ctaText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }, {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }>, "many">>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        discountType: z.ZodEnum<["PERCENTAGE", "FIXED"]>;
        discountValue: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }, {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }>, "many">>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    status: "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED";
    code: string;
    startDate: Date;
    endDate: Date;
    displayType: "BANNER" | "POPUP" | "INLINE" | "WELCOME_SCREEN";
    displayPriority: number;
    ctaType: "LINK" | "NONE" | "BUTTON";
    description?: string | null | undefined;
    items?: {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }[] | undefined;
    ctaText?: string | null | undefined;
    ctaUrl?: string | null | undefined;
    discountType?: "PERCENTAGE" | "FIXED" | null | undefined;
    discountValue?: number | null | undefined;
    minOrderAmount?: number | null | undefined;
    maxUsageCount?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    timeRestrictions?: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    } | null | undefined;
    dayRestrictions?: {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    } | null | undefined;
    welcomeSettings?: {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    } | null | undefined;
    translations?: {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }[] | undefined;
    categories?: string[] | undefined;
}, {
    name: string;
    status: "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED";
    code: string;
    startDate: Date;
    endDate: Date;
    displayType: "BANNER" | "POPUP" | "INLINE" | "WELCOME_SCREEN";
    displayPriority: number;
    ctaType: "LINK" | "NONE" | "BUTTON";
    description?: string | null | undefined;
    items?: {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }[] | undefined;
    ctaText?: string | null | undefined;
    ctaUrl?: string | null | undefined;
    discountType?: "PERCENTAGE" | "FIXED" | null | undefined;
    discountValue?: number | null | undefined;
    minOrderAmount?: number | null | undefined;
    maxUsageCount?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    timeRestrictions?: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    } | null | undefined;
    dayRestrictions?: {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    } | null | undefined;
    welcomeSettings?: {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    } | null | undefined;
    translations?: {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }[] | undefined;
    categories?: string[] | undefined;
}>;
export declare const campaignUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "INACTIVE", "EXPIRED"]>>;
    displayType: z.ZodOptional<z.ZodEnum<["BANNER", "POPUP", "INLINE", "WELCOME_SCREEN"]>>;
    displayPriority: z.ZodOptional<z.ZodNumber>;
    ctaType: z.ZodOptional<z.ZodEnum<["BUTTON", "LINK", "NONE"]>>;
    ctaText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ctaUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    discountType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["PERCENTAGE", "FIXED"]>>>;
    discountValue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    minOrderAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxUsageCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perUserLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    timeRestrictions: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        enabled: z.ZodBoolean;
        startTime: z.ZodString;
        endTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        startTime: string;
        endTime: string;
    }, {
        enabled: boolean;
        startTime: string;
        endTime: string;
    }>>>;
    dayRestrictions: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        enabled: z.ZodBoolean;
        days: z.ZodObject<{
            monday: z.ZodBoolean;
            tuesday: z.ZodBoolean;
            wednesday: z.ZodBoolean;
            thursday: z.ZodBoolean;
            friday: z.ZodBoolean;
            saturday: z.ZodBoolean;
            sunday: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        }, {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    }, {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    }>>>;
    welcomeSettings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        enabled: z.ZodBoolean;
        imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        videoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        buttonText: z.ZodOptional<z.ZodString>;
        showOnce: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    }, {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    }>>>;
    translations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        languageCode: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ctaText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }, {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }>, "many">>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        discountType: z.ZodEnum<["PERCENTAGE", "FIXED"]>;
        discountValue: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }, {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }>, "many">>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
    status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED" | undefined;
    items?: {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    displayType?: "BANNER" | "POPUP" | "INLINE" | "WELCOME_SCREEN" | undefined;
    displayPriority?: number | undefined;
    ctaType?: "LINK" | "NONE" | "BUTTON" | undefined;
    ctaText?: string | null | undefined;
    ctaUrl?: string | null | undefined;
    discountType?: "PERCENTAGE" | "FIXED" | null | undefined;
    discountValue?: number | null | undefined;
    minOrderAmount?: number | null | undefined;
    maxUsageCount?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    timeRestrictions?: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    } | null | undefined;
    dayRestrictions?: {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    } | null | undefined;
    welcomeSettings?: {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    } | null | undefined;
    translations?: {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }[] | undefined;
    categories?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED" | undefined;
    items?: {
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
        productId: string;
    }[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    displayType?: "BANNER" | "POPUP" | "INLINE" | "WELCOME_SCREEN" | undefined;
    displayPriority?: number | undefined;
    ctaType?: "LINK" | "NONE" | "BUTTON" | undefined;
    ctaText?: string | null | undefined;
    ctaUrl?: string | null | undefined;
    discountType?: "PERCENTAGE" | "FIXED" | null | undefined;
    discountValue?: number | null | undefined;
    minOrderAmount?: number | null | undefined;
    maxUsageCount?: number | null | undefined;
    perUserLimit?: number | null | undefined;
    timeRestrictions?: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    } | null | undefined;
    dayRestrictions?: {
        days: {
            monday: boolean;
            tuesday: boolean;
            wednesday: boolean;
            thursday: boolean;
            friday: boolean;
            saturday: boolean;
            sunday: boolean;
        };
        enabled: boolean;
    } | null | undefined;
    welcomeSettings?: {
        enabled: boolean;
        imageUrl?: string | null | undefined;
        videoUrl?: string | null | undefined;
        buttonText?: string | undefined;
        showOnce?: boolean | undefined;
    } | null | undefined;
    translations?: {
        name: string;
        languageCode: string;
        description?: string | null | undefined;
        ctaText?: string | null | undefined;
    }[] | undefined;
    categories?: string[] | undefined;
}>;
export declare const campaignCategoryCreateSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code: string;
    description?: string | null | undefined;
}, {
    name: string;
    code: string;
    description?: string | null | undefined;
}>;
export declare const campaignCategoryUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
}>;
export declare const checkCampaignSchema: z.ZodEffects<z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    categoryCode: z.ZodOptional<z.ZodString>;
    orderAmount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    orderAmount: number;
    productId?: string | undefined;
    categoryCode?: string | undefined;
}, {
    productId?: string | undefined;
    categoryCode?: string | undefined;
    orderAmount?: number | undefined;
}>, {
    orderAmount: number;
    productId?: string | undefined;
    categoryCode?: string | undefined;
}, {
    productId?: string | undefined;
    categoryCode?: string | undefined;
    orderAmount?: number | undefined;
}>;
export declare const welcomeScreenMarkCompletedSchema: z.ZodObject<{
    deviceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    deviceId: string;
}, {
    deviceId: string;
}>;
