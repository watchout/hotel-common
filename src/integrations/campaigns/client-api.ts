import express from 'express';
import { z } from 'zod';

import { CampaignService } from './services';
import { checkCampaignSchema, welcomeScreenMarkCompletedSchema } from './types';
import { getLanguageFromRequest } from './utils';
import { WelcomeScreenService } from './welcome-screen-service';
import { verifyTenantAuth } from '../../auth/middleware';
import { StandardResponseBuilder } from '../../standards/api-standards';
import { logger } from '../../utils/logger';

import type { Request, Response } from 'express';

const router = express.Router();
const campaignService = new CampaignService();
const welcomeScreenService = new WelcomeScreenService();

// キャンペーン適用チェックAPI
router.get('/campaigns/check', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    const validationResult = checkCampaignSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid request parameters', validationResult.error).response
      );
    }
    
    const { productId, categoryCode, orderAmount } = validationResult.data;
    // ユーザーIDの取得（HierarchicalJWTPayloadにはidプロパティがないため、user_idを使用）
    const userId = req.user?.user_id;
    
    const applicableCampaign = await campaignService.checkCampaignApplicability(
      productId || '', 
      categoryCode || '', 
      orderAmount, 
      userId || ''
    );
    
    return StandardResponseBuilder.success(res, { 
      applicable: !!applicableCampaign,
      campaign: applicableCampaign || null
    });
  } catch (error) {
    logger.error('Failed to check campaign applicability', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to check campaign applicability').response
    );
  }
});

// アクティブなキャンペーン一覧取得API
router.get('/campaigns/active', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    const language = getLanguageFromRequest(req);
    const activeCampaigns = await campaignService.getActiveCampaigns();
    
    return StandardResponseBuilder.success(res, activeCampaigns);
  } catch (error) {
    logger.error('Failed to get active campaigns', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get active campaigns').response
    );
  }
});

// カテゴリー別キャンペーン取得API
router.get('/campaigns/by-category/:code', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const language = getLanguageFromRequest(req);
    
    const campaigns = await campaignService.getCampaignsByCategory(code, language);
    
    return StandardResponseBuilder.success(res, campaigns);
  } catch (error) {
    logger.error(`Failed to get campaigns by category: ${req.params.code}`, error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaigns by category').response
    );
  }
});

// ウェルカムスクリーン設定取得API
router.get('/welcome-screen/config', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    const language = getLanguageFromRequest(req);
    const config = await welcomeScreenService.getWelcomeScreenConfig(language);
    
    return StandardResponseBuilder.success(res, config);
  } catch (error) {
    logger.error('Failed to get welcome screen config', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get welcome screen config').response
    );
  }
});

// ウェルカムスクリーン表示判定API
router.get('/welcome-screen/should-show', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    // ユーザーIDの取得（HierarchicalJWTPayloadにはidプロパティがないため、user_idを使用）
    const userId = req.user?.user_id;
    const deviceId = req.query.deviceId as string;
    
    if (!deviceId) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', 'Device ID is required').response
      );
    }
    
    const shouldShow = await welcomeScreenService.shouldShowWelcomeScreen(userId, deviceId);
    
    return StandardResponseBuilder.success(res, { shouldShow });
  } catch (error) {
    logger.error('Failed to check if welcome screen should be shown', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to check if welcome screen should be shown').response
    );
  }
});

// ウェルカムスクリーン完了マークAPI
router.post('/welcome-screen/mark-completed', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    const validationResult = welcomeScreenMarkCompletedSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid request data', validationResult.error).response
      );
    }
    
    const { deviceId } = validationResult.data;
    // ユーザーIDの取得（HierarchicalJWTPayloadにはidプロパティがないため、user_idを使用）
    const userId = req.user?.user_id;
    
    await welcomeScreenService.markWelcomeScreenCompleted(userId, deviceId);
    
    return StandardResponseBuilder.success(res, { success: true });
  } catch (error) {
    logger.error('Failed to mark welcome screen as completed', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to mark welcome screen as completed').response
    );
  }
});

export default router;
