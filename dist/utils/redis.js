"use strict";
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
exports.HotelRedisClient = void 0;
exports.getRedisClient = getRedisClient;
const Redis = __importStar(require("redis"));
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
        this.client = Redis.createClient({
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
     * セッションIDでセッション取得（Cookie認証用）
     * SSOT準拠: hotel:session:{sessionId}
     */
    async getSessionById(sessionId) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`session:${sessionId}`);
        const data = await this.client.get(key);
        if (!data)
            return null;
        try {
            const sessionInfo = JSON.parse(data);
            // 日付フィールドをDateオブジェクトに変換
            sessionInfo.expires_at = new Date(sessionInfo.expires_at);
            sessionInfo.created_at = new Date(sessionInfo.created_at);
            sessionInfo.last_activity = new Date(sessionInfo.last_activity);
            // 期限切れチェック
            if (sessionInfo.expires_at < new Date()) {
                // 期限切れセッションは削除
                await this.client.del(key);
                return null;
            }
            return sessionInfo;
        }
        catch (error) {
            console.error('Error parsing session data:', error);
            return null;
        }
    }
    /**
     * セッションIDでセッション保存（Cookie認証用）
     * SSOT準拠: hotel:session:{sessionId}
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async saveSessionById(sessionId, sessionInfo, ttlSeconds = 3600) {
        if (!this.connected)
            await this.connect();
        const key = `hotel:session:${sessionId}`; // プレフィックスなしで直接指定（SSOT準拠）
        await this.client.setEx(key, ttlSeconds, JSON.stringify(sessionInfo));
    }
    /**
     * セッションIDでセッション削除（Cookie認証用）
     * SSOT準拠: hotel:session:{sessionId}
     */
    async deleteSessionById(sessionId) {
        if (!this.connected)
            await this.connect();
        // eslint-disable-next-line no-return-await
        // eslint-disable-next-line no-return-await
        const key = `hotel:session:${sessionId}`; // プレフィックスなしで直接指定（SSOT準拠）
        // eslint-disable-next-line no-return-await
        return await this.client.del(key);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * キャッシュ保存
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
     * 値を保存
     */
    async set(key, value, ttlSeconds) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(key);
        if (ttlSeconds) {
            await this.client.setEx(prefixedKey, ttlSeconds, value);
        }
        else {
            await this.client.set(prefixedKey, value);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * キャッシュ取得
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line no-return-await
    /**
     * 値を取得
     */
    async get(key) {
        // eslint-disable-next-line no-return-await
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(key);
        // eslint-disable-next-line no-return-await
        return await this.client.get(prefixedKey);
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
    // eslint-disable-next-line no-return-await
    /**
     * パターンマッチでキー取得
     */
    async getKeysByPattern(pattern) {
        // eslint-disable-next-line no-return-await
        if (!this.connected)
            await this.connect();
        const prefixedPattern = this.prefixKey(pattern);
        // eslint-disable-next-line no-return-await
        return await this.client.keys(prefixedPattern);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * リストの末尾に追加（キューとして使用）
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async pushToQueue(queueName, item) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`queue:${queueName}`);
        await this.client.rPush(key, JSON.stringify(item));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    /**
     * リストの先頭から取得（キューとして使用）
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async popFromQueue(queueName) {
        if (!this.connected)
            await this.connect();
        const key = this.prefixKey(`queue:${queueName}`);
        const data = await this.client.lPop(key);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error parsing queue data:', error);
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    /**
     * イベントログ保存
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async logEvent(event) {
        const logKey = this.prefixKey(`events:${new Date().toISOString().split('T')[0]}`);
        await this.client.rPush(logKey, JSON.stringify({
            ...event,
            timestamp: new Date().toISOString()
        }));
        // 30日後に自動削除
        await this.client.expire(logKey, 30 * 24 * 60 * 60);
    }
    /**
     * ハッシュに値を設定
     */
    async hset(key, field, value) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(key);
        await this.client.hSet(prefixedKey, field, value);
    }
    /**
     * ハッシュから値を取得
     */
    async hget(key, field) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(key);
        const result = await this.client.hGet(prefixedKey, field);
        return result;
    }
    /**
     * ハッシュからフィールドを削除
     */
    async hdel(key, field) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(key);
        await this.client.hDel(prefixedKey, field);
    }
    /**
     * キーを削除
     */
    async del(key) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(key);
        await this.client.del(prefixedKey);
    }
    /**
     * ハッシュに複数の値を設定
     */
    async hsetAll(key, fieldValues) {
        if (!this.connected)
            await this.connect();
        const prefixedKey = this.prefixKey(key);
        for (const [field, value] of Object.entries(fieldValues)) {
            await this.client.hSet(prefixedKey, field, value);
        }
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
