/** @req: REQ-API-GEN-002 */
/**
 * 汎用CRUD 作成API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericCreate
 *
 * POST /api/v1/admin/resources/{resource}
 * 権限: メタデータで定義（例: system:staff:manage）
 *
 * Phase C-1: staff作成のみ実装
 */


import { getResourceMetadata } from '../../../../../config/resource-metadata';
import { prisma } from '../../../../../database/prisma';

import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    const resource = req.params.resource;
    console.log(`🔍 [hotel-common] POST /api/v1/admin/resources/${resource}`);

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
      // === スタッフ作成ロジック ===

      // 必須フィールドチェック
      if (!body.email || !body.password) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'email と password は必須です' }
        });
      }

      // データ作成
      const bcrypt = await import('bcrypt');
      const { v4: uuidv4 } = await import('uuid');
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const staffId = uuidv4();

      const newStaff = await prisma.staff.create({
        data: {
          id: staffId,
          email: body.email,
          password_hash: hashedPassword,
          name: body.name || '',
          is_active: body.isActive !== undefined ? body.isActive : true,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date()
        } as any
      });

      // テナント関連付け（staff_tenant_memberships）
      const { v4: uuidv4Member } = await import('uuid');
      await prisma.staff_tenant_memberships.create({
        data: {
          id: uuidv4Member(),
          staff_id: newStaff.id,
          tenant_id: tenantId,
          created_at: new Date()
        }
      });

      console.log(`✅ [hotel-common] スタッフ作成成功: ${newStaff.id}`);

      // レスポンス整形
      const formattedStaff = {
        id: newStaff.id,
        email: newStaff.email,
        name: newStaff.name || '',
        isActive: newStaff.is_active,
        createdAt: newStaff.created_at.toISOString()
      };

      return res.status(201).json({
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
    console.error('❌ [hotel-common] [resources.post] Error:', error);

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

