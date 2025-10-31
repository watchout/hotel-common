import * as express from 'express';
import { z } from 'zod';

import adminCategoryRouter from './admin-category-api';
import { PAGINATION } from './constants';
import { CampaignService } from './services';
import { campaignCreateSchema, campaignUpdateSchema } from './types';
import { validateBody, validateUniqueCampaignCode } from './validators';
import { verifyAdminAuth } from '../../auth/middleware';
import { hotelDb } from '../../database/prisma';
import { StandardResponseBuilder } from '../../standards/api-standards';
import { logger } from '../../utils/logger';

import type { Request, Response } from 'express';

const router = express.Router();
const campaignService = new CampaignService();

// カテゴリー関連のルーターをマウント
router.use('/', adminCategoryRouter);

// 管理者向けキャンペーン一覧取得API
router.get('/campaigns', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const displayType = req.query.displayType as string | undefined;
    const search = req.query.search as string | undefined;
    
    const campaigns = await campaignService.getCampaigns({
      page,
      limit,
      status,
      // @ts-expect-error - 型定義が不完全
      type,
      displayType,
      search
    });
    
    return StandardResponseBuilder.success(res, campaigns.data, campaigns.meta);
  } catch (error: unknown) {
    logger.error('Failed to get campaigns', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaigns').response
    );
  }
});

// キャンペーン作成API
router.post(
  '/campaigns',
  verifyAdminAuth,
  validateBody(campaignCreateSchema),
  validateUniqueCampaignCode(hotelDb.getAdapter()),
  async (req: Request, res: Response) => {
    try {
      const campaign = await campaignService.createCampaign(req.body);
      return StandardResponseBuilder.success(res, campaign, null, 201);
    } catch (error: unknown) {
      logger.error('Failed to create campaign', error);
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to create campaign').response
      );
    }
  }
);

// キャンペーン詳細取得API
router.get('/campaigns/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await campaignService.getCampaignById(id);
    
    if (!campaign) {
      return res.status(404).json(
        StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response
      );
    }
    
    return StandardResponseBuilder.success(res, campaign);
  } catch (error: unknown) {
    logger.error(`Failed to get campaign: ${req.params.id}`, error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign').response
    );
  }
});

// キャンペーン更新API
router.put(
  '/campaigns/:id',
  verifyAdminAuth,
  validateBody(campaignUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existingCampaign = await campaignService.getCampaignById(id);
      
      if (!existingCampaign) {
        return res.status(404).json(
          StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response
        );
      }
      
      const updatedCampaign = await campaignService.updateCampaign(id, req.body);
      return StandardResponseBuilder.success(res, updatedCampaign);
    } catch (error: unknown) {
      logger.error(`Failed to update campaign: ${req.params.id}`, error);
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to update campaign').response
      );
    }
  }
);

// キャンペーン削除API
router.delete('/campaigns/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingCampaign = await campaignService.getCampaignById(id);
    
    if (!existingCampaign) {
      return res.status(404).json(
        StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response
      );
    }
    
    await campaignService.deleteCampaign(id);
    return res.status(204).send();
  } catch (error: unknown) {
    logger.error(`Failed to delete campaign: ${req.params.id}`, error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to delete campaign').response
    );
  }
});

// キャンペーン分析API
router.get('/campaigns/:id/analytics', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingCampaign = await campaignService.getCampaignById(id);
    
    if (!existingCampaign) {
      return res.status(404).json(
        StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response
      );
    }
    
    // TODO: 詳細な分析データ取得実装
    const analytics = {
      campaignId: id,
      views: 0,
      clicks: 0,
      conversions: 0,
      usageCount: 0,
      totalDiscountAmount: 0,
      averageDiscountAmount: 0,
      period: {
        start: existingCampaign.startDate,
        end: existingCampaign.endDate,
        daysActive: Math.ceil((existingCampaign.endDate.getTime() - existingCampaign.startDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    };
    
    return StandardResponseBuilder.success(res, analytics);
  } catch (error: unknown) {
    logger.error(`Failed to get campaign analytics: ${req.params.id}`, error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign analytics').response
    );
  }
});

// キャンペーン分析サマリーAPI
router.get('/campaigns/analytics/summary', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    // TODO: 詳細な分析データ取得実装
    const summary = {
      totalCampaigns: await hotelDb.getAdapter().campaign.count(),
      activeCampaigns: await hotelDb.getAdapter().campaign.count({
        where: {
          status: 'ACTIVE',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        }
      }),
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalUsageCount: await hotelDb.getAdapter().campaignUsageLog.count(),
      totalDiscountAmount: 0
    };
    
    return StandardResponseBuilder.success(res, summary);
  } catch (error: unknown) {
    logger.error('Failed to get campaigns analytics summary', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaigns analytics summary').response
    );
  }
});

export default router;