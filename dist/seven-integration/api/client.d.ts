import { ApiClientConfig, RequestConfig } from '../types/api';
import { ApiResponse } from '../types/common';
export declare class HotelApiClient {
    private client;
    private config;
    constructor(config: ApiClientConfig);
    /**
     * インターセプター設定
     */
    private setupInterceptors;
    /**
     * HTTPステータスコードをエラーコードにマッピング
     */
    private mapHttpStatusToErrorCode;
    /**
     * 認証トークンを設定
     */
    setAuthToken(token: string): void;
    /**
     * 認証トークンを削除
     */
    removeAuthToken(): void;
    /**
     * 汎用リクエストメソッド
     */
    request<T = any>(config: RequestConfig): Promise<ApiResponse<T>>;
    /**
     * GET リクエスト
     */
    get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    /**
     * POST リクエスト
     */
    post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
    /**
     * PUT リクエスト
     */
    put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
    /**
     * DELETE リクエスト
     */
    delete<T = any>(url: string): Promise<ApiResponse<T>>;
    /**
     * PATCH リクエスト
     */
    patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
}
/**
 * システム別APIクライアントファクトリー
 */
export declare class HotelApiClientFactory {
    /**
     * hotel-saas用クライアント作成
     */
    static createSaasClient(config?: Partial<ApiClientConfig>): HotelApiClient;
    /**
     * hotel-member用クライアント作成
     */
    static createMemberClient(config?: Partial<ApiClientConfig>): HotelApiClient;
    /**
     * hotel-pms用クライアント作成
     */
    static createPmsClient(config?: Partial<ApiClientConfig>): HotelApiClient;
}
//# sourceMappingURL=client.d.ts.map