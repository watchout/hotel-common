/**
 * Google Playアプリ選択機能のバリデーション関数
 */


import { 
  googlePlayAppCreateSchema, 
  googlePlayAppUpdateSchema, 
  googlePlayAppApproveSchema,
  hotelAppCreateSchema,
  hotelAppUpdateSchema,
  layoutAppBlockUpdateSchema
} from './types';
import { prisma } from '../../database';
import { StandardResponseBuilder } from '../../standards/api-standards';

import type { Request, Response, NextFunction } from 'express';

/**
 * リクエストボディのバリデーション
 */
export const validateBody = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      const { response, statusCode } = StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー', error.errors, 400);
      return res.status(statusCode).json(response);
    }
  };
};

/**
 * パッケージ名の一意性チェック
 */
export const validateUniquePackageName = async (req: Request, res: Response, next: NextFunction) => {
  const { packageName } = req.body;
  
  try {
    // @ts-expect-error - Prismaスキーマに存在するが型定義されていないモデル
  const existingApp = await prisma.googlePlayApp.findUnique({
      where: { packageName }
    });
    
    if (existingApp) {
      const { response, statusCode } = StandardResponseBuilder.error('DUPLICATE_PACKAGE', 'このパッケージ名は既に登録されています', undefined, 409);
      return res.status(statusCode).json(response);
    }
    
    next();
  } catch (error: unknown) {
    const { response, statusCode } = StandardResponseBuilder.error('SERVER_ERROR', '一意性チェックに失敗しました', undefined, 500);
    return res.status(statusCode).json(response);
  }
};

/**
 * GooglePlayAppの存在チェック
 */
export const validateGooglePlayAppExists = async (req: Request, res: Response, next: NextFunction) => {
  const appId = req.params.id;
  
  try {
    // @ts-expect-error - Prismaスキーマに存在するが型定義されていないモデル
  const app = await prisma.googlePlayApp.findUnique({
      where: { id: appId }
    });
    
    if (!app) {
      const { response, statusCode } = StandardResponseBuilder.error('NOT_FOUND', '指定されたアプリが見つかりません', undefined, 404);
      return res.status(statusCode).json(response);
    }
    
    req.app.locals.googlePlayApp = app;
    next();
  } catch (error: unknown) {
    const { response, statusCode } = StandardResponseBuilder.error('SERVER_ERROR', 'アプリの検索に失敗しました', undefined, 500);
    return res.status(statusCode).json(response);
  }
};

/**
 * HotelAppの存在チェック
 */
export const validateHotelAppExists = async (req: Request, res: Response, next: NextFunction) => {
  const placeId = parseInt(req.params.placeId);
  const appId = req.params.appId;
  
  try {
    // @ts-expect-error - Prismaスキーマに存在するが型定義されていないモデル
  const hotelApp = await prisma.hotelApp.findUnique({
      where: {
        placeId_appId: {
          placeId,
          appId
        }
      }
    });
    
    if (!hotelApp) {
      const { response, statusCode } = StandardResponseBuilder.error('NOT_FOUND', '指定された場所のアプリ設定が見つかりません', undefined, 404);
      return res.status(statusCode).json(response);
    }
    
    req.app.locals.hotelApp = hotelApp;
    next();
  } catch (error: unknown) {
    const { response, statusCode } = StandardResponseBuilder.error('SERVER_ERROR', 'アプリ設定の検索に失敗しました', undefined, 500);
    return res.status(statusCode).json(response);
  }
};

/**
 * LayoutAppBlockの存在チェック
 */
export const validateLayoutAppBlockExists = async (req: Request, res: Response, next: NextFunction) => {
  const layoutId = parseInt(req.params.layoutId);
  const blockId = req.params.blockId;
  
  try {
    // @ts-expect-error - Prismaスキーマに存在するが型定義されていないモデル
  const layoutAppBlock = await prisma.layoutAppBlock.findUnique({
      where: {
        layoutId_blockId: {
          layoutId,
          blockId
        }
      }
    });
    
    if (!layoutAppBlock) {
      const { response, statusCode } = StandardResponseBuilder.error('NOT_FOUND', '指定されたレイアウトブロックが見つかりません', undefined, 404);
      return res.status(statusCode).json(response);
    }
    
    req.app.locals.layoutAppBlock = layoutAppBlock;
    next();
  } catch (error: unknown) {
    const { response, statusCode } = StandardResponseBuilder.error('SERVER_ERROR', 'レイアウトブロックの検索に失敗しました', undefined, 500);
    return res.status(statusCode).json(response);
  }
};