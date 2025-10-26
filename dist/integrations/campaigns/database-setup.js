"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCampaignDatabase = setupCampaignDatabase;
exports.checkCampaignDatabase = checkCampaignDatabase;
const uuid_1 = require("uuid");
const prisma_1 = require("../../database/prisma");
const logger_1 = require("../../utils/logger");
/**
 * キャンペーン関連のデータベース初期設定を行う
 */
async function setupCampaignDatabase() {
    try {
        logger_1.logger.info('キャンペーン機能のデータベース初期設定を開始します...');
        // キャンペーンカテゴリの初期データを作成
        const categories = [
            { code: 'WELCOME', name: 'ウェルカム', description: '新規顧客向けキャンペーン', isSystem: true },
            { code: 'SEASONAL', name: '季節限定', description: '季節に応じたキャンペーン', isSystem: true },
            { code: 'DISCOUNT', name: '割引', description: '割引キャンペーン', isSystem: true },
            { code: 'EVENT', name: 'イベント', description: 'イベント関連キャンペーン', isSystem: true }
        ];
        // カテゴリを作成（存在しない場合のみ）
        for (const category of categories) {
            const existing = await prisma_1.hotelDb.getAdapter().campaignCategory.findUnique({
                where: { code: category.code }
            });
            if (!existing) {
                await prisma_1.hotelDb.getAdapter().campaignCategory.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        code: category.code,
                        name: category.name,
                        description: category.description,
                        // @ts-ignore - 型定義が不完全
                        isSystem: category.isSystem,
                        isActive: true,
                        priority: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                logger_1.logger.info(`カテゴリを作成しました: ${category.name}`);
            }
        }
        logger_1.logger.info('キャンペーン機能のデータベース初期設定が完了しました');
    }
    catch (error) {
        logger_1.logger.error('キャンペーン機能のデータベース初期設定中にエラーが発生しました', error);
        throw error;
    }
}
/**
 * キャンペーンデータベースの状態を確認
 */
async function checkCampaignDatabase() {
    try {
        const categoryCount = await prisma_1.hotelDb.getAdapter().campaignCategory.count();
        const campaignCount = await prisma_1.hotelDb.getAdapter().campaign.count();
        return {
            categories: categoryCount,
            campaigns: campaignCount,
            isReady: true
        };
    }
    catch (error) {
        logger_1.logger.error('キャンペーンデータベース状態確認中にエラーが発生しました', error);
        return {
            categories: 0,
            campaigns: 0,
            isReady: false
        };
    }
}
