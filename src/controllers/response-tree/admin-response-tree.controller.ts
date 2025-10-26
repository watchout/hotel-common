
import { ResponseNodeService } from '../../services/response-tree/response-node.service';
import { ResponseTreeService } from '../../services/response-tree/response-tree.service';
import { HotelLogger } from '../../utils/logger';

import type { CreateTreeRequestDto, UpdateTreeRequestDto, PublishTreeRequestDto, CreateNodeRequestDto } from '../../dtos/response-tree/response-tree.dto';
import type { Request, Response } from 'express';

/**
 * 管理者向けレスポンスツリーコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export class AdminResponseTreeController {
  private responseTreeService: ResponseTreeService;
  private responseNodeService: ResponseNodeService;
  private logger: HotelLogger;

  constructor() {
    this.responseTreeService = new ResponseTreeService();
    this.responseNodeService = new ResponseNodeService();
    this.logger = HotelLogger.getInstance();
  }

  /**
   * レスポンスツリーを作成
   */
  async createTree(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTreeRequestDto = req.body;
      const userId = req.user?.user_id || 'system';
      
      if (!data.name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'name is required'
          }
        });
        return;
      }
      
      const tree = await this.responseTreeService.createTree(data, userId);
      
      res.status(201).json({
        success: true,
        data: tree
      });
    } catch (error: unknown) {
      this.logger.error('Error creating tree:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create tree'
        }
      });
    }
  }

  /**
   * レスポンスツリーを更新
   */
  async updateTree(req: Request, res: Response): Promise<void> {
    try {
      const treeId = req.params.treeId;
      const data: UpdateTreeRequestDto = req.body;
      
      const tree = await this.responseTreeService.updateTree(treeId, data);
      
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
      this.logger.error('Error updating tree:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update tree'
        }
      });
    }
  }

  /**
   * レスポンスツリーを公開
   */
  async publishTree(req: Request, res: Response): Promise<void> {
    try {
      const treeId = req.params.treeId;
      const data: PublishTreeRequestDto = req.body;
      const userId = req.user?.user_id || 'system';
      
      const tree = await this.responseTreeService.publishTree(treeId, data, userId);
      
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
      this.logger.error('Error publishing tree:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to publish tree'
        }
      });
    }
  }

  /**
   * ノードを作成
   */
  async createNode(req: Request, res: Response): Promise<void> {
    try {
      const treeId = req.params.treeId;
      const data: CreateNodeRequestDto = req.body;
      
      if (!data.title || !data.type) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'title and type are required'
          }
        });
        return;
      }
      
      // ツリーの存在確認
      const tree = await this.responseTreeService.getTreeById(treeId, 'ja', false);
      
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
      
      const node = await this.responseNodeService.createNode(treeId, data);
      
      res.status(201).json({
        success: true,
        data: node
      });
    } catch (error: unknown) {
      this.logger.error('Error creating node:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create node'
        }
      });
    }
  }
}