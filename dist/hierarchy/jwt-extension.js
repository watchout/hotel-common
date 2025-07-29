import { JwtManager } from '../auth/jwt';
import { HotelLogger } from '../utils/logger';
import { hotelDb } from '../database';
import { HierarchyPermissionManager } from './permission-manager';
/**
 * 階層管理対応JWT拡張マネージャー
 *
 * 機能:
 * - 階層コンテキスト付きJWT生成
 * - 既存JWTの階層情報拡張
 * - 階層権限の動的更新
 */
export class HierarchicalJwtManager extends JwtManager {
    static logger = HotelLogger.getInstance();
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
                accessibleTenants = await HierarchyPermissionManager.getAccessibleTenants(payload.organization_id);
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
            const tokens = this.generateTokenPair(hierarchicalPayload);
            this.logger.info('階層JWT生成完了', {
                user_id: payload.user_id,
                organization_level: hierarchyContext?.organization_level,
                accessible_tenant_count: accessibleTenants.length
            });
            return tokens;
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
            // 組織情報取得
            const organization = await hotelDb.organization_hierarchy.findUnique({
                where: { id: organizationId },
                include: {
                    data_sharing_policies: true
                }
            });
            if (!organization) {
                this.logger.warn('組織が見つかりません', { organizationId });
                return null;
            }
            // アクセス可能スコープ取得
            const accessScope = await HierarchyPermissionManager.getAccessibleTenants(organizationId);
            // データアクセスポリシー構築
            const dataAccessPolicies = {};
            for (const policy of organization.data_sharing_policies) {
                dataAccessPolicies[policy.data_type] = {
                    scope: policy.sharing_scope,
                    level: policy.access_level,
                    conditions: policy.conditions
                };
            }
            // デフォルトポリシー適用（未設定データタイプ用）
            const defaultPolicies = this.getDefaultDataPolicies(organization.organization_type);
            for (const [dataType, policy] of Object.entries(defaultPolicies)) {
                if (!dataAccessPolicies[dataType]) {
                    dataAccessPolicies[dataType] = policy;
                }
            }
            return {
                organization_id: organizationId,
                organization_level: organization.level,
                organization_type: organization.organization_type,
                organization_path: organization.path,
                access_scope: accessScope,
                data_access_policies: dataAccessPolicies
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
            const decoded = this.verifyToken(existingToken);
            if (!decoded) {
                throw new Error('無効なトークンです');
            }
            // 組織ID決定
            const organizationId = newOrganizationId ||
                decoded.hierarchy_context?.organization_id ||
                await this.findUserOrganization(decoded.user_id, decoded.tenant_id);
            if (!organizationId) {
                this.logger.warn('組織IDが見つかりません', { user_id: decoded.user_id });
                return existingToken; // 階層情報なしで既存トークンを返す
            }
            // 新しい階層コンテキストで再生成
            const newTokens = await this.generateHierarchicalToken({
                user_id: decoded.user_id,
                tenant_id: decoded.tenant_id,
                email: decoded.email,
                role: decoded.role,
                level: decoded.level,
                permissions: decoded.permissions,
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
            // ユーザーテーブルから組織ID取得
            const staff = await hotelDb.staff.findUnique({
                where: { id: userId },
                select: { hotelCommonUserId: true }
            });
            if (user?.organization_id) {
                return staff?.hotelCommonUserId;
            }
            // テナントから組織関係を検索
            const tenantOrg = await hotelDb.tenant_organization.findFirst({
                where: {
                    tenant_id: tenantId,
                    role: 'PRIMARY'
                },
                select: { organization_id: true }
            });
            return tenantOrg?.organization_id || null;
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
            const decoded = this.verifyToken(token);
            if (!decoded) {
                return null;
            }
            // 階層コンテキストの存在確認
            const hierarchicalToken = decoded;
            if (!hierarchicalToken.hierarchy_context) {
                this.logger.warn('階層コンテキストが含まれていないトークンです', { user_id: decoded.user_id });
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
