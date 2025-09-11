"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMobileLinkService = void 0;
const response_mobile_link_repository_1 = require("../../repositories/response-tree/response-mobile-link.repository");
const response_session_repository_1 = require("../../repositories/response-tree/response-session.repository");
/**
 * レスポンスモバイル連携サービス
 * ビジネスロジックを担当
 */
class ResponseMobileLinkService {
    responseMobileLinkRepository;
    responseSessionRepository;
    constructor() {
        this.responseMobileLinkRepository = new response_mobile_link_repository_1.ResponseMobileLinkRepository();
        this.responseSessionRepository = new response_session_repository_1.ResponseSessionRepository();
    }
    /**
     * モバイル連携を作成
     */
    async createMobileLink(data) {
        // セッションの存在確認
        const session = await this.responseSessionRepository.findSessionById(data.sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        // モバイル連携を作成
        const link = await this.responseMobileLinkRepository.createMobileLink({
            sessionId: data.sessionId,
            deviceId: data.deviceId,
            roomId: data.roomId,
            expiresInMinutes: 60 // 60分
        });
        // QRコードのURL生成
        const qrCodeUrl = `/api/v1/ai/response-tree/qrcode/${link.linkCode}`;
        return {
            linkId: link.id,
            linkCode: link.linkCode,
            qrCodeUrl,
            expiresAt: link.expiresAt
        };
    }
    /**
     * モバイル連携を取得
     */
    async getMobileLink(linkCode) {
        const link = await this.responseMobileLinkRepository.findMobileLinkByCode(linkCode);
        if (!link) {
            return null;
        }
        return {
            linkId: link.id,
            sessionId: link.session.sessionId,
            deviceId: link.session.deviceId,
            roomId: link.session.roomId,
            isValid: link.isValid,
            expiresAt: link.expiresAt
        };
    }
    /**
     * モバイル連携を実行
     */
    async connectMobileLink(linkCode, data) {
        const link = await this.responseMobileLinkRepository.connectMobileLink(linkCode, {
            userId: data.userId,
            deviceInfo: data.deviceInfo
        });
        if (!link) {
            return null;
        }
        // セッション情報を取得
        const session = await this.responseSessionRepository.findSessionById(link.session.sessionId);
        return {
            linkId: link.id,
            sessionId: link.session.sessionId,
            connectionId: link.connectionId,
            status: link.status,
            connectedAt: link.connectedAt
        };
    }
    /**
     * QRコード画像を生成
     */
    async generateQRCode(linkCode) {
        // QRコード生成ライブラリを使用（実際の実装ではqrcode等のライブラリを使用）
        // ここではダミー実装
        const qrcode = require('qrcode');
        // モバイル連携URLを生成
        const url = `https://example.com/mobile-connect?code=${linkCode}`;
        // QRコード生成
        return new Promise((resolve, reject) => {
            qrcode.toBuffer(url, (err, buffer) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(buffer);
                }
            });
        });
    }
}
exports.ResponseMobileLinkService = ResponseMobileLinkService;
