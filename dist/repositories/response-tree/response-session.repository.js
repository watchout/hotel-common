"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseSessionRepository = void 0;
const index_1 = require("../../database/index");
const uuid_1 = require("uuid");
/**
 * レスポンスセッションリポジトリ
 * データベースとのやり取りを担当
 */
class ResponseSessionRepository {
    /**
     * セッションを作成
     */
    async createSession(data) {
        const sessionId = (0, uuid_1.v4)();
        return index_1.hotelDb.getAdapter().responseTreeSession.create({
            data: {
                sessionId,
                // @ts-ignore - 型定義が不完全
                deviceId: data.deviceId ? String(data.deviceId) : null,
                roomId: data.roomId,
                // @ts-ignore - 型定義が不完全
                locale: data.language,
                interfaceType: data.interfaceType
            }
        });
    }
    /**
     * セッションを取得
     */
    async findSessionById(sessionId) {
        return index_1.hotelDb.getAdapter().responseTreeSession.findFirst({
            where: { sessionId },
            include: {
                response_nodes: {
                    select: {
                        id: true,
                        type: true,
                        title: true,
                        description: true,
                        icon: true,
                        answer: true
                    }
                },
                response_tree_history: {
                    select: {
                        nodeId: true,
                        timestamp: true,
                        action: true,
                        response_nodes: {
                            select: {
                                title: true
                            }
                        }
                    },
                    orderBy: {
                        timestamp: 'desc'
                    },
                    take: 10
                }
            }
        });
    }
    /**
     * セッションを更新
     */
    async updateSession(sessionId, data) {
        return index_1.hotelDb.getAdapter().responseTreeSession.updateMany({
            where: { sessionId },
            data
        });
    }
    /**
     * セッション履歴を追加
     */
    async addSessionHistory(data) {
        const session = await index_1.hotelDb.getAdapter().responseTreeSession.findFirst({
            where: { sessionId: data.sessionId },
            select: { id: true }
        });
        if (!session) {
            throw new Error('Session not found');
        }
        return index_1.hotelDb.getAdapter().responseTreeHistory.create({
            data: {
                id: (0, uuid_1.v4)(),
                sessionId: session.id,
                nodeId: data.nodeId,
                action: data.action,
                createdAt: new Date()
            }
        });
    }
    /**
     * セッション履歴を取得
     */
    async getSessionHistory(sessionId, limit = 10) {
        const session = await index_1.hotelDb.getAdapter().responseTreeSession.findFirst({
            where: { sessionId },
            select: { id: true }
        });
        if (!session) {
            return [];
        }
        return index_1.hotelDb.getAdapter().responseTreeHistory.findMany({
            where: { sessionId: session.id },
            include: {
                response_nodes: {
                    select: {
                        title: true,
                        type: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit
        });
    }
    /**
     * セッションを終了
     */
    async endSession(sessionId) {
        const now = new Date();
        const session = await index_1.hotelDb.getAdapter().responseTreeSession.findFirst({
            where: { sessionId },
            select: {
                id: true,
                startedAt: true
            }
        });
        if (!session) {
            return null;
        }
        await index_1.hotelDb.getAdapter().responseTreeSession.update({
            where: { id: session.id },
            data: {
                endedAt: now,
                lastActivityAt: now
            }
        });
        return {
            sessionId,
            startedAt: session.startedAt,
            endedAt: now,
            duration: Math.floor((now.getTime() - session.startedAt.getTime()) / 1000)
        };
    }
}
exports.ResponseSessionRepository = ResponseSessionRepository;
