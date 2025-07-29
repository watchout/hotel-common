import { hotelDb } from '../database';
import { HotelLogger } from '../utils/logger';
import { createClient } from 'redis';
/**
 * Hotel Group階層権限管理システム
 *
 * 機能:
 * - 階層スコープ内権限チェック
 * - アクセス可能テナント一覧取得
 * - データ共有ポリシー適用
 * - 階層クエリ最適化（キャッシュ付き）
 */
export class HierarchyPermissionManager {
    static logger = HotelLogger.getInstance();
    static redis = null;
    static CACHE_TTL = 300; // 5分キャッシュ
    /**
     * Redisクライアント初期化
     */
    static async getRedisClient() {
        if (!this.redis) {
            this.redis = createClient({
                url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}/${process.env.REDIS_DB || '0'}`
            });
            await this.redis.connect();
        }
        return this.redis;
    }
    /**
     * 階層権限チェック（メインエントリーポイント）
     */
    static async checkHierarchyAccess(params) {
        try {
            const { user_token, target_resource, operation } = params;
            this.logger.debug('階層権限チェック開始', {
                userId: user_token.user_id,
                organizationId: user_token.hierarchy_context.organization_id,
                targetTenant: target_resource.tenant_id,
                dataType: target_resource.data_type,
                operation
            });
            // 1. 階層スコープチェック
            const scopeCheck = await this.checkHierarchyScope(user_token.hierarchy_context.organization_id, target_resource.tenant_id);
            if (!scopeCheck.allowed) {
                return {
                    allowed: false,
                    reason: 'アクセス対象が階層スコープ外です'
                };
            }
            // 2. データタイプ別権限チェック
            const dataPolicy = user_token.hierarchy_context.data_access_policies[target_resource.data_type];
            if (!dataPolicy) {
                return {
                    allowed: false,
                    reason: `データタイプ ${target_resource.data_type} の権限が設定されていません`
                };
            }
            // 3. 操作権限チェック
            const operationCheck = this.checkOperationPermission(dataPolicy.level, operation);
            if (!operationCheck.allowed) {
                return {
                    allowed: false,
                    reason: `操作 ${operation} の権限がありません（アクセスレベル: ${dataPolicy.level}）`
                };
            }
            // 4. 条件付きアクセスチェック
            if (dataPolicy.conditions) {
                const conditionCheck = await this.checkAccessConditions(dataPolicy.conditions, params.additional_context || {});
                if (!conditionCheck.allowed) {
                    return conditionCheck;
                }
            }
            return {
                allowed: true,
                effective_scope: dataPolicy.scope,
                effective_level: dataPolicy.level,
                restrictions: dataPolicy.conditions
            };
        }
        catch (error) {
            this.logger.error('階層権限チェックエラー:', error);
            return {
                allowed: false,
                reason: 'システムエラーが発生しました'
            };
        }
    }
    /**
     * 階層スコープ内チェック
     */
    static async checkHierarchyScope(userOrganizationId, targetTenantId) {
        try {
            // キャッシュ確認
            const redis = await this.getRedisClient();
            const cacheKey = `hierarchy:scope:${userOrganizationId}:${targetTenantId}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
                const result = JSON.parse(cached);
                this.logger.debug('階層スコープチェック（キャッシュヒット）', { userOrganizationId, targetTenantId, result: result });
                return result;
            }
            // データベース検索
            const accessibleTenants = await this.getAccessibleTenants(userOrganizationId);
            const allowed = accessibleTenants.includes(targetTenantId);
            const result = {
                allowed,
                reason: allowed ? undefined : '階層スコープ外のテナントです'
            };
            // キャッシュ保存
            await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(result));
            this.logger.debug('階層スコープチェック（DB検索）', { userOrganizationId, targetTenantId, result: result });
            return result;
        }
        catch (error) {
            this.logger.error('階層スコープチェックエラー:', error);
            return {
                allowed: false,
                reason: 'スコープチェックでエラーが発生しました'
            };
        }
    }
    /**
     * アクセス可能テナント一覧取得（キャッシュ付き）
     */
    static async getAccessibleTenants(organizationId, scopeLevel) {
        try {
            const redis = await this.getRedisClient();
            const cacheKey = `hierarchy:tenants:${organizationId}:${scopeLevel || 'auto'}`;
            // キャッシュ確認
            const cached = await redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            // 組織情報取得（Prismaクライアント経由）
            const organization = await hotelDb.organization_hierarchy.findUnique({
                where: { id: organizationId },
                select: { level: true, path: true, organization_type: true }
            });
            if (!organization) {
                throw new Error(`組織が見つかりません: ${organizationId}`);
            }
            // 検索対象レベル計算
            let maxLevel = organization.level;
            if (scopeLevel && scopeLevel !== 'NONE') {
                const scopeLevelMap = { GROUP: 1, BRAND: 2, HOTEL: 3, DEPARTMENT: 4 };
                maxLevel = Math.min(maxLevel + (scopeLevelMap[scopeLevel] - organization.level), 4);
            }
            else {
                maxLevel = 4; // デフォルトは全下位レベル
            }
            // 階層検索SQL（Materialized Path Pattern）
            const hierarchyQuery = `
        WITH RECURSIVE hierarchy_scope AS (
          SELECT id, path, level, organization_type
          FROM organization_hierarchy 
          WHERE id = $1
          
          UNION ALL
          
          SELECT oh.id, oh.path, oh.level, oh.organization_type
          FROM organization_hierarchy oh
          INNER JOIN hierarchy_scope hs ON oh.parent_id = hs.id
          WHERE oh.level <= $2 AND oh.deleted_at IS NULL
        )
        SELECT DISTINCT to.tenant_id
        FROM hierarchy_scope hs
        INNER JOIN tenant_organization to ON hs.id = to.organization_id
        WHERE (to.effective_until IS NULL OR to.effective_until > NOW())
      `;
            const result = await hotelDb.$queryRawUnsafe(hierarchyQuery, organizationId, maxLevel);
            const tenantIds = result.map((r) => r.tenant_id);
            // キャッシュ保存
            await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(tenantIds));
            this.logger.debug('アクセス可能テナント取得', {
                organizationId,
                scopeLevel,
                maxLevel,
                tenantCount: tenantIds.length
            });
            return tenantIds;
        }
        catch (error) {
            this.logger.error('アクセス可能テナント取得エラー:', error);
            return [];
        }
    }
    /**
     * 操作権限チェック
     */
    static checkOperationPermission(accessLevel, operation) {
        const permissions = {
            FULL: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
            READ_ONLY: ['READ'],
            ANALYTICS_ONLY: ['READ'], // 分析用の特殊読み取り
            SUMMARY_ONLY: ['READ'] // 集計データのみ
        };
        const allowed = permissions[accessLevel]?.includes(operation.toLowerCase()) || false;
        return {
            allowed,
            reason: allowed ? undefined : `アクセスレベル ${accessLevel} では ${operation} 操作は許可されていません`
        };
    }
    /**
     * 条件付きアクセスチェック
     */
    static async checkAccessConditions(conditions, context) {
        try {
            // 時間制限チェック
            if (conditions.time_restrictions) {
                const now = new Date();
                const timeRestrictions = conditions.time_restrictions;
                if (timeRestrictions.start_time && timeRestrictions.end_time) {
                    const startTime = new Date(`${now.toDateString()} ${timeRestrictions.start_time}`);
                    const endTime = new Date(`${now.toDateString()} ${timeRestrictions.end_time}`);
                    if (now < startTime || now > endTime) {
                        return {
                            allowed: false,
                            reason: `アクセス時間外です（許可時間: ${timeRestrictions.start_time}-${timeRestrictions.end_time}）`
                        };
                    }
                }
            }
            // IP制限チェック
            if (conditions.ip_restrictions && context.client_ip) {
                const allowedIPs = conditions.ip_restrictions.allowed_ips || [];
                if (allowedIPs.length > 0 && !allowedIPs.includes(context.client_ip)) {
                    return {
                        allowed: false,
                        reason: 'アクセス許可されていないIPアドレスです'
                    };
                }
            }
            return { allowed: true };
        }
        catch (error) {
            this.logger.error('条件付きアクセスチェックエラー:', error);
            return {
                allowed: false,
                reason: '条件チェックでエラーが発生しました'
            };
        }
    }
    /**
     * 階層変更時のキャッシュ無効化
     */
    static async invalidateHierarchyCache(organizationId) {
        try {
            const redis = await this.getRedisClient();
            // 関連するキャッシュキーパターンを取得
            const patterns = [
                `hierarchy:scope:${organizationId}:*`,
                `hierarchy:scope:*:${organizationId}`,
                `hierarchy:tenants:${organizationId}:*`
            ];
            for (const pattern of patterns) {
                const keys = await redis.keys(pattern);
                if (keys.length > 0) {
                    await redis.del(...keys);
                }
            }
            this.logger.info('階層キャッシュ無効化完了', { organizationId, invalidatedPatterns: patterns });
        }
        catch (error) {
            this.logger.error('階層キャッシュ無効化エラー:', error);
        }
    }
    /**
     * 組織階層ツリー取得
     */
    static async getOrganizationTree(rootOrganizationId, maxDepth = 4) {
        try {
            const whereClause = rootOrganizationId
                ? { parent_id: rootOrganizationId }
                : { level: 1 }; // ルートレベルから開始
            const organizations = await hotelDb.organization_hierarchy.findMany({
                where: {
                    ...whereClause,
                    deleted_at: null
                },
                orderBy: [
                    { level: 'asc' },
                    { name: 'asc' }
                ]
            });
            this.logger.debug('組織階層ツリー取得', {
                rootOrganizationId,
                maxDepth,
                organizationCount: organizations.length
            });
            return organizations;
        }
        catch (error) {
            this.logger.error('組織階層ツリー取得エラー:', error);
            return [];
        }
    }
    /**
     * データ共有ポリシー取得
     */
    static async getDataSharingPolicies(organizationId) {
        try {
            const policies = await hotelDb.data_sharing_policy.findMany({
                where: {
                    organization_id: organizationId
                },
                orderBy: {
                    data_type: 'asc'
                }
            });
            return policies;
        }
        catch (error) {
            this.logger.error('データ共有ポリシー取得エラー:', error);
            return [];
        }
    }
}
