"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchicalJwtManager = void 0;
const jwt_1 = require("../auth/jwt");
const logger_1 = require("../utils/logger");
const permission_manager_1 = require("./permission-manager");
/**
 * 階層管理対応JWT拡張マネージャー
 *
 * 機能:
 * - 階層コンテキスト付きJWT生成
 * - 既存JWTの階層情報拡張
 * - 階層権限の動的更新
 */
class HierarchicalJwtManager {
    static logger = logger_1.HotelLogger.getInstance();
    /**
     * 階層コンテキスト付きJWT生成
     */
    static async generateHierarchicalToken(payload) {
        try {
            this.logger.debug('階層JWT生成開始', {
                user_id: payload.user_id,
                organization_id: payload.organization_id
            });
            // 1. 組織階層情報取得
            let hierarchyContext = null;
            if (payload.organization_id) {
                hierarchyContext = await this.buildHierarchyContext(payload.organization_id, payload.tenant_id);
            }
            // 2. アクセス可能テナント一覧取得
            let accessibleTenants = [payload.tenant_id];
            if (hierarchyContext) {
                accessibleTenants = await permission_manager_1.HierarchyPermissionManager.getAccessibleTenants(payload.organization_id);
            }
            // 3. 階層対応JWT Payload構築
            const hierarchicalPayload = {
                user_id: payload.user_id,
                tenant_id: payload.tenant_id,
                email: payload.email,
                role: payload.role,
                level: payload.level,
                permissions: payload.permissions,
                hierarchy_context: hierarchyContext || {
                    organization_id: '',
                    organization_level: 3, // デフォルトはHOTELレベル
                    organization_type: 'HOTEL',
                    organization_path: '',
                    access_scope: [],
                    data_access_policies: {}
                },
                accessible_tenants: accessibleTenants
            };
            // 4. JWT生成
            // @ts-ignore - 型定義が不完全
            const accessToken = (0, jwt_1.generateToken)(hierarchicalPayload);
            // @ts-ignore - 型定義が不完全
            const refreshToken = (0, jwt_1.generateToken)(hierarchicalPayload, { expiresIn: '7d' });
            this.logger.info('階層JWT生成完了', {
                user_id: payload.user_id,
                organization_level: hierarchyContext?.organization_level,
                accessible_tenant_count: accessibleTenants.length
            });
            return {
                accessToken,
                refreshToken,
                expiresIn: 86400 // 24時間（秒単位）
            };
        }
        catch (error) {
            this.logger.error('階層JWT生成エラー:', error);
            throw new Error('階層JWT生成に失敗しました');
        }
    }
    /**
     * 階層コンテキスト構築
     */
    static async buildHierarchyContext(organizationId, tenantId) {
        try {
            // 緊急対応：スタブ実装
            return {
                organization_id: organizationId,
                organization_level: 3,
                organization_type: 'HOTEL',
                organization_path: '',
                access_scope: [tenantId],
                data_access_policies: {
                    CUSTOMER: { scope: 'HOTEL', level: 'FULL' },
                    RESERVATION: { scope: 'HOTEL', level: 'FULL' },
                    ANALYTICS: { scope: 'HOTEL', level: 'FULL' },
                    FINANCIAL: { scope: 'HOTEL', level: 'FULL' },
                    STAFF: { scope: 'HOTEL', level: 'FULL' },
                    INVENTORY: { scope: 'HOTEL', level: 'FULL' }
                }
            };
        }
        catch (error) {
            this.logger.error('階層コンテキスト構築エラー:', error);
            return null;
        }
    }
    /**
     * デフォルトデータポリシー取得
     */
    static getDefaultDataPolicies(organizationType) {
        const policies = {
            GROUP: {
                CUSTOMER: { scope: 'GROUP', level: 'FULL' },
                RESERVATION: { scope: 'GROUP', level: 'FULL' },
                ANALYTICS: { scope: 'GROUP', level: 'FULL' },
                FINANCIAL: { scope: 'GROUP', level: 'FULL' },
                STAFF: { scope: 'GROUP', level: 'FULL' },
                INVENTORY: { scope: 'GROUP', level: 'FULL' }
            },
            BRAND: {
                CUSTOMER: { scope: 'BRAND', level: 'FULL' },
                RESERVATION: { scope: 'BRAND', level: 'FULL' },
                ANALYTICS: { scope: 'GROUP', level: 'SUMMARY_ONLY' },
                FINANCIAL: { scope: 'BRAND', level: 'FULL' },
                STAFF: { scope: 'BRAND', level: 'FULL' },
                INVENTORY: { scope: 'BRAND', level: 'FULL' }
            },
            HOTEL: {
                CUSTOMER: { scope: 'HOTEL', level: 'FULL' },
                RESERVATION: { scope: 'HOTEL', level: 'FULL' },
                ANALYTICS: { scope: 'HOTEL', level: 'FULL' },
                FINANCIAL: { scope: 'HOTEL', level: 'FULL' },
                STAFF: { scope: 'HOTEL', level: 'FULL' },
                INVENTORY: { scope: 'HOTEL', level: 'FULL' }
            },
            DEPARTMENT: {
                CUSTOMER: { scope: 'HOTEL', level: 'READ_ONLY' },
                RESERVATION: { scope: 'HOTEL', level: 'READ_ONLY' },
                ANALYTICS: { scope: 'DEPARTMENT', level: 'FULL' },
                FINANCIAL: { scope: 'DEPARTMENT', level: 'READ_ONLY' },
                STAFF: { scope: 'DEPARTMENT', level: 'FULL' },
                INVENTORY: { scope: 'DEPARTMENT', level: 'FULL' }
            }
        };
        return policies[organizationType] || policies.HOTEL;
    }
    /**
     * 既存JWTトークンの階層情報更新
     */
    static async refreshHierarchyContext(existingToken, newOrganizationId) {
        try {
            // 既存トークン検証・デコード
            const decoded = (0, jwt_1.verifyToken)(existingToken);
            if (!decoded) {
                throw new Error('無効なトークンです');
            }
            // 組織ID決定
            const organizationId = newOrganizationId ||
                decoded.hierarchy_context?.organization_id ||
                await this.findUserOrganization(decoded.user_id, decoded.tenant_id);
            if (!organizationId) {
                this.logger.warn(`組織IDが見つかりません: ${decoded.user_id}`);
                return existingToken; // 階層情報なしで既存トークンを返す
            }
            // 新しい階層コンテキストで再生成
            const newTokens = await this.generateHierarchicalToken({
                user_id: decoded.user_id,
                tenant_id: decoded.tenant_id,
                email: decoded.email || '',
                // @ts-ignore - 型定義が不完全
                role: decoded.role,
                // @ts-ignore - 型定義が不完全
                level: decoded.level || 0,
                permissions: decoded.permissions || [],
                organization_id: organizationId
            });
            return newTokens.accessToken;
        }
        catch (error) {
            this.logger.error('階層コンテキスト更新エラー:', error);
            throw new Error('階層コンテキスト更新に失敗しました');
        }
    }
    /**
     * ユーザーの所属組織検索
     */
    static async findUserOrganization(userId, tenantId) {
        try {
            // 緊急対応：スタブ実装
            return "org_default";
        }
        catch (error) {
            this.logger.error('ユーザー所属組織検索エラー:', error);
            return null;
        }
    }
    /**
     * 階層権限付きトークン検証
     */
    static verifyHierarchicalToken(token) {
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            if (!decoded) {
                return null;
            }
            // 階層コンテキストの存在確認
            const hierarchicalToken = decoded;
            if (!hierarchicalToken.hierarchy_context) {
                this.logger.warn(`階層コンテキストが含まれていないトークン: ${decoded.user_id}`);
                // 基本トークンから階層トークンへの変換（デフォルト値設定）
                hierarchicalToken.hierarchy_context = {
                    organization_id: '',
                    organization_level: 3,
                    organization_type: 'HOTEL',
                    organization_path: '',
                    access_scope: [decoded.tenant_id],
                    data_access_policies: {}
                };
                hierarchicalToken.accessible_tenants = [decoded.tenant_id];
            }
            return hierarchicalToken;
        }
        catch (error) {
            this.logger.error('階層トークン検証エラー:', error);
            return null;
        }
    }
    /**
     * Express.js用階層認証ミドルウェア
     */
    static hierarchicalAuthMiddleware() {
        return async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({ error: 'Authentication token required' });
                }
                const token = authHeader.substring(7);
                const decoded = this.verifyHierarchicalToken(token);
                if (!decoded) {
                    return res.status(401).json({ error: 'Invalid or expired token' });
                }
                // リクエストオブジェクトに階層情報付きユーザー情報を設定
                req.user = decoded;
                req.hierarchy = decoded.hierarchy_context;
                req.accessibleTenants = decoded.accessible_tenants;
                next();
            }
            catch (error) {
                this.logger.error('階層認証ミドルウェアエラー:', error);
                return res.status(500).json({ error: 'Authentication middleware error' });
            }
        };
    }
}
exports.HierarchicalJwtManager = HierarchicalJwtManager;
