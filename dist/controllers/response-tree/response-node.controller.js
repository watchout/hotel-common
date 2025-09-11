"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseNodeController = void 0;
const response_node_service_1 = require("../../services/response-tree/response-node.service");
const logger_1 = require("../../utils/logger");
/**
 * レスポンスノードコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
class ResponseNodeController {
    responseNodeService;
    logger;
    constructor() {
        this.responseNodeService = new response_node_service_1.ResponseNodeService();
        this.logger = logger_1.HotelLogger.getInstance();
    }
    /**
     * ノード詳細を取得
     */
    async getNodeById(req, res) {
        try {
            const nodeId = req.params.nodeId;
            const language = req.query.language || 'ja';
            const includeChildren = req.query.includeChildren !== 'false';
            const node = await this.responseNodeService.getNodeById(nodeId, language, includeChildren);
            if (!node) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NODE_NOT_FOUND',
                        message: 'Response node not found'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: node
            });
        }
        catch (error) {
            this.logger.error('Error getting node by id:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get node details'
                }
            });
        }
    }
    /**
     * 子ノード一覧を取得
     */
    async getChildNodes(req, res) {
        try {
            const nodeId = req.params.nodeId;
            const language = req.query.language || 'ja';
            const children = await this.responseNodeService.getChildNodes(nodeId, language);
            res.json({
                success: true,
                data: children
            });
        }
        catch (error) {
            this.logger.error('Error getting child nodes:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get child nodes'
                }
            });
        }
    }
    /**
     * ノード検索
     */
    async searchNodes(req, res) {
        try {
            const treeId = req.query.treeId;
            const query = req.query.query;
            const language = req.query.language || 'ja';
            const limit = parseInt(req.query.limit || '10', 10);
            if (!query) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Query parameter is required'
                    }
                });
                return;
            }
            const results = await this.responseNodeService.searchNodes(query, treeId, language, limit);
            res.json({
                success: true,
                data: results
            });
        }
        catch (error) {
            this.logger.error('Error searching nodes:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to search nodes'
                }
            });
        }
    }
}
exports.ResponseNodeController = ResponseNodeController;
