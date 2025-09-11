/**
 * メール通知プロバイダーインターフェース
 *
 * 複数のメールプロバイダー（SendGrid, SES, SMTP等）を統一インターフェースで扱うための抽象化レイヤー
 */
import { HotelLogger } from '../../utils/logger';
/**
 * メール送信設定
 */
export interface EmailConfig {
    provider: 'sendgrid' | 'ses' | 'smtp';
    from: string;
    apiKey?: string;
    region?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
}
/**
 * メール送信データ
 */
export interface EmailData {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    html?: boolean;
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }>;
}
/**
 * メール送信結果
 */
export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    provider: string;
}
/**
 * メールプロバイダー基底クラス
 */
export declare abstract class EmailProvider {
    protected logger: HotelLogger;
    protected config: EmailConfig;
    constructor(config: EmailConfig);
    /**
     * メール送信抽象メソッド
     */
    abstract sendEmail(data: EmailData): Promise<EmailResult>;
}
/**
 * SendGridプロバイダー
 */
export declare class SendGridProvider extends EmailProvider {
    private client;
    constructor(config: EmailConfig);
    /**
     * SendGridでメール送信
     */
    sendEmail(data: EmailData): Promise<EmailResult>;
}
/**
 * AWS SESプロバイダー
 */
export declare class SESProvider extends EmailProvider {
    private client;
    constructor(config: EmailConfig);
    /**
     * AWS SESでメール送信
     */
    sendEmail(data: EmailData): Promise<EmailResult>;
    /**
     * 添付ファイル付きメール送信（SES Raw Email API）
     */
    private sendRawEmail;
}
/**
 * SMTPプロバイダー
 */
export declare class SMTPProvider extends EmailProvider {
    private transporter;
    constructor(config: EmailConfig);
    /**
     * SMTPでメール送信
     */
    sendEmail(data: EmailData): Promise<EmailResult>;
}
/**
 * メールプロバイダーファクトリー
 */
export declare function createEmailProvider(config: EmailConfig): EmailProvider;
