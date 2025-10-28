/**
 * 管理者用API
 * 
 * このファイルは、管理者用のAPIエンドポイントを提供します。
 */
import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';

import { getTenantServices, updateTenantService } from '../api/tenant-service-api';
import { hotelDb } from '../database/prisma';

// PrismaClientの直接インスタンス化は避け、hotelDb.getClient()を使用
const prisma = hotelDb.getClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key';

// 認証ミドルウェア
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authMiddleware = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: '認証が必要です' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error: unknown) {
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
    const token = jwt.sign(
      { id: admin.id, email: admin.email, adminLevel: admin.admin_level },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

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
  } catch (error: unknown) {
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        domain: true,
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        planType: true,
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Prismaスキーマに存在するが型定義されていないプロパティ
        planCategory: true,
        status: true,
        createdAt: true
      }
    });

    res.json({ success: true, tenants });
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    console.error('Get integration status error:', error);
    res.status(500).json({ success: false, error: '統合状況の取得中にエラーが発生しました' });
  }
});

// テナントのサービス情報を取得
router.get('/tenant-services/:tenantId', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const result = await getTenantServices(tenantId);

    if (result.success) {
      res.json({ success: true, services: result.data });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error: unknown) {
    console.error('Get tenant services error:', error);
    res.status(500).json({ success: false, error: 'テナントサービスの取得中にエラーが発生しました' });
  }
});

// テナントのサービス情報を更新
router.put('/tenant-services/:tenantId/:serviceId', authMiddleware, async (req, res) => {
  try {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const { tenantId, serviceId } = req.params;
    const { planType, isActive } = req.body;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

    // サービスIDからサービスタイプを取得
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    const service = await prisma.tenant_services.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ success: false, error: '指定されたサービスが見つかりません' });
    }

    const result = await updateTenantService(tenantId, service.service_type, planType, isActive);

    if (result.success) {
      res.json({ success: true, service: result.data });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: unknown) {
    console.error('Update tenant service error:', error);
    res.status(500).json({ success: false, error: 'テナントサービスの更新中にエラーが発生しました' });
  }
});

// テナントに新しいサービスを追加
router.post('/tenant-services/:tenantId', authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { serviceType, planType, isActive } = req.body;

    const result = await updateTenantService(tenantId, serviceType, planType, isActive);

    if (result.success) {
      res.json({ success: true, service: result.data });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: unknown) {
    console.error('Add tenant service error:', error);
    res.status(500).json({ success: false, error: 'テナントサービスの追加中にエラーが発生しました' });
  }
});

export default router;