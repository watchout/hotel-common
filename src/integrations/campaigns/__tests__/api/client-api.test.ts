import express from 'express';
import request from 'supertest';

import clientRouter from '../../client-api';
import { CampaignService } from '../../services';
import { WelcomeScreenService } from '../../welcome-screen-service';

// モック
jest.mock('../../services');
jest.mock('../../welcome-screen-service');
jest.mock('../../utils', () => ({
  getLanguageFromRequest: jest.fn().mockReturnValue('ja')
}));
jest.mock('../../../auth/middleware', () => ({
  verifyTenantAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

describe('Client API', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1', clientRouter);
    
    // モックのリセット
    jest.clearAllMocks();
  });
  
  describe('GET /campaigns/active', () => {
    it('should return active campaigns', async () => {
      // モックデータ
      const mockCampaigns = [
        {
          id: '1',
          code: 'SUMMER2025',
          name: '夏のキャンペーン',
          description: '夏の特別セール',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-08-31'),
          status: 'ACTIVE',
          displayType: 'BANNER',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // モック関数の設定
      (CampaignService.prototype.getActiveCampaigns as jest.Mock).mockResolvedValue(mockCampaigns);
      
      // リクエスト実行
      const response = await request(app).get('/api/v1/campaigns/active');
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe('SUMMER2025');
      
      // モック関数の呼び出し確認
      expect(CampaignService.prototype.getActiveCampaigns).toHaveBeenCalledWith('ja');
    });
    
    it('should handle errors', async () => {
      // エラーをスローするモック
      (CampaignService.prototype.getActiveCampaigns as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // リクエスト実行
      const response = await request(app).get('/api/v1/campaigns/active');
      
      // レスポンス検証
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('GET /campaigns/check', () => {
    it('should check campaign applicability', async () => {
      // モックデータ
      const mockCampaign = {
        id: '1',
        code: 'SUMMER2025',
        name: '夏のキャンペーン',
        description: '夏の特別セール',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        status: 'ACTIVE',
        displayType: 'BANNER',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // モック関数の設定
      (CampaignService.prototype.checkCampaignApplicability as jest.Mock).mockResolvedValue(mockCampaign);
      
      // リクエスト実行
      const response = await request(app)
        .get('/api/v1/campaigns/check')
        .query({
          productId: 'product1',
          orderAmount: 5000
        });
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.applicable).toBe(true);
      expect(response.body.data.campaign).toBeDefined();
      
      // モック関数の呼び出し確認
      expect(CampaignService.prototype.checkCampaignApplicability).toHaveBeenCalledWith(
        'product1',
        undefined,
        5000,
        'test-user-id'
      );
    });
    
    it('should return not applicable when no campaign found', async () => {
      // モック関数の設定（null返却）
      (CampaignService.prototype.checkCampaignApplicability as jest.Mock).mockResolvedValue(null);
      
      // リクエスト実行
      const response = await request(app)
        .get('/api/v1/campaigns/check')
        .query({
          productId: 'product1',
          orderAmount: 1000 // 最低注文金額に満たない
        });
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.applicable).toBe(false);
      expect(response.body.data.campaign).toBeNull();
    });
    
    it('should handle validation errors', async () => {
      // リクエスト実行（必須パラメータなし）
      const response = await request(app).get('/api/v1/campaigns/check');
      
      // レスポンス検証
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('GET /welcome-screen/config', () => {
    it('should return welcome screen config', async () => {
      // モックデータ
      const mockConfig = {
        enabled: true,
        title: 'ようこそ',
        message: '当ホテルへようこそ',
        imageUrl: 'https://example.com/image.jpg',
        videoUrl: null,
        buttonText: 'OK',
        showOnce: true
      };
      
      // モック関数の設定
      (WelcomeScreenService.prototype.getWelcomeScreenConfig as jest.Mock).mockResolvedValue(mockConfig);
      
      // リクエスト実行
      const response = await request(app).get('/api/v1/welcome-screen/config');
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConfig);
      
      // モック関数の呼び出し確認
      expect(WelcomeScreenService.prototype.getWelcomeScreenConfig).toHaveBeenCalledWith('ja');
    });
  });
  
  describe('GET /welcome-screen/should-show', () => {
    it('should check if welcome screen should be shown', async () => {
      // モック関数の設定
      (WelcomeScreenService.prototype.shouldShowWelcomeScreen as jest.Mock).mockResolvedValue(true);
      
      // リクエスト実行
      const response = await request(app)
        .get('/api/v1/welcome-screen/should-show')
        .query({ deviceId: 'device123' });
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shouldShow).toBe(true);
      
      // モック関数の呼び出し確認
      expect(WelcomeScreenService.prototype.shouldShowWelcomeScreen).toHaveBeenCalledWith(
        'test-user-id',
        'device123'
      );
    });
    
    it('should require deviceId parameter', async () => {
      // リクエスト実行（deviceIdなし）
      const response = await request(app).get('/api/v1/welcome-screen/should-show');
      
      // レスポンス検証
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('POST /welcome-screen/mark-completed', () => {
    it('should mark welcome screen as completed', async () => {
      // モック関数の設定
      (WelcomeScreenService.prototype.markWelcomeScreenCompleted as jest.Mock).mockResolvedValue(undefined);
      
      // リクエスト実行
      const response = await request(app)
        .post('/api/v1/welcome-screen/mark-completed')
        .send({ deviceId: 'device123' });
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      
      // モック関数の呼び出し確認
      expect(WelcomeScreenService.prototype.markWelcomeScreenCompleted).toHaveBeenCalledWith(
        'test-user-id',
        'device123'
      );
    });
    
    it('should validate request body', async () => {
      // リクエスト実行（空のボディ）
      const response = await request(app)
        .post('/api/v1/welcome-screen/mark-completed')
        .send({});
      
      // レスポンス検証
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
