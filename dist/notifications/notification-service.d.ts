/**
 * 通知タイプ定義
 */
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
/**
 * 通知優先度
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
/**
 * 通知テンプレート定義
 */
export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    subject?: string;
    body: string;
    variables: string[];
    html?: boolean;
}
/**
 * 通知設定
 */
export interface NotificationConfig {
    email?: {
        provider: 'smtp' | 'sendgrid' | 'ses';
        from: string;
        config: Record<string, any>;
    };
    sms?: {
        provider: 'twilio' | 'sns';
        config: Record<string, any>;
    };
    push?: {
        provider: 'firebase' | 'onesignal';
        config: Record<string, any>;
    };
    webhook?: {
        endpoints: string[];
    };
}
/**
 * 通知送信オプション
 */
export interface NotificationOptions {
    priority?: NotificationPriority;
    scheduled?: Date;
    locale?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }>;
    metadata?: Record<string, any>;
}
/**
 * 統合通知サービス
 *
 * 各システムで通知を送信するための統一インターフェース
 */
export declare class NotificationService {
    private static instance;
    private logger;
    private redis;
    private tenantManager;
    private i18n;
    private config;
    private constructor();
    /**
     * シングルトンインスタンス取得
     */
    static getInstance(): NotificationService;
    /**
     * 通知サービス設定
     */
    configure(config: NotificationConfig): void;
    /**
     * メール通知送信
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    sendEmail(to: string | string[], templateId: string, data: Record<string, any>, options?: NotificationOptions): Promise<boolean>;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * SMS通知送信
     */
    sendSms(to: string | string[], templateId: string, data: Record<string, any>, options?: NotificationOptions): Promise<boolean>;
    /**
     * プッシュ通知送信
     */
    sendPushNotification(to: string | string[], templateId: string, data: Record<string, any>, options?: NotificationOptions): Promise<boolean>;
    /**
     * アプリ内通知送信
     */
    sendInAppNotification(userId: string | string[], templateId: string, data: Record<string, any>, options?: NotificationOptions): Promise<boolean>;
    /**
     * Webhook通知送信
     */
    sendWebhook(templateId: string, data: Record<string, any>, options?: NotificationOptions): Promise<boolean>;
    /**
     * テンプレート取得
     */
    private getTemplate;
    /**
     * テンプレート変数置換
     */
    private replaceVariables;
    /**
     * メール送信（プロバイダー別）
     */
    private sendEmailByProvider;
    /**
     * SMS送信（プロバイダー別）
     */
    private sendSmsByProvider;
    /**
     * プッシュ通知送信（プロバイダー別）
     */
    private sendPushByProvider;
    /**
     * Webhook送信
     */
    private sendWebhookToEndpoint;
    /**
     * 通知イベント発行
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     */
    private publishNotificationEvent;
}
/**
 * 通知サービス取得
 */
export declare function getNotificationService(): NotificationService;
