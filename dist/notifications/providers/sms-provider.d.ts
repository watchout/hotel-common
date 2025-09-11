/**
 * SMS通知プロバイダーインターフェース
 *
 * 複数のSMSプロバイダー（Twilio, AWS SNS等）を統一インターフェースで扱うための抽象化レイヤー
 */
import { HotelLogger } from '../../utils/logger';
/**
 * SMS送信設定
 */
export interface SMSConfig {
    provider: 'twilio' | 'sns' | 'mock';
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
    region?: string;
    apiKey?: string;
}
/**
 * SMS送信データ
 */
export interface SMSData {
    to: string[];
    body: string;
    mediaUrls?: string[];
}
/**
 * SMS送信結果
 */
export interface SMSResult {
    success: boolean;
    messageId?: string;
    error?: string;
    provider: string;
}
/**
 * SMSプロバイダー基底クラス
 */
export declare abstract class SMSProvider {
    protected logger: HotelLogger;
    protected config: SMSConfig;
    constructor(config: SMSConfig);
    /**
     * SMS送信抽象メソッド
     */
    abstract sendSMS(data: SMSData): Promise<SMSResult>;
}
/**
 * Twilioプロバイダー
 */
export declare class TwilioProvider extends SMSProvider {
    private client;
    constructor(config: SMSConfig);
    /**
     * TwilioでSMS送信
     */
    sendSMS(data: SMSData): Promise<SMSResult>;
}
/**
 * AWS SNSプロバイダー
 */
export declare class SNSProvider extends SMSProvider {
    private client;
    constructor(config: SMSConfig);
    /**
     * AWS SNSでSMS送信
     */
    sendSMS(data: SMSData): Promise<SMSResult>;
}
/**
 * モックSMSプロバイダー（開発・テスト用）
 */
export declare class MockSMSProvider extends SMSProvider {
    constructor(config: SMSConfig);
    /**
     * モックSMS送信（実際には送信せず）
     */
    sendSMS(data: SMSData): Promise<SMSResult>;
}
/**
 * SMSプロバイダーファクトリー
 */
export declare function createSMSProvider(config: SMSConfig): SMSProvider;
