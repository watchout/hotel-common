"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
exports.validateUniqueCampaignCode = validateUniqueCampaignCode;
exports.validateUniqueCategoryCode = validateUniqueCategoryCode;
const api_standards_1 = require("../../standards/api-standards");
const logger_1 = require("../../utils/logger");
/**
 * リクエストボディのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                logger_1.logger.warn('Validation error', { data: { errors: result.error.format() } });
                return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid request body', result.error).response);
            }
            // バリデーション済みのデータをリクエストに設定
            req.body = result.data;
            next();
        }
        catch (error) {
            const { createErrorLogOption } = require('../../utils/error-helper');
            logger_1.logger.error('Validation middleware error', createErrorLogOption(error));
            return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response);
        }
    };
}
/**
 * クエリパラメータのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                logger_1.logger.warn('Query validation error', { data: { errors: result.error.format() } });
                return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid query parameters', result.error).response);
            }
            // バリデーション済みのデータをリクエストに設定
            req.query = result.data;
            next();
        }
        catch (error) {
            const { createErrorLogOption } = require('../../utils/error-helper');
            logger_1.logger.error('Query validation middleware error', createErrorLogOption(error));
            return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response);
        }
    };
}
/**
 * パスパラメータのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                logger_1.logger.warn('Params validation error', { data: { errors: result.error.format() } });
                return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid path parameters', result.error).response);
            }
            // バリデーション済みのデータをリクエストに設定
            req.params = result.data;
            next();
        }
        catch (error) {
            const { createErrorLogOption } = require('../../utils/error-helper');
            logger_1.logger.error('Params validation middleware error', createErrorLogOption(error));
            return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response);
        }
    };
}
/**
 * キャンペーンコードの一意性をチェック
 * @param adapter Prismaアダプター
 */
function validateUniqueCampaignCode(adapter) {
    return async (req, res, next) => {
        try {
            const { code } = req.body;
            if (!code) {
                return next();
            }
            const existingCampaign = await adapter.campaign.findUnique({
                where: { code }
            });
            if (existingCampaign) {
                return res.status(409).json(api_standards_1.StandardResponseBuilder.error('ALREADY_EXISTS', `Campaign with code '${code}' already exists`).response);
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Unique campaign code validation error', { error });
            return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response);
        }
    };
}
/**
 * キャンペーンカテゴリーコードの一意性をチェック
 * @param adapter Prismaアダプター
 */
function validateUniqueCategoryCode(adapter) {
    return async (req, res, next) => {
        try {
            const { code } = req.body;
            if (!code) {
                return next();
            }
            const existingCategory = await adapter.campaignCategory.findUnique({
                where: { code }
            });
            if (existingCategory) {
                return res.status(409).json(api_standards_1.StandardResponseBuilder.error('ALREADY_EXISTS', `Category with code '${code}' already exists`).response);
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Unique category code validation error', { error });
            return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Validation process failed').response);
        }
    };
}
