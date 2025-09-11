import express from 'express';
import { Request, Response } from 'express';
import { generateToken, verifyToken } from '../../../auth/jwt';
import { HierarchicalJWTPayload } from '../../../auth/types';
import { HotelLogger } from '../../../utils/logger';
import { StandardResponseBuilder } from '../../../utils/response-builder';
import { hotelDb } from '../../../database';
import * as bcrypt from 'bcrypt';

const router = express.Router();
const logger = HotelLogger.getInstance();

/**
 * ログイン処理
 * POST /api/v1/auth/login
 */
router.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  console.log('🔐 [AUTH] ログインリクエスト受信 - 修正版コード実行中');
  try {
    const { email, password, tenantId } = req.body;

    // 入力値検証
    if (!email || !password) {
      return res.status(400).json(
        StandardResponseBuilder.error('VALIDATION_ERROR', '必須フィールドが不足しています').response
      );
    }

    // スタッフ認証（メールアドレスで検索）
    const staffMembers = await hotelDb.getAdapter().staff.findMany({
      where: {
        email,
        is_active: true,
        is_deleted: false
      }
    });

    if (staffMembers.length === 0) {
      return res.status(401).json(
        StandardResponseBuilder.error('INVALID_CREDENTIALS', '認証情報が正しくありません').response
      );
    }
    // 特定のテナントが指定されている場合は、そのテナントのスタッフに限定
    const candidateStaffList = tenantId
      ? staffMembers.filter(s => s.tenant_id === tenantId)
      : staffMembers;

    if (tenantId && candidateStaffList.length === 0) {
      return res.status(404).json(
        StandardResponseBuilder.error('TENANT_NOT_FOUND', '指定されたテナントにアクセス権がありません').response
      );
    }

    // パスワードハッシュ照合（bcrypt）
    let selectedStaffMember = null as any;
    for (const s of candidateStaffList) {
      const hash = (s as any).password_hash as string | null | undefined;
      if (!hash) {
        logger.info('パスワードハッシュ未設定をスキップ', { email, staffId: s.id });
        continue; // パスワード未設定はスキップ
      }
      logger.info('bcrypt照合開始', { email, hashExists: !!hash });
      const ok = await bcrypt.compare(password, hash);
      logger.info('bcrypt照合結果', { email, result: ok });
      if (ok) {
        selectedStaffMember = s;
        break;
      }
    }

    if (!selectedStaffMember) {
      // 認証情報は伏せて統一エラー
      return res.status(401).json(
        StandardResponseBuilder.error('INVALID_CREDENTIALS', '認証情報が正しくありません').response
      );
    }
    
    // 複数テナントに所属している場合の処理
    const availableTenants = await Promise.all(
      staffMembers.map(async (staffMember) => {
        const tenant = await hotelDb.getAdapter().tenant.findUnique({
          where: { id: staffMember.tenant_id }
        });
        return {
          tenantId: staffMember.tenant_id,
          staffId: staffMember.id,
          staffRole: staffMember.role,
          tenant: tenant
        };
      })
    );

    // 選択されたテナントの情報を取得
    const selectedTenantId = selectedStaffMember.tenant_id;
    const selectedTenant = availableTenants.find(t => t.tenantId === selectedTenantId)?.tenant;

    if (!selectedTenant) {
      return res.status(404).json(
        StandardResponseBuilder.error('TENANT_NOT_FOUND', 'テナント情報が見つかりません').response
      );
    }

    // accessible_tenantsを生成（必ずtenant_idを含む）
    const accessibleTenants = availableTenants.map(t => t.tenantId);
    if (!accessibleTenants.includes(selectedTenantId)) {
      accessibleTenants.push(selectedTenantId);
    }

    // JWTトークン生成
    const tokenPayload: HierarchicalJWTPayload = {
      user_id: selectedStaffMember.id,
      tenant_id: selectedTenantId,
      email: selectedStaffMember.email,
      role: selectedStaffMember.role as 'STAFF' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'OWNER' | 'SYSTEM',
      level: 3, // デフォルトレベル
      permissions: selectedStaffMember.role === 'SUPER_ADMIN' ? ['*'] : ['tenant:read', 'tenant:write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8時間
      jti: `jwt-${Date.now()}`,
      accessible_tenants: accessibleTenants,
      hierarchy_context: {
        organization_id: selectedTenantId,
        organization_level: 3 as const,
        organization_type: 'HOTEL' as const,
        organization_path: `/${selectedTenantId}`,
        access_scope: ['tenant'],
        data_access_policies: {}
      },
      type: 'access'
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateToken({
      ...tokenPayload,
      type: 'refresh' as const,
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30日
    });

    // ログイン記録更新
    await hotelDb.getAdapter().staff.update({
      where: { id: selectedStaffMember.id },
      data: { last_login_at: new Date() }
    });

    logger.info('ログイン成功', { userId: selectedStaffMember.id, tenantId: selectedTenantId, email });

    return StandardResponseBuilder.success(res, {
      accessToken,
      refreshToken,
      user: {
        id: selectedStaffMember.id,
        email: selectedStaffMember.email,
        name: selectedStaffMember.name,
        role: selectedStaffMember.role,
        tenantId: selectedTenantId
      },
      tenant: selectedTenant,
      availableTenants: availableTenants.map(t => ({
        id: t.tenantId,
        name: t.tenant?.name || 'Unknown',
        domain: t.tenant?.domain || 'unknown.domain',
        staffRole: t.staffRole
      }))
    });

  } catch (error) {
    logger.error('ログインエラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('LOGIN_ERROR', 
        error instanceof Error ? error.message : 'ログインに失敗しました').response
    );
  }
});

/**
 * ログアウト処理
 * POST /api/v1/auth/logout
 */
router.post('/api/v1/auth/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    // トークンがない場合は早期リターン
    if (!authHeader) {
      return StandardResponseBuilder.success(res, {
        message: 'ログアウト成功（トークンなし）',
        clearTokens: true // クライアント側でトークンを削除するフラグ
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      // トークンを検証
      const decoded = verifyToken(token);
      
      // ログアウト記録
      logger.info('ログアウト成功', { 
        userId: decoded.user_id, 
        tenantId: decoded.tenant_id, 
        email: decoded.email 
      });

      // ログアウト成功レスポンス
      return StandardResponseBuilder.success(res, {
        message: 'ログアウト成功',
        clearTokens: true // クライアント側でトークンを削除するフラグ
      });
    } catch (verifyError) {
      // トークンが無効でも成功レスポンスを返す
      return StandardResponseBuilder.success(res, {
        message: 'ログアウト成功（無効なトークン）',
        clearTokens: true // クライアント側でトークンを削除するフラグ
      });
    }
  } catch (error) {
    logger.error('ログアウトエラー:', error);
    // エラーが発生してもユーザー側では正常にログアウトできたと表示するため、
    // 成功レスポンスを返す
    return StandardResponseBuilder.success(res, {
      message: 'ログアウト成功',
      clearTokens: true // クライアント側でトークンを削除するフラグ
    });
  }
});

/**
 * テナント切り替え
 * POST /api/v1/auth/switch-tenant
 */
router.post('/api/v1/auth/switch-tenant', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(
        StandardResponseBuilder.error('MISSING_TOKEN', 'Authorizationヘッダーが必要です').response
      );
    }

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('MISSING_TENANT_ID', 'テナントIDが必要です').response
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = verifyToken(token);
      
      // アクセス可能なテナントかチェック（フォールバック対応）
      const accessibleTenants = decoded.accessible_tenants || [decoded.tenant_id];
      if (!accessibleTenants.includes(tenantId)) {
        return res.status(403).json(
          StandardResponseBuilder.error('TENANT_ACCESS_DENIED', 'このテナントへのアクセス権がありません').response
        );
      }

      // テナント情報を取得
      const tenant = await hotelDb.getAdapter().tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        return res.status(404).json(
          StandardResponseBuilder.error('TENANT_NOT_FOUND', 'テナントが見つかりません').response
        );
      }

      // スタッフ情報を取得
      const staff = await hotelDb.getAdapter().staff.findFirst({
        where: {
          email: decoded.email,
          tenant_id: tenantId,
          is_active: true
        }
      });

      if (!staff) {
        return res.status(404).json(
          StandardResponseBuilder.error('STAFF_NOT_FOUND', 'スタッフ情報が見つかりません').response
        );
      }

      // accessible_tenantsを確保（必ずtenant_idを含む）
      const updatedAccessibleTenants = decoded.accessible_tenants || [decoded.tenant_id];
      if (!updatedAccessibleTenants.includes(tenantId)) {
        updatedAccessibleTenants.push(tenantId);
      }

      // 新しいトークンを生成（テナントIDを更新）
      const newTokenPayload: HierarchicalJWTPayload = {
        ...decoded,
        tenant_id: tenantId,
        role: staff.role as 'STAFF' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'OWNER' | 'SYSTEM',
        accessible_tenants: updatedAccessibleTenants,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8時間
        jti: `jwt-${Date.now()}`,
        hierarchy_context: {
          ...decoded.hierarchy_context,
          organization_id: tenantId,
          organization_path: `/${tenantId}`,
        },
        type: decoded.type || 'access'
      };

      const accessToken = generateToken(newTokenPayload);
      const refreshToken = generateToken({
        ...newTokenPayload,
        type: 'refresh' as const,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30日
      });

      // ログイン記録更新
      await hotelDb.getAdapter().staff.update({
        where: { id: staff.id },
        data: { last_login_at: new Date() }
      });

      logger.info('テナント切り替え成功', { userId: staff.id, tenantId, email: staff.email });

      return StandardResponseBuilder.success(res, {
        accessToken,
        refreshToken,
        expiresIn: 28800, // 8時間（秒）
        tokenType: "Bearer",
        user: {
          id: staff.id,
          email: staff.email,
          name: staff.name,
          role: staff.role,
          tenantId
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain
        }
      });

    } catch (verifyError) {
      return res.status(401).json(
        StandardResponseBuilder.error('INVALID_TOKEN', 'トークンが無効です').response
      );
    }

  } catch (error) {
    logger.error('テナント切り替えエラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('TENANT_SWITCH_ERROR', 
        error instanceof Error ? error.message : 'テナント切り替えに失敗しました').response
    );
  }
});

/**
 * トークン検証
 * GET /api/v1/auth/validate-token
 */
router.get('/api/v1/auth/validate-token', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(
        StandardResponseBuilder.error('MISSING_TOKEN', 'Authorizationヘッダーが必要です').response
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = verifyToken(token);
      
      // トークンの有効性確認
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json(
          StandardResponseBuilder.error('TOKEN_EXPIRED', 'トークンの有効期限が切れています').response
        );
      }

      return StandardResponseBuilder.success(res, {
        valid: true,
        user: {
          user_id: decoded.user_id,
          tenant_id: decoded.tenant_id,
          email: decoded.email,
          role: decoded.role,
          level: decoded.level,
          permissions: decoded.permissions
        },
        expires_at: new Date(decoded.exp * 1000)
      });

    } catch (verifyError) {
      return res.status(401).json(
        StandardResponseBuilder.error('INVALID_TOKEN', 'トークンが無効です').response
      );
    }

  } catch (error) {
    logger.error('トークン検証エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('TOKEN_VALIDATION_ERROR', 
        error instanceof Error ? error.message : 'トークン検証に失敗しました').response
    );
  }
});

/**
 * トークンリフレッシュ
 * POST /api/v1/auth/refresh
 */
router.post('/api/v1/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(
        StandardResponseBuilder.error('MISSING_REFRESH_TOKEN', 'リフレッシュトークンが必要です').response
      );
    }

    try {
      const decoded = verifyToken(refreshToken);

      // リフレッシュトークンの検証
      if (decoded.type !== 'refresh') {
        return res.status(401).json(
          StandardResponseBuilder.error('INVALID_REFRESH_TOKEN', '無効なリフレッシュトークンです').response
        );
      }

      // 新しいアクセストークン生成
      const newTokenPayload = {
        user_id: decoded.user_id,
        tenant_id: decoded.tenant_id,
        email: decoded.email,
        role: decoded.role,
        level: decoded.level,
        permissions: decoded.permissions,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8時間
        jti: `jwt-${Date.now()}`,
        accessible_tenants: decoded.accessible_tenants || [decoded.tenant_id],
        hierarchy_context: decoded.hierarchy_context
      };

      const newAccessToken = generateToken(newTokenPayload);
      // 仕様に合わせてレスポンスは accessToken と expires_at のみ返却
      return StandardResponseBuilder.success(res, {
        accessToken: newAccessToken,
        expires_at: new Date(newTokenPayload.exp * 1000).toISOString()
      });

    } catch (verifyError) {
      return res.status(401).json(
        StandardResponseBuilder.error('INVALID_REFRESH_TOKEN', 'リフレッシュトークンが無効です').response
      );
    }

  } catch (error) {
    logger.error('トークンリフレッシュエラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('REFRESH_ERROR', 
        error instanceof Error ? error.message : 'トークンリフレッシュに失敗しました').response
    );
  }
});

/**
 * 現在のテナント情報取得（管理画面用）
 * GET /api/v1/admin/tenant/current
 */
router.get('/api/v1/admin/tenant/current', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(
        StandardResponseBuilder.error('UNAUTHORIZED', 'Authorization header required').response
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = verifyToken(token);
      
      // JWT整合性検証
      const accessibleTenants = decoded.accessible_tenants || [decoded.tenant_id];
      if (!accessibleTenants.includes(decoded.tenant_id)) {
        return res.status(500).json(
          StandardResponseBuilder.error('INTERNAL_ERROR', 'Token integrity violation').response
        );
      }

      // X-Tenant-ID検証
      const headerTenantId = req.headers['x-tenant-id'] as string;
      if (headerTenantId && headerTenantId !== decoded.tenant_id) {
        return res.status(400).json(
          StandardResponseBuilder.error('TENANT_MISMATCH', 'X-Tenant-ID must match JWT tenant_id', {
            jwt_tenant_id: decoded.tenant_id,
            header_tenant_id: headerTenantId
          }).response
        );
      }

      // テナント情報取得
      const tenant = await hotelDb.getAdapter().tenant.findUnique({
        where: { id: decoded.tenant_id },
        select: {
          id: true,
          name: true,
          domain: true,
          status: true,
          contactEmail: true,
          features: true,
          planType: true,
          settings: true,
          createdAt: true
        }
      });

      if (!tenant) {
        return res.status(404).json(
          StandardResponseBuilder.error('TENANT_NOT_FOUND', 'テナント情報が見つかりません').response
        );
      }

      return StandardResponseBuilder.success(res, {
        tenant,
        user: {
          id: decoded.user_id,
          email: decoded.email,
          role: decoded.role,
          accessible_tenants: accessibleTenants
        }
      });

    } catch (verifyError) {
      return res.status(401).json(
        StandardResponseBuilder.error('INVALID_TOKEN', 'トークンが無効です').response
      );
    }

  } catch (error) {
    logger.error('現在テナント取得エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('INTERNAL_ERROR', 
        error instanceof Error ? error.message : '現在テナント情報の取得に失敗しました').response
    );
  }
});

/**
 * テナント情報取得
 * GET /api/v1/tenants/:id
 */
import { authMiddleware } from '../../../auth/middleware'
import { validateTenantIdHeader, validateJwtIntegrity } from '../../../auth/tenant-validation-middleware'

router.get('/api/v1/tenants/:id', authMiddleware, validateTenantIdHeader, validateJwtIntegrity, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const requesterTenantId = req.user?.tenant_id;

    if (!requesterTenantId) {
      return res.status(401).json(
        StandardResponseBuilder.error('UNAUTHORIZED', 'Authentication required').response
      );
    }
    if (id !== requesterTenantId) {
      return res.status(403).json(
        StandardResponseBuilder.error('TENANT_ACCESS_DENIED', 'Access to this tenant is not allowed').response
      );
    }

    const tenant = await hotelDb.getAdapter().tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        domain: true,
        status: true,
        contactEmail: true,
        features: true,
        planType: true,
        settings: true,
        createdAt: true
      }
    });

    if (!tenant) {
      return res.status(404).json(
        StandardResponseBuilder.error('TENANT_NOT_FOUND', 'テナントが見つかりません').response
      );
    }

    return StandardResponseBuilder.success(res, tenant);

  } catch (error) {
    logger.error('テナント情報取得エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('TENANT_FETCH_ERROR', 
        error instanceof Error ? error.message : 'テナント情報取得に失敗しました').response
    );
  }
});

/**
 * スタッフ情報取得
 * GET /api/v1/staff/:id
 */
router.get('/api/v1/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json(
        StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response
      );
    }

    const staff = await hotelDb.getAdapter().staff.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      select: {
        id: true,
        tenant_id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        is_active: true,
        last_login_at: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!staff) {
      return res.status(404).json(
        StandardResponseBuilder.error('STAFF_NOT_FOUND', 'スタッフが見つかりません').response
      );
    }

    return StandardResponseBuilder.success(res, staff);

  } catch (error) {
    logger.error('スタッフ情報取得エラー:', error);
    return res.status(500).json(
      StandardResponseBuilder.error('STAFF_FETCH_ERROR', 
        error instanceof Error ? error.message : 'スタッフ情報取得に失敗しました').response
    );
  }
});

export default router;
