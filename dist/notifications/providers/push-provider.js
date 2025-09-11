"use strict";
/**
 * プッシュ通知プロバイダーインターフェース
 *
 * 複数のプッシュ通知プロバイダー（Firebase, OneSignal等）を統一インターフェースで扱うための抽象化レイヤー
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPushProvider = exports.OneSignalPushProvider = exports.FirebasePushProvider = exports.PushProvider = void 0;
exports.createPushProvider = createPushProvider;
const logger_1 = require("../../utils/logger");
/**
 * プッシュ通知プロバイダー基底クラス
 */
class PushProvider {
    logger = logger_1.HotelLogger.getInstance();
    config;
    constructor(config) {
        this.config = config;
    }
}
exports.PushProvider = PushProvider;
/**
 * Firebaseプロバイダー
 */
class FirebasePushProvider extends PushProvider {
    admin;
    messaging;
    constructor(config) {
        super(config);
        if (!config.serviceAccountPath && !config.projectId) {
            throw new Error('Firebase serviceAccountPath or projectId is required');
        }
        try {
            // Firebase Admin SDK初期化
            this.admin = require('firebase-admin');
            // 認証情報設定
            if (config.serviceAccountPath) {
                // サービスアカウントJSONファイルを使用
                const serviceAccount = require(config.serviceAccountPath);
                this.admin.initializeApp({
                    credential: this.admin.credential.cert(serviceAccount),
                    databaseURL: config.databaseURL
                });
            }
            else {
                // デフォルト認証情報を使用（環境変数またはGCP環境）
                this.admin.initializeApp({
                    projectId: config.projectId
                });
            }
            this.messaging = this.admin.messaging();
            this.logger.info('Firebase push provider initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase client', { error: error instanceof Error ? error : new Error(String(error)) });
            throw new Error('Firebase initialization failed');
        }
    }
    /**
     * Firebaseでプッシュ通知送信
     */
    async sendPush(data) {
        try {
            // Firebase Cloud Messaging形式に変換
            const message = {
                notification: {
                    title: data.title,
                    body: data.body,
                    imageUrl: data.imageUrl
                },
                data: data.data || {},
                android: {
                    notification: {
                        sound: data.sound || 'default',
                        clickAction: data.clickAction
                    },
                    ttl: data.ttl ? data.ttl * 1000 : undefined // ミリ秒に変換
                },
                apns: {
                    payload: {
                        aps: {
                            badge: data.badge,
                            sound: data.sound || 'default'
                        }
                    }
                }
            };
            // トークン配列に送信
            const response = await this.messaging.sendMulticast({
                ...message,
                tokens: data.to
            });
            this.logger.info('Push notification sent via Firebase', {
                data: {
                    successCount: response.successCount,
                    failureCount: response.failureCount
                }
            });
            return {
                success: response.successCount > 0,
                messageId: response.responses[0]?.messageId,
                provider: 'firebase',
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        }
        catch (error) {
            this.logger.error('Failed to send push notification via Firebase', { error: error instanceof Error ? error : new Error(String(error)) });
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                provider: 'firebase'
            };
        }
    }
}
exports.FirebasePushProvider = FirebasePushProvider;
/**
 * OneSignalプロバイダー
 */
class OneSignalPushProvider extends PushProvider {
    client;
    constructor(config) {
        super(config);
        if (!config.appId || !config.apiKey) {
            throw new Error('OneSignal appId and apiKey are required');
        }
        try {
            // OneSignalクライアント初期化
            const OneSignal = require('onesignal-node');
            this.client = new OneSignal.Client(config.appId, config.apiKey);
            this.logger.info('OneSignal push provider initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize OneSignal client', { error: error instanceof Error ? error : new Error(String(error)) });
            throw new Error('OneSignal initialization failed');
        }
    }
    /**
     * OneSignalでプッシュ通知送信
     */
    async sendPush(data) {
        try {
            // OneSignal形式に変換
            const notification = {
                headings: {
                    en: data.title
                },
                contents: {
                    en: data.body
                },
                include_player_ids: data.to,
                data: data.data || {},
                ios_badgeType: data.badge ? 'SetTo' : undefined,
                ios_badgeCount: data.badge,
                ios_sound: data.sound || 'default',
                android_sound: data.sound || 'default',
                android_channel_id: data.clickAction,
                big_picture: data.imageUrl,
                ttl: data.ttl
            };
            const response = await this.client.createNotification(notification);
            this.logger.info('Push notification sent via OneSignal', {
                data: {
                    id: response.body.id,
                    recipients: response.body.recipients
                }
            });
            return {
                success: true,
                messageId: response.body.id,
                provider: 'onesignal',
                successCount: response.body.recipients
            };
        }
        catch (error) {
            const { createErrorLogOption } = require('../../utils/error-helper');
            this.logger.error('Failed to send push notification via OneSignal', createErrorLogOption(error));
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                provider: 'onesignal'
            };
        }
    }
}
exports.OneSignalPushProvider = OneSignalPushProvider;
/**
 * モックプッシュ通知プロバイダー（開発・テスト用）
 */
class MockPushProvider extends PushProvider {
    constructor(config) {
        super({
            ...config,
            provider: 'mock'
        });
        this.logger.info('Mock push provider initialized');
    }
    /**
     * モックプッシュ通知送信（実際には送信せず）
     */
    async sendPush(data) {
        const mockMessageId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        this.logger.info('Mock push notification sent', {
            data: {
                to: data.to,
                title: data.title,
                body: data.body,
                messageId: mockMessageId
            }
        });
        return {
            success: true,
            messageId: mockMessageId,
            provider: 'mock',
            successCount: data.to.length,
            failureCount: 0
        };
    }
}
exports.MockPushProvider = MockPushProvider;
/**
 * プッシュ通知プロバイダーファクトリー
 */
function createPushProvider(config) {
    switch (config.provider) {
        case 'firebase':
            return new FirebasePushProvider(config);
        case 'onesignal':
            return new OneSignalPushProvider(config);
        case 'mock':
            return new MockPushProvider(config);
        default:
            throw new Error(`Unsupported push provider: ${config.provider}`);
    }
}
