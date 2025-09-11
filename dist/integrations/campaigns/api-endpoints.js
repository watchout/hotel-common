"use strict";
// キャンペーン管理APIエンドポイント
// 緊急対応：最小限の実装
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrateCampaignFeature = integrateCampaignFeature;
const express_1 = __importDefault(require("express"));
const api_standards_1 = require("../../standards/api-standards");
const router = express_1.default.Router();
/**
 * アクティブなキャンペーン一覧を取得
 */
router.get('/active', (req, res) => {
    try {
        // スタブデータ
        const campaigns = [
            {
                id: 'camp_001',
                name: '夏季特別キャンペーン',
                code: 'SUMMER2025',
                description: '夏の特別割引キャンペーン',
                startDate: '2025-07-01',
                endDate: '2025-08-31',
                isActive: true,
                discountRate: 15,
                targetCustomers: ['ALL']
            },
            {
                id: 'camp_002',
                name: '新規会員登録キャンペーン',
                code: 'NEWMEMBER',
                description: '新規会員登録特典',
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                isActive: true,
                discountRate: 10,
                targetCustomers: ['NEW']
            }
        ];
        return res.json({
            success: true,
            campaigns
        });
    }
    catch (error) {
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('CAMPAIGN_ERROR', 'キャンペーン取得エラー', error instanceof Error ? error.message : String(error));
        return res.status(statusCode).json(response);
    }
});
/**
 * 特定のキャンペーンを取得
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        // スタブデータ
        const campaign = {
            id,
            name: id === 'camp_001' ? '夏季特別キャンペーン' : '新規会員登録キャンペーン',
            code: id === 'camp_001' ? 'SUMMER2025' : 'NEWMEMBER',
            description: id === 'camp_001' ? '夏の特別割引キャンペーン' : '新規会員登録特典',
            startDate: id === 'camp_001' ? '2025-07-01' : '2025-01-01',
            endDate: id === 'camp_001' ? '2025-08-31' : '2025-12-31',
            isActive: true,
            discountRate: id === 'camp_001' ? 15 : 10,
            targetCustomers: id === 'camp_001' ? ['ALL'] : ['NEW'],
            createdAt: '2025-06-01T00:00:00Z',
            updatedAt: '2025-06-01T00:00:00Z'
        };
        return res.json({
            success: true,
            campaign
        });
    }
    catch (error) {
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('CAMPAIGN_ERROR', 'キャンペーン取得エラー', error instanceof Error ? error.message : String(error));
        return res.status(statusCode).json(response);
    }
});
/**
 * カテゴリ別キャンペーン一覧を取得
 */
router.get('/category/:categoryId', (req, res) => {
    try {
        const { categoryId } = req.params;
        // スタブデータ
        const campaigns = [
            {
                id: 'camp_001',
                name: '夏季特別キャンペーン',
                code: 'SUMMER2025',
                description: '夏の特別割引キャンペーン',
                startDate: '2025-07-01',
                endDate: '2025-08-31',
                isActive: true,
                discountRate: 15,
                targetCustomers: ['ALL'],
                categoryId
            }
        ];
        return res.json({
            success: true,
            categoryId,
            campaigns
        });
    }
    catch (error) {
        const { response, statusCode } = api_standards_1.StandardResponseBuilder.error('CAMPAIGN_ERROR', 'キャンペーン取得エラー', error instanceof Error ? error.message : String(error));
        return res.status(statusCode).json(response);
    }
});
// エクスポート
exports.default = router;
// 統合用関数
function integrateCampaignFeature() {
    console.log('キャンペーン機能を統合しました');
    return router;
}
