"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicPageController = void 0;
const page_service_1 = __importDefault(require("../../services/pages/page.service"));
const api_standards_1 = require("../../standards/api-standards");
const logger_1 = require("../../utils/logger");
const logger = logger_1.HotelLogger.getInstance();
/**
 * 公開向けページコントローラー
 */
class PublicPageController {
    /**
     * 公開ページ取得
     */
    async getPublicPage(req, res) {
        try {
            const { slug } = req.params;
            // テナントIDはヘッダーから取得
            const tenantId = req.headers['x-tenant-id'];
            if (!tenantId) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_TENANT', 'テナントIDが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            if (!slug) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INVALID_PARAMS', 'スラグが必要です', undefined, 400);
                return res.status(statusCode).json(response);
            }
            // ページデータの取得を試みる
            let page;
            try {
                page = await page_service_1.default.getPublishedPageBySlug(tenantId, slug);
            }
            catch (fetchError) {
                logger.error('公開ページ取得中にエラーが発生しました', { error: fetchError, tenantId, slug });
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('ページデータの取得に失敗しました');
                return res.status(statusCode).json(response);
            }
            if (!page) {
                const { response, statusCode } = api_standards_1.StandardResponseBuilder.notFoundError('ページ');
                return res.status(statusCode).json(response);
            }
            // JSONデータをパースして返す
            const content = page.Content ? JSON.parse(page.Content) : { blocks: [] };
            return api_standards_1.StandardResponseBuilder.success(res, {
                html: page.Html,
                css: page.Css,
                content,
                template: page.Template
            });
        }
        catch (error) {
            logger.error('公開ページ取得エラー', { error: error });
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.serverError('サーバーエラー');
            return res.status(statusCode).json(response);
        }
    }
}
exports.PublicPageController = PublicPageController;
exports.default = new PublicPageController();
