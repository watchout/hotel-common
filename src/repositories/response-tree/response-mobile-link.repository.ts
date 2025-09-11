import { PrismaClient } from '@prisma/client';
import { hotelDb } from '../../database/index';
import { v4 as uuidv4 } from 'uuid';
import { generateRandomString } from '../../utils/string-utils';

/**
 * レスポンスモバイル連携リポジトリ
 * データベースとのやり取りを担当
 */
export class ResponseMobileLinkRepository {
  /**
   * モバイル連携を作成
   */
  async createMobileLink(data: {
    sessionId: string;
    deviceId?: number;
    roomId?: string;
    expiresInMinutes?: number;
  }): Promise<any> {
    const session = await hotelDb.getAdapter().responseTreeSession.findFirst({
      where: { sessionId: data.sessionId },
      select: { id: true }
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // 6桁のランダムコードを生成
    const linkCode = generateRandomString(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
    
    // 有効期限を設定（デフォルト60分）
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresInMinutes || 60));
    
    return hotelDb.getAdapter().responseTreeMobileLink.create({
      data: {
        id: uuidv4(),
        sessionId: session.id,
        qrCodeData: `rt:${linkCode}`,
        deviceId: data.deviceId || 0,
        expiresAt,
        code: linkCode,
        createdAt: new Date()
      }
    });
  }
  
  /**
   * モバイル連携を取得
   */
  async findMobileLinkByCode(linkCode: string): Promise<any> {
    const now = new Date();
    
    return hotelDb.getAdapter().responseTreeMobileLink.findFirst({
      where: {
        qrCodeData: `rt:${linkCode}`,
        expiresAt: { gt: now }
      },
      include: {
        response_tree_sessions: {
          select: {
            sessionId: true,
            deviceId: true,
            roomId: true
          }
        }
      }
    });
  }
  
  /**
   * モバイル連携を実行
   */
  async connectMobileLink(linkCode: string, data: {
    userId?: string;
    deviceInfo?: any;
  }): Promise<any> {
    const now = new Date();
    
    const link = await hotelDb.getAdapter().responseTreeMobileLink.findFirst({
      where: {
        qrCodeData: `rt:${linkCode}`,
        expiresAt: { gt: now }
      },
      select: { id: true }
    });
    
    if (!link) {
      return null;
    }
    
    const connectionId = uuidv4();
    
    return hotelDb.getAdapter().responseTreeMobileLink.update({
      where: { id: link.id },
      data: {
        connectionId
      }
    });
  }
  
  /**
   * モバイル連携を無効化
   */
  async invalidateMobileLink(linkId: string): Promise<any> {
    return hotelDb.getAdapter().responseTreeMobileLink.update({
      where: { id: linkId },
      data: {
        expiresAt: new Date(0) // 過去の日付に設定して無効化
      }
    });
  }
}