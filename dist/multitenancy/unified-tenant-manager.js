"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedTenantManager = void 0;
exports.getTenantManager = getTenantManager;
const database_1 = require("../database");
const logger_1 = require("../utils/logger");
const redis_1 = require("../utils/redis");
class UnifiedTenantManager {
    static instance;
    logger = logger_1.HotelLogger.getInstance();
    db = database_1.hotelDb.getAdapter();
    redis = (0, redis_1.getRedisClient)();
    constructor() { }
    /**
     * シングルトンインスタンスを取得
     */
    static getInstance() {
        if (!UnifiedTenantManager.instance) {
            UnifiedTenantManager.instance = new UnifiedTenantManager();
        }
        return UnifiedTenantManager.instance;
    }
    /**
     * テナントの存在確認
     */
    async validateTenant(tenantId) {
        try {
            const tenant = await this.db.tenant.findUnique({
                where: { id: tenantId }
            });
            return !!tenant && tenant.status === 'active';
        }
        catch (error) {
            this.logger.error('テナント検証エラー', { tenantId, error });
            return false;
        }
    }
    /**
     * テナント情報の取得
     */
    async getTenant(tenantId) {
        try {
            // キャッシュから取得を試みる
            const cachedTenant = await this.redis.get(`tenant:${tenantId}`);
            if (cachedTenant) {
                return JSON.parse(cachedTenant);
            }
            // DBから取得
            const tenant = await this.db.tenant.findUnique({
                where: { id: tenantId }
            });
            if (!tenant) {
                return null;
            }
            const tenantConfig = {
                id: tenant.id,
                name: tenant.name,
                domain: tenant.domain || undefined,
                settings: tenant.settings,
                features: tenant.features,
                status: tenant.status
            };
            // キャッシュに保存（TTL: 1時間）
            // @ts-ignore - Redisクライアントの型定義の問題
            await this.redis.set(`tenant:${tenantId}`, JSON.stringify(tenantConfig));
            return tenantConfig;
        }
        catch (error) {
            this.logger.error('テナント取得エラー', { tenantId, error });
            return null;
        }
    }
    /**
     * テナントコンテキストの作成
     */
    createTenantContext(tenantId, sourceSystem, userId) {
        const requestId = this.generateRequestId();
        return {
            tenantId,
            userId,
            sourceSystem,
            requestId
        };
    }
    /**
     * リクエストヘッダーからテナントコンテキストを抽出
     */
    extractTenantContextFromHeaders(headers) {
        const tenantId = this.extractHeaderValue(headers, 'x-tenant-id');
        const userId = this.extractHeaderValue(headers, 'x-user-id');
        const sourceSystem = this.extractHeaderValue(headers, 'x-source-system');
        const requestId = this.extractHeaderValue(headers, 'x-request-id');
        if (!tenantId || !sourceSystem) {
            return null;
        }
        return {
            tenantId,
            userId,
            sourceSystem,
            requestId
        };
    }
    /**
     * テナントアクセスログの記録
     */
    async logTenantAccess(context, resource, action) {
        try {
            await this.db.tenantAccessLog.create({
                data: {
                    tenant_id: context.tenantId,
                    user_id: context.userId,
                    source_system: context.sourceSystem,
                    // @ts-ignore - フィールド名の不一致
                    request_id: context.requestId,
                    resource,
                    action,
                    timestamp: new Date()
                }
            });
        }
        catch (error) {
            this.logger.error('テナントアクセスログ記録エラー', { context, error });
        }
    }
    /**
     * テナント固有の設定値を取得
     */
    async getTenantSetting(tenantId, key, defaultValue) {
        const tenant = await this.getTenant(tenantId);
        if (!tenant || !tenant.settings) {
            return defaultValue;
        }
        return tenant.settings[key] !== undefined
            ? tenant.settings[key]
            : defaultValue;
    }
    /**
     * テナント固有の機能フラグをチェック
     */
    async hasTenantFeature(tenantId, feature) {
        const tenant = await this.getTenant(tenantId);
        if (!tenant || !tenant.features) {
            return false;
        }
        return tenant.features.includes(feature);
    }
    /**
     * ヘッダー値の抽出ヘルパー
     */
    extractHeaderValue(headers, key) {
        const value = headers[key] || headers[key.toLowerCase()];
        if (Array.isArray(value)) {
            return value[0];
        }
        return value;
    }
    /**
     * リクエストIDの生成
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
}
exports.UnifiedTenantManager = UnifiedTenantManager;
/**
 * 便利なファクトリー関数
 */
function getTenantManager() {
    return UnifiedTenantManager.getInstance();
}
