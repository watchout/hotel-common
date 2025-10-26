"use strict";
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
exports.default = handler;
const resource_metadata_1 = require("../../../../../config/resource-metadata");
const prisma_1 = require("../../../../../database/prisma");
async function handler(req, res) {
    try {
        const resource = req.params.resource;
        console.log(`🔍 [hotel-common] POST /api/v1/admin/resources/${resource}`);
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
            const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
            const { v4: uuidv4 } = await Promise.resolve().then(() => __importStar(require('uuid')));
            const hashedPassword = await bcrypt.hash(body.password, 10);
            const staffId = uuidv4();
            const newStaff = await prisma_1.prisma.staff.create({
                data: {
                    id: staffId,
                    email: body.email,
                    password_hash: hashedPassword,
                    name: body.name || '',
                    is_active: body.isActive !== undefined ? body.isActive : true,
                    is_deleted: false,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
            // テナント関連付け（staff_tenant_memberships）
            const { v4: uuidv4Member } = await Promise.resolve().then(() => __importStar(require('uuid')));
            await prisma_1.prisma.staff_tenant_memberships.create({
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
