"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const prisma_1 = require("../../database/prisma");
const utils_1 = require("./utils");
const uuid_1 = require("uuid");
class CampaignService {
    /**
     * キャンペーンの適用可能性をチェック
     */
    async checkCampaignApplicability(productId, categoryCode, orderAmount, userId) {
        // 実装は後で追加
        return null;
    }
    /**
     * アクティブなキャンペーンを取得
     */
    async getActiveCampaigns() {
        const campaigns = await prisma_1.hotelDb.getAdapter().campaign.findMany({
            where: {
                status: 'ACTIVE',
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
            },
            include: {
                campaign_translations: true
            }
        });
        return campaigns.map((campaign) => (0, utils_1.mapCampaignToBasicInfo)(campaign));
    }
    /**
     * カテゴリ別キャンペーンを取得
     */
    async getCampaignsByCategory(code, language) {
        const campaigns = await prisma_1.hotelDb.getAdapter().campaign.findMany({
            where: {
                status: 'ACTIVE',
                campaign_category_relations: {
                    some: {
                        campaign_categories: {
                            code: code
                        }
                    }
                }
            },
            include: {
                campaign_translations: {
                    where: { languageCode: language }
                }
            }
        });
        return campaigns.map((campaign) => (0, utils_1.mapCampaignToBasicInfo)(campaign));
    }
    /**
     * キャンペーン一覧を取得
     * @param options 検索オプション
     * @returns キャンペーン一覧
     */
    async getCampaigns(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;
        // 検索条件を構築
        const where = {};
        if (options?.status) {
            where.status = options.status;
        }
        if (options?.displayType) {
            where.displayType = options.displayType;
        }
        if (options?.search) {
            where.OR = [
                { name: { contains: options.search } },
                { code: { contains: options.search } },
                { description: { contains: options.search } }
            ];
        }
        // キャンペーンデータを取得
        const [campaigns, total] = await Promise.all([
            prisma_1.hotelDb.getAdapter().campaign.findMany({
                skip,
                take: limit,
                where,
                orderBy: [
                    { status: 'asc' },
                    { startDate: 'desc' }
                ]
            }),
            prisma_1.hotelDb.getAdapter().campaign.count({ where })
        ]);
        // キャンペーンデータを整形
        const campaignData = campaigns.map((campaign) => (0, utils_1.mapCampaignToBasicInfo)(campaign));
        return {
            data: campaignData,
            meta: {
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    }
    /**
     * キャンペーンを作成
     * @param data キャンペーン作成データ
     * @returns 作成されたキャンペーン
     */
    async createCampaign(data) {
        // トランザクションを使用
        const campaign = await prisma_1.hotelDb.transaction(async (tx) => {
            // キャンペーンを作成
            const newCampaign = await tx.campaign.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    name: data.name,
                    code: data.code,
                    description: data.description,
                    displayType: data.displayType,
                    status: data.status || 'DRAFT',
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    maxUsageCount: data.maxUsageCount,
                    displayPriority: data.displayPriority || 0,
                    ctaType: data.ctaType || 'NONE',
                    ctaText: data.ctaText || null,
                    ctaUrl: data.ctaUrl || null,
                    minOrderAmount: data.minOrderAmount || null,
                    perUserLimit: data.perUserLimit || null,
                    timeRestrictions: data.timeRestrictions || null,
                    dayRestrictions: data.dayRestrictions || null,
                    welcomeSettings: data.welcomeSettings || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            // カテゴリー関連付けがある場合
            if (data.categories && data.categories.length > 0) {
                await Promise.all(data.categories.map((categoryId) => tx.campaignCategoryRelation.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        campaignId: newCampaign.id,
                        categoryId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                })));
            }
            // 多言語対応がある場合
            if (data.translations && data.translations.length > 0) {
                await Promise.all(data.translations.map((translation) => tx.campaignTranslation.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        campaignId: newCampaign.id,
                        languageCode: translation.languageCode,
                        name: translation.name,
                        description: translation.description || null,
                        ctaText: translation.ctaText || null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                })));
            }
            // 作成したキャンペーンを取得（関連データ含む）
            return await tx.campaign.findUnique({
                where: { id: newCampaign.id }
            });
        });
        // キャンペーンデータを整形して返却
        return (0, utils_1.mapCampaignToDetailInfo)(campaign);
    }
    /**
     * キャンペーンを更新
     * @param id キャンペーンID
     * @param data 更新データ
     * @returns 更新されたキャンペーン
     */
    async updateCampaign(id, data) {
        // トランザクションを使用
        const campaign = await prisma_1.hotelDb.transaction(async (tx) => {
            // 基本情報を更新
            const updatedCampaign = await tx.campaign.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    displayType: data.displayType,
                    status: data.status,
                    startDate: data.startDate ? new Date(data.startDate) : undefined,
                    endDate: data.endDate ? new Date(data.endDate) : undefined,
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    maxUsageCount: data.maxUsageCount,
                    displayPriority: data.displayPriority,
                    ctaType: data.ctaType,
                    ctaText: data.ctaText,
                    ctaUrl: data.ctaUrl,
                    minOrderAmount: data.minOrderAmount,
                    perUserLimit: data.perUserLimit,
                    timeRestrictions: data.timeRestrictions,
                    dayRestrictions: data.dayRestrictions,
                    welcomeSettings: data.welcomeSettings,
                    updatedAt: new Date()
                }
            });
            // カテゴリー関連付けがある場合、一度削除して再作成
            if (data.categories !== undefined) {
                // 既存の関連付けを削除
                await tx.campaignCategoryRelation.deleteMany({
                    where: { campaignId: id }
                });
                // 新しい関連付けを作成
                if (data.categories.length > 0) {
                    await Promise.all(data.categories.map((categoryId) => tx.campaignCategoryRelation.create({
                        data: {
                            id: (0, uuid_1.v4)(),
                            campaignId: id,
                            categoryId,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    })));
                }
            }
            // 多言語対応がある場合
            if (data.translations && data.translations.length > 0) {
                // 既存の翻訳を削除
                await tx.campaignTranslation.deleteMany({
                    where: { campaignId: id }
                });
                // 新しい翻訳を作成
                await Promise.all(data.translations.map((translation) => tx.campaignTranslation.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        campaignId: id,
                        languageCode: translation.languageCode,
                        name: translation.name,
                        description: translation.description || null,
                        ctaText: translation.ctaText || null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                })));
            }
            // 更新したキャンペーンを取得（関連データ含む）
            return await tx.campaign.findUnique({
                where: { id }
            });
        });
        // キャンペーンデータを整形して返却
        return (0, utils_1.mapCampaignToDetailInfo)(campaign);
    }
    /**
     * キャンペーンを削除
     * @param id キャンペーンID
     */
    async deleteCampaign(id) {
        await prisma_1.hotelDb.transaction(async (tx) => {
            // 関連データを削除
            await tx.campaignCategoryRelation.deleteMany({
                where: { campaignId: id }
            });
            await tx.campaignTranslation.deleteMany({
                where: { campaignId: id }
            });
            // キャンペーンを削除
            await tx.campaign.delete({
                where: { id }
            });
        });
    }
    /**
     * キャンペーン詳細を取得
     * @param id キャンペーンID
     * @returns キャンペーン詳細
     */
    async getCampaignById(id) {
        const campaign = await prisma_1.hotelDb.getAdapter().campaign.findUnique({
            where: { id }
        });
        if (!campaign) {
            return null;
        }
        return (0, utils_1.mapCampaignToDetailInfo)(campaign);
    }
}
exports.CampaignService = CampaignService;
