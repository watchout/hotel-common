/**
 * Webhook通知プロバイダー
 *
 * 外部システムへのWebhook通知を送信するための機能を提供
 */
/**
 * Webhook設定
 */
export interface WebhookConfig {
    endpoints: string[];
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    secret?: string;
}
/**
 * Webhook送信データ
 */
export interface WebhookData {
    event: string;
    payload: any;
    metadata?: Record<string, any>;
}
/**
 * Webhook送信結果
 */
export interface WebhookResult {
    success: boolean;
    statusCode?: number;
    error?: string;
    endpoint: string;
    responseTime?: number;
}
/**
 * Webhook通知プロバイダー
 */
export declare class WebhookProvider {
    private logger;
    private config;
    private fetch;
    constructor(config: WebhookConfig);
    /**
     * 単一エンドポイントにWebhook送信
     */
    sendWebhook(endpoint: string, data: WebhookData): Promise<WebhookResult>;
    /**
     * 複数エンドポイントにWebhook送信
     */
    sendWebhooks(data: WebhookData): Promise<WebhookResult[]>;
    /**
     * Webhook署名生成
     */
    private generateSignature;
}
/**
 * Webhookプロバイダー作成
 */
export declare function createWebhookProvider(config: WebhookConfig): WebhookProvider;
