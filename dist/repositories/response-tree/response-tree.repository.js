"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTreeRepository = void 0;
const uuid_1 = require("uuid");
const prisma_1 = require("../../database/prisma");
/**
 * レスポンスツリーリポジトリ
 * データベースとのやり取りを担当
 */
class ResponseTreeRepository {
    /**
     * アクティブなレスポンスツリー一覧を取得
     */
    async findActiveTrees(tenantId) {
        return prisma_1.hotelDb.getAdapter().responseTree.findMany({
            where: {
                tenantId,
                isActive: true,
                publishedAt: { not: null }
            },
            select: {
                id: true,
                name: true,
                description: true,
                version: true,
                publishedAt: true
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });
    }
    /**
     * レスポンスツリー詳細を取得
     */
    async findTreeById(treeId) {
        return prisma_1.hotelDb.getAdapter().responseTree.findUnique({
            where: { id: treeId },
            select: {
                id: true,
                tenantId: true,
                name: true,
                description: true,
                version: true,
                publishedAt: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }
    /**
     * ルートノードを取得
     */
    async findRootNodes(treeId, language) {
        // 型エラーを回避するために、一度findManyを実行してから別途翻訳を取得する方法に変更
        const nodes = await prisma_1.hotelDb.getAdapter().responseNode.findMany({
            where: {
                treeId,
                isRoot: true
            },
            select: {
                id: true,
                type: true,
                title: true,
                description: true,
                icon: true,
                order: true,
                isRoot: true
            },
            orderBy: {
                order: 'asc'
            }
        });
        // 翻訳を別途取得する場合はここで実装
        // 例: const translations = await hotelDb.getAdapter().responseNodeTranslation.findMany({ ... });
        return nodes;
    }
    /**
     * レスポンスツリーを作成
     */
    async createTree(data) {
        return prisma_1.hotelDb.getAdapter().responseTree.create({
            data: {
                id: (0, uuid_1.v4)(), // IDを自動生成
                name: data.name,
                description: data.description,
                tenantId: data.tenantId,
                isActive: data.isActive,
                version: 1, // デフォルト値を設定
                updatedAt: new Date(), // 必須フィールドを追加
                createdAt: new Date() // 必須フィールドを追加
            }
        });
    }
    /**
     * レスポンスツリーを更新
     */
    async updateTree(treeId, data) {
        return prisma_1.hotelDb.getAdapter().responseTree.update({
            where: { id: treeId },
            data: {
                ...data,
                updatedAt: new Date() // 必須フィールドを追加
            }
        });
    }
    /**
     * レスポンスツリーを公開
     */
    async publishTree(treeId) {
        return prisma_1.hotelDb.getAdapter().responseTree.update({
            where: { id: treeId },
            data: {
                publishedAt: new Date(),
                version: {
                    increment: 1
                },
                updatedAt: new Date() // 必須フィールドを追加
            }
        });
    }
    /**
     * レスポンスツリーバージョンを作成
     */
    async createTreeVersion(data) {
        // @ts-ignore - Prismaスキーマの型定義が不完全
        return prisma_1.hotelDb.getAdapter().responseTreeVersion.create({
            data: {
                id: (0, uuid_1.v4)(), // IDを文字列で自動生成
                treeId: data.treeId,
                version: data.version,
                snapshot: data.data,
                createdBy: data.createdBy,
                createdAt: new Date() // 必須フィールドを追加
            }
        });
    }
}
exports.ResponseTreeRepository = ResponseTreeRepository;
