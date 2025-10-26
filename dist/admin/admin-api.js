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
/**
 * 管理者用API
 *
 * このファイルは、管理者用のAPIエンドポイントを提供します。
 */
const bcrypt = __importStar(require("bcrypt"));
const express = __importStar(require("express"));
const jwt = __importStar(require("jsonwebtoken"));
const tenant_service_api_1 = require("../api/tenant-service-api");
const prisma_1 = require("../database/prisma");
// PrismaClientの直接インスタンス化は避け、hotelDb.getClient()を使用
const prisma = prisma_1.hotelDb.getClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key';
// 認証ミドルウェア
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, error: '認証が必要です' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, error: '無効なトークンです' });
    }
};
// ログイン
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await prisma.admin.findUnique({
            where: { email }
        });
        if (!admin) {
            return res.status(401).json({ success: false, error: 'メールアドレスまたはパスワードが正しくありません' });
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: 'メールアドレスまたはパスワードが正しくありません' });
        }
        // 最終ログイン日時を更新
        await prisma.admin.update({
            where: { id: admin.id },
            data: { last_login_at: new Date() }
        });
        // JWTトークンを生成
        const token = jwt.sign({ id: admin.id, email: admin.email, adminLevel: admin.admin_level }, JWT_SECRET, { expiresIn: '8h' });
        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                username: admin.username,
                displayName: admin.display_name,
                adminLevel: admin.admin_level
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'ログイン処理中にエラーが発生しました' });
    }
});
// テナント一覧を取得
router.get('/tenants', authMiddleware, async (req, res) => {
    try {
        const tenants = await prisma.tenant.findMany({
            select: {
                id: true,
                name: true,
                domain: true,
                planType: true,
                // @ts-ignore - Prismaスキーマに存在するが型定義されていないプロパティ
                planCategory: true,
                status: true,
                createdAt: true
            }
        });
        res.json({ success: true, tenants });
    }
    catch (error) {
        console.error('Get tenants error:', error);
        res.status(500).json({ success: false, error: 'テナント一覧の取得中にエラーが発生しました' });
    }
});
// チェーン一覧を取得（モック）
router.get('/chains', authMiddleware, async (req, res) => {
    try {
        // モックデータ
        const chains = [
            { id: 'chain_1', name: 'ホテルチェーンA', tenantsCount: 15, status: 'active' },
            { id: 'chain_2', name: 'ホテルチェーンB', tenantsCount: 8, status: 'active' },
            { id: 'chain_3', name: 'ホテルチェーンC', tenantsCount: 3, status: 'inactive' }
        ];
        res.json({ success: true, chains });
    }
    catch (error) {
        console.error('Get chains error:', error);
        res.status(500).json({ success: false, error: 'チェーン一覧の取得中にエラーが発生しました' });
    }
});
// グループ一覧を取得（モック）
router.get('/groups', authMiddleware, async (req, res) => {
    try {
        // モックデータ
        const groups = [
            { id: 'group_1', name: 'ホテルグループX', chainsCount: 3, tenantsCount: 25, status: 'active' },
            { id: 'group_2', name: 'ホテルグループY', chainsCount: 1, tenantsCount: 12, status: 'active' },
            { id: 'group_3', name: 'ホテルグループZ', chainsCount: 2, tenantsCount: 8, status: 'active' }
        ];
        res.json({ success: true, groups });
    }
    catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ success: false, error: 'グループ一覧の取得中にエラーが発生しました' });
    }
});
// システム統合状況を取得（モック）
router.get('/integration-status', authMiddleware, async (req, res) => {
    try {
        // モックデータ
        const status = {
            'hotel-saas': { progress: 60, status: 'partial', message: 'Customer model追加中' },
            'hotel-member': { progress: 0, status: 'disconnected', message: 'DB接続修正必要' },
            'hotel-pms': { progress: 20, status: 'partial', message: 'Schema移行必要' }
        };
        res.json({ success: true, status });
    }
    catch (error) {
        console.error('Get integration status error:', error);
        res.status(500).json({ success: false, error: '統合状況の取得中にエラーが発生しました' });
    }
});
// テナントのサービス情報を取得
router.get('/tenant-services/:tenantId', authMiddleware, async (req, res) => {
    try {
        const { tenantId } = req.params;
        const result = await (0, tenant_service_api_1.getTenantServices)(tenantId);
        if (result.success) {
            res.json({ success: true, services: result.data });
        }
        else {
            res.status(404).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        console.error('Get tenant services error:', error);
        res.status(500).json({ success: false, error: 'テナントサービスの取得中にエラーが発生しました' });
    }
});
// テナントのサービス情報を更新
router.put('/tenant-services/:tenantId/:serviceId', authMiddleware, async (req, res) => {
    try {
        const { tenantId, serviceId } = req.params;
        const { planType, isActive } = req.body;
        // サービスIDからサービスタイプを取得
        // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
        const service = await prisma.tenant_services.findUnique({
            where: { id: serviceId }
        });
        if (!service) {
            return res.status(404).json({ success: false, error: '指定されたサービスが見つかりません' });
        }
        const result = await (0, tenant_service_api_1.updateTenantService)(tenantId, service.service_type, planType, isActive);
        if (result.success) {
            res.json({ success: true, service: result.data });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        console.error('Update tenant service error:', error);
        res.status(500).json({ success: false, error: 'テナントサービスの更新中にエラーが発生しました' });
    }
});
// テナントに新しいサービスを追加
router.post('/tenant-services/:tenantId', authMiddleware, async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { serviceType, planType, isActive } = req.body;
        const result = await (0, tenant_service_api_1.updateTenantService)(tenantId, serviceType, planType, isActive);
        if (result.success) {
            res.json({ success: true, service: result.data });
        }
        else {
            res.status(500).json({ success: false, error: result.error });
        }
    }
    catch (error) {
        console.error('Add tenant service error:', error);
        res.status(500).json({ success: false, error: 'テナントサービスの追加中にエラーが発生しました' });
    }
});
exports.default = router;
