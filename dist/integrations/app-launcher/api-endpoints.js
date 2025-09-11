"use strict";
/**
 * Google Playアプリ選択機能のAPIエンドポイント
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const services_1 = require("./services");
const database_1 = require("../../database");
const api_standards_1 = require("../../standards/api-standards");
const middleware_1 = require("../../auth/middleware");
const validators_1 = require("./validators");
const types_1 = require("./types");
const utils_1 = require("./utils");
// サービスのインスタンス化
const appLauncherService = new services_1.AppLauncherService(database_1.hotelDb.getClient());
// ルーターの作成
const router = express.Router();
/**
 * アプリ管理API（管理者用）
 */
// アプリ一覧取得
router.get('/apps/google-play', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const { page, limit } = (0, utils_1.parsePaginationParams)(req);
        const category = req.query.category;
        const approved = (0, utils_1.parseBooleanParam)(req.query.approved);
        const result = await appLauncherService.listGooglePlayApps({
            category,
            approved,
            page,
            limit
        });
        return api_standards_1.StandardResponseBuilder.success(res, result.data, {
            pagination: result.pagination
        });
    }
    catch (error) {
        console.error('Google Playアプリ一覧取得エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('SERVER_ERROR', 'アプリ一覧の取得に失敗しました', undefined, 500);
        return res.status(statusCode).json(response);
    }
});
// アプリ詳細取得
router.get('/apps/google-play/:id', middleware_1.verifyAdminAuth, validators_1.validateGooglePlayAppExists, async (req, res) => {
    try {
        const appId = req.params.id;
        const app = await appLauncherService.getGooglePlayApp(appId);
        return api_standards_1.StandardResponseBuilder.success(res, app);
    }
    catch (error) {
        console.error('Google Playアプリ詳細取得エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('SERVER_ERROR', 'アプリ詳細の取得に失敗しました', undefined, 500);
        return res.status(statusCode).json(response);
    }
});
// アプリ登録
router.post('/apps/google-play', middleware_1.verifyAdminAuth, (0, validators_1.validateBody)(types_1.googlePlayAppCreateSchema), validators_1.validateUniquePackageName, async (req, res) => {
    try {
        const app = await appLauncherService.createGooglePlayApp(req.body);
        return api_standards_1.StandardResponseBuilder.success(res, app, {
            message: 'アプリを登録しました'
        }, 201);
    }
    catch (error) {
        console.error('Google Playアプリ登録エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'アプリの登録に失敗しました');
        return res.status(statusCode).json(response);
    }
});
// アプリ更新
router.put('/apps/google-play/:id', middleware_1.verifyAdminAuth, validators_1.validateGooglePlayAppExists, (0, validators_1.validateBody)(types_1.googlePlayAppUpdateSchema), async (req, res) => {
    try {
        const appId = req.params.id;
        const app = await appLauncherService.updateGooglePlayApp(appId, req.body);
        return api_standards_1.StandardResponseBuilder.success(res, app, {
            message: 'アプリ情報を更新しました'
        });
    }
    catch (error) {
        console.error('Google Playアプリ更新エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'アプリ情報の更新に失敗しました');
        return res.status(statusCode).json(response);
    }
});
// アプリ承認/非承認
router.patch('/apps/google-play/:id/approve', middleware_1.verifyAdminAuth, validators_1.validateGooglePlayAppExists, (0, validators_1.validateBody)(types_1.googlePlayAppApproveSchema), async (req, res) => {
    try {
        const appId = req.params.id;
        const { isApproved } = req.body;
        const app = await appLauncherService.approveGooglePlayApp(appId, isApproved);
        const message = isApproved
            ? 'アプリを承認しました'
            : 'アプリの承認を取り消しました';
        return api_standards_1.StandardResponseBuilder.success(res, app, { message });
    }
    catch (error) {
        console.error('Google Playアプリ承認エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'アプリの承認状態の更新に失敗しました');
        return res.status(statusCode).json(response);
    }
});
/**
 * 場所別アプリ設定API
 */
// 場所別アプリ一覧取得
router.get('/places/:placeId/apps', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const placeId = parseInt(req.params.placeId);
        const isEnabled = (0, utils_1.parseBooleanParam)(req.query.isEnabled);
        const apps = await appLauncherService.listHotelApps(placeId, { isEnabled });
        return api_standards_1.StandardResponseBuilder.success(res, apps);
    }
    catch (error) {
        console.error('場所別アプリ一覧取得エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', '場所別アプリ一覧の取得に失敗しました');
        return res.status(statusCode).json(response);
    }
});
// 場所別アプリ追加
router.post('/places/:placeId/apps', middleware_1.verifyTenantAuth, (0, validators_1.validateBody)(types_1.hotelAppCreateSchema), async (req, res) => {
    try {
        const placeId = parseInt(req.params.placeId);
        const hotelApp = await appLauncherService.createHotelApp({
            placeId,
            ...req.body
        });
        return api_standards_1.StandardResponseBuilder.success(res, hotelApp, {
            message: '場所にアプリを追加しました'
        }, 201);
    }
    catch (error) {
        console.error('場所別アプリ追加エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', '場所へのアプリ追加に失敗しました');
        return res.status(statusCode).json(response);
    }
});
// 場所別アプリ更新
router.put('/places/:placeId/apps/:appId', middleware_1.verifyTenantAuth, validators_1.validateHotelAppExists, (0, validators_1.validateBody)(types_1.hotelAppUpdateSchema), async (req, res) => {
    try {
        const placeId = parseInt(req.params.placeId);
        const appId = req.params.appId;
        const hotelApp = await appLauncherService.updateHotelApp(placeId, appId, req.body);
        return api_standards_1.StandardResponseBuilder.success(res, hotelApp, {
            message: '場所のアプリ設定を更新しました'
        });
    }
    catch (error) {
        console.error('場所別アプリ更新エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', '場所のアプリ設定の更新に失敗しました');
        return res.status(statusCode).json(response);
    }
});
// 場所別アプリ削除
router.delete('/places/:placeId/apps/:appId', middleware_1.verifyTenantAuth, validators_1.validateHotelAppExists, async (req, res) => {
    try {
        const placeId = parseInt(req.params.placeId);
        const appId = req.params.appId;
        await appLauncherService.deleteHotelApp(placeId, appId);
        return api_standards_1.StandardResponseBuilder.success(res, null, {
            message: '場所からアプリを削除しました'
        });
    }
    catch (error) {
        console.error('場所別アプリ削除エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', '場所からのアプリ削除に失敗しました');
        return res.status(statusCode).json(response);
    }
});
/**
 * レイアウトブロック別アプリAPI
 */
// レイアウトブロック別アプリ設定取得
router.get('/layouts/:layoutId/blocks/:blockId/apps', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const layoutId = parseInt(req.params.layoutId);
        const blockId = req.params.blockId;
        const layoutAppBlock = await appLauncherService.getLayoutAppBlock(layoutId, blockId);
        if (!layoutAppBlock) {
            return api_standards_1.StandardResponseBuilder.success(res, { appConfig: {} });
        }
        return api_standards_1.StandardResponseBuilder.success(res, {
            appConfig: layoutAppBlock.appConfig
        });
    }
    catch (error) {
        console.error('レイアウトブロック別アプリ設定取得エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'レイアウトブロックのアプリ設定の取得に失敗しました');
        return res.status(statusCode).json(response);
    }
});
// レイアウトブロック別アプリ設定更新
router.put('/layouts/:layoutId/blocks/:blockId/apps', middleware_1.verifyTenantAuth, (0, validators_1.validateBody)(types_1.layoutAppBlockUpdateSchema), async (req, res) => {
    try {
        const layoutId = parseInt(req.params.layoutId);
        const blockId = req.params.blockId;
        const { appConfig } = req.body;
        const layoutAppBlock = await appLauncherService.updateLayoutAppBlock({
            layoutId,
            blockId,
            appConfig
        });
        return api_standards_1.StandardResponseBuilder.success(res, layoutAppBlock, {
            message: 'レイアウトブロックのアプリ設定を更新しました'
        });
    }
    catch (error) {
        console.error('レイアウトブロック別アプリ設定更新エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'レイアウトブロックのアプリ設定の更新に失敗しました');
        return res.status(statusCode).json(response);
    }
});
/**
 * クライアント用API
 */
// 利用可能アプリ一覧取得
router.get('/client/places/:placeId/apps', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const placeId = parseInt(req.params.placeId);
        // 有効なアプリのみ取得
        const apps = await appLauncherService.listHotelApps(placeId, { isEnabled: true });
        // 承認済みのアプリのみフィルタリング
        const approvedApps = apps.filter((app) => app.GooglePlayApp.isApproved);
        // カテゴリでフィルタリング（オプション）
        const category = req.query.category;
        const filteredApps = category
            ? approvedApps.filter((app) => app.GooglePlayApp.category === category)
            : approvedApps;
        return api_standards_1.StandardResponseBuilder.success(res, filteredApps);
    }
    catch (error) {
        console.error('クライアント用アプリ一覧取得エラー:', error);
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'アプリ一覧の取得に失敗しました');
        return res.status(statusCode).json(response);
    }
});
exports.default = router;
