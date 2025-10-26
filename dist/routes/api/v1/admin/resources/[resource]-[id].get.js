"use strict";
/** @req: REQ-API-GEN-003 */
/**
 * 汎用CRUD 単体取得API
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericGet
 *
 * GET /api/v1/admin/resources/{resource}/{id}
 * 権限: メタデータで定義（例: system:staff:view）
 *
 * Phase C-1: staff取得のみ実装
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const resource_metadata_1 = require("../../../../../config/resource-metadata");
const prisma_1 = require("../../../../../database/prisma");
async function handler(req, res) {
    try {
        const { resource, id } = req.params;
        console.log(`🔍 [hotel-common] GET /api/v1/admin/resources/${resource}/${id}`);
        // 1. リソースメタデータ取得
        const metadata = (0, resource_metadata_1.getResourceMetadata)(resource);
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
        const user = req.user;
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
        console.log(`✅ [hotel-common] 権限チェック: ${metadata.perms.view}（暫定スキップ）`);
        // 4. リソース別処理（Phase C-1: staffのみ）
        if (resource === 'staff') {
            // === スタッフ単体取得ロジック ===
            const staff = await prisma_1.prisma.staff.findFirst({
                where: {
                    id,
                    is_deleted: false,
                    staff_tenant_memberships: {
                        some: { tenant_id: tenantId }
                    }
                }
            });
            if (!staff) {
                console.error(`❌ [hotel-common] スタッフが見つかりません: ${id}`);
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'スタッフが見つかりません'
                    }
                });
            }
            console.log(`✅ [hotel-common] スタッフ取得成功: ${staff.id}`);
            // レスポンス整形
            const formattedStaff = {
                id: staff.id,
                email: staff.email,
                name: staff.name || '',
                isActive: staff.is_active,
                lockedUntil: staff.locked_until?.toISOString() || null,
                failedLoginCount: staff.failed_login_count || 0,
                lastLoginAt: staff.last_login_at?.toISOString() || null,
                createdAt: staff.created_at.toISOString(),
                updatedAt: staff.updated_at?.toISOString() || null
            };
            return res.status(200).json({
                success: true,
                data: formattedStaff
            });
        }
        else {
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
    }
    catch (error) {
        console.error('❌ [hotel-common] [resources-id.get] Error:', error);
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
