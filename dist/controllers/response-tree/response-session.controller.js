"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseSessionController = void 0;
const response_session_service_1 = require("../../services/response-tree/response-session.service");
const logger_1 = require("../../utils/logger");
/**
 * レスポンスセッションコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
class ResponseSessionController {
    responseSessionService;
    logger;
    constructor() {
        this.responseSessionService = new response_session_service_1.ResponseSessionService();
        this.logger = logger_1.HotelLogger.getInstance();
    }
    /**
     * セッション開始
     */
    async startSession(req, res) {
        try {
            const data = req.body;
            if (!data.deviceId && !data.roomId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Either deviceId or roomId is required'
                    }
                });
                return;
            }
            const session = await this.responseSessionService.startSession({
                deviceId: data.deviceId,
                roomId: data.roomId,
                language: data.language || 'ja',
                interfaceType: data.interfaceType || 'tv'
            });
            res.json({
                success: true,
                data: session
            });
        }
        catch (error) {
            this.logger.error('Error starting session:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to start session'
                }
            });
        }
    }
    /**
     * セッション状態取得
     */
    async getSession(req, res) {
        try {
            const sessionId = req.params.sessionId;
            const session = await this.responseSessionService.getSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: 'Session not found'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: session
            });
        }
        catch (error) {
            this.logger.error('Error getting session:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get session'
                }
            });
        }
    }
    /**
     * セッション更新
     */
    async updateSession(req, res) {
        try {
            const sessionId = req.params.sessionId;
            const data = req.body;
            if (!data.currentNodeId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'currentNodeId is required'
                    }
                });
                return;
            }
            const session = await this.responseSessionService.updateSession(sessionId, data.currentNodeId, data.action || 'select_node');
            if (!session) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: 'Session not found'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: session
            });
        }
        catch (error) {
            this.logger.error('Error updating session:', { error: error instanceof Error ? error : new Error('Unknown error') });
            if (error.message === 'Node not found') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'NODE_NOT_FOUND',
                        message: 'Node not found'
                    }
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to update session'
                }
            });
        }
    }
    /**
     * セッション終了
     */
    async endSession(req, res) {
        try {
            const sessionId = req.params.sessionId;
            const session = await this.responseSessionService.endSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: 'Session not found'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: session
            });
        }
        catch (error) {
            this.logger.error('Error ending session:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to end session'
                }
            });
        }
    }
}
exports.ResponseSessionController = ResponseSessionController;
