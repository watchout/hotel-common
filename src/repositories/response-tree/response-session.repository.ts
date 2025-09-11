import { PrismaClient } from '@prisma/client';
import { hotelDb } from '../../database/index';
import { v4 as uuidv4 } from 'uuid';

/**
 * レスポンスセッションリポジトリ
 * データベースとのやり取りを担当
 */
export class ResponseSessionRepository {
  /**
   * セッションを作成
   */
  async createSession(data: {
    deviceId?: number;
    roomId?: string;
    language: string;
    interfaceType: string;
  }): Promise<any> {
    const sessionId = uuidv4();
    
    return hotelDb.getAdapter().responseTreeSession.create({
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
  async findSessionById(sessionId: string): Promise<any> {
    return hotelDb.getAdapter().responseTreeSession.findFirst({
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
  async updateSession(sessionId: string, data: {
    currentNodeId?: string;
    lastActivityAt?: Date;
    endedAt?: Date;
  }): Promise<any> {
    return hotelDb.getAdapter().responseTreeSession.updateMany({
      where: { sessionId },
      data
    });
  }
  
  /**
   * セッション履歴を追加
   */
  async addSessionHistory(data: {
    sessionId: string;
    nodeId: string;
    action: string;
  }): Promise<any> {
    const session = await hotelDb.getAdapter().responseTreeSession.findFirst({
      where: { sessionId: data.sessionId },
      select: { id: true }
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    return hotelDb.getAdapter().responseTreeHistory.create({
      data: {
        id: uuidv4(),
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
  async getSessionHistory(sessionId: string, limit: number = 10): Promise<any[]> {
    const session = await hotelDb.getAdapter().responseTreeSession.findFirst({
      where: { sessionId },
      select: { id: true }
    });
    
    if (!session) {
      return [];
    }
    
    return hotelDb.getAdapter().responseTreeHistory.findMany({
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
  async endSession(sessionId: string): Promise<any> {
    const now = new Date();
    
    const session = await hotelDb.getAdapter().responseTreeSession.findFirst({
      where: { sessionId },
      select: {
        id: true,
        startedAt: true
      }
    });
    
    if (!session) {
      return null;
    }
    
    await hotelDb.getAdapter().responseTreeSession.update({
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