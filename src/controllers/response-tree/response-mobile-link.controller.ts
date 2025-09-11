import { Request, Response } from 'express';
import { ResponseMobileLinkService } from '../../services/response-tree/response-mobile-link.service';
import { CreateMobileLinkRequestDto, ConnectMobileLinkRequestDto } from '../../dtos/response-tree/response-tree.dto';
import { HotelLogger } from '../../utils/logger';

/**
 * レスポンスモバイル連携コントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export class ResponseMobileLinkController {
  private responseMobileLinkService: ResponseMobileLinkService;
  private logger: HotelLogger;

  constructor() {
    this.responseMobileLinkService = new ResponseMobileLinkService();
    this.logger = HotelLogger.getInstance();
  }

  /**
   * モバイル連携を作成
   */
  async createMobileLink(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateMobileLinkRequestDto = req.body;
      
      if (!data.sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'sessionId is required'
          }
        });
        return;
      }
      
      const link = await this.responseMobileLinkService.createMobileLink(data);
      
      res.json({
        success: true,
        data: link
      });
    } catch (error) {
      this.logger.error('Error creating mobile link:', { error: error instanceof Error ? error : new Error('Unknown error') });
      
      if ((error as Error).message === 'Session not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create mobile link'
        }
      });
    }
  }

  /**
   * モバイル連携を取得
   */
  async getMobileLink(req: Request, res: Response): Promise<void> {
    try {
      const linkCode = req.params.linkCode;
      
      const link = await this.responseMobileLinkService.getMobileLink(linkCode);
      
      if (!link) {
        res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_LINK_CODE',
            message: 'Invalid or expired link code'
          }
        });
        return;
      }
      
      res.json({
        success: true,
        data: link
      });
    } catch (error) {
      this.logger.error('Error getting mobile link:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get mobile link'
        }
      });
    }
  }

  /**
   * モバイル連携を実行
   */
  async connectMobileLink(req: Request, res: Response): Promise<void> {
    try {
      const linkCode = req.params.linkCode;
      const data: ConnectMobileLinkRequestDto = req.body;
      
      const connection = await this.responseMobileLinkService.connectMobileLink(linkCode, data);
      
      if (!connection) {
        res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_LINK_CODE',
            message: 'Invalid or expired link code'
          }
        });
        return;
      }
      
      res.json({
        success: true,
        data: connection
      });
    } catch (error) {
      this.logger.error('Error connecting mobile link:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to connect mobile link'
        }
      });
    }
  }

  /**
   * QRコード画像を取得
   */
  async getQRCode(req: Request, res: Response): Promise<void> {
    try {
      const linkCode = req.params.linkCode;
      
      // リンクの存在確認
      const link = await this.responseMobileLinkService.getMobileLink(linkCode);
      
      if (!link) {
        res.status(404).json({
          success: false,
          error: {
            code: 'INVALID_LINK_CODE',
            message: 'Invalid or expired link code'
          }
        });
        return;
      }
      
      // QRコード生成
      const qrBuffer = await this.responseMobileLinkService.generateQRCode(linkCode);
      
      // 画像として返す
      res.set('Content-Type', 'image/png');
      res.send(qrBuffer);
    } catch (error) {
      this.logger.error('Error generating QR code:', { error: error instanceof Error ? error : new Error('Unknown error') });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate QR code'
        }
      });
    }
  }
}