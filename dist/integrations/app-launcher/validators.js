"use strict";
/**
 * Google Playアプリ選択機能のバリデーション関数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLayoutAppBlockExists = exports.validateHotelAppExists = exports.validateGooglePlayAppExists = exports.validateUniquePackageName = exports.validateBody = void 0;
const database_1 = require("../../database");
const api_standards_1 = require("../../standards/api-standards");
/**
 * リクエストボディのバリデーション
 */
const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー', error.errors, 400);
            return res.status(statusCode).json(response);
        }
    };
};
exports.validateBody = validateBody;
/**
 * パッケージ名の一意性チェック
 */
const validateUniquePackageName = async (req, res, next) => {
    const { packageName } = req.body;
    try {
        // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
        const existingApp = await database_1.prisma.googlePlayApp.findUnique({
            where: { packageName }
        });
        if (existingApp) {
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('DUPLICATE_PACKAGE', 'このパッケージ名は既に登録されています', undefined, 409);
            return res.status(statusCode).json(response);
        }
        next();
    }
    catch (error) {
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('SERVER_ERROR', '一意性チェックに失敗しました', undefined, 500);
        return res.status(statusCode).json(response);
    }
};
exports.validateUniquePackageName = validateUniquePackageName;
/**
 * GooglePlayAppの存在チェック
 */
const validateGooglePlayAppExists = async (req, res, next) => {
    const appId = req.params.id;
    try {
        // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
        const app = await database_1.prisma.googlePlayApp.findUnique({
            where: { id: appId }
        });
        if (!app) {
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('NOT_FOUND', '指定されたアプリが見つかりません', undefined, 404);
            return res.status(statusCode).json(response);
        }
        req.app.locals.googlePlayApp = app;
        next();
    }
    catch (error) {
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('SERVER_ERROR', 'アプリの検索に失敗しました', undefined, 500);
        return res.status(statusCode).json(response);
    }
};
exports.validateGooglePlayAppExists = validateGooglePlayAppExists;
/**
 * HotelAppの存在チェック
 */
const validateHotelAppExists = async (req, res, next) => {
    const placeId = parseInt(req.params.placeId);
    const appId = req.params.appId;
    try {
        // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
        const hotelApp = await database_1.prisma.hotelApp.findUnique({
            where: {
                placeId_appId: {
                    placeId,
                    appId
                }
            }
        });
        if (!hotelApp) {
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('NOT_FOUND', '指定された場所のアプリ設定が見つかりません', undefined, 404);
            return res.status(statusCode).json(response);
        }
        req.app.locals.hotelApp = hotelApp;
        next();
    }
    catch (error) {
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('SERVER_ERROR', 'アプリ設定の検索に失敗しました', undefined, 500);
        return res.status(statusCode).json(response);
    }
};
exports.validateHotelAppExists = validateHotelAppExists;
/**
 * LayoutAppBlockの存在チェック
 */
const validateLayoutAppBlockExists = async (req, res, next) => {
    const layoutId = parseInt(req.params.layoutId);
    const blockId = req.params.blockId;
    try {
        // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
        const layoutAppBlock = await database_1.prisma.layoutAppBlock.findUnique({
            where: {
                layoutId_blockId: {
                    layoutId,
                    blockId
                }
            }
        });
        if (!layoutAppBlock) {
            const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('NOT_FOUND', '指定されたレイアウトブロックが見つかりません', undefined, 404);
            return res.status(statusCode).json(response);
        }
        req.app.locals.layoutAppBlock = layoutAppBlock;
        next();
    }
    catch (error) {
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('SERVER_ERROR', 'レイアウトブロックの検索に失敗しました', undefined, 500);
        return res.status(statusCode).json(response);
    }
};
exports.validateLayoutAppBlockExists = validateLayoutAppBlockExists;
