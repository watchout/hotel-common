/** @req: REQ-API-GEN-001 */
/**
 * 汎用CRUD 一覧取得API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericList
 *
 * GET /api/v1/admin/resources/{resource}
 * 権限: メタデータで定義（例: system:staff:view）
 *
 * Phase C-1: staff一覧のみ実装
 */

import { Request, Response } from 'express';
import { getResourceMetadata } from '../../../../../config/resource-metadata';
import { prisma } from '../../../../../database/prisma';

export default async function handler(req: Request, res: Response) {
  try {
    const resource = req.params.resource;
    console.log(`🔍 [hotel-common] /api/v1/admin/resources/${resource} 呼び出し`);

    // 1. リソースメタデータ取得
    const metadata = getResourceMetadata(resource);
    if (!metadata) {
      console.error(`❌ [hotel-common] 未サポートリソース: ${resource}`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_RESOURCE',
          message: `リソース '${resource}' はサポートされていません`
        }
      });
    }

    // 2. Session認証チェック
    const user = req.user as any | undefined;
    if (!user) {
      console.error('❌ [hotel-common] 認証ユーザーがありません');
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '認証が必要です' }
      });
    }

    const tenantId = user.tenant_id;
    if (!tenantId) {
      console.error('❌ [hotel-common] tenantId がありません');
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'テナント情報が取得できません' }
      });
    }

    // 3. 権限チェック（TODO: 権限サービス統合後に実装）
    // const hasPermission = await checkPermission(user.id, metadata.perms.list);
    // if (!hasPermission) {
    //   return res.status(403).json({
    //     success: false,
    //     error: { code: 'PERMISSION_DENIED', message: '権限がありません' }
    //   });
    // }
    console.log(`✅ [hotel-common] 権限チェック: ${metadata.perms.list}（暫定スキップ）`);

    // 4. クエリパラメータの取得
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const includeDeleted = req.query.includeDeleted === 'true';

    const skip = (page - 1) * limit;

    // 5. リソース別処理（Phase C-1: staffのみ）
    if (resource === 'staff') {
      // === スタッフ一覧取得ロジック ===

      // Where条件の構築
      const where: any = {};

      // 論理削除フィルタ
      if (!includeDeleted) {
        where.is_deleted = false;
      }

      // 検索フィルタ
      if (search) {
        where.OR = metadata.searchFields.map(field => ({
          [field]: { contains: search, mode: 'insensitive' }
        }));
      }

      // テナント分離（staff_tenant_memberships経由）
      where.staff_tenant_memberships = {
        some: { tenant_id: tenantId }
      };

      // orderByのフォールバック
      const orderBy = (metadata.orderByDefault as any) || { created_at: 'desc' };

      console.log('🔍 [hotel-common] where:', JSON.stringify(where, null, 2));

      // データ取得（シンプル版）
      const [staff, total] = await Promise.all([
        prisma.staff.findMany({
          where,
          skip,
          take: limit,
          orderBy
        }),
        prisma.staff.count({ where })
      ]);

      console.log(`✅ [hotel-common] スタッフ一覧取得成功:`, { total, count: staff.length });

      // レスポンス整形
      const formattedStaff = staff.map(s => ({
        id: s.id,
        email: s.email,
        name: s.name || '',
        isActive: s.is_active,
        lockedUntil: s.locked_until?.toISOString() || null,
        failedLoginCount: s.failed_login_count || 0,
        lastLoginAt: s.last_login_at?.toISOString() || null,
        createdAt: s.created_at.toISOString(),
        role: null
      }));

      return res.status(200).json({
        success: true,
        data: {
          staff: formattedStaff,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } else {
      // 未実装リソース
      console.error(`❌ [hotel-common] リソース '${resource}' は未実装です`);
      return res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: `リソース '${resource}' はまだ実装されていません`
        }
      });
    }
  } catch (error) {
    console.error('❌ [hotel-common] [resources.get] Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }
    });
  }
}

