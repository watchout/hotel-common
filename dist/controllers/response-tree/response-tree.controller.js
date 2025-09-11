"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTreeController = void 0;
const response_tree_service_1 = require("../../services/response-tree/response-tree.service");
const logger_1 = require("../../utils/logger");
/**
 * レスポンスツリーコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
class ResponseTreeController {
    responseTreeService;
    logger;
    constructor() {
        this.responseTreeService = new response_tree_service_1.ResponseTreeService();
        this.logger = logger_1.HotelLogger.getInstance();
    }
    /**
     * アクティブなレスポンスツリー一覧を取得
     */
    async getActiveTrees(req, res) {
        try {
            const tenantId = req.query.tenantId || req.user?.tenantId || 'test-tenant-001';
            const language = req.query.language || 'ja';
            const trees = await this.responseTreeService.getActiveTrees(tenantId, language);
            res.json({
                success: true,
                data: trees
            });
        }
        catch (error) {
            this.logger.error('Error getting active trees:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get active trees'
                }
            });
        }
    }
    /**
     * レスポンスツリー詳細を取得
     */
    async getTreeById(req, res) {
        try {
            const treeId = req.params.treeId;
            const language = req.query.language || 'ja';
            const includeNodes = req.query.includeNodes === 'true';
            const tree = await this.responseTreeService.getTreeById(treeId, language, includeNodes);
            if (!tree) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'TREE_NOT_FOUND',
                        message: 'Response tree not found'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: tree
            });
        }
        catch (error) {
            this.logger.error('Error getting tree by id:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get tree details'
                }
            });
        }
    }
}
exports.ResponseTreeController = ResponseTreeController;
