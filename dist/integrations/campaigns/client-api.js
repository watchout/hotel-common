"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const services_1 = require("./services");
const welcome_screen_service_1 = require("./welcome-screen-service");
const api_standards_1 = require("../../standards/api-standards");
const middleware_1 = require("../../auth/middleware");
const types_1 = require("./types");
const logger_1 = require("../../utils/logger");
const utils_1 = require("./utils");
const router = express_1.default.Router();
const campaignService = new services_1.CampaignService();
const welcomeScreenService = new welcome_screen_service_1.WelcomeScreenService();
// キャンペーン適用チェックAPI
router.get('/campaigns/check', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const validationResult = types_1.checkCampaignSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid request parameters', validationResult.error).response);
        }
        const { productId, categoryCode, orderAmount } = validationResult.data;
        // ユーザーIDの取得（HierarchicalJWTPayloadにはidプロパティがないため、user_idを使用）
        const userId = req.user?.user_id;
        const applicableCampaign = await campaignService.checkCampaignApplicability(productId || '', categoryCode || '', orderAmount, userId || '');
        return api_standards_1.StandardResponseBuilder.success(res, {
            applicable: !!applicableCampaign,
            campaign: applicableCampaign || null
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to check campaign applicability', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to check campaign applicability').response);
    }
});
// アクティブなキャンペーン一覧取得API
router.get('/campaigns/active', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const language = (0, utils_1.getLanguageFromRequest)(req);
        const activeCampaigns = await campaignService.getActiveCampaigns();
        return api_standards_1.StandardResponseBuilder.success(res, activeCampaigns);
    }
    catch (error) {
        logger_1.logger.error('Failed to get active campaigns', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get active campaigns').response);
    }
});
// カテゴリー別キャンペーン取得API
router.get('/campaigns/by-category/:code', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const { code } = req.params;
        const language = (0, utils_1.getLanguageFromRequest)(req);
        const campaigns = await campaignService.getCampaignsByCategory(code, language);
        return api_standards_1.StandardResponseBuilder.success(res, campaigns);
    }
    catch (error) {
        logger_1.logger.error(`Failed to get campaigns by category: ${req.params.code}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaigns by category').response);
    }
});
// ウェルカムスクリーン設定取得API
router.get('/welcome-screen/config', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const language = (0, utils_1.getLanguageFromRequest)(req);
        const config = await welcomeScreenService.getWelcomeScreenConfig(language);
        return api_standards_1.StandardResponseBuilder.success(res, config);
    }
    catch (error) {
        logger_1.logger.error('Failed to get welcome screen config', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get welcome screen config').response);
    }
});
// ウェルカムスクリーン表示判定API
router.get('/welcome-screen/should-show', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        // ユーザーIDの取得（HierarchicalJWTPayloadにはidプロパティがないため、user_idを使用）
        const userId = req.user?.user_id;
        const deviceId = req.query.deviceId;
        if (!deviceId) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'Device ID is required').response);
        }
        const shouldShow = await welcomeScreenService.shouldShowWelcomeScreen(userId, deviceId);
        return api_standards_1.StandardResponseBuilder.success(res, { shouldShow });
    }
    catch (error) {
        logger_1.logger.error('Failed to check if welcome screen should be shown', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to check if welcome screen should be shown').response);
    }
});
// ウェルカムスクリーン完了マークAPI
router.post('/welcome-screen/mark-completed', middleware_1.verifyTenantAuth, async (req, res) => {
    try {
        const validationResult = types_1.welcomeScreenMarkCompletedSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json(api_standards_1.StandardResponseBuilder.error('VALIDATION_ERROR', 'Invalid request data', validationResult.error).response);
        }
        const { deviceId } = validationResult.data;
        // ユーザーIDの取得（HierarchicalJWTPayloadにはidプロパティがないため、user_idを使用）
        const userId = req.user?.user_id;
        await welcomeScreenService.markWelcomeScreenCompleted(userId, deviceId);
        return api_standards_1.StandardResponseBuilder.success(res, { success: true });
    }
    catch (error) {
        logger_1.logger.error('Failed to mark welcome screen as completed', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to mark welcome screen as completed').response);
    }
});
exports.default = router;
