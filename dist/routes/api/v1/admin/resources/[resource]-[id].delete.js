"use strict";
/** @req: REQ-API-GEN-005 */
/**
 * 汎用CRUD 削除API（論理削除）
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 * OpenAPI: generic-resources.yaml operationId: genericDelete
 *
 * DELETE /api/v1/admin/resources/{resource}/{id}
 * 権限: メタデータで定義（例: system:staff:manage）
 *
 * Phase C-1: staff削除のみ実装（論理削除）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const resource_metadata_1 = require("../../../../../config/resource-metadata");
const prisma_1 = require("../../../../../database/prisma");
async function handler(req, res) {
    try {
        const { resource, id } = req.params;
        console.log(`🔍 [hotel-common] DELETE /api/v1/admin/resources/${resource}/${id}`);
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
        console.log(`✅ [hotel-common] 権限チェック: ${metadata.perms.write}（暫定スキップ）`);
        // 4. リソース別処理（Phase C-1: staffのみ）
        if (resource === 'staff') {
            // === スタッフ削除ロジック（論理削除） ===
            // 存在チェック（テナント分離含む）
            const existing = await prisma_1.prisma.staff.findFirst({
                where: {
                    id,
                    is_deleted: false,
                    staff_tenant_memberships: {
                        some: { tenant_id: tenantId }
                    }
                }
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
            // 論理削除
            await prisma_1.prisma.staff.update({
                where: { id },
                data: {
                    is_deleted: true,
                    deleted_at: new Date(),
                    updated_at: new Date()
                }
            });
            console.log(`✅ [hotel-common] スタッフ削除成功（論理削除）: ${id}`);
            // 204 No Content（レスポンスボディなし）
            return res.status(204).send();
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
        console.error('❌ [hotel-common] [resources-id.delete] Error:', error);
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
