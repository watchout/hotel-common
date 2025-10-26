/** @req: REQ-API-GEN-004 */
/**
 * 汎用CRUD 更新API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericUpdate
 *
 * PATCH /api/v1/admin/resources/{resource}/{id}
 * 権限: メタデータで定義（例: system:staff:manage）
 *
 * Phase C-1: staff更新のみ実装
 */

import { Request, Response } from 'express';
import { getResourceMetadata } from '../../../../../config/resource-metadata';
import { prisma } from '../../../../../database/prisma';

export default async function handler(req: Request, res: Response) {
  try {
    const { resource, id } = req.params;
    console.log(`🔍 [hotel-common] PATCH /api/v1/admin/resources/${resource}/${id}`);

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
    console.log(`✅ [hotel-common] 権限チェック: ${metadata.perms.write}（暫定スキップ）`);

    // 4. リクエストボディの取得
    const body = req.body;
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'リクエストボディが空です' }
      });
    }

    // 5. リソース別処理（Phase C-1: staffのみ）
    if (resource === 'staff') {
      // === スタッフ更新ロジック ===

      // 存在チェック（テナント分離含む）
      const existing = await prisma.staff.findFirst({
        where: {
          id,
          is_deleted: false,
          staff_tenant_memberships: {
            some: { tenant_id: tenantId }
          }
        } as any
      });

      if (!existing) {
        console.error(`❌ [hotel-common] スタッフが見つかりません: ${id}`);
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'スタッフが見つかりません'
          }
        });
      }

      // 更新データの構築
      const updateData: any = {
        updated_at: new Date()
      };

      if (body.name !== undefined) updateData.name = body.name;
      if (body.isActive !== undefined) updateData.is_active = body.isActive;
      if (body.email !== undefined) updateData.email = body.email;

      // パスワード更新（提供された場合のみ）
      if (body.password) {
        const bcrypt = await import('bcrypt');
        updateData.password_hash = await bcrypt.hash(body.password, 10);
      }

      // データ更新
      const updatedStaff = await prisma.staff.update({
        where: { id },
        data: updateData
      });

      console.log(`✅ [hotel-common] スタッフ更新成功: ${updatedStaff.id}`);

      // レスポンス整形
      const formattedStaff = {
        id: updatedStaff.id,
        email: updatedStaff.email,
        name: updatedStaff.name || '',
        isActive: updatedStaff.is_active,
        updatedAt: updatedStaff.updated_at?.toISOString() || null
      };

      return res.status(200).json({
        success: true,
        data: formattedStaff
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
  } catch (error: any) {
    console.error('❌ [hotel-common] [resources-id.patch] Error:', error);

    // Prisma unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'すでに存在するデータです（email重複等）'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}

