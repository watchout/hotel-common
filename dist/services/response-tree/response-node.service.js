"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseNodeService = void 0;
const response_node_repository_1 = require("../../repositories/response-tree/response-node.repository");
/**
 * レスポンスノードサービス
 * ビジネスロジックを担当
 */
class ResponseNodeService {
    responseNodeRepository;
    constructor() {
        this.responseNodeRepository = new response_node_repository_1.ResponseNodeRepository();
    }
    /**
     * ノード詳細を取得
     */
    async getNodeById(nodeId, language, includeChildren) {
        const node = await this.responseNodeRepository.findNodeById(nodeId, language);
        if (!node) {
            return null;
        }
        const result = {
            id: node.id,
            treeId: node.treeId,
            type: node.type,
            title: node.title,
            description: node.description,
            icon: node.icon,
            order: node.order,
            parentId: node.parentId,
            isRoot: node.isRoot,
            answer: node.answer
        };
        if (includeChildren) {
            const children = await this.responseNodeRepository.findChildNodes(nodeId, language);
            result.children = children.map(child => ({
                id: child.id,
                treeId: child.treeId,
                type: child.type,
                title: child.title,
                description: child.description,
                icon: child.icon,
                order: child.order,
                parentId: nodeId,
                isRoot: child.isRoot
            }));
        }
        return result;
    }
    /**
     * 子ノード一覧を取得
     */
    async getChildNodes(nodeId, language) {
        const children = await this.responseNodeRepository.findChildNodes(nodeId, language);
        return children.map(child => ({
            id: child.id,
            treeId: child.treeId,
            type: child.type,
            title: child.title,
            description: child.description,
            icon: child.icon,
            order: child.order,
            parentId: nodeId,
            isRoot: child.isRoot
        }));
    }
    /**
     * ノード検索
     */
    async searchNodes(query, treeId, language, limit) {
        const results = await this.responseNodeRepository.searchNodes(query, treeId, language, limit);
        return results.map(result => ({
            id: result.id,
            treeId: result.treeId,
            type: result.type,
            title: result.title,
            description: result.description,
            icon: result.icon,
            relevance: result.relevance
        }));
    }
    /**
     * ノードを作成
     */
    async createNode(treeId, data) {
        // ノードを作成
        const node = await this.responseNodeRepository.createNode({
            treeId,
            type: data.type,
            title: data.title,
            description: data.description,
            icon: data.icon,
            order: data.order,
            parentId: data.parentId,
            isRoot: data.isRoot || false,
            answer: data.answer
        });
        // 翻訳がある場合は作成
        if (data.translations && data.translations.length > 0) {
            for (const translation of data.translations) {
                await this.responseNodeRepository.createNodeTranslation({
                    nodeId: node.id,
                    language: translation.language,
                    title: translation.title,
                    answer: translation.answer
                });
            }
        }
        return {
            id: node.id,
            treeId: node.treeId,
            type: node.type,
            title: node.title,
            description: node.description,
            icon: node.icon,
            order: node.order,
            parentId: node.parentId,
            isRoot: node.isRoot
        };
    }
    /**
     * ノードを更新
     */
    async updateNode(nodeId, data) {
        // ノードを更新
        const node = await this.responseNodeRepository.updateNode(nodeId, {
            title: data.title,
            description: data.description,
            icon: data.icon,
            order: data.order,
            parentId: data.parentId,
            answer: data.answer
        });
        if (!node) {
            return null;
        }
        // 翻訳がある場合は更新
        if (data.translations && data.translations.length > 0) {
            for (const translation of data.translations) {
                await this.responseNodeRepository.updateNodeTranslation(nodeId, translation.language, {
                    title: translation.title,
                    answer: translation.answer
                });
            }
        }
        return {
            id: node.id,
            treeId: node.treeId,
            type: node.type,
            title: node.title,
            description: node.description,
            icon: node.icon,
            order: node.order,
            parentId: node.parentId,
            isRoot: node.isRoot
        };
    }
}
exports.ResponseNodeService = ResponseNodeService;
