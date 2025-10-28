import type { SessionInfo } from '../types/auth';
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
     * セッションIDでセッション取得（Cookie認証用）
     * SSOT準拠: hotel:session:{sessionId}
     */
    getSessionById(sessionId: string): Promise<SessionInfo | null>;
    /**
     * セッションIDでセッション保存（Cookie認証用）
     * SSOT準拠: hotel:session:{sessionId}
     */
    saveSessionById(sessionId: string, sessionInfo: any, ttlSeconds?: number): Promise<void>;
    /**
     * セッションIDでセッション削除（Cookie認証用）
     * SSOT準拠: hotel:session:{sessionId}
     */
    deleteSessionById(sessionId: string): Promise<number>;
    /**
     * セッション更新（最終アクティビティ時間）
     */
    updateSessionActivity(tenantId: string, userId: string): Promise<void>;
    /**
     * キャッシュ保存
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    setCache(key: string, value: any, ttlSeconds?: number): Promise<void>;
    /**
     * 値を保存
     */
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * キャッシュ取得
     */
    getCache<T = any>(key: string): Promise<T | null>;
    /**
     * 値を取得
     */
    get(key: string): Promise<string | null>;
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
    /**
     * ハッシュに値を設定
     */
    hset(key: string, field: string, value: string): Promise<void>;
    /**
     * ハッシュから値を取得
     */
    hget(key: string, field: string): Promise<string | null>;
    /**
     * ハッシュからフィールドを削除
     */
    hdel(key: string, field: string): Promise<void>;
    /**
     * キーを削除
     */
    del(key: string): Promise<void>;
    /**
     * ハッシュに複数の値を設定
     */
    hsetAll(key: string, fieldValues: Record<string, string>): Promise<void>;
}
export declare function getRedisClient(config?: RedisConfig): HotelRedisClient;
