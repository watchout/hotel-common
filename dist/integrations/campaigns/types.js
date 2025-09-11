"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeScreenMarkCompletedSchema = exports.checkCampaignSchema = exports.campaignCategoryUpdateSchema = exports.campaignCategoryCreateSchema = exports.campaignUpdateSchema = exports.campaignCreateSchema = void 0;
const zod_1 = require("zod");
// キャンペーン作成スキーマ
exports.campaignCreateSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).nullable().optional(),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED']),
    displayType: zod_1.z.enum(['BANNER', 'POPUP', 'INLINE', 'WELCOME_SCREEN']),
    displayPriority: zod_1.z.number().int().min(0).max(100),
    ctaType: zod_1.z.enum(['BUTTON', 'LINK', 'NONE']),
    ctaText: zod_1.z.string().max(50).nullable().optional(),
    ctaUrl: zod_1.z.string().url().max(2000).nullable().optional(),
    discountType: zod_1.z.enum(['PERCENTAGE', 'FIXED']).nullable().optional(),
    discountValue: zod_1.z.number().min(0).nullable().optional(),
    minOrderAmount: zod_1.z.number().min(0).nullable().optional(),
    maxUsageCount: zod_1.z.number().int().min(0).nullable().optional(),
    perUserLimit: zod_1.z.number().int().min(0).nullable().optional(),
    timeRestrictions: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    }).nullable().optional(),
    dayRestrictions: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        days: zod_1.z.object({
            monday: zod_1.z.boolean(),
            tuesday: zod_1.z.boolean(),
            wednesday: zod_1.z.boolean(),
            thursday: zod_1.z.boolean(),
            friday: zod_1.z.boolean(),
            saturday: zod_1.z.boolean(),
            sunday: zod_1.z.boolean()
        })
    }).nullable().optional(),
    welcomeSettings: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        imageUrl: zod_1.z.string().url().max(2000).nullable().optional(),
        videoUrl: zod_1.z.string().url().max(2000).nullable().optional(),
        buttonText: zod_1.z.string().max(50).optional(),
        showOnce: zod_1.z.boolean().optional()
    }).nullable().optional(),
    translations: zod_1.z.array(zod_1.z.object({
        languageCode: zod_1.z.string().min(2).max(5),
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(500).nullable().optional(),
        ctaText: zod_1.z.string().max(50).nullable().optional()
    })).optional(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        discountType: zod_1.z.enum(['PERCENTAGE', 'FIXED']),
        discountValue: zod_1.z.number().min(0)
    })).optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional()
});
// キャンペーン更新スキーマ
exports.campaignUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(500).nullable().optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
    displayType: zod_1.z.enum(['BANNER', 'POPUP', 'INLINE', 'WELCOME_SCREEN']).optional(),
    displayPriority: zod_1.z.number().int().min(0).max(100).optional(),
    ctaType: zod_1.z.enum(['BUTTON', 'LINK', 'NONE']).optional(),
    ctaText: zod_1.z.string().max(50).nullable().optional(),
    ctaUrl: zod_1.z.string().url().max(2000).nullable().optional(),
    discountType: zod_1.z.enum(['PERCENTAGE', 'FIXED']).nullable().optional(),
    discountValue: zod_1.z.number().min(0).nullable().optional(),
    minOrderAmount: zod_1.z.number().min(0).nullable().optional(),
    maxUsageCount: zod_1.z.number().int().min(0).nullable().optional(),
    perUserLimit: zod_1.z.number().int().min(0).nullable().optional(),
    timeRestrictions: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    }).nullable().optional(),
    dayRestrictions: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        days: zod_1.z.object({
            monday: zod_1.z.boolean(),
            tuesday: zod_1.z.boolean(),
            wednesday: zod_1.z.boolean(),
            thursday: zod_1.z.boolean(),
            friday: zod_1.z.boolean(),
            saturday: zod_1.z.boolean(),
            sunday: zod_1.z.boolean()
        })
    }).nullable().optional(),
    welcomeSettings: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        imageUrl: zod_1.z.string().url().max(2000).nullable().optional(),
        videoUrl: zod_1.z.string().url().max(2000).nullable().optional(),
        buttonText: zod_1.z.string().max(50).optional(),
        showOnce: zod_1.z.boolean().optional()
    }).nullable().optional(),
    translations: zod_1.z.array(zod_1.z.object({
        languageCode: zod_1.z.string().min(2).max(5),
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(500).nullable().optional(),
        ctaText: zod_1.z.string().max(50).nullable().optional()
    })).optional(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        discountType: zod_1.z.enum(['PERCENTAGE', 'FIXED']),
        discountValue: zod_1.z.number().min(0)
    })).optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional()
});
// キャンペーンカテゴリー作成スキーマ
exports.campaignCategoryCreateSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).nullable().optional()
});
// キャンペーンカテゴリー更新スキーマ
exports.campaignCategoryUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(500).nullable().optional()
});
// キャンペーン適用チェックスキーマ
exports.checkCampaignSchema = zod_1.z.object({
    productId: zod_1.z.string().optional(),
    categoryCode: zod_1.z.string().optional(),
    orderAmount: zod_1.z.coerce.number().min(0).default(0)
}).refine(data => data.productId || data.categoryCode, {
    message: "Either productId or categoryCode must be provided",
    path: ["productId"]
});
// ウェルカムスクリーン完了マークスキーマ
exports.welcomeScreenMarkCompletedSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1)
});
