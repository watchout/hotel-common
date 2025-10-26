"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseSessionService = void 0;
const response_node_repository_1 = require("../../repositories/response-tree/response-node.repository");
const response_session_repository_1 = require("../../repositories/response-tree/response-session.repository");
const response_tree_repository_1 = require("../../repositories/response-tree/response-tree.repository");
/**
 * レスポンスセッションサービス
 * ビジネスロジックを担当
 */
class ResponseSessionService {
    responseSessionRepository;
    responseNodeRepository;
    responseTreeRepository;
    constructor() {
        this.responseSessionRepository = new response_session_repository_1.ResponseSessionRepository();
        this.responseNodeRepository = new response_node_repository_1.ResponseNodeRepository();
        this.responseTreeRepository = new response_tree_repository_1.ResponseTreeRepository();
    }
    /**
     * セッションを開始
     */
    async startSession(data) {
        // セッション作成
        const session = await this.responseSessionRepository.createSession({
            deviceId: data.deviceId,
            roomId: data.roomId,
            language: data.language || 'ja',
            interfaceType: data.interfaceType || 'tv'
        });
        // アクティブなレスポンスツリーを取得（テナントIDは実際の実装では適切に設定）
        const trees = await this.responseTreeRepository.findActiveTrees('test-tenant-001');
        if (trees.length === 0) {
            return {
                sessionId: session.sessionId,
                startedAt: session.startedAt,
                language: session.language,
                interfaceType: session.interfaceType,
                initialNodes: []
            };
        }
        // 最新のツリーを使用
        const latestTree = trees[0];
        // ルートノードを取得
        const rootNodes = await this.responseTreeRepository.findRootNodes(latestTree.id, session.language);
        return {
            sessionId: session.sessionId,
            startedAt: session.startedAt,
            language: session.language,
            interfaceType: session.interfaceType,
            initialNodes: rootNodes
        };
    }
    /**
     * セッションを取得
     */
    async getSession(sessionId) {
        const session = await this.responseSessionRepository.findSessionById(sessionId);
        if (!session) {
            return null;
        }
        // 履歴データを整形
        const history = session.history.map((item) => ({
            nodeId: item.nodeId,
            title: item.node.title,
            timestamp: item.timestamp
        }));
        return {
            sessionId: session.sessionId,
            startedAt: session.startedAt,
            lastActivityAt: session.lastActivityAt,
            endedAt: session.endedAt,
            language: session.language,
            interfaceType: session.interfaceType,
            currentNodeId: session.currentNodeId,
            history
        };
    }
    /**
     * セッションを更新
     */
    async updateSession(sessionId, currentNodeId, action) {
        // ノード情報を取得
        const node = await this.responseNodeRepository.findNodeById(currentNodeId, 'ja');
        if (!node) {
            throw new Error('Node not found');
        }
        // セッション更新
        await this.responseSessionRepository.updateSession(sessionId, {
            currentNodeId,
            lastActivityAt: new Date()
        });
        // 履歴追加
        await this.responseSessionRepository.addSessionHistory({
            sessionId,
            nodeId: currentNodeId,
            action: action || 'select_node'
        });
        // 更新後のセッション取得
        const session = await this.responseSessionRepository.findSessionById(sessionId);
        if (!session) {
            return null;
        }
        return {
            sessionId: session.sessionId,
            currentNodeId,
            lastActivityAt: session.lastActivityAt,
            node: {
                id: node.id,
                type: node.type,
                title: node.title,
                description: node.description,
                icon: node.icon,
                answer: node.answer
            }
        };
    }
    /**
     * セッションを終了
     */
    async endSession(sessionId) {
        return this.responseSessionRepository.endSession(sessionId);
    }
}
exports.ResponseSessionService = ResponseSessionService;
