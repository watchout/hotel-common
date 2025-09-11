/**
 * プッシュ通知プロバイダーインターフェース
 *
 * 複数のプッシュ通知プロバイダー（Firebase, OneSignal等）を統一インターフェースで扱うための抽象化レイヤー
 */
import { HotelLogger } from '../../utils/logger';
/**
 * プッシュ通知設定
 */
export interface PushConfig {
    provider: 'firebase' | 'onesignal' | 'mock';
    serviceAccountPath?: string;
    databaseURL?: string;
    appId?: string;
    apiKey?: string;
    projectId?: string;
}
/**
 * プッシュ通知データ
 */
export interface PushData {
    to: string[];
    title: string;
    body: string;
    data?: Record<string, any>;
    imageUrl?: string;
    badge?: number;
    sound?: string;
    clickAction?: string;
    ttl?: number;
}
/**
 * プッシュ通知結果
 */
export interface PushResult {
    success: boolean;
    messageId?: string;
    error?: string;
    provider: string;
    successCount?: number;
    failureCount?: number;
}
/**
 * プッシュ通知プロバイダー基底クラス
 */
export declare abstract class PushProvider {
    protected logger: HotelLogger;
    protected config: PushConfig;
    constructor(config: PushConfig);
    /**
     * プッシュ通知送信抽象メソッド
     */
    abstract sendPush(data: PushData): Promise<PushResult>;
}
/**
 * Firebaseプロバイダー
 */
export declare class FirebasePushProvider extends PushProvider {
    private admin;
    private messaging;
    constructor(config: PushConfig);
    /**
     * Firebaseでプッシュ通知送信
     */
    sendPush(data: PushData): Promise<PushResult>;
}
/**
 * OneSignalプロバイダー
 */
export declare class OneSignalPushProvider extends PushProvider {
    private client;
    constructor(config: PushConfig);
    /**
     * OneSignalでプッシュ通知送信
     */
    sendPush(data: PushData): Promise<PushResult>;
}
/**
 * モックプッシュ通知プロバイダー（開発・テスト用）
 */
export declare class MockPushProvider extends PushProvider {
    constructor(config: PushConfig);
    /**
     * モックプッシュ通知送信（実際には送信せず）
     */
    sendPush(data: PushData): Promise<PushResult>;
}
/**
 * プッシュ通知プロバイダーファクトリー
 */
export declare function createPushProvider(config: PushConfig): PushProvider;
