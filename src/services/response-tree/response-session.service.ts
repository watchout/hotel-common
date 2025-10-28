import { UpdateSessionRequestDto } from '../../dtos/response-tree/response-tree.dto';
import { ResponseNodeRepository } from '../../repositories/response-tree/response-node.repository';
import { ResponseSessionRepository } from '../../repositories/response-tree/response-session.repository';
import { ResponseTreeRepository } from '../../repositories/response-tree/response-tree.repository';

import type { SessionDto, CreateSessionRequestDto} from '../../dtos/response-tree/response-tree.dto';

/**
 * レスポンスセッションサービス
 * ビジネスロジックを担当
 */
export class ResponseSessionService {
  private responseSessionRepository: ResponseSessionRepository;
  private responseNodeRepository: ResponseNodeRepository;
  private responseTreeRepository: ResponseTreeRepository;
  
  constructor() {
    this.responseSessionRepository = new ResponseSessionRepository();
    this.responseNodeRepository = new ResponseNodeRepository();
    this.responseTreeRepository = new ResponseTreeRepository();
  }
  
  /**
   * セッションを開始
   */
  async startSession(data: CreateSessionRequestDto): Promise<any> {
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
  async getSession(sessionId: string): Promise<SessionDto | null> {
    const session = await this.responseSessionRepository.findSessionById(sessionId);
    
    if (!session) {
      return null;
    }
    
    // 履歴データを整形
    const history = session.history.map((item: any) => ({
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
      interfaceType: session.interfaceType as 'tv' | 'mobile',
      currentNodeId: session.currentNodeId,
      history
    };
  }
  
  /**
   * セッションを更新
   */
  async updateSession(sessionId: string, currentNodeId: string, action: string): Promise<any> {
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
  async endSession(sessionId: string): Promise<any> {
    return this.responseSessionRepository.endSession(sessionId);
  }
}