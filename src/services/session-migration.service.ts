import { hotelDb } from '../database/prisma';
import { logger } from '../utils/logger';

/**
 * セッション移行サービス
 * 既存の注文データとセッションの紐付け処理
 */
export class SessionMigrationService {
  
  /**
   * 既存注文データのセッション紐付け処理
   */
  static async migrateExistingOrders(tenantId: string): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migratedCount = 0;

    try {
      logger.info('既存注文データのセッション紐付け開始', { tenantId });

      // セッションIDが未設定の注文を取得
      const unmappedOrders = await hotelDb.getAdapter().order.findMany({
        where: {
          tenantId,
          sessionId: null,
          isDeleted: false
        },
        include: {
          OrderItem: true
        },
        orderBy: { createdAt: 'asc' }
      });

      logger.info('未紐付け注文数', { count: unmappedOrders.length, tenantId });

      for (const order of unmappedOrders) {
        try {
          // 注文時刻に基づいてアクティブなセッションを検索
          const session = await this.findSessionForOrder(tenantId, order);
          
          if (session) {
            // 注文にセッションIDを設定
            await hotelDb.getAdapter().order.update({
              where: { id: order.id },
              data: { 
                sessionId: session.id,
                updatedAt: new Date()
              }
            });

            migratedCount++;
            logger.info('注文セッション紐付け完了', {
              orderId: order.id,
              sessionId: session.id,
              sessionNumber: session.sessionNumber,
              roomId: order.roomId
            });
          } else {
            // セッションが見つからない場合の処理
            const fallbackSession = await this.createFallbackSession(tenantId, order);
            
            if (fallbackSession) {
              await hotelDb.getAdapter().order.update({
                where: { id: order.id },
                data: { 
                  sessionId: fallbackSession.id,
                  updatedAt: new Date()
                }
              });

              migratedCount++;
              logger.info('フォールバックセッション作成・紐付け完了', {
                orderId: order.id,
                sessionId: fallbackSession.id,
                sessionNumber: fallbackSession.sessionNumber
              });
            } else {
              errors.push(`注文ID ${order.id}: 適切なセッションが見つからず、フォールバック作成も失敗`);
            }
          }
        } catch (error) {
          const errorMsg = `注文ID ${order.id}: ${error instanceof Error ? error.message : '不明なエラー'}`;
          errors.push(errorMsg);
          logger.error('注文セッション紐付けエラー', { orderId: order.id, error });
        }
      }

      logger.info('既存注文データのセッション紐付け完了', {
        tenantId,
        totalOrders: unmappedOrders.length,
        migratedCount,
        errorCount: errors.length
      });

      return {
        success: errors.length === 0,
        migratedCount,
        errors
      };

    } catch (error) {
      logger.error('セッション移行処理エラー', { tenantId, error });
      return {
        success: false,
        migratedCount,
        errors: [error instanceof Error ? error.message : '不明なエラー']
      };
    }
  }

  /**
   * 注文に対応するセッションを検索
   */
  private static async findSessionForOrder(tenantId: string, order: any) {
    // 1. 同じ部屋で注文時刻に重複するアクティブセッションを検索
    const overlappingSessions = await hotelDb.getAdapter().checkinSession.findMany({
      where: {
        tenantId,
        roomId: order.roomId,
        checkInAt: { lte: order.createdAt },
        OR: [
          { checkOutAt: null }, // まだチェックアウトしていない
          { checkOutAt: { gte: order.createdAt } } // 注文時刻後にチェックアウト
        ]
      },
      orderBy: { checkInAt: 'desc' }
    });

    if (overlappingSessions.length > 0) {
      // 最も近いチェックイン時刻のセッションを選択
      return overlappingSessions[0];
    }

    // 2. 同じ部屋で最も近い時刻のセッションを検索（時刻が前後しても許容）
    const nearestSession = await hotelDb.getAdapter().checkinSession.findFirst({
      where: {
        tenantId,
        roomId: order.roomId
      },
      orderBy: {
        checkInAt: 'desc'
      }
    });

    // 時刻差が24時間以内なら許容
    if (nearestSession) {
      const timeDiff = Math.abs(order.createdAt.getTime() - nearestSession.checkInAt.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff <= 24) {
        return nearestSession;
      }
    }

    return null;
  }

  /**
   * フォールバックセッション作成
   */
  private static async createFallbackSession(tenantId: string, order: any) {
    try {
      // 部屋情報取得
      const room = await hotelDb.getAdapter().room.findFirst({
        where: { id: order.roomId }
      });

      if (!room) {
        logger.error('部屋が見つかりません', { roomId: order.roomId });
        return null;
      }

      // 注文時刻に基づく予約を検索
      const reservation = await hotelDb.getAdapter().reservation.findFirst({
        where: {
          tenantId,
          roomId: order.roomId,
          checkinDate: { lte: order.createdAt },
          checkoutDate: { gte: order.createdAt }
        }
      });

      // 予約が見つからない場合は、最も近い予約を使用
      const fallbackReservation = reservation || await hotelDb.getAdapter().reservation.findFirst({
        where: {
          tenantId,
          roomId: order.roomId
        },
        orderBy: { checkinDate: 'desc' }
      });

      if (!fallbackReservation) {
        logger.error('対応する予約が見つかりません', { roomId: order.roomId });
        return null;
      }

      // セッション番号生成
      const orderDate = order.createdAt.toISOString().split('T')[0].replace(/-/g, '');
      const sessionNumber = `R${room.roomNumber}-${orderDate}-MIGRATED`;

      // フォールバックセッション作成
      const fallbackSession = await hotelDb.getAdapter().checkinSession.create({
        data: {
          tenantId,
          sessionNumber,
          reservationId: fallbackReservation.id,
          roomId: order.roomId,
          guestInfo: {
            primaryGuest: {
              firstName: fallbackReservation.guestName?.split(' ')[0] || 'Unknown',
              lastName: fallbackReservation.guestName?.split(' ').slice(1).join(' ') || '',
              email: fallbackReservation.guestEmail
            },
            migrationType: 'auto-generated'
          },
          adults: 1, // デフォルト値（ReservationモデルにguestCountフィールドが見つからない）
          children: 0, // 現在のDBスキーマにchild_countフィールドなし
          checkInAt: order.createdAt,
          plannedCheckOut: fallbackReservation.checkoutDate,
          status: 'CHECKED_OUT', // 過去の注文なので完了状態
          notes: `自動生成セッション（注文ID: ${order.id}からの移行）`,
          updatedAt: new Date()
        }
      });

      logger.info('フォールバックセッション作成完了', {
        sessionId: fallbackSession.id,
        sessionNumber: fallbackSession.sessionNumber,
        orderId: order.id,
        roomId: order.roomId
      });

      return fallbackSession;

    } catch (error) {
      logger.error('フォールバックセッション作成エラー', { orderId: order.id, error });
      return null;
    }
  }

  /**
   * セッション統計情報取得
   */
  static async getSessionStatistics(tenantId: string) {
    try {
      const [
        totalSessions,
        activeSessions,
        totalOrders,
        mappedOrders,
        unmappedOrders
      ] = await Promise.all([
        hotelDb.getAdapter().checkinSession.count({
          where: { tenantId }
        }),
        hotelDb.getAdapter().checkinSession.count({
          where: { tenantId, status: 'ACTIVE' }
        }),
        hotelDb.getAdapter().order.count({
          where: { tenantId, isDeleted: false }
        }),
        hotelDb.getAdapter().order.count({
          where: { tenantId, isDeleted: false, sessionId: { not: null } }
        }),
        hotelDb.getAdapter().order.count({
          where: { tenantId, isDeleted: false, sessionId: null }
        })
      ]);

      return {
        sessions: {
          total: totalSessions,
          active: activeSessions,
          completed: totalSessions - activeSessions
        },
        orders: {
          total: totalOrders,
          mapped: mappedOrders,
          unmapped: unmappedOrders,
          mappingRate: totalOrders > 0 ? (mappedOrders / totalOrders * 100).toFixed(2) : '0.00'
        }
      };
    } catch (error) {
      logger.error('セッション統計取得エラー', { tenantId, error });
      throw error;
    }
  }

  /**
   * 後方互換性チェック
   */
  static async checkBackwardCompatibility(tenantId: string) {
    try {
      // セッションIDなしでも動作する既存APIの確認
      const compatibilityChecks = {
        ordersWithoutSession: await hotelDb.getAdapter().order.count({
          where: { tenantId, sessionId: null, isDeleted: false }
        }),
        reservationsWithoutSession: await hotelDb.getAdapter().reservation.count({
          where: { 
            tenantId, 
            sessions: { none: {} }
          }
        }),
        activeReservationsNeedingSessions: await hotelDb.getAdapter().reservation.count({
          where: { 
            tenantId, 
            status: 'checked_in',
            sessions: { none: {} }
          }
        })
      };

      return {
        isCompatible: compatibilityChecks.ordersWithoutSession === 0,
        issues: compatibilityChecks,
        recommendations: this.generateCompatibilityRecommendations(compatibilityChecks)
      };
    } catch (error) {
      logger.error('後方互換性チェックエラー', { tenantId, error });
      throw error;
    }
  }

  /**
   * 互換性改善の推奨事項生成
   */
  private static generateCompatibilityRecommendations(checks: any): string[] {
    const recommendations: string[] = [];

    if (checks.ordersWithoutSession > 0) {
      recommendations.push(`${checks.ordersWithoutSession}件の注文がセッションに紐付いていません。migrateExistingOrders()を実行してください。`);
    }

    if (checks.activeReservationsNeedingSessions > 0) {
      recommendations.push(`${checks.activeReservationsNeedingSessions}件のアクティブな予約にセッションが作成されていません。手動でセッションを作成するか、チェックイン処理を再実行してください。`);
    }

    if (checks.reservationsWithoutSession > 0) {
      recommendations.push(`${checks.reservationsWithoutSession}件の予約にセッションがありません。必要に応じてセッションを作成してください。`);
    }

    if (recommendations.length === 0) {
      recommendations.push('すべてのデータが適切にセッションに紐付けられています。');
    }

    return recommendations;
  }
}

export default SessionMigrationService;
