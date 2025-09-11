"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageService = void 0;
const prisma_1 = require("../../database/prisma");
const logger_1 = require("../../utils/logger");
const uuid_1 = require("uuid");
const logger = logger_1.HotelLogger.getInstance();
/**
 * ページ管理サービス
 */
class PageService {
    /**
     * テナントIDに紐づくすべてのページを取得
     */
    async getAllPages(tenantId) {
        try {
            const pages = await prisma_1.hotelDb.getAdapter().page.findMany({
                where: {
                    TenantId: tenantId
                },
                orderBy: {
                    UpdatedAt: 'desc'
                }
            });
            return pages;
        }
        catch (error) {
            logger.error('全ページ取得エラー', { error: error, data: { tenantId } });
            throw error;
        }
    }
    /**
     * テナントIDとスラグでページを取得
     */
    async getPageBySlug(tenantId, slug) {
        try {
            const page = await prisma_1.hotelDb.getAdapter().page.findUnique({
                where: {
                    TenantId_Slug: {
                        TenantId: tenantId,
                        Slug: slug
                    }
                }
            });
            return page;
        }
        catch (error) {
            logger.error('ページ取得エラー', { error: error, data: { tenantId, slug } });
            throw error;
        }
    }
    /**
     * 公開済みページをスラグで取得
     */
    async getPublishedPageBySlug(tenantId, slug) {
        try {
            // アダプターを使用する
            const page = await prisma_1.hotelDb.getAdapter().page.findFirst({
                where: {
                    TenantId: tenantId,
                    Slug: slug,
                    IsPublished: true
                }
            });
            return page;
        }
        catch (error) {
            logger.error('公開ページ取得エラー', { error: error, data: { tenantId, slug } });
            throw error;
        }
    }
    /**
     * ページを保存（新規作成または更新）
     */
    async savePage(tenantId, slug, pageData) {
        try {
            // 既存ページを検索
            const existingPage = await prisma_1.hotelDb.getAdapter().page.findUnique({
                where: {
                    TenantId_Slug: {
                        TenantId: tenantId,
                        Slug: slug
                    }
                }
            });
            if (existingPage) {
                // 更新の場合
                const updatedPage = await prisma_1.hotelDb.transaction(async (tx) => {
                    // 履歴を作成
                    await tx.pageHistory.create({
                        data: {
                            id: (0, uuid_1.v4)(),
                            PageId: existingPage.Id,
                            Html: existingPage.Html,
                            Css: existingPage.Css,
                            Content: existingPage.Content,
                            Template: existingPage.Template,
                            Version: existingPage.Version,
                            CreatedBy: 'system', // 実際には認証されたユーザーIDを使用
                            createdAt: new Date()
                        }
                    });
                    // ページを更新
                    return tx.page.update({
                        where: {
                            Id: existingPage.Id
                        },
                        data: {
                            Title: pageData.Title,
                            Html: pageData.Html,
                            Css: pageData.Css,
                            Content: pageData.Content,
                            Template: pageData.Template,
                            Version: { increment: 1 },
                            UpdatedAt: new Date()
                        }
                    });
                });
                return updatedPage;
            }
            else {
                // 新規作成の場合
                const newPage = await prisma_1.hotelDb.getAdapter().page.create({
                    data: {
                        Id: (0, uuid_1.v4)(),
                        TenantId: tenantId,
                        Slug: slug,
                        Title: pageData.Title,
                        Html: pageData.Html,
                        Css: pageData.Css,
                        Content: pageData.Content,
                        Template: pageData.Template,
                        Version: 1,
                        IsPublished: false,
                        UpdatedAt: new Date(),
                        CreatedAt: new Date()
                    }
                });
                return newPage;
            }
        }
        catch (error) {
            logger.error('ページ保存エラー', { error: error, data: { tenantId, slug } });
            throw error;
        }
    }
    /**
     * ページを公開する
     */
    async publishPage(tenantId, slug, pageId) {
        try {
            const page = await prisma_1.hotelDb.getAdapter().page.findFirst({
                where: {
                    Id: pageId,
                    TenantId: tenantId,
                    Slug: slug
                }
            });
            if (!page) {
                throw new Error('ページが見つかりません');
            }
            const publishedPage = await prisma_1.hotelDb.getAdapter().page.update({
                where: {
                    Id: pageId
                },
                data: {
                    IsPublished: true,
                    PublishedAt: new Date(),
                    UpdatedAt: new Date()
                }
            });
            return publishedPage;
        }
        catch (error) {
            logger.error('ページ公開エラー', { error: error, data: { tenantId, slug, pageId } });
            throw error;
        }
    }
    /**
     * ページの履歴一覧を取得
     */
    async getPageHistory(tenantId, slug) {
        try {
            const page = await prisma_1.hotelDb.getAdapter().page.findUnique({
                where: {
                    TenantId_Slug: {
                        TenantId: tenantId,
                        Slug: slug
                    }
                },
                select: {
                    Id: true,
                    Version: true,
                    UpdatedAt: true
                }
            });
            if (!page) {
                throw new Error('ページが見つかりません');
            }
            const history = await prisma_1.hotelDb.getAdapter().pageHistory.findMany({
                where: {
                    PageId: page.Id
                },
                orderBy: {
                    Version: 'desc'
                },
                select: {
                    Id: true,
                    Version: true,
                    CreatedAt: true,
                    CreatedBy: true
                }
            });
            return {
                current: page,
                history
            };
        }
        catch (error) {
            logger.error('ページ履歴取得エラー', { error: error, data: { tenantId, slug } });
            throw error;
        }
    }
    /**
     * 特定バージョンの履歴を取得
     */
    async getPageHistoryVersion(tenantId, slug, version) {
        try {
            const page = await prisma_1.hotelDb.getAdapter().page.findUnique({
                where: {
                    TenantId_Slug: {
                        TenantId: tenantId,
                        Slug: slug
                    }
                }
            });
            if (!page) {
                throw new Error('ページが見つかりません');
            }
            const historyVersion = await prisma_1.hotelDb.getAdapter().pageHistory.findFirst({
                where: {
                    PageId: page.Id,
                    Version: version
                }
            });
            if (!historyVersion) {
                throw new Error('指定されたバージョンが見つかりません');
            }
            return historyVersion;
        }
        catch (error) {
            logger.error('ページ履歴バージョン取得エラー', { error: error, data: { tenantId, slug, version } });
            throw error;
        }
    }
    /**
     * 過去のバージョンを復元
     */
    async restorePageVersion(tenantId, slug, version) {
        try {
            return await prisma_1.hotelDb.transaction(async (tx) => {
                // 現在のページを取得
                const page = await tx.pages.findUnique({
                    where: {
                        TenantId_Slug: {
                            TenantId: tenantId,
                            Slug: slug
                        }
                    }
                });
                if (!page) {
                    throw new Error('ページが見つかりません');
                }
                // 復元するバージョンを取得
                const historyVersion = await tx.page_histories.findFirst({
                    where: {
                        PageId: page.Id,
                        Version: version
                    }
                });
                if (!historyVersion) {
                    throw new Error('指定されたバージョンが見つかりません');
                }
                // 現在のバージョンを履歴に保存
                await tx.page_histories.create({
                    data: {
                        id: (0, uuid_1.v4)(),
                        PageId: page.Id,
                        Html: page.Html,
                        Css: page.Css,
                        Content: page.Content,
                        Template: page.Template,
                        Version: page.Version,
                        CreatedBy: 'system', // 実際には認証されたユーザーIDを使用
                        createdAt: new Date()
                    }
                });
                // 過去のバージョンを現在のページに復元
                const restoredPage = await tx.pages.update({
                    where: {
                        Id: page.Id
                    },
                    data: {
                        Html: historyVersion.Html,
                        Css: historyVersion.Css,
                        Content: historyVersion.Content,
                        Template: historyVersion.Template,
                        Version: { increment: 1 },
                        UpdatedAt: new Date()
                    }
                });
                return restoredPage;
            });
        }
        catch (error) {
            logger.error('ページバージョン復元エラー', { error: error, data: { tenantId, slug, version } });
            throw error;
        }
    }
}
exports.PageService = PageService;
exports.default = new PageService();
