"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardizedApiClient = void 0;
exports.createStandardizedApiClient = createStandardizedApiClient;
const axios_1 = __importDefault(require("axios"));
const unified_tenant_manager_1 = require("../multitenancy/unified-tenant-manager");
const logger_1 = require("../utils/logger");
const redis_1 = require("../utils/redis");
/**
 * 標準化されたAPIクライアント
 *
 * 機能:
 * - 統一認証ヘッダー
 * - テナントコンテキスト自動設定
 * - エラーハンドリング
 * - キャッシュ
 * - リトライ
 * - メトリクス収集
 */
class StandardizedApiClient {
    client;
    logger = logger_1.HotelLogger.getInstance();
    redis = (0, redis_1.getRedisClient)();
    tenantManager = (0, unified_tenant_manager_1.getTenantManager)();
    config;
    constructor(config) {
        this.config = {
            timeout: 30000,
            enableCache: false,
            cacheTTL: 300,
            ...config,
            retryConfig: {
                maxRetries: 3,
                retryDelay: 1000,
                retryableStatuses: [408, 429, 500, 502, 503, 504],
                ...config.retryConfig
            }
        };
        this.client = axios_1.default.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        this.setupInterceptors();
    }
    /**
     * インターセプター設定
     */
    setupInterceptors() {
        // リクエストインターセプター
        this.client.interceptors.request.use(async (config) => {
            const startTime = Date.now();
            // テナントコンテキスト設定
            const tenantContext = {
                tenantId: this.config.tenantId,
                userId: this.config.userId,
                sourceSystem: this.config.sourceSystem,
                requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
            };
            // 統一ヘッダー設定
            // @ts-ignore - ヘッダーの型定義の問題
            config.headers = {
                ...config.headers,
                'X-Tenant-ID': tenantContext.tenantId,
                'X-Source-System': tenantContext.sourceSystem,
                'X-Request-ID': tenantContext.requestId
            };
            if (tenantContext.userId) {
                config.headers['X-User-ID'] = tenantContext.userId;
            }
            if (this.config.apiKey) {
                config.headers['X-API-Key'] = this.config.apiKey;
            }
            // リクエストログ
            this.logger.debug('API Request', {
                method: config.method,
                url: config.url,
                tenant: tenantContext.tenantId,
                requestId: tenantContext.requestId
            });
            // メトリクス用データ保存
            // @ts-ignore - メタデータの型定義の問題
            config.metadata = {
                startTime,
                tenantContext,
                retryCount: 0
            };
            return config;
        }, (error) => {
            this.logger.error('リクエスト準備エラー', error);
            return Promise.reject(error);
        });
        // レスポンスインターセプター
        this.client.interceptors.response.use(async (response) => {
            const config = response.config;
            const endTime = Date.now();
            const duration = endTime - config.metadata.startTime;
            // レスポンスログ
            this.logger.debug('API Response', {
                method: config.method,
                url: config.url,
                status: response.status,
                duration: `${duration}ms`,
                tenant: config.metadata.tenantContext.tenantId,
                requestId: config.metadata.tenantContext.requestId
            });
            // キャッシュ保存（GETリクエストのみ）
            if (this.config.enableCache && config.method === 'get') {
                await this.cacheResponse(config.url, response.data);
            }
            // テナントアクセスログ記録
            await this.tenantManager.logTenantAccess(config.metadata.tenantContext, `API:${config.url}`, config.method);
            // メトリクス記録
            this.recordMetrics({
                url: config.url,
                method: config.method,
                status: response.status,
                duration,
                tenantId: config.metadata.tenantContext.tenantId,
                retryCount: config.metadata.retryCount
            });
            return response;
        }, async (error) => {
            if (!error.config) {
                this.logger.error('API Error (No Config)', error);
                return Promise.reject(error);
            }
            const config = error.config;
            const endTime = Date.now();
            const duration = endTime - (config.metadata?.startTime || endTime);
            const retryCount = config.metadata?.retryCount || 0;
            // エラーログ
            this.logger.error('API Error', {
                method: config.method,
                url: config.url,
                status: error.response?.status,
                duration: `${duration}ms`,
                tenant: config.metadata?.tenantContext?.tenantId,
                requestId: config.metadata?.tenantContext?.requestId,
                retryCount,
                error: error.message
            });
            // リトライ処理
            if (this.shouldRetry(error, retryCount)) {
                config.metadata.retryCount = retryCount + 1;
                this.logger.info('API Retry', {
                    method: config.method,
                    url: config.url,
                    attempt: config.metadata.retryCount,
                    maxRetries: this.config.retryConfig?.maxRetries
                });
                // 遅延を入れてリトライ
                await new Promise(resolve => setTimeout(resolve, this.calculateRetryDelay(retryCount)));
                return this.client(config);
            }
            // メトリクス記録（失敗）
            if (config.metadata?.tenantContext) {
                this.recordMetrics({
                    url: config.url,
                    method: config.method,
                    status: error.response?.status || 0,
                    duration,
                    tenantId: config.metadata.tenantContext.tenantId,
                    retryCount,
                    error: error.message
                });
            }
            return Promise.reject(error);
        });
    }
    /**
     * リトライ判断
     */
    shouldRetry(error, retryCount) {
        // リトライ設定がなければリトライしない
        if (!this.config.retryConfig)
            return false;
        // 最大リトライ回数を超えていればリトライしない
        if (retryCount >= this.config.retryConfig.maxRetries)
            return false;
        // レスポンスがなければネットワークエラーとしてリトライ
        if (!error.response)
            return true;
        // 設定されたステータスコードならリトライ
        return this.config.retryConfig.retryableStatuses.includes(error.response.status);
    }
    /**
     * リトライ遅延計算（指数バックオフ）
     */
    calculateRetryDelay(retryCount) {
        const baseDelay = this.config.retryConfig?.retryDelay || 1000;
        return baseDelay * Math.pow(2, retryCount);
    }
    /**
     * レスポンスキャッシュ
     */
    async cacheResponse(url, data) {
        try {
            const cacheKey = `api:${this.config.tenantId}:${url}`;
            // @ts-ignore - Redisクライアントの型定義の問題
            await this.redis.set(cacheKey, JSON.stringify(data));
        }
        catch (error) {
            this.logger.warn('キャッシュ保存エラー', error);
        }
    }
    /**
     * キャッシュからデータ取得
     */
    async getFromCache(url) {
        try {
            const cacheKey = `api:${this.config.tenantId}:${url}`;
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        }
        catch (error) {
            this.logger.warn('キャッシュ取得エラー', error);
            return null;
        }
    }
    /**
     * メトリクス記録
     */
    recordMetrics(metrics) {
        try {
            // メトリクス記録（実装は別途）
        }
        catch (error) {
            this.logger.warn('メトリクス記録エラー', error);
        }
    }
    /**
     * GET リクエスト
     */
    async get(url, config) {
        // キャッシュチェック
        if (this.config.enableCache) {
            const cached = await this.getFromCache(url);
            if (cached) {
                this.logger.debug('Cache Hit', { url, tenant: this.config.tenantId });
                return cached;
            }
        }
        const response = await this.client.get(url, config);
        return response.data;
    }
    /**
     * POST リクエスト
     */
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    /**
     * PUT リクエスト
     */
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    /**
     * PATCH リクエスト
     */
    async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }
    /**
     * DELETE リクエスト
     */
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
}
exports.StandardizedApiClient = StandardizedApiClient;
/**
 * 標準化APIクライアントファクトリー
 */
function createStandardizedApiClient(config) {
    return new StandardizedApiClient(config);
}
