"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const admin_category_api_1 = __importDefault(require("./admin-category-api"));
const constants_1 = require("./constants");
const services_1 = require("./services");
const types_1 = require("./types");
const validators_1 = require("./validators");
const middleware_1 = require("../../auth/middleware");
const prisma_1 = require("../../database/prisma");
const api_standards_1 = require("../../standards/api-standards");
const logger_1 = require("../../utils/logger");
const router = express.Router();
const campaignService = new services_1.CampaignService();
// カテゴリー関連のルーターをマウント
router.use('/', admin_category_api_1.default);
// 管理者向けキャンペーン一覧取得API
router.get('/campaigns', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const page = Number(req.query.page) || constants_1.PAGINATION.DEFAULT_PAGE;
        const limit = Number(req.query.limit) || constants_1.PAGINATION.DEFAULT_LIMIT;
        const status = req.query.status;
        const type = req.query.type;
        const displayType = req.query.displayType;
        const search = req.query.search;
        const campaigns = await campaignService.getCampaigns({
            page,
            limit,
            status,
            // @ts-ignore - 型定義が不完全
            type,
            displayType,
            search
        });
        return api_standards_1.StandardResponseBuilder.success(res, campaigns.data, campaigns.meta);
    }
    catch (error) {
        logger_1.logger.error('Failed to get campaigns', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaigns').response);
    }
});
// キャンペーン作成API
router.post('/campaigns', middleware_1.verifyAdminAuth, (0, validators_1.validateBody)(types_1.campaignCreateSchema), (0, validators_1.validateUniqueCampaignCode)(prisma_1.hotelDb.getAdapter()), async (req, res) => {
    try {
        const campaign = await campaignService.createCampaign(req.body);
        return api_standards_1.StandardResponseBuilder.success(res, campaign, null, 201);
    }
    catch (error) {
        logger_1.logger.error('Failed to create campaign', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to create campaign').response);
    }
});
// キャンペーン詳細取得API
router.get('/campaigns/:id', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await campaignService.getCampaignById(id);
        if (!campaign) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response);
        }
        return api_standards_1.StandardResponseBuilder.success(res, campaign);
    }
    catch (error) {
        logger_1.logger.error(`Failed to get campaign: ${req.params.id}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign').response);
    }
});
// キャンペーン更新API
router.put('/campaigns/:id', middleware_1.verifyAdminAuth, (0, validators_1.validateBody)(types_1.campaignUpdateSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const existingCampaign = await campaignService.getCampaignById(id);
        if (!existingCampaign) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response);
        }
        const updatedCampaign = await campaignService.updateCampaign(id, req.body);
        return api_standards_1.StandardResponseBuilder.success(res, updatedCampaign);
    }
    catch (error) {
        logger_1.logger.error(`Failed to update campaign: ${req.params.id}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to update campaign').response);
    }
});
// キャンペーン削除API
router.delete('/campaigns/:id', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const existingCampaign = await campaignService.getCampaignById(id);
        if (!existingCampaign) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response);
        }
        await campaignService.deleteCampaign(id);
        return res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error(`Failed to delete campaign: ${req.params.id}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to delete campaign').response);
    }
});
// キャンペーン分析API
router.get('/campaigns/:id/analytics', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const existingCampaign = await campaignService.getCampaignById(id);
        if (!existingCampaign) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('NOT_FOUND', 'Campaign not found').response);
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
        return api_standards_1.StandardResponseBuilder.success(res, analytics);
    }
    catch (error) {
        logger_1.logger.error(`Failed to get campaign analytics: ${req.params.id}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign analytics').response);
    }
});
// キャンペーン分析サマリーAPI
router.get('/campaigns/analytics/summary', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        // TODO: 詳細な分析データ取得実装
        const summary = {
            totalCampaigns: await prisma_1.hotelDb.getAdapter().campaign.count(),
            activeCampaigns: await prisma_1.hotelDb.getAdapter().campaign.count({
                where: {
                    status: 'ACTIVE',
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() }
                }
            }),
            totalViews: 0,
            totalClicks: 0,
            totalConversions: 0,
            totalUsageCount: await prisma_1.hotelDb.getAdapter().campaignUsageLog.count(),
            totalDiscountAmount: 0
        };
        return api_standards_1.StandardResponseBuilder.success(res, summary);
    }
    catch (error) {
        logger_1.logger.error('Failed to get campaigns analytics summary', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaigns analytics summary').response);
    }
});
exports.default = router;
