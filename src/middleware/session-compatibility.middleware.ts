import { Request, Response, NextFunction } from 'express';
import { hotelDb } from '../database/prisma';
import { logger } from '../utils/logger';

/**
 * セッション互換性ミドルウェア
 * 既存APIの後方互換性を確保
 */

/**
 * 注文API用セッション自動紐付けミドルウェア
 * セッションIDが未設定の注文に対して自動でセッションを検索・紐付け
 */
export const autoSessionMapping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // POSTリクエスト（注文作成）の場合のみ処理
    if (req.method === 'POST' && req.body.roomId) {
      const tenantId = (req as any).user?.tenant_id;
      const { roomId } = req.body;

      if (tenantId && roomId) {
        // アクティブなセッションを検索
        const activeSession = await hotelDb.getAdapter().checkinSession.findFirst({
          where: {
            roomId,
            tenantId,
            status: 'ACTIVE'
          }
        });

        if (activeSession) {
          // リクエストボディにセッションIDを追加
          req.body.sessionId = activeSession.id;
          logger.info('自動セッション紐付け実行', {
            roomId,
            sessionId: activeSession.id,
            sessionNumber: activeSession.sessionNumber
          });
        } else {
          logger.warn('アクティブセッションが見つかりません', { roomId, tenantId });
        }
      }
    }

    next();
  } catch (error) {
    logger.error('セッション自動紐付けエラー', error);
    // エラーが発生してもAPIの実行は継続
    next();
  }
};

/**
 * レガシーAPI互換性ミドルウェア
 * セッション情報なしでも動作するよう既存APIを拡張
 */
export const legacyApiCompatibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // レスポンスを拡張してセッション情報を含める
    const originalJson = res.json;
    
    res.json = function(body: any) {
      // 注文データにセッション情報を追加
      if (body && body.order && body.order.roomId) {
        addSessionInfoToResponse(body, (req as any).user?.tenant_id);
      }
      
      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    logger.error('レガシーAPI互換性ミドルウェアエラー', error);
    next();
  }
};

/**
 * レスポンスにセッション情報を追加
 */
async function addSessionInfoToResponse(responseBody: any, tenantId: string) {
  try {
    if (responseBody.order && responseBody.order.roomId && tenantId) {
      const session = await hotelDb.getAdapter().checkinSession.findFirst({
        where: {
          roomId: responseBody.order.roomId,
          tenantId,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          sessionNumber: true,
          guestInfo: true,
          status: true
        }
      });

      if (session) {
        responseBody.order.session = {
          id: session.id,
          sessionNumber: session.sessionNumber,
          guestName: (session.guestInfo as any)?.primaryGuest?.firstName + ' ' + (session.guestInfo as any)?.primaryGuest?.lastName,
          status: session.status
        };
      }
    }
  } catch (error) {
    logger.error('レスポンスセッション情報追加エラー', error);
    // エラーが発生してもレスポンスは返す
  }
}

/**
 * セッション必須チェックミドルウェア
 * 新しいAPIでセッションが必須の場合に使用
 */
export const requireSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).user?.tenant_id;
    const { roomId, sessionId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'TENANT_ID_REQUIRED',
        message: 'テナントIDが必要です'
      });
    }

    // セッションIDが指定されている場合は検証
    if (sessionId) {
      const session = await hotelDb.getAdapter().checkinSession.findFirst({
        where: {
          id: sessionId,
          tenantId
        }
      });

      if (!session) {
        return res.status(404).json({
          error: 'SESSION_NOT_FOUND',
          message: '指定されたセッションが見つかりません'
        });
      }

      // リクエストにセッション情報を追加
      (req as any).session = session;
    } else if (roomId) {
      // セッションIDが未指定の場合、部屋IDからアクティブセッションを検索
      const activeSession = await hotelDb.getAdapter().checkinSession.findFirst({
        where: {
          roomId,
          tenantId,
          status: 'ACTIVE'
        }
      });

      if (!activeSession) {
        return res.status(400).json({
          error: 'NO_ACTIVE_SESSION',
          message: '指定された部屋にアクティブなセッションがありません。先にチェックイン処理を行ってください。'
        });
      }

      // リクエストボディとセッション情報を更新
      req.body.sessionId = activeSession.id;
      (req as any).session = activeSession;
    } else {
      return res.status(400).json({
        error: 'SESSION_OR_ROOM_REQUIRED',
        message: 'セッションIDまたは部屋IDが必要です'
      });
    }

    next();
  } catch (error) {
    logger.error('セッション必須チェックエラー', error);
    return res.status(500).json({
      error: 'SESSION_CHECK_ERROR',
      message: 'セッション確認中にエラーが発生しました'
    });
  }
};

/**
 * セッション状態チェックミドルウェア
 * セッションが適切な状態かを確認
 */
export const validateSessionStatus = (allowedStatuses: string[] = ['ACTIVE']) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = (req as any).session;

      if (!session) {
        return res.status(400).json({
          error: 'SESSION_REQUIRED',
          message: 'セッション情報が必要です'
        });
      }

      if (!allowedStatuses.includes(session.status)) {
        return res.status(400).json({
          error: 'INVALID_SESSION_STATUS',
          message: `セッションの状態が無効です。許可された状態: ${allowedStatuses.join(', ')}`
        });
      }

      next();
    } catch (error) {
      logger.error('セッション状態チェックエラー', error);
      return res.status(500).json({
        error: 'SESSION_STATUS_CHECK_ERROR',
        message: 'セッション状態確認中にエラーが発生しました'
      });
    }
  };
};

/**
 * 移行期間用の柔軟なセッションチェック
 * セッションがない場合でも警告ログを出すだけで処理を継続
 */
export const flexibleSessionCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).user?.tenant_id;
    const { roomId } = req.body;

    if (tenantId && roomId) {
      const activeSession = await hotelDb.getAdapter().checkinSession.findFirst({
        where: {
          roomId,
          tenantId,
          status: 'ACTIVE'
        }
      });

      if (activeSession) {
        req.body.sessionId = activeSession.id;
        (req as any).session = activeSession;
        logger.info('セッション情報を自動設定', {
          sessionId: activeSession.id,
          sessionNumber: activeSession.sessionNumber,
          roomId
        });
      } else {
        logger.warn('アクティブセッションが見つかりません（移行期間中）', {
          roomId,
          tenantId,
          endpoint: req.path
        });
      }
    }

    next();
  } catch (error) {
    logger.error('柔軟なセッションチェックエラー', error);
    // エラーが発生しても処理を継続
    next();
  }
};

export default {
  autoSessionMapping,
  legacyApiCompatibility,
  requireSession,
  validateSessionStatus,
  flexibleSessionCheck
};
