"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMobileLinkController = void 0;
const response_mobile_link_service_1 = require("../../services/response-tree/response-mobile-link.service");
const logger_1 = require("../../utils/logger");
/**
 * レスポンスモバイル連携コントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
class ResponseMobileLinkController {
    responseMobileLinkService;
    logger;
    constructor() {
        this.responseMobileLinkService = new response_mobile_link_service_1.ResponseMobileLinkService();
        this.logger = logger_1.HotelLogger.getInstance();
    }
    /**
     * モバイル連携を作成
     */
    async createMobileLink(req, res) {
        try {
            const data = req.body;
            if (!data.sessionId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'sessionId is required'
                    }
                });
                return;
            }
            const link = await this.responseMobileLinkService.createMobileLink(data);
            res.json({
                success: true,
                data: link
            });
        }
        catch (error) {
            this.logger.error('Error creating mobile link:', { error: error instanceof Error ? error : new Error('Unknown error') });
            if (error.message === 'Session not found') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: 'Session not found'
                    }
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create mobile link'
                }
            });
        }
    }
    /**
     * モバイル連携を取得
     */
    async getMobileLink(req, res) {
        try {
            const linkCode = req.params.linkCode;
            const link = await this.responseMobileLinkService.getMobileLink(linkCode);
            if (!link) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'INVALID_LINK_CODE',
                        message: 'Invalid or expired link code'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: link
            });
        }
        catch (error) {
            this.logger.error('Error getting mobile link:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to get mobile link'
                }
            });
        }
    }
    /**
     * モバイル連携を実行
     */
    async connectMobileLink(req, res) {
        try {
            const linkCode = req.params.linkCode;
            const data = req.body;
            const connection = await this.responseMobileLinkService.connectMobileLink(linkCode, data);
            if (!connection) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'INVALID_LINK_CODE',
                        message: 'Invalid or expired link code'
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: connection
            });
        }
        catch (error) {
            this.logger.error('Error connecting mobile link:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to connect mobile link'
                }
            });
        }
    }
    /**
     * QRコード画像を取得
     */
    async getQRCode(req, res) {
        try {
            const linkCode = req.params.linkCode;
            // リンクの存在確認
            const link = await this.responseMobileLinkService.getMobileLink(linkCode);
            if (!link) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'INVALID_LINK_CODE',
                        message: 'Invalid or expired link code'
                    }
                });
                return;
            }
            // QRコード生成
            const qrBuffer = await this.responseMobileLinkService.generateQRCode(linkCode);
            // 画像として返す
            res.set('Content-Type', 'image/png');
            res.send(qrBuffer);
        }
        catch (error) {
            this.logger.error('Error generating QR code:', { error: error instanceof Error ? error : new Error('Unknown error') });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to generate QR code'
                }
            });
        }
    }
}
exports.ResponseMobileLinkController = ResponseMobileLinkController;
