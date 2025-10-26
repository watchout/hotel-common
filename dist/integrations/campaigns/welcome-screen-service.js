"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeScreenService = void 0;
const uuid_1 = require("uuid");
const cache_1 = require("./cache");
const prisma_1 = require("../../database/prisma");
class WelcomeScreenService {
    cache = new cache_1.CampaignCache();
    async getWelcomeScreenConfig(languageCode) {
        // キャッシュから取得を試みる
        const cacheKey = `${cache_1.CACHE_TYPES.WELCOME_SCREEN_CONFIG}_${languageCode}`;
        const cachedConfig = this.cache.get(cacheKey);
        if (cachedConfig) {
            return cachedConfig;
        }
        // アクティブなウェルカムスクリーン設定を持つキャンペーンを取得
        const now = new Date();
        const campaigns = await prisma_1.hotelDb.getAdapter().campaign.findMany({
            where: {
                status: 'ACTIVE',
                startDate: { lte: now },
                endDate: { gte: now },
                welcomeSettings: {
                    // @ts-ignore - 型定義が不完全
                    path: '$.enabled',
                    equals: true
                }
            },
            orderBy: {
                displayPriority: 'desc'
            },
            take: 1 // 優先度の最も高いものを1つだけ取得
        });
        if (campaigns.length === 0) {
            // デフォルト設定を返す
            const defaultConfig = {
                enabled: false,
                title: '',
                message: '',
                imageUrl: null,
                videoUrl: null,
                buttonText: 'OK',
                showOnce: true
            };
            // キャッシュに保存
            this.cache.set(cacheKey, defaultConfig);
            return defaultConfig;
        }
        const campaign = campaigns[0];
        // @ts-ignore - 型定義が不完全
        const translation = campaign.translations?.[0];
        const welcomeSettings = campaign.welcomeSettings;
        // 設定を構築
        const config = {
            enabled: true,
            title: translation?.name || campaign.name,
            message: translation?.description || campaign.description,
            imageUrl: welcomeSettings.imageUrl || null,
            videoUrl: welcomeSettings.videoUrl || null,
            buttonText: welcomeSettings.buttonText || 'OK',
            showOnce: welcomeSettings.showOnce !== false // デフォルトはtrue
        };
        // キャッシュに保存
        this.cache.set(cacheKey, config);
        return config;
    }
    async shouldShowWelcomeScreen(userId, deviceId) {
        // 設定を取得
        const config = await this.getWelcomeScreenConfig('ja'); // デフォルト言語
        // 無効な場合は表示しない
        if (!config.enabled) {
            return false;
        }
        // 一度だけ表示する設定の場合
        if (config.showOnce) {
            // このデバイスでの表示履歴を確認
            const viewHistory = await prisma_1.hotelDb.getAdapter().deviceVideoCache.findFirst({
                where: {
                    deviceId,
                    // @ts-ignore - 型定義が不完全
                    userId: userId || '',
                    viewed: true
                }
            });
            // 表示履歴がある場合は表示しない
            if (viewHistory) {
                return false;
            }
        }
        return true;
    }
    async markWelcomeScreenCompleted(userId, deviceId) {
        // デバイス情報を更新または作成
        await prisma_1.hotelDb.getAdapter().deviceVideoCache.upsert({
            where: {
                deviceId_userId: {
                    deviceId,
                    // @ts-ignore - 型定義が不完全
                    userId: userId || ''
                }
            },
            update: {
                viewed: true,
                lastViewedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                id: (0, uuid_1.v4)(),
                deviceId,
                userId: userId || null,
                viewed: true,
                lastViewedAt: new Date(),
                updatedAt: new Date()
            }
        });
    }
    async getVideoCacheSchedule() {
        // アクティブなウェルカムスクリーン設定を持つキャンペーンを取得
        const now = new Date();
        const campaigns = await prisma_1.hotelDb.getAdapter().campaign.findMany({
            where: {
                status: 'ACTIVE',
                startDate: { lte: now },
                endDate: { gte: now },
                welcomeSettings: {
                    // @ts-ignore - 型定義が不完全
                    path: '$.enabled',
                    equals: true
                },
                AND: [
                    {
                        welcomeSettings: {
                            // @ts-ignore - 型定義が不完全
                            path: '$.videoUrl',
                            // @ts-ignore - 型定義が不完全
                            not: null
                        }
                    }
                ]
            },
            orderBy: {
                displayPriority: 'desc'
            }
        });
        return campaigns.map(campaign => {
            const welcomeSettings = campaign.welcomeSettings;
            return {
                videoId: campaign.id,
                url: welcomeSettings.videoUrl,
                priority: campaign.displayPriority
            };
        });
    }
    async checkVideoUpdate(videoIds) {
        // 指定されたIDのキャンペーンで、更新されたものを確認
        const now = new Date();
        const updatedCampaigns = await prisma_1.hotelDb.getAdapter().campaign.findMany({
            where: {
                id: { in: videoIds },
                status: 'ACTIVE',
                startDate: { lte: now },
                endDate: { gte: now },
                welcomeSettings: {
                    // @ts-ignore - 型定義が不完全
                    path: '$.enabled',
                    equals: true
                },
                updatedAt: {
                    gt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 過去24時間で更新されたもの
                }
            }
        });
        return {
            updatedVideoIds: updatedCampaigns.map(campaign => campaign.id)
        };
    }
    async getVideoById(id) {
        const campaign = await prisma_1.hotelDb.getAdapter().campaign.findUnique({
            where: {
                id,
                welcomeSettings: {
                    // @ts-ignore - 型定義が不完全
                    path: '$.videoUrl',
                    // @ts-ignore - 型定義が不完全
                    not: null
                }
            }
        });
        if (!campaign) {
            return null;
        }
        const welcomeSettings = campaign.welcomeSettings;
        return {
            url: welcomeSettings.videoUrl
        };
    }
}
exports.WelcomeScreenService = WelcomeScreenService;
