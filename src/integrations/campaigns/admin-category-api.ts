import * as express from 'express';
import { z } from 'zod';

import { PAGINATION } from './constants';
import { campaignCategoryCreateSchema, campaignCategoryUpdateSchema } from './types';
import { mapCategoryToInfo } from './utils';
import { validateBody, validateUniqueCategoryCode } from './validators';
import { verifyAdminAuth } from '../../auth/middleware';
import { hotelDb } from '../../database/prisma';
import { StandardResponseBuilder } from '../../standards/api-standards';
import { logger } from '../../utils/logger';

import type { Request, Response } from 'express';

const router = express.Router();

// カテゴリー一覧取得API
router.get('/campaign-categories', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Number(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    
    const [categories, total] = await Promise.all([
      hotelDb.getAdapter().campaignCategory.findMany({
        skip,
        take: limit,
        orderBy: {
          name: 'asc'
        }
      }),
      hotelDb.getAdapter().campaignCategory.count()
    ]);
    
    const mappedCategories = categories.map(mapCategoryToInfo);
    
    return StandardResponseBuilder.success(res, 
      mappedCategories,
      {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    );
  } catch (error) {
    logger.error('Failed to get campaign categories', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign categories').response
    );
  }
});

// カテゴリー作成API
router.post(
  '/campaign-categories',
  verifyAdminAuth,
  validateBody(campaignCategoryCreateSchema),
  validateUniqueCategoryCode(hotelDb.getAdapter()),
  async (req: Request, res: Response) => {
    try {
      const category = await hotelDb.getAdapter().campaignCategory.create({
        data: {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return StandardResponseBuilder.success(res, mapCategoryToInfo(category), null, 201);
    } catch (error) {
      logger.error('Failed to create campaign category', error);
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to create campaign category').response
      );
    }
  }
);

// カテゴリー詳細取得API
router.get('/campaign-categories/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await hotelDb.getAdapter().campaignCategory.findUnique({
      where: { id }
    });
    
    if (!category) {
      return res.status(404).json(
        StandardResponseBuilder.error('NOT_FOUND', 'Campaign category not found').response
      );
    }
    
    return StandardResponseBuilder.success(res, mapCategoryToInfo(category));
  } catch (error) {
    logger.error(`Failed to get campaign category: ${req.params.id}`, error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign category').response
    );
  }
});

// カテゴリー更新API
router.put(
  '/campaign-categories/:id',
  verifyAdminAuth,
  validateBody(campaignCategoryUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const existingCategory = await hotelDb.getAdapter().campaignCategory.findUnique({
        where: { id }
      });
      
      if (!existingCategory) {
        return res.status(404).json(
          StandardResponseBuilder.error('NOT_FOUND', 'Campaign category not found').response
        );
      }
      
      const updatedCategory = await hotelDb.getAdapter().campaignCategory.update({
        where: { id },
        data: {
          ...req.body,
          updatedAt: new Date()
        }
      });
      
      return StandardResponseBuilder.success(res, mapCategoryToInfo(updatedCategory));
    } catch (error) {
      logger.error(`Failed to update campaign category: ${req.params.id}`, error);
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to update campaign category').response
      );
    }
  }
);

// カテゴリー削除API
router.delete('/campaign-categories/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingCategory = await hotelDb.getAdapter().campaignCategory.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return res.status(404).json(
        StandardResponseBuilder.error('NOT_FOUND', 'Campaign category not found').response
      );
    }
    
    // 関連するキャンペーンがあるか確認
    const relatedCampaigns = await hotelDb.getAdapter().campaignCategoryRelation.findFirst({
      where: { categoryId: id }
    });
    
    if (relatedCampaigns) {
      return res.status(409).json(
        StandardResponseBuilder.error(
          'CONFLICT',
          'Cannot delete category that is associated with campaigns'
        ).response
      );
    }
    
    await hotelDb.getAdapter().campaignCategory.delete({
      where: { id }
    });
    
    return res.status(204).send();
  } catch (error) {
    logger.error(`Failed to delete campaign category: ${req.params.id}`, error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to delete campaign category').response
    );
  }
});

export default router;