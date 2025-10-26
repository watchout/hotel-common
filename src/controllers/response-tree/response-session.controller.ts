
import { ResponseSessionService } from '../../services/response-tree/response-session.service';
import { HotelLogger } from '../../utils/logger';

import type { CreateSessionRequestDto, UpdateSessionRequestDto } from '../../dtos/response-tree/response-tree.dto';
import type { Request, Response } from 'express';

/**
 * レスポンスセッションコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export class ResponseSessionController {
  private responseSessionService: ResponseSessionService;
  private logger: HotelLogger;

  constructor() {
    this.responseSessionService = new ResponseSessionService();
    this.logger = HotelLogger.getInstance();
  }

  /**
   * セッション開始
   */
  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateSessionRequestDto = req.body;
      
      if (!data.deviceId && !data.roomId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Either deviceId or roomId is required'
          }
        });
        return;
      }
      
      const session = await this.responseSessionService.startSession({
        deviceId: data.deviceId,
        roomId: data.roomId,
        language: data.language || 'ja',
        interfaceType: data.interfaceType || 'tv'
      });
      
      res.json({
        success: true,
        data: session
      });
    } catch (error: Error) {
      this.logger.error('Error starting session:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to start session'
        }
      });
    }
  }

  /**
   * セッション状態取得
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      
      const session = await this.responseSessionService.getSession(sessionId);
      
      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }
      
      res.json({
        success: true,
        data: session
      });
    } catch (error: Error) {
      this.logger.error('Error getting session:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get session'
        }
      });
    }
  }

  /**
   * セッション更新
   */
  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const data: UpdateSessionRequestDto = req.body;
      
      if (!data.currentNodeId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'currentNodeId is required'
          }
        });
        return;
      }
      
      const session = await this.responseSessionService.updateSession(
        sessionId,
        data.currentNodeId,
        data.action || 'select_node'
      );
      
      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }
      
      res.json({
        success: true,
        data: session
      });
    } catch (error: Error) {
      this.logger.error('Error updating session:', { error: error instanceof Error ? error : new Error('Unknown error') });
      
      if ((error as Error).message === 'Node not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NODE_NOT_FOUND',
            message: 'Node not found'
          }
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update session'
        }
      });
    }
  }

  /**
   * セッション終了
   */
  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      
      const session = await this.responseSessionService.endSession(sessionId);
      
      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }
      
      res.json({
        success: true,
        data: session
      });
    } catch (error: Error) {
      this.logger.error('Error ending session:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to end session'
        }
      });
    }
  }
}