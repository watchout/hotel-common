// PrismaClient 型の直接参照は不要のため削除
import { v4 as uuidv4 } from 'uuid';

import { hotelDb } from '../../database/index';

/**
 * レスポンスノードリポジトリ
 * データベースとのやり取りを担当
 */
export class ResponseNodeRepository {
  /**
   * ノード詳細を取得
   */
  async findNodeById(nodeId: string, language: string): Promise<any> {
    const node = await hotelDb.getAdapter().responseNode.findUnique({
      where: { id: nodeId },
      include: {
        response_node_translations: {
          where: { language },
          select: {
            title: true,
            answer: true
          }
        }
      }
    });

    if (!node) {
      return null;
    }

    // 翻訳がある場合はタイトルと回答を置き換え
    if (node.response_node_translations.length > 0) {
      const translation = node.response_node_translations[0];
      return {
        ...node,
        title: translation.title,
        answer: translation.answer || node.answer,
        translations: undefined
      };
    }

    return {
      ...node,
      translations: undefined
    };
  }

  /**
   * 子ノード一覧を取得
   */
  async findChildNodes(parentId: string, language: string): Promise<any[]> {
    const nodes = await hotelDb.getAdapter().responseNode.findMany({
      where: { parentId },
      select: {
        id: true,
        treeId: true,
        type: true,
        title: true,
        description: true,
        icon: true,
        order: true,
        isRoot: true,
        response_node_translations: {
          where: { language },
          select: {
            title: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // 翻訳がある場合はタイトルを置き換え
    return nodes.map((node: any) => {
      if (node.translations.length > 0) {
        return {
          ...node,
          title: node.response_node_translations[0].title,
          translations: undefined
        };
      }
      return {
        ...node,
        translations: undefined
      };
    });
  }

  /**
   * ノード検索
   */
  async searchNodes(query: string, treeId: string | undefined, language: string, limit: number): Promise<any[]> {
    // 基本的な検索条件
    const whereCondition: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    // ツリーIDが指定されている場合は条件に追加
    if (treeId) {
      whereCondition.treeId = treeId;
    }

    // 検索実行
    const nodes = await hotelDb.getAdapter().responseNode.findMany({
      where: whereCondition,
      select: {
        id: true,
        treeId: true,
        type: true,
        title: true,
        description: true,
        icon: true,
        response_node_translations: {
          where: { language },
          select: {
            title: true
          }
        }
      },
      take: limit,
      orderBy: {
        order: 'asc'
      }
    });

    // 翻訳がある場合はタイトルを置き換え
    return nodes.map((node: any) => {
      // 簡易的な関連度スコアを計算（実際の実装ではより高度なアルゴリズムを使用）
      const titleMatch = node.title.toLowerCase().includes(query.toLowerCase()) ? 0.8 : 0;
      const descMatch = node.description?.toLowerCase().includes(query.toLowerCase()) ? 0.5 : 0;
      const relevance = Math.min(1, titleMatch + descMatch);

      if (node.translations.length > 0) {
        return {
          ...node,
          title: node.response_node_translations[0].title,
          translations: undefined,
          relevance: parseFloat(relevance.toFixed(2))
        };
      }
      return {
        ...node,
        translations: undefined,
        relevance: parseFloat(relevance.toFixed(2))
      };
    }).sort((a: any, b: any) => b.relevance - a.relevance); // 関連度の高い順にソート
  }

  /**
   * ノードを作成
   */
  async createNode(data: {
    treeId: string;
    type: string;
    title: string;
    description?: string;
    icon?: string;
    order?: number;
    parentId?: string;
    isRoot?: boolean;
    answer?: any;
  }): Promise<any> {
    return hotelDb.getAdapter().responseNode.create({
      data: {
        id: uuidv4(),
        treeId: data.treeId,
        // @ts-ignore - 型定義が不完全
        nodeType: data.type,
        title: data.title,
        description: data.description,
        icon: data.icon,
        order: data.order || 0,
        parentId: data.parentId,
        isRoot: data.isRoot || false,
        answer: data.answer,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * ノード翻訳を作成
   */
  async createNodeTranslation(data: {
    nodeId: string;
    language: string;
    title: string;
    answer?: any;
  }): Promise<any> {
    return hotelDb.getAdapter().responseNodeTranslation.create({
      data: {
        id: uuidv4(),
        nodeId: data.nodeId,
        // @ts-ignore - 型定義が不完全
        locale: data.language,
        title: data.title,
        answer: data.answer,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * ノードを更新
   */
  async updateNode(nodeId: string, data: {
    title?: string;
    description?: string;
    icon?: string;
    order?: number;
    parentId?: string;
    answer?: any;
  }): Promise<any> {
    return hotelDb.getAdapter().responseNode.update({
      where: { id: nodeId },
      data
    });
  }

  /**
   * ノード翻訳を更新
   */
  async updateNodeTranslation(nodeId: string, language: string, data: {
    title?: string;
    answer?: any;
  }): Promise<any> {
    return hotelDb.getAdapter().responseNodeTranslation.upsert({
      where: {
        nodeId_language: {
          nodeId,
          language
        }
      },
      update: data,
      create: {
        id: uuidv4(),
        nodeId,
        // @ts-ignore - 型定義が不完全
        locale: language,
        title: data.title || '',
        answer: data.answer,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
}
