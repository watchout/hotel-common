/**
 * Google Playアプリ選択機能のAPIエンドポイント
 */

import * as express from 'express';


import { AppLauncherService } from './services';
import { 
  googlePlayAppCreateSchema, 
  googlePlayAppUpdateSchema, 
  googlePlayAppApproveSchema,
  hotelAppCreateSchema,
  hotelAppUpdateSchema,
  layoutAppBlockUpdateSchema
} from './types';
import { parseBooleanParam, parsePaginationParams } from './utils';
import { 
  validateBody, 
  validateUniquePackageName, 
  validateGooglePlayAppExists,
  validateHotelAppExists,
  validateLayoutAppBlockExists
} from './validators';
import { verifyAdminAuth, verifyTenantAuth } from '../../auth/middleware';
import { hotelDb } from '../../database';
import { StandardResponseBuilder } from '../../standards/api-standards';

import type { Request, Response } from 'express';

// サービスのインスタンス化
const appLauncherService = new AppLauncherService(hotelDb.getClient());

// ルーターの作成
const router = express.Router();

/**
 * アプリ管理API（管理者用）
 */

// アプリ一覧取得
router.get('/apps/google-play', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const { page, limit } = parsePaginationParams(req);
    const category = req.query.category as string | undefined;
    const approved = parseBooleanParam(req.query.approved as string | undefined);

    const result = await appLauncherService.listGooglePlayApps({
      category,
      approved,
      page,
      limit
    });

    return StandardResponseBuilder.success(res, result.data, {
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Google Playアプリ一覧取得エラー:', error);
    const { response, statusCode } = StandardResponseBuilder.error('SERVER_ERROR', 'アプリ一覧の取得に失敗しました', undefined, 500);
    return res.status(statusCode).json(response);
  }
});

// アプリ詳細取得
router.get('/apps/google-play/:id', verifyAdminAuth, validateGooglePlayAppExists, async (req: Request, res: Response) => {
  try {
    const appId = req.params.id;
    const app = await appLauncherService.getGooglePlayApp(appId);
    
    return StandardResponseBuilder.success(res, app);
  } catch (error) {
    console.error('Google Playアプリ詳細取得エラー:', error);
    const { response, statusCode } = StandardResponseBuilder.error('SERVER_ERROR', 'アプリ詳細の取得に失敗しました', undefined, 500);
    return res.status(statusCode).json(response);
  }
});

// アプリ登録
router.post(
  '/apps/google-play', 
  verifyAdminAuth, 
  validateBody(googlePlayAppCreateSchema), 
  validateUniquePackageName,
  async (req: Request, res: Response) => {
    try {
      const app = await appLauncherService.createGooglePlayApp(req.body);
      
      return StandardResponseBuilder.success(res, app, {
        message: 'アプリを登録しました'
      }, 201);
    } catch (error) {
      console.error('Google Playアプリ登録エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        'アプリの登録に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

// アプリ更新
router.put(
  '/apps/google-play/:id', 
  verifyAdminAuth, 
  validateGooglePlayAppExists,
  validateBody(googlePlayAppUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const appId = req.params.id;
      const app = await appLauncherService.updateGooglePlayApp(appId, req.body);
      
      return StandardResponseBuilder.success(res, app, {
        message: 'アプリ情報を更新しました'
      });
    } catch (error) {
      console.error('Google Playアプリ更新エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        'アプリ情報の更新に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

// アプリ承認/非承認
router.patch(
  '/apps/google-play/:id/approve', 
  verifyAdminAuth, 
  validateGooglePlayAppExists,
  validateBody(googlePlayAppApproveSchema),
  async (req: Request, res: Response) => {
    try {
      const appId = req.params.id;
      const { isApproved } = req.body;
      
      const app = await appLauncherService.approveGooglePlayApp(appId, isApproved);
      
      const message = isApproved 
        ? 'アプリを承認しました' 
        : 'アプリの承認を取り消しました';
      
      return StandardResponseBuilder.success(res, app, { message });
    } catch (error) {
      console.error('Google Playアプリ承認エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        'アプリの承認状態の更新に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

/**
 * 場所別アプリ設定API
 */

// 場所別アプリ一覧取得
router.get('/places/:placeId/apps', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    const placeId = parseInt(req.params.placeId);
    const isEnabled = parseBooleanParam(req.query.isEnabled as string | undefined);
    
    const apps = await appLauncherService.listHotelApps(placeId, { isEnabled });
    
    return StandardResponseBuilder.success(res, apps);
  } catch (error) {
    console.error('場所別アプリ一覧取得エラー:', error);
    const { response, statusCode } = StandardResponseBuilder.error(
      'INTERNAL_SERVER_ERROR',
      '場所別アプリ一覧の取得に失敗しました'
    );
    return res.status(statusCode).json(response);
  }
});

// 場所別アプリ追加
router.post(
  '/places/:placeId/apps', 
  verifyTenantAuth, 
  validateBody(hotelAppCreateSchema),
  async (req: Request, res: Response) => {
    try {
      const placeId = parseInt(req.params.placeId);
      
      const hotelApp = await appLauncherService.createHotelApp({
        placeId,
        ...req.body
      });
      
      return StandardResponseBuilder.success(res, hotelApp, {
        message: '場所にアプリを追加しました'
      }, 201);
    } catch (error) {
      console.error('場所別アプリ追加エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        '場所へのアプリ追加に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

// 場所別アプリ更新
router.put(
  '/places/:placeId/apps/:appId', 
  verifyTenantAuth, 
  validateHotelAppExists,
  validateBody(hotelAppUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const placeId = parseInt(req.params.placeId);
      const appId = req.params.appId;
      
      const hotelApp = await appLauncherService.updateHotelApp(placeId, appId, req.body);
      
      return StandardResponseBuilder.success(res, hotelApp, {
        message: '場所のアプリ設定を更新しました'
      });
    } catch (error) {
      console.error('場所別アプリ更新エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        '場所のアプリ設定の更新に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

// 場所別アプリ削除
router.delete(
  '/places/:placeId/apps/:appId', 
  verifyTenantAuth, 
  validateHotelAppExists,
  async (req: Request, res: Response) => {
    try {
      const placeId = parseInt(req.params.placeId);
      const appId = req.params.appId;
      
      await appLauncherService.deleteHotelApp(placeId, appId);
      
      return StandardResponseBuilder.success(res, null, {
        message: '場所からアプリを削除しました'
      });
    } catch (error) {
      console.error('場所別アプリ削除エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        '場所からのアプリ削除に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

/**
 * レイアウトブロック別アプリAPI
 */

// レイアウトブロック別アプリ設定取得
router.get(
  '/layouts/:layoutId/blocks/:blockId/apps', 
  verifyTenantAuth,
  async (req: Request, res: Response) => {
    try {
      const layoutId = parseInt(req.params.layoutId);
      const blockId = req.params.blockId;
      
      const layoutAppBlock = await appLauncherService.getLayoutAppBlock(layoutId, blockId);
      
      if (!layoutAppBlock) {
        return StandardResponseBuilder.success(res, { appConfig: {} });
      }
      
      return StandardResponseBuilder.success(res, {
        appConfig: layoutAppBlock.appConfig
      });
    } catch (error) {
      console.error('レイアウトブロック別アプリ設定取得エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        'レイアウトブロックのアプリ設定の取得に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

// レイアウトブロック別アプリ設定更新
router.put(
  '/layouts/:layoutId/blocks/:blockId/apps', 
  verifyTenantAuth, 
  validateBody(layoutAppBlockUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const layoutId = parseInt(req.params.layoutId);
      const blockId = req.params.blockId;
      const { appConfig } = req.body;
      
      const layoutAppBlock = await appLauncherService.updateLayoutAppBlock({
        layoutId,
        blockId,
        appConfig
      });
      
      return StandardResponseBuilder.success(res, layoutAppBlock, {
        message: 'レイアウトブロックのアプリ設定を更新しました'
      });
    } catch (error) {
      console.error('レイアウトブロック別アプリ設定更新エラー:', error);
      const { response, statusCode } = StandardResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        'レイアウトブロックのアプリ設定の更新に失敗しました'
      );
      return res.status(statusCode).json(response);
    }
  }
);

/**
 * クライアント用API
 */

// 利用可能アプリ一覧取得
router.get('/client/places/:placeId/apps', verifyTenantAuth, async (req: Request, res: Response) => {
  try {
    const placeId = parseInt(req.params.placeId);
    
    // 有効なアプリのみ取得
    const apps = await appLauncherService.listHotelApps(placeId, { isEnabled: true });
    
    // 承認済みのアプリのみフィルタリング
    const approvedApps = apps.filter((app: any) => app.GooglePlayApp.isApproved);
    
    // カテゴリでフィルタリング（オプション）
    const category = req.query.category as string | undefined;
    const filteredApps = category 
      ? approvedApps.filter((app: any) => app.GooglePlayApp.category === category)
      : approvedApps;
    
    return StandardResponseBuilder.success(res, filteredApps);
  } catch (error) {
    console.error('クライアント用アプリ一覧取得エラー:', error);
    const { response, statusCode } = StandardResponseBuilder.error(
      'INTERNAL_SERVER_ERROR',
      'アプリ一覧の取得に失敗しました'
    );
    return res.status(statusCode).json(response);
  }
});

export default router;