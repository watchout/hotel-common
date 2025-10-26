
import { ResponseNodeService } from '../../services/response-tree/response-node.service';
import { HotelLogger } from '../../utils/logger';

import type { Request, Response } from 'express';

/**
 * レスポンスノードコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export class ResponseNodeController {
  private responseNodeService: ResponseNodeService;
  private logger: HotelLogger;

  constructor() {
    this.responseNodeService = new ResponseNodeService();
    this.logger = HotelLogger.getInstance();
  }

  /**
   * ノード詳細を取得
   */
  async getNodeById(req: Request, res: Response): Promise<void> {
    try {
      const nodeId = req.params.nodeId;
      const language = req.query.language as string || 'ja';
      const includeChildren = req.query.includeChildren !== 'false';
      
      const node = await this.responseNodeService.getNodeById(nodeId, language, includeChildren);
      
      if (!node) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NODE_NOT_FOUND',
            message: 'Response node not found'
          }
        });
        return;
      }
      
      res.json({
        success: true,
        data: node
      });
    } catch (error) {
      this.logger.error('Error getting node by id:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get node details'
        }
      });
    }
  }

  /**
   * 子ノード一覧を取得
   */
  async getChildNodes(req: Request, res: Response): Promise<void> {
    try {
      const nodeId = req.params.nodeId;
      const language = req.query.language as string || 'ja';
      
      const children = await this.responseNodeService.getChildNodes(nodeId, language);
      
      res.json({
        success: true,
        data: children
      });
    } catch (error) {
      this.logger.error('Error getting child nodes:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get child nodes'
        }
      });
    }
  }

  /**
   * ノード検索
   */
  async searchNodes(req: Request, res: Response): Promise<void> {
    try {
      const treeId = req.query.treeId as string;
      const query = req.query.query as string;
      const language = req.query.language as string || 'ja';
      const limit = parseInt(req.query.limit as string || '10', 10);
      
      if (!query) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter is required'
          }
        });
        return;
      }
      
      const results = await this.responseNodeService.searchNodes(query, treeId, language, limit);
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      this.logger.error('Error searching nodes:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search nodes'
        }
      });
    }
  }
}