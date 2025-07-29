"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelRedisClient = void 0;
exports.getRedisClient = getRedisClient;
const redis_1 = __importDefault(require("redis"));
class HotelRedisClient {
    client;
    config;
    connected = false;
    constructor(config = {}) {
        this.config = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            keyPrefix: 'hotel:',
            ...config
        };
        this.client = redis_1.default.createClient({
            socket: {
                host: this.config.host,
                port: this.config.port
            },
            password: this.config.password,
            database: this.config.db
        });
        this.setupEventHandlers();
    }
    /**
     * Redis接続
     */
    async connect() {
        if (!this.connected) {
            await this.client.connect();
            this.connected = true;
        }
    }
    /**
     * Redis切断
     */
    async disconnect() {
        if (this.connected) {
            await this.client.disconnect();
            this.connected = false;
        }
    }
    /**
     * イベントハンドラー設定
     */
    setupEventHandlers() {
        this.client.on('error', (error) => {
            console.error('Redis error:', error);
        });
        this.client.on('connect', () => {
            console.log('Redis connected');
        });
        this.client.on('disconnect', () => {
            console.log('Redis disconnected');
            this.connected = false;
        });
    }
    /**
     * キーにプレフィックスを追加
     */
    prefixKey(key) {
        return `${this.config.keyPrefix}${key}`;
    }
    /**
     * セッション保存
     */
    async saveSession(sessionInfo) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`session:${sessionInfo.tenant_id}:${sessionInfo.user_id}`);
        const ttl = Math.floor((sessionInfo.expires_at.getTime() - Date.now()) / 1000);
        await this.client.setEx(key, ttl, JSON.stringify(sessionInfo));
    }
    /**
     * セッション取得
     */
    async getSession(tenantId, userId) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`session:${tenantId}:${userId}`);
        const data = await this.client.get(key);
        if (!data)
            return null;
        try {
            const sessionInfo = JSON.parse(data);
            // 日付フィールドをDateオブジェクトに変換
            sessionInfo.expires_at = new Date(sessionInfo.expires_at);
            sessionInfo.created_at = new Date(sessionInfo.created_at);
            sessionInfo.last_activity = new Date(sessionInfo.last_activity);
            return sessionInfo;
        }
        catch (error) {
            console.error('Error parsing session data:', error);
            return null;
        }
    }
    /**
     * セッション削除
     */
    async deleteSession(tenantId, userId) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`session:${tenantId}:${userId}`);
        await this.client.del(key);
    }
    /**
     * セッション更新（最終アクティビティ時間）
     */
    async updateSessionActivity(tenantId, userId) {
        const session = await this.getSession(tenantId, userId);
        if (session) {
            session.last_activity = new Date();
            await this.saveSession(session);
        }
    }
    /**
     * キャッシュ保存
     */
    async setCache(key, value, ttlSeconds) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(`cache:${key}`);
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setEx(prefixedKey, ttlSeconds, serialized);
        }
        else {
            await this.client.set(prefixedKey, serialized);
        }
    }
    /**
     * キャッシュ取得
     */
    async getCache(key) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(`cache:${key}`);
        const data = await this.client.get(prefixedKey);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error parsing cache data:', error);
            return null;
        }
    }
    /**
     * キャッシュ削除
     */
    async deleteCache(key) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(`cache:${key}`);
        await this.client.del(prefixedKey);
    }
    /**
     * パターンマッチでキー取得
     */
    async getKeysByPattern(pattern) {
        if (!this.connected)
            await this.connect();
        const prefixedPattern = this.prefixKey(pattern);
        return await this.client.keys(prefixedPattern);
    }
    /**
     * リストの末尾に追加（キューとして使用）
     */
    async pushToQueue(queueName, item) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`queue:${queueName}`);
        await this.client.rPush(key, JSON.stringify(item));
    }
    /**
     * リストの先頭から取得（キューとして使用）
     */
    async popFromQueue(queueName) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`queue:${queueName}`);
        const data = await this.client.lPop(key);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error parsing queue data:', error);
            return null;
        }
    }
    /**
     * イベントログ保存
     */
    async logEvent(event) {
        const logKey = this.prefixKey(`events:${new Date().toISOString().split('T')[0]}`);
        await this.client.rPush(logKey, JSON.stringify({
            ...event,
            timestamp: new Date().toISOString()
        }));
        // 30日後に自動削除
        await this.client.expire(logKey, 30 * 24 * 60 * 60);
    }
}
exports.HotelRedisClient = HotelRedisClient;
// シングルトンインスタンス
let redisInstance = null;
function getRedisClient(config) {
    if (!redisInstance) {
        redisInstance = new HotelRedisClient(config);
    }
    return redisInstance;
}
//# sourceMappingURL=redis.js.map