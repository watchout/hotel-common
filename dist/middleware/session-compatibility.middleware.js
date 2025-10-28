"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flexibleSessionCheck = exports.validateSessionStatus = exports.requireSession = exports.legacyApiCompatibility = exports.autoSessionMapping = void 0;
const prisma_1 = require("../database/prisma");
const logger_1 = require("../utils/logger");
/**
 * セッション互換性ミドルウェア
 * 既存APIの後方互換性を確保
 */
/**
 * 注文API用セッション自動紐付けミドルウェア
 * セッションIDが未設定の注文に対して自動でセッションを検索・紐付け
 */
const autoSessionMapping = async (req, res, next) => {
    try {
        // POSTリクエスト（注文作成）の場合のみ処理
        if (req.method === 'POST' && req.body.roomId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tenantId = req.user?.tenant_id;
            const { roomId } = req.body;
            if (tenantId && roomId) {
                // アクティブなセッションを検索
                const activeSession = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
                    where: {
                        roomId,
                        tenantId,
                        status: 'ACTIVE'
                    }
                });
                if (activeSession) {
                    // リクエストボディにセッションIDを追加
                    req.body.sessionId = activeSession.id;
                    logger_1.logger.info('自動セッション紐付け実行', {
                        roomId,
                        sessionId: activeSession.id,
                        sessionNumber: activeSession.sessionNumber
                    });
                }
                else {
                    logger_1.logger.warn('アクティブセッションが見つかりません', { roomId, tenantId });
                }
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('セッション自動紐付けエラー', error);
        // エラーが発生してもAPIの実行は継続
        next();
    }
};
exports.autoSessionMapping = autoSessionMapping;
/**
 * レガシーAPI互換性ミドルウェア
 * セッション情報なしでも動作するよう既存APIを拡張
 */
const legacyApiCompatibility = async (req, res, next) => {
    try {
        // レスポンスを拡張してセッション情報を含める
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const originalJson = res.json;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.json = function (body) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // 注文データにセッション情報を追加
            if (body && body.order && body.order.roomId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                addSessionInfoToResponse(body, req.user?.tenant_id);
            }
            return originalJson.call(this, body);
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('レガシーAPI互換性ミドルウェアエラー', error);
        next();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
};
exports.legacyApiCompatibility = legacyApiCompatibility;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * レスポンスにセッション情報を追加
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addSessionInfoToResponse(responseBody, tenantId) {
    try {
        if (responseBody.order && responseBody.order.roomId && tenantId) {
            const session = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
                where: {
                    roomId: responseBody.order.roomId,
                    tenantId,
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    sessionNumber: true,
                    guestInfo: true,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    status: true
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (session) {
                responseBody.order.session = {
                    id: session.id,
                    sessionNumber: session.sessionNumber,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    guestName: session.guestInfo?.primaryGuest?.firstName + ' ' + session.guestInfo?.primaryGuest?.lastName,
                    status: session.status
                };
            }
        }
    }
    catch (error) {
        logger_1.logger.error('レスポンスセッション情報追加エラー', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // エラーが発生してもレスポンスは返す
    }
}
/**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * セッション必須チェックミドルウェア
 * 新しいAPIでセッションが必須の場合に使用
 */
const requireSession = async (req, res, next) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = req.user?.tenant_id;
        const { roomId, sessionId } = req.body;
        if (!tenantId) {
            return res.status(400).json({
                error: 'TENANT_ID_REQUIRED',
                message: 'テナントIDが必要です'
            });
        }
        // セッションIDが指定されている場合は検証
        if (sessionId) {
            const session = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
                where: {
                    id: sessionId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    tenantId
                }
            });
            if (!session) {
                return res.status(404).json({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    error: 'SESSION_NOT_FOUND',
                    message: '指定されたセッションが見つかりません'
                });
            }
            // リクエストにセッション情報を追加
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            req.session = session;
        }
        else if (roomId) {
            // セッションIDが未指定の場合、部屋IDからアクティブセッションを検索
            const activeSession = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
                where: {
                    roomId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    tenantId,
                    status: 'ACTIVE'
                }
            });
            if (!activeSession) {
                return res.status(400).json({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    error: 'NO_ACTIVE_SESSION',
                    message: '指定された部屋にアクティブなセッションがありません。先にチェックイン処理を行ってください。'
                });
            }
            // リクエストボディとセッション情報を更新
            req.body.sessionId = activeSession.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            req.session = activeSession;
        }
        else {
            return res.status(400).json({
                error: 'SESSION_OR_ROOM_REQUIRED',
                message: 'セッションIDまたは部屋IDが必要です'
            });
        }
        next();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        logger_1.logger.error('セッション必須チェックエラー', error);
        return res.status(500).json({
            error: 'SESSION_CHECK_ERROR',
            message: 'セッション確認中にエラーが発生しました'
        });
    }
};
exports.requireSession = requireSession;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * セッション状態チェックミドルウェア
 * セッションが適切な状態かを確認
 */
const validateSessionStatus = (allowedStatuses = ['ACTIVE']) => {
    return async (req, res, next) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const session = req.session;
            if (!session) {
                return res.status(400).json({
                    error: 'SESSION_REQUIRED',
                    message: 'セッション情報が必要です'
                });
            }
            if (!allowedStatuses.includes(session.status)) {
                return res.status(400).json({
                    error: 'INVALID_SESSION_STATUS',
                    message: `セッションの状態が無効です。許可された状態: ${allowedStatuses.join(', ')}`
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next();
        }
        catch (error) {
            logger_1.logger.error('セッション状態チェックエラー', error);
            return res.status(500).json({
                error: 'SESSION_STATUS_CHECK_ERROR',
                message: 'セッション状態確認中にエラーが発生しました'
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    };
};
exports.validateSessionStatus = validateSessionStatus;
/**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * 移行期間用の柔軟なセッションチェック
 * セッションがない場合でも警告ログを出すだけで処理を継続
 */
const flexibleSessionCheck = async (req, res, next) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = req.user?.tenant_id;
        const { roomId } = req.body;
        if (tenantId && roomId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const activeSession = await prisma_1.hotelDb.getAdapter().checkinSession.findFirst({
                where: {
                    roomId,
                    tenantId,
                    status: 'ACTIVE'
                }
            });
            if (activeSession) {
                req.body.sessionId = activeSession.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                req.session = activeSession;
                logger_1.logger.info('セッション情報を自動設定', {
                    sessionId: activeSession.id,
                    sessionNumber: activeSession.sessionNumber,
                    roomId
                });
            }
            else {
                logger_1.logger.warn('アクティブセッションが見つかりません（移行期間中）', {
                    roomId,
                    tenantId,
                    endpoint: req.path
                });
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('柔軟なセッションチェックエラー', error);
        // エラーが発生しても処理を継続
        next();
    }
};
exports.flexibleSessionCheck = flexibleSessionCheck;
exports.default = {
    autoSessionMapping: exports.autoSessionMapping,
    legacyApiCompatibility: exports.legacyApiCompatibility,
    requireSession: exports.requireSession,
    validateSessionStatus: exports.validateSessionStatus,
    flexibleSessionCheck: exports.flexibleSessionCheck
};
