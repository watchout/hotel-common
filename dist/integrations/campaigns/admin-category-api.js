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
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const api_standards_1 = require("../../standards/api-standards");
const middleware_1 = require("../../auth/middleware");
const types_1 = require("./types");
const logger_1 = require("../../utils/logger");
const utils_1 = require("./utils");
const prisma_1 = require("../../database/prisma");
const validators_1 = require("./validators");
const constants_1 = require("./constants");
const router = express.Router();
// カテゴリー一覧取得API
router.get('/campaign-categories', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const page = Number(req.query.page) || constants_1.PAGINATION.DEFAULT_PAGE;
        const limit = Number(req.query.limit) || constants_1.PAGINATION.DEFAULT_LIMIT;
        const skip = (page - 1) * limit;
        const [categories, total] = await Promise.all([
            prisma_1.hotelDb.getAdapter().campaignCategory.findMany({
                skip,
                take: limit,
                orderBy: {
                    name: 'asc'
                }
            }),
            prisma_1.hotelDb.getAdapter().campaignCategory.count()
        ]);
        const mappedCategories = categories.map(utils_1.mapCategoryToInfo);
        return api_standards_1.StandardResponseBuilder.success(res, mappedCategories, {
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to get campaign categories', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign categories').response);
    }
});
// カテゴリー作成API
router.post('/campaign-categories', middleware_1.verifyAdminAuth, (0, validators_1.validateBody)(types_1.campaignCategoryCreateSchema), (0, validators_1.validateUniqueCategoryCode)(prisma_1.hotelDb.getAdapter()), async (req, res) => {
    try {
        const category = await prisma_1.hotelDb.getAdapter().campaignCategory.create({
            data: {
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        return api_standards_1.StandardResponseBuilder.success(res, (0, utils_1.mapCategoryToInfo)(category), null, 201);
    }
    catch (error) {
        logger_1.logger.error('Failed to create campaign category', error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to create campaign category').response);
    }
});
// カテゴリー詳細取得API
router.get('/campaign-categories/:id', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma_1.hotelDb.getAdapter().campaignCategory.findUnique({
            where: { id }
        });
        if (!category) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('NOT_FOUND', 'Campaign category not found').response);
        }
        return api_standards_1.StandardResponseBuilder.success(res, (0, utils_1.mapCategoryToInfo)(category));
    }
    catch (error) {
        logger_1.logger.error(`Failed to get campaign category: ${req.params.id}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to get campaign category').response);
    }
});
// カテゴリー更新API
router.put('/campaign-categories/:id', middleware_1.verifyAdminAuth, (0, validators_1.validateBody)(types_1.campaignCategoryUpdateSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const existingCategory = await prisma_1.hotelDb.getAdapter().campaignCategory.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('NOT_FOUND', 'Campaign category not found').response);
        }
        const updatedCategory = await prisma_1.hotelDb.getAdapter().campaignCategory.update({
            where: { id },
            data: {
                ...req.body,
                updatedAt: new Date()
            }
        });
        return api_standards_1.StandardResponseBuilder.success(res, (0, utils_1.mapCategoryToInfo)(updatedCategory));
    }
    catch (error) {
        logger_1.logger.error(`Failed to update campaign category: ${req.params.id}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to update campaign category').response);
    }
});
// カテゴリー削除API
router.delete('/campaign-categories/:id', middleware_1.verifyAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const existingCategory = await prisma_1.hotelDb.getAdapter().campaignCategory.findUnique({
            where: { id }
        });
        if (!existingCategory) {
            return res.status(404).json(api_standards_1.StandardResponseBuilder.error('NOT_FOUND', 'Campaign category not found').response);
        }
        // 関連するキャンペーンがあるか確認
        const relatedCampaigns = await prisma_1.hotelDb.getAdapter().campaignCategoryRelation.findFirst({
            where: { categoryId: id }
        });
        if (relatedCampaigns) {
            return res.status(409).json(api_standards_1.StandardResponseBuilder.error('CONFLICT', 'Cannot delete category that is associated with campaigns').response);
        }
        await prisma_1.hotelDb.getAdapter().campaignCategory.delete({
            where: { id }
        });
        return res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error(`Failed to delete campaign category: ${req.params.id}`, error);
        return res.status(500).json(api_standards_1.StandardResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Failed to delete campaign category').response);
    }
});
exports.default = router;
