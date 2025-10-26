
import { ResponseTreeService } from '../../services/response-tree/response-tree.service';
import { HotelLogger } from '../../utils/logger';

import type { Request, Response } from 'express';

/**
 * レスポンスツリーコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export class ResponseTreeController {
  private responseTreeService: ResponseTreeService;

  private logger: HotelLogger;

  constructor() {
    this.responseTreeService = new ResponseTreeService();
    this.logger = HotelLogger.getInstance();
  }

  /**
   * アクティブなレスポンスツリー一覧を取得
   */
  async getActiveTrees(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.query.tenantId as string || (req.user as any)?.tenantId || 'test-tenant-001';
      const language = req.query.language as string || 'ja';
      
      const trees = await this.responseTreeService.getActiveTrees(tenantId, language);
      
      res.json({
        success: true,
        data: trees
      });
    } catch (error: unknown) {
      this.logger.error('Error getting active trees:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get active trees'
        }
      });
    }
  }

  /**
   * レスポンスツリー詳細を取得
   */
  async getTreeById(req: Request, res: Response): Promise<void> {
    try {
      const treeId = req.params.treeId;
      const language = req.query.language as string || 'ja';
      const includeNodes = req.query.includeNodes === 'true';
      
      const tree = await this.responseTreeService.getTreeById(treeId, language, includeNodes);
      
      if (!tree) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TREE_NOT_FOUND',
            message: 'Response tree not found'
          }
        });
        return;
      }
      
      res.json({
        success: true,
        data: tree
      });
    } catch (error: unknown) {
      this.logger.error('Error getting tree by id:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get tree details'
        }
      });
    }
  }
}