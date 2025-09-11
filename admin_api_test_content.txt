import request from 'supertest';
import express from 'express';
import adminRouter from '../../admin-api';
import { CampaignService } from '../../services';
import { prisma } from '../../../../database';

// モック
jest.mock('../../services');
jest.mock('../../../../database', () => ({
  prisma: {
    campaign: {
      findUnique: jest.fn(),
      count: jest.fn()
    }
  }
}));
jest.mock('../../../auth/middleware', () => ({
  verifyAdminAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'admin-user-id', role: 'ADMIN' };
    next();
  }
}));

describe('Admin API', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/admin', adminRouter);
    
    // モックのリセット
    jest.clearAllMocks();
  });
  
  describe('GET /campaigns', () => {
    it('should return campaigns list', async () => {
      // モックデータ
      const mockCampaigns = {
        data: [
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
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1
          }
        }
      };
      
      // モック関数の設定
      (CampaignService.prototype.getCampaigns as jest.Mock).mockResolvedValue(mockCampaigns);
      
      // リクエスト実行
      const response = await request(app).get('/api/v1/admin/campaigns');
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe('SUMMER2025');
      expect(response.body.meta).toBeDefined();
      
      // モック関数の呼び出し確認
      expect(CampaignService.prototype.getCampaigns).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // エラーをスローするモック
      (CampaignService.prototype.getCampaigns as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // リクエスト実行
      const response = await request(app).get('/api/v1/admin/campaigns');
      
      // レスポンス検証
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('GET /campaigns/:id', () => {
    it('should return campaign details', async () => {
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
        displayPriority: 100,
        ctaType: 'BUTTON',
        ctaText: '詳細を見る',
        ctaUrl: null,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 5000,
        maxUsageCount: 1000,
        perUserLimit: 1,
        timeRestrictions: null,
        dayRestrictions: null,
        welcomeSettings: null,
        translations: [],
        items: [],
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // モック関数の設定
      (CampaignService.prototype.getCampaignById as jest.Mock).mockResolvedValue(mockCampaign);
      
      // リクエスト実行
      const response = await request(app).get('/api/v1/admin/campaigns/1');
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.code).toBe('SUMMER2025');
      
      // モック関数の呼び出し確認
      expect(CampaignService.prototype.getCampaignById).toHaveBeenCalledWith('1');
    });
    
    it('should return 404 when campaign not found', async () => {
      // モック関数の設定（null返却）
      (CampaignService.prototype.getCampaignById as jest.Mock).mockResolvedValue(null);
      
      // リクエスト実行
      const response = await request(app).get('/api/v1/admin/campaigns/999');
      
      // レスポンス検証
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('POST /campaigns', () => {
    it('should create a new campaign', async () => {
      // 作成用データ
      const campaignData = {
        code: 'WINTER2025',
        name: '冬のキャンペーン',
        description: '冬の特別セール',
        startDate: '2025-12-01T00:00:00.000Z',
        endDate: '2026-02-28T23:59:59.999Z',
        status: 'DRAFT',
        displayType: 'BANNER',
        displayPriority: 80,
        ctaType: 'BUTTON',
        ctaText: '詳細を見る',
        ctaUrl: null,
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 3000,
        maxUsageCount: 500,
        perUserLimit: 1
      };
      
      // モック関数の設定
      const mockCreatedCampaign = { id: '2', ...campaignData, createdAt: new Date(), updatedAt: new Date() };
      (CampaignService.prototype.createCampaign as jest.Mock).mockResolvedValue(mockCreatedCampaign);
      
      // リクエスト実行
      const response = await request(app)
        .post('/api/v1/admin/campaigns')
        .send(campaignData);
      
      // レスポンス検証
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('2');
      expect(response.body.data.code).toBe('WINTER2025');
      
      // モック関数の呼び出し確認
      expect(CampaignService.prototype.createCampaign).toHaveBeenCalledWith(campaignData);
    });
    
    it('should validate request body', async () => {
      // 不完全なデータ
      const invalidData = {
        name: '冬のキャンペーン',
        // 必須フィールドの欠落
      };
      
      // リクエスト実行
      const response = await request(app)
        .post('/api/v1/admin/campaigns')
        .send(invalidData);
      
      // レスポンス検証
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('PUT /campaigns/:id', () => {
    it('should update an existing campaign', async () => {
      // 更新用データ
      const updateData = {
        name: '更新された冬のキャンペーン',
        description: '更新された説明',
        status: 'ACTIVE'
      };
      
      // モック関数の設定
      const mockUpdatedCampaign = {
        id: '1',
        code: 'WINTER2025',
        ...updateData,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-02-28'),
        displayType: 'BANNER',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (CampaignService.prototype.getCampaignById as jest.Mock).mockResolvedValue({ id: '1' });
      (CampaignService.prototype.updateCampaign as jest.Mock).mockResolvedValue(mockUpdatedCampaign);
      
      // リクエスト実行
      const response = await request(app)
        .put('/api/v1/admin/campaigns/1')
        .send(updateData);
      
      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('更新された冬のキャンペーン');
      
      // モック関数の呼び出し確認
      expect(CampaignService.prototype.updateCampaign).toHaveBeenCalledWith('1', updateData);
    });
    
    it('should return 404 when campaign not found', async () => {
      // モック関数の設定（null返却）
      (CampaignService.prototype.getCampaignById as jest.Mock).mockResolvedValue(null);
      
      // リクエスト実行
      const response = await request(app)
        .put('/api/v1/admin/campaigns/999')
        .send({ name: '更新テスト' });
      
      // レスポンス検証
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('DELETE /campaigns/:id', () => {
    it('should delete a campaign', async () => {
      // モック関数の設定
      (CampaignService.prototype.getCampaignById as jest.Mock).mockResolvedValue({ id: '1' });
      (CampaignService.prototype.deleteCampaign as jest.Mock).mockResolvedValue(undefined);
      
      // リクエスト実行
      const response = await request(app).delete('/api/v1/admin/campaigns/1');
      
      // レスポンス検証
      expect(response.status).toBe(204);
      
      // モック関数の呼び出し確認
      expect(CampaignService.prototype.deleteCampaign).toHaveBeenCalledWith('1');
    });
    
    it('should return 404 when campaign not found', async () => {
      // モック関数の設定（null返却）
      (CampaignService.prototype.getCampaignById as jest.Mock).mockResolvedValue(null);
      
      // リクエスト実行
      const response = await request(app).delete('/api/v1/admin/campaigns/999');
      
      // レスポンス検証
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
