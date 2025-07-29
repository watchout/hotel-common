import { SessionInfo } from '../types/auth';
export interface RedisConfig {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
}
export declare class HotelRedisClient {
    private client;
    private config;
    private connected;
    constructor(config?: RedisConfig);
    /**
     * Redis接続
     */
    connect(): Promise<void>;
    /**
     * Redis切断
     */
    disconnect(): Promise<void>;
    /**
     * イベントハンドラー設定
     */
    private setupEventHandlers;
    /**
     * キーにプレフィックスを追加
     */
    private prefixKey;
    /**
     * セッション保存
     */
    saveSession(sessionInfo: SessionInfo): Promise<void>;
    /**
     * セッション取得
     */
    getSession(tenantId: string, userId: string): Promise<SessionInfo | null>;
    /**
     * セッション削除
     */
    deleteSession(tenantId: string, userId: string): Promise<void>;
    /**
     * セッション更新（最終アクティビティ時間）
     */
    updateSessionActivity(tenantId: string, userId: string): Promise<void>;
    /**
     * キャッシュ保存
     */
    setCache(key: string, value: any, ttlSeconds?: number): Promise<void>;
    /**
     * キャッシュ取得
     */
    getCache<T = any>(key: string): Promise<T | null>;
    /**
     * キャッシュ削除
     */
    deleteCache(key: string): Promise<void>;
    /**
     * パターンマッチでキー取得
     */
    getKeysByPattern(pattern: string): Promise<string[]>;
    /**
     * リストの末尾に追加（キューとして使用）
     */
    pushToQueue(queueName: string, item: any): Promise<void>;
    /**
     * リストの先頭から取得（キューとして使用）
     */
    popFromQueue<T = any>(queueName: string): Promise<T | null>;
    /**
     * イベントログ保存
     */
    logEvent(event: any): Promise<void>;
}
export declare function getRedisClient(config?: RedisConfig): HotelRedisClient;
//# sourceMappingURL=redis.d.ts.map