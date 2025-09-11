import { hotelDb } from '../database/prisma';
import { CampaignService } from '../services';
import { CampaignCreateInput, CampaignUpdateInput } from '../types';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Prismaクライアントのモック
const mockPrisma = mockDeep<PrismaClient>();

// テスト前にモックをリセット
beforeEach(() => {
  mockReset(mockPrisma);
});

describe('CampaignService', () => {
  let campaignService: CampaignService;

  beforeEach(() => {
    campaignService = new CampaignService(mockPrisma);
  });

  describe('getCampaigns', () => {
    it('should return a list of campaigns', async () => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [],
          items: [],
          categoryRelations: []
        }
      ];

      // PrismaのfindManyメソッドをモック
      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns as any);

      // サービスメソッドを呼び出し
      const result = await campaignService.getCampaigns();

      // 結果を検証
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('SUMMER2025');
      expect(result[0].name).toBe('夏のキャンペーン');

      // PrismaのfindManyメソッドが呼び出されたことを確認
      expect(mockPrisma.campaign.findMany).toHaveBeenCalled();
    });
  });

  describe('getCampaignById', () => {
    it('should return a campaign by id', async () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
        translations: [],
        items: [],
        categoryRelations: []
      };

      // PrismaのfindUniqueメソッドをモック
      mockPrisma.campaign.findUnique.mockResolvedValue(mockCampaign as any);

      // サービスメソッドを呼び出し
      const result = await campaignService.getCampaignById('1');

      // 結果を検証
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result?.code).toBe('SUMMER2025');

      // PrismaのfindUniqueメソッドが正しいパラメータで呼び出されたことを確認
      expect(mockPrisma.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          translations: true,
          items: true,
          categoryRelations: {
            include: {
              category: true
            }
          }
        }
      });
    });

    it('should return null if campaign not found', async () => {
      // PrismaのfindUniqueメソッドをモック（nullを返す）
      mockPrisma.campaign.findUnique.mockResolvedValue(null);

      // サービスメソッドを呼び出し
      const result = await campaignService.getCampaignById('999');

      // 結果を検証
      expect(result).toBeNull();

      // PrismaのfindUniqueメソッドが正しいパラメータで呼び出されたことを確認
      expect(mockPrisma.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
        include: {
          translations: true,
          items: true,
          categoryRelations: {
            include: {
              category: true
            }
          }
        }
      });
    });
  });

  describe('createCampaign', () => {
    it('should create a new campaign', async () => {
      // 作成用データ
      const campaignData: CampaignCreateInput = {
        code: 'WINTER2025',
        name: '冬のキャンペーン',
        description: '冬の特別セール',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-02-28'),
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
        perUserLimit: 1,
        timeRestrictions: null,
        dayRestrictions: null,
        welcomeSettings: null,
        translations: [
          {
            languageCode: 'en',
            name: 'Winter Campaign',
            description: 'Winter special sale',
            ctaText: 'See details'
          }
        ],
        items: [
          {
            productId: 'product1',
            discountType: 'PERCENTAGE',
            discountValue: 15
          }
        ],
        categories: ['category1']
      };

      // モックデータ（作成結果）
      const mockCreatedCampaign = {
        id: '2',
        ...campaignData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // トランザクションモック
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback(mockPrisma);
        }
        return mockCreatedCampaign;
      });

      // Prismaのcreateメソッドをモック
      mockPrisma.campaign.create.mockResolvedValue(mockCreatedCampaign as any);

      // getCampaignByIdメソッドをモック
      jest.spyOn(campaignService, 'getCampaignById').mockResolvedValue({
        ...mockCreatedCampaign,
        translations: campaignData.translations as any,
        items: campaignData.items as any,
        categories: [{ id: 'category1', code: 'CAT1', name: 'カテゴリ1' }]
      } as any);

      // サービスメソッドを呼び出し
      const result = await campaignService.createCampaign(campaignData);

      // 結果を検証
      expect(result).not.toBeNull();
      expect(result.id).toBe('2');
      expect(result.code).toBe('WINTER2025');

      // Prismaのcreateメソッドが正しいパラメータで呼び出されたことを確認
      expect(mockPrisma.campaign.create).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateCampaign', () => {
    it('should update an existing campaign', async () => {
      // 更新用データ
      const updateData: CampaignUpdateInput = {
        name: '更新された冬のキャンペーン',
        description: '更新された説明',
        status: 'ACTIVE'
      };

      // モックデータ（更新結果）
      const mockUpdatedCampaign = {
        id: '2',
        code: 'WINTER2025',
        ...updateData,
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-02-28'),
        displayType: 'BANNER',
        displayPriority: 80,
        ctaType: 'BUTTON',
        ctaText: '詳細を見る',
        ctaUrl: null,
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 3000,
        maxUsageCount: 500,
        perUserLimit: 1,
        timeRestrictions: null,
        dayRestrictions: null,
        welcomeSettings: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // トランザクションモック
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback(mockPrisma);
        }
        return undefined;
      });

      // Prismaのupdateメソッドをモック
      mockPrisma.campaign.update.mockResolvedValue(mockUpdatedCampaign as any);

      // getCampaignByIdメソッドをモック
      jest.spyOn(campaignService, 'getCampaignById').mockResolvedValue({
        ...mockUpdatedCampaign,
        translations: [],
        items: [],
        categories: []
      } as any);

      // サービスメソッドを呼び出し
      const result = await campaignService.updateCampaign('2', updateData);

      // 結果を検証
      expect(result).not.toBeNull();
      expect(result.id).toBe('2');
      expect(result.name).toBe('更新された冬のキャンペーン');
      expect(result.status).toBe('ACTIVE');

      // Prismaのupdateメソッドが正しいパラメータで呼び出されたことを確認
      expect(mockPrisma.campaign.update).toHaveBeenCalledWith({
        where: { id: '2' },
        data: updateData
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('deleteCampaign', () => {
    it('should delete a campaign', async () => {
      // トランザクションモック
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return callback(mockPrisma);
        }
        return undefined;
      });

      // サービスメソッドを呼び出し
      await campaignService.deleteCampaign('3');

      // Prismaのdeleteメソッドが正しいパラメータで呼び出されたことを確認
      expect(mockPrisma.campaign.delete).toHaveBeenCalledWith({
        where: { id: '3' }
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();

      // 関連データの削除も確認
      expect(mockPrisma.campaignTranslation.deleteMany).toHaveBeenCalledWith({
        where: { campaignId: '3' }
      });
      expect(mockPrisma.campaignItem.deleteMany).toHaveBeenCalledWith({
        where: { campaignId: '3' }
      });
      expect(mockPrisma.campaignCategoryRelation.deleteMany).toHaveBeenCalledWith({
        where: { campaignId: '3' }
      });
      expect(mockPrisma.campaignUsageLog.deleteMany).toHaveBeenCalledWith({
        where: { campaignId: '3' }
      });
    });
  });

  describe('getActiveCampaigns', () => {
    it('should return active campaigns for a given language', async () => {
      // 現在の日時
      const now = new Date();
      
      // モックデータ
      const mockCampaigns = [
        {
          id: '1',
          code: 'ACTIVE1',
          name: 'アクティブキャンペーン1',
          description: '説明1',
          startDate: new Date(now.getTime() - 86400000), // 1日前
          endDate: new Date(now.getTime() + 86400000),   // 1日後
          status: 'ACTIVE',
          displayType: 'BANNER',
          displayPriority: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [
            {
              languageCode: 'en',
              name: 'Active Campaign 1',
              description: 'Description 1'
            }
          ],
          items: [],
          categoryRelations: []
        }
      ];

      // PrismaのfindManyメソッドをモック
      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns as any);

      // サービスメソッドを呼び出し
      const result = await campaignService.getActiveCampaigns('en');

      // 結果を検証
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('ACTIVE1');
      expect(result[0].name).toBe('Active Campaign 1'); // 英語の翻訳が使われるべき

      // PrismaのfindManyメソッドが正しいパラメータで呼び出されたことを確認
      expect(mockPrisma.campaign.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          status: 'ACTIVE',
          startDate: expect.any(Object),
          endDate: expect.any(Object)
        },
        include: {
          translations: {
            where: {
              languageCode: 'en'
            }
          },
          items: true,
          categoryRelations: expect.any(Object)
        },
        orderBy: {
          displayPriority: 'desc'
        }
      }));
    });
  });

  describe('checkCampaignApplicability', () => {
    it('should return applicable campaign when conditions are met', async () => {
      // 現在の日時
      const now = new Date();
      
      // モックデータ
      const mockCampaigns = [
        {
          id: '1',
          code: 'APPLICABLE',
          name: '適用可能キャンペーン',
          description: '説明',
          startDate: new Date(now.getTime() - 86400000), // 1日前
          endDate: new Date(now.getTime() + 86400000),   // 1日後
          status: 'ACTIVE',
          displayType: 'BANNER',
          displayPriority: 100,
          minOrderAmount: 1000, // 最低注文金額
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [],
          items: [{ productId: 'product1' }],
          categoryRelations: [],
          usageLogs: [] // 使用履歴なし
        }
      ];

      // PrismaのfindManyメソッドをモック
      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns as any);

      // サービスメソッドを呼び出し
      const result = await campaignService.checkCampaignApplicability(
        'product1', // 製品ID
        undefined,  // カテゴリーコード
        2000,       // 注文金額（最低注文金額を超えている）
        'user1'     // ユーザーID
      );

      // 結果を検証
      expect(result).not.toBeNull();
      expect(result?.code).toBe('APPLICABLE');

      // PrismaのfindManyメソッドが正しいパラメータで呼び出されたことを確認
      expect(mockPrisma.campaign.findMany).toHaveBeenCalled();
    });

    it('should return null when no applicable campaign is found', async () => {
      // 現在の日時
      const now = new Date();
      
      // モックデータ（最低注文金額が高いキャンペーン）
      const mockCampaigns = [
        {
          id: '1',
          code: 'NOT_APPLICABLE',
          name: '適用不可キャンペーン',
          description: '説明',
          startDate: new Date(now.getTime() - 86400000), // 1日前
          endDate: new Date(now.getTime() + 86400000),   // 1日後
          status: 'ACTIVE',
          displayType: 'BANNER',
          displayPriority: 100,
          minOrderAmount: 5000, // 高い最低注文金額
          createdAt: new Date(),
          updatedAt: new Date(),
          translations: [],
          items: [{ productId: 'product1' }],
          categoryRelations: [],
          usageLogs: []
        }
      ];

      // PrismaのfindManyメソッドをモック
      mockPrisma.campaign.findMany.mockResolvedValue(mockCampaigns as any);

      // サービスメソッドを呼び出し
      const result = await campaignService.checkCampaignApplicability(
        'product1', // 製品ID
        undefined,  // カテゴリーコード
        2000,       // 注文金額（最低注文金額に満たない）
        'user1'     // ユーザーID
      );

      // 結果を検証
      expect(result).toBeNull();

      // PrismaのfindManyメソッドが呼び出されたことを確認
      expect(mockPrisma.campaign.findMany).toHaveBeenCalled();
    });
  });
});
