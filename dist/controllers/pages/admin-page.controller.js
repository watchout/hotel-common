"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPageController = void 0;
const page_service_1 = __importDefault(require("../../services/pages/page.service"));
const api_standards_1 = require("../../standards/api-standards");
const logger_1 = require("../../utils/logger");
const logger = logger_1.HotelLogger.getInstance();
/**
 * 管理者向けページ管理コントローラー
 */
class AdminPageController {
    /**
     * すべてのページ取得
     */
    async getAllPages(req, res) {
        try {
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.authError('テナントIDが必要です');
                return res.status(statusCode).json(response);
            }
            const pages = await page_service_1.default.getAllPages(tenantId);
            return api_standards_1.StandardResponseBuilder.success(res, pages.map((page) => ({
                id: page.Id,
                slug: page.Slug,
                title: page.Title,
                isPublished: page.IsPublished,
                publishedAt: page.PublishedAt,
                version: page.Version,
                updatedAt: page.UpdatedAt
            })));
        }
        catch (error) {
            logger.error('全ページ取得エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('ページ一覧の取得に失敗しました');
            return res.status(statusCode).json(response);
        }
    }
    /**
     * ページ取得
     */
    async getPage(req, res) {
        try {
            const { slug } = req.params;
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.authError('テナントIDが必要です');
                return res.status(statusCode).json(response);
            }
            if (!slug) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'スラグが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            const page = await page_service_1.default.getPageBySlug(tenantId, slug);
            if (!page) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.notFoundError('ページ');
                return res.status(statusCode).json(response);
            }
            // JSONデータをパースして返す
            const content = page.Content ? JSON.parse(page.Content) : { blocks: [] };
            return api_standards_1.StandardResponseBuilder.success(res, {
                id: page.Id,
                title: page.Title,
                html: page.Html,
                css: page.Css,
                content,
                template: page.Template,
                isPublished: page.IsPublished,
                publishedAt: page.PublishedAt,
                version: page.Version
            });
        }
        catch (error) {
            logger.error('ページ取得エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('サーバーエラー');
            return res.status(statusCode).json(response);
        }
    }
    /**
     * ページ保存
     */
    async savePage(req, res) {
        try {
            const { slug } = req.params;
            const tenantId = req.user?.tenant_id;
            const { title, html, css, content, template } = req.body;
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.authError('テナントIDが必要です');
                return res.status(statusCode).json(response);
            }
            if (!slug) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'スラグが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            if (!title) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'タイトルが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            // contentがオブジェクトの場合はJSON文字列に変換
            const contentString = content ? JSON.stringify(content) : undefined;
            const page = await page_service_1.default.savePage(tenantId, slug, {
                Title: title,
                Html: html,
                Css: css,
                Content: contentString,
                Template: template
            });
            return api_standards_1.StandardResponseBuilder.success(res, {
                id: page.Id,
                version: page.Version
            });
        }
        catch (error) {
            logger.error('ページ保存エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('保存に失敗しました');
            return res.status(statusCode).json(response);
        }
    }
    /**
     * ページ公開
     */
    async publishPage(req, res) {
        try {
            const { slug } = req.params;
            const tenantId = req.user?.tenant_id;
            const { id } = req.body;
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.authError('テナントIDが必要です');
                return res.status(statusCode).json(response);
            }
            if (!slug || !id) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'スラグとIDが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            const page = await page_service_1.default.publishPage(tenantId, slug, id);
            return api_standards_1.StandardResponseBuilder.success(res, {
                id: page.Id,
                isPublished: page.IsPublished,
                publishedAt: page.PublishedAt
            });
        }
        catch (error) {
            logger.error('ページ公開エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('公開に失敗しました');
            return res.status(statusCode).json(response);
        }
    }
    /**
     * ページ履歴取得
     */
    async getPageHistory(req, res) {
        try {
            const { slug } = req.params;
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.authError('テナントIDが必要です');
                return res.status(statusCode).json(response);
            }
            if (!slug) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'スラグが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            const history = await page_service_1.default.getPageHistory(tenantId, slug);
            return api_standards_1.StandardResponseBuilder.success(res, history);
        }
        catch (error) {
            logger.error('ページ履歴取得エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('履歴の取得に失敗しました');
            return res.status(statusCode).json(response);
        }
    }
    /**
     * 特定バージョンの履歴取得（クエリパラメータ方式）
     */
    async getPageHistoryVersion(req, res) {
        try {
            const { slug, version } = req.query;
            const tenantId = req.user?.tenant_id;
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.authError('テナントIDが必要です');
                return res.status(statusCode).json(response);
            }
            if (!slug || !version) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'スラグとバージョンがクエリパラメータで必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            const versionNumber = parseInt(version, 10);
            if (isNaN(versionNumber)) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'バージョンは数値である必要があります', undefined, 400);
                return res.status(statusCode).json(response);
            }
            const historyVersion = await page_service_1.default.getPageHistoryVersion(tenantId, slug, versionNumber);
            // JSONデータをパースして返す
            const content = historyVersion.Content ? JSON.parse(historyVersion.Content) : { blocks: [] };
            return api_standards_1.StandardResponseBuilder.success(res, {
                id: historyVersion.Id,
                html: historyVersion.Html,
                css: historyVersion.Css,
                content,
                template: historyVersion.Template,
                version: historyVersion.Version,
                createdAt: historyVersion.CreatedAt,
                createdBy: historyVersion.CreatedBy
            });
        }
        catch (error) {
            logger.error('ページ履歴バージョン取得エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('指定されたバージョンが見つかりません');
            return res.status(statusCode).json(response);
        }
    }
    /**
     * バージョン復元
     */
    async restorePageVersion(req, res) {
        try {
            const { slug } = req.params;
            const tenantId = req.user?.tenant_id;
            const { version } = req.body;
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.authError('テナントIDが必要です');
                return res.status(statusCode).json(response);
            }
            if (!slug || !version) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'スラグとバージョンが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            const versionNumber = parseInt(version, 10);
            if (isNaN(versionNumber)) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'バージョンは数値である必要があります', undefined, 400);
                return res.status(statusCode).json(response);
            }
            const restoredPage = await page_service_1.default.restorePageVersion(tenantId, slug, versionNumber);
            return api_standards_1.StandardResponseBuilder.success(res, {
                id: restoredPage.Id,
                version: restoredPage.Version
            });
        }
        catch (error) {
            logger.error('ページバージョン復元エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('バージョンの復元に失敗しました');
            return res.status(statusCode).json(response);
        }
    }
}
exports.AdminPageController = AdminPageController;
exports.default = new AdminPageController();
