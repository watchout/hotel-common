"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMobileLinkRepository = void 0;
const index_1 = require("../../database/index");
const uuid_1 = require("uuid");
const string_utils_1 = require("../../utils/string-utils");
/**
 * レスポンスモバイル連携リポジトリ
 * データベースとのやり取りを担当
 */
class ResponseMobileLinkRepository {
    /**
     * モバイル連携を作成
     */
    async createMobileLink(data) {
        const session = await index_1.hotelDb.getAdapter().responseTreeSession.findFirst({
            where: { sessionId: data.sessionId },
            select: { id: true }
        });
        if (!session) {
            throw new Error('Session not found');
        }
        // 6桁のランダムコードを生成
        const linkCode = (0, string_utils_1.generateRandomString)(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
        // 有効期限を設定（デフォルト60分）
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresInMinutes || 60));
        return index_1.hotelDb.getAdapter().responseTreeMobileLink.create({
            data: {
                id: (0, uuid_1.v4)(),
                sessionId: session.id,
                qrCodeData: `rt:${linkCode}`,
                deviceId: data.deviceId || 0,
                expiresAt,
                code: linkCode,
                createdAt: new Date()
            }
        });
    }
    /**
     * モバイル連携を取得
     */
    async findMobileLinkByCode(linkCode) {
        const now = new Date();
        return index_1.hotelDb.getAdapter().responseTreeMobileLink.findFirst({
            where: {
                qrCodeData: `rt:${linkCode}`,
                expiresAt: { gt: now }
            },
            include: {
                response_tree_sessions: {
                    select: {
                        sessionId: true,
                        deviceId: true,
                        roomId: true
                    }
                }
            }
        });
    }
    /**
     * モバイル連携を実行
     */
    async connectMobileLink(linkCode, data) {
        const now = new Date();
        const link = await index_1.hotelDb.getAdapter().responseTreeMobileLink.findFirst({
            where: {
                qrCodeData: `rt:${linkCode}`,
                expiresAt: { gt: now }
            },
            select: { id: true }
        });
        if (!link) {
            return null;
        }
        const connectionId = (0, uuid_1.v4)();
        return index_1.hotelDb.getAdapter().responseTreeMobileLink.update({
            where: { id: link.id },
            data: {
                connectionId
            }
        });
    }
    /**
     * モバイル連携を無効化
     */
    async invalidateMobileLink(linkId) {
        return index_1.hotelDb.getAdapter().responseTreeMobileLink.update({
            where: { id: linkId },
            data: {
                expiresAt: new Date(0) // 過去の日付に設定して無効化
            }
        });
    }
}
exports.ResponseMobileLinkRepository = ResponseMobileLinkRepository;
