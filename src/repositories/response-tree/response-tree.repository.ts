import { v4 as uuidv4 } from 'uuid';

import { hotelDb } from '../../database/prisma';

/**
 * レスポンスツリーリポジトリ
 * データベースとのやり取りを担当
 */
export class ResponseTreeRepository {
  /**
   * アクティブなレスポンスツリー一覧を取得
   */
  async findActiveTrees(tenantId: string): Promise<any[]> {
    return hotelDb.getAdapter().responseTree.findMany({
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
  async findTreeById(treeId: string): Promise<any> {
    return hotelDb.getAdapter().responseTree.findUnique({
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
  async findRootNodes(treeId: string, language: string): Promise<any[]> {
    // 型エラーを回避するために、一度findManyを実行してから別途翻訳を取得する方法に変更
    const nodes = await hotelDb.getAdapter().responseNode.findMany({
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
  async createTree(data: {
    name: string;
    description?: string;
    tenantId: string;
    isActive: boolean;
  }): Promise<any> {
    return hotelDb.getAdapter().responseTree.create({
      data: {
        id: uuidv4(), // IDを自動生成
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
  async updateTree(treeId: string, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<any> {
    return hotelDb.getAdapter().responseTree.update({
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
  async publishTree(treeId: string): Promise<any> {
    return hotelDb.getAdapter().responseTree.update({
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
  async createTreeVersion(data: {
    treeId: string;
    version: number;
    data: any;
    createdBy: string;
    comment?: string;
  }): Promise<any> {
    return hotelDb.getAdapter().responseTreeVersion.create({
      data: {
        id: uuidv4(), // IDを文字列で自動生成
        treeId: data.treeId,
        version: data.version,
        snapshot: data.data,
        createdBy: data.createdBy,
        createdAt: new Date() // 必須フィールドを追加
      }
    });
  }
}