import { ResponseTreeRepository } from '../../repositories/response-tree/response-tree.repository';
import { ResponseNodeRepository } from '../../repositories/response-tree/response-node.repository';
import { ResponseTreeDto, CreateTreeRequestDto, UpdateTreeRequestDto, PublishTreeRequestDto } from '../../dtos/response-tree/response-tree.dto';
import { hotelDb } from '../../database/prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * レスポンスツリーサービス
 * ビジネスロジックを担当
 */
export class ResponseTreeService {
  private responseTreeRepository: ResponseTreeRepository;
  private responseNodeRepository: ResponseNodeRepository;
  
  constructor() {
    this.responseTreeRepository = new ResponseTreeRepository();
    this.responseNodeRepository = new ResponseNodeRepository();
  }
  
  /**
   * アクティブなレスポンスツリー一覧を取得
   */
  async getActiveTrees(tenantId: string, language: string): Promise<ResponseTreeDto[]> {
    const trees = await this.responseTreeRepository.findActiveTrees(tenantId);
    return trees.map(tree => ({
      id: tree.id,
      name: tree.name,
      description: tree.description,
      version: tree.version,
      publishedAt: tree.publishedAt
    }));
  }
  
  /**
   * レスポンスツリー詳細を取得
   */
  async getTreeById(treeId: string, language: string, includeNodes: boolean): Promise<ResponseTreeDto | null> {
    const tree = await this.responseTreeRepository.findTreeById(treeId);
    
    if (!tree) {
      return null;
    }
    
    const result: any = {
      id: tree.id,
      name: tree.name,
      description: tree.description,
      version: tree.version,
      publishedAt: tree.publishedAt
    };
    
    if (includeNodes) {
      const rootNodes = await this.responseTreeRepository.findRootNodes(treeId, language);
      result.rootNodes = rootNodes;
    }
    
    return result;
  }
  
  /**
   * レスポンスツリーを作成
   */
  async createTree(data: CreateTreeRequestDto, userId: string): Promise<ResponseTreeDto> {
    const tree = await this.responseTreeRepository.createTree({
      name: data.name,
      description: data.description,
      tenantId: data.tenantId || 'test-tenant-001', // 実際の実装ではユーザーのテナントIDを使用
      isActive: data.isActive || false
    });
    
    return {
      id: tree.id,
      name: tree.name,
      description: tree.description,
      version: tree.version,
      publishedAt: tree.publishedAt
    };
  }
  
  /**
   * レスポンスツリーを更新
   */
  async updateTree(treeId: string, data: UpdateTreeRequestDto): Promise<ResponseTreeDto | null> {
    const tree = await this.responseTreeRepository.updateTree(treeId, {
      name: data.name,
      description: data.description,
      isActive: data.isActive
    });
    
    if (!tree) {
      return null;
    }
    
    return {
      id: tree.id,
      name: tree.name,
      description: tree.description,
      version: tree.version,
      publishedAt: tree.publishedAt
    };
  }
  
  /**
   * レスポンスツリーを公開
   */
  async publishTree(treeId: string, data: PublishTreeRequestDto, userId: string): Promise<ResponseTreeDto | null> {
    // 現在のツリー情報を取得
    const tree = await this.responseTreeRepository.findTreeById(treeId);
    
    if (!tree) {
      return null;
    }
    
    // ツリーのすべてのノードを取得（スナップショット用）
    const nodes = await hotelDb.getAdapter().responseNode.findMany({
      where: { treeId }
      // リレーションは別途取得する必要があります
    });
    
    // スナップショットデータを作成
    const snapshotData = {
      tree: {
        id: tree.id,
        name: tree.name,
        description: tree.description,
        version: tree.version + 1
      },
      nodes: nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        title: node.title,
        description: node.description,
        icon: node.icon,
        order: node.order,
        parentId: node.parentId,
        isRoot: node.isRoot,
        answer: node.answer
        // 翻訳データは別途取得する必要があります
      }))
    };
    
    // トランザクションで更新とバージョン作成を行う
    const result = await hotelDb.transaction(async (tx) => {
      // ツリーを公開状態に更新
      const updatedTree = await tx.responseTree.update({
        where: { id: treeId },
        data: {
          publishedAt: new Date(),
          version: {
            increment: 1
          },
          updatedAt: new Date() // 必須フィールドを追加
        }
      });
      
      // バージョンを作成
      await tx.responseTreeVersion.create({
        data: {
          id: uuidv4(), // IDを文字列で自動生成
          treeId,
          version: updatedTree.version,
          snapshot: snapshotData,
          createdBy: userId,
          createdAt: new Date(), // 必須フィールドを追加
          updatedAt: new Date() // 必須フィールドを追加
        }
      });
      
      return updatedTree;
    });
    
    return {
      id: result.id,
      name: result.name,
      description: result.description || '',
      version: result.version,
      publishedAt: result.publishedAt || undefined
    };
  }
}