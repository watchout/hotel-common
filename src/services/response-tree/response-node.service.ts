import { ResponseNodeRepository } from '../../repositories/response-tree/response-node.repository';

import type { ResponseNodeDto, ResponseNodeDetailDto, ResponseNodeSearchResultDto, CreateNodeRequestDto } from '../../dtos/response-tree/response-tree.dto';

/**
 * レスポンスノードサービス
 * ビジネスロジックを担当
 */
export class ResponseNodeService {
  private responseNodeRepository: ResponseNodeRepository;
  
  constructor() {
    this.responseNodeRepository = new ResponseNodeRepository();
  }
  
  /**
   * ノード詳細を取得
   */
  async getNodeById(nodeId: string, language: string, includeChildren: boolean): Promise<ResponseNodeDetailDto | null> {
    const node = await this.responseNodeRepository.findNodeById(nodeId, language);
    
    if (!node) {
      return null;
    }
    
    const result: ResponseNodeDetailDto = {
      id: node.id,
      treeId: node.treeId,
      type: node.type as 'category' | 'question',
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
        type: child.type as 'category' | 'question',
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
  async getChildNodes(nodeId: string, language: string): Promise<ResponseNodeDto[]> {
    const children = await this.responseNodeRepository.findChildNodes(nodeId, language);
    
    return children.map(child => ({
      id: child.id,
      treeId: child.treeId,
      type: child.type as 'category' | 'question',
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
  async searchNodes(query: string, treeId: string | undefined, language: string, limit: number): Promise<ResponseNodeSearchResultDto[]> {
    const results = await this.responseNodeRepository.searchNodes(query, treeId, language, limit);
    
    return results.map(result => ({
      id: result.id,
      treeId: result.treeId,
      type: result.type as 'category' | 'question',
      title: result.title,
      description: result.description,
      icon: result.icon,
      relevance: result.relevance
    }));
  }
  
  /**
   * ノードを作成
   */
  async createNode(treeId: string, data: CreateNodeRequestDto): Promise<ResponseNodeDto> {
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
      type: node.type as 'category' | 'question',
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
  async updateNode(nodeId: string, data: {
    title?: string;
    description?: string;
    icon?: string;
    order?: number;
    parentId?: string;
    answer?: any;
    translations?: Array<{
      language: string;
      title: string;
      answer?: any;
    }>;
  }): Promise<ResponseNodeDto | null> {
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
        await this.responseNodeRepository.updateNodeTranslation(
          nodeId,
          translation.language,
          {
            title: translation.title,
            answer: translation.answer
          }
        );
      }
    }
    
    return {
      id: node.id,
      treeId: node.treeId,
      type: node.type as 'category' | 'question',
      title: node.title,
      description: node.description,
      icon: node.icon,
      order: node.order,
      parentId: node.parentId,
      isRoot: node.isRoot
    };
  }
}