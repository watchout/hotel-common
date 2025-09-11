import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { StandardResponseBuilder } from '../../standards/api-standards';
import { logger } from '../../utils/logger';
import { PrismaAdapter } from '../../database/prisma-adapter';

/**
 * リクエストボディのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        logger.warn('Validation error', { data: { errors: result.error.format() } });
        return res.status(400).json(
          StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid request body', result.error).response
        );
      }
      
      // バリデーション済みのデータをリクエストに設定
      req.body = result.data;
      next();
    } catch (error) {
      const { createErrorLogOption } = require('../../utils/error-helper');
      logger.error('Validation middleware error', createErrorLogOption(error));
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response
      );
    }
  };
}

/**
 * クエリパラメータのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        logger.warn('Query validation error', { data: { errors: result.error.format() } });
        return res.status(400).json(
          StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid query parameters', result.error).response
        );
      }
      
      // バリデーション済みのデータをリクエストに設定
      req.query = result.data as any;
      next();
    } catch (error) {
      const { createErrorLogOption } = require('../../utils/error-helper');
      logger.error('Query validation middleware error', createErrorLogOption(error));
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response
      );
    }
  };
}

/**
 * パスパラメータのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        logger.warn('Params validation error', { data: { errors: result.error.format() } });
        return res.status(400).json(
          StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid path parameters', result.error).response
        );
      }
      
      // バリデーション済みのデータをリクエストに設定
      req.params = result.data as any;
      next();
    } catch (error) {
      const { createErrorLogOption } = require('../../utils/error-helper');
      logger.error('Params validation middleware error', createErrorLogOption(error));
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response
      );
    }
  };
}

/**
 * キャンペーンコードの一意性をチェック
 * @param adapter Prismaアダプター
 */
export function validateUniqueCampaignCode(adapter: PrismaAdapter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return next();
      }
      
      const existingCampaign = await adapter.campaign.findUnique({
        where: { code }
      });
      
      if (existingCampaign) {
        return res.status(409).json(
          StandardResponseBuilder.error('ALREADY_EXISTS', `Campaign with code '${code}' already exists`).response
        );
      }
      
      next();
    } catch (error) {
      logger.error('Unique campaign code validation error', { error });
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response
      );
    }
  };
}

/**
 * キャンペーンカテゴリーコードの一意性をチェック
 * @param adapter Prismaアダプター
 */
export function validateUniqueCategoryCode(adapter: PrismaAdapter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return next();
      }
      
      const existingCategory = await adapter.campaignCategory.findUnique({
        where: { code }
      });
      
      if (existingCategory) {
        return res.status(409).json(
          StandardResponseBuilder.error('ALREADY_EXISTS', `Category with code '${code}' already exists`).response
        );
      }
      
      next();
    } catch (error) {
      logger.error('Unique category code validation error', { error });
      return res.status(500).json(
        StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response
      );
    }
  };
}