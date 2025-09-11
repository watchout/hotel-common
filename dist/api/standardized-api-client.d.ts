import { AxiosRequestConfig } from 'axios';
/**
 * 標準化されたAPIクライアント設定
 */
export interface StandardizedApiClientConfig {
    baseURL: string;
    tenantId: string;
    sourceSystem: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common';
    timeout?: number;
    userId?: string;
    apiKey?: string;
    enableCache?: boolean;
    cacheTTL?: number;
    retryConfig?: RetryConfig;
}
/**
 * リトライ設定
 */
export interface RetryConfig {
    maxRetries: number;
    retryDelay: number;
    retryableStatuses: number[];
}
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
export declare class StandardizedApiClient {
    private client;
    private logger;
    private redis;
    private tenantManager;
    private config;
    constructor(config: StandardizedApiClientConfig);
    /**
     * インターセプター設定
     */
    private setupInterceptors;
    /**
     * リトライ判断
     */
    private shouldRetry;
    /**
     * リトライ遅延計算（指数バックオフ）
     */
    private calculateRetryDelay;
    /**
     * レスポンスキャッシュ
     */
    private cacheResponse;
    /**
     * キャッシュからデータ取得
     */
    private getFromCache;
    /**
     * メトリクス記録
     */
    private recordMetrics;
    /**
     * GET リクエスト
     */
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * POST リクエスト
     */
    post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
    /**
     * PUT リクエスト
     */
    put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
    /**
     * PATCH リクエスト
     */
    patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T>;
    /**
     * DELETE リクエスト
     */
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}
/**
 * 標準化APIクライアントファクトリー
 */
export declare function createStandardizedApiClient(config: StandardizedApiClientConfig): StandardizedApiClient;
