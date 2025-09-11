"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
exports.getNotificationService = getNotificationService;
const logger_1 = require("../utils/logger");
const redis_1 = require("../utils/redis");
const unified_tenant_manager_1 = require("../multitenancy/unified-tenant-manager");
const event_publisher_1 = require("../events/event-publisher");
const factory_1 = require("../i18n/factory");
/**
 * 統合通知サービス
 *
 * 各システムで通知を送信するための統一インターフェース
 */
class NotificationService {
    static instance;
    logger = logger_1.HotelLogger.getInstance();
    redis = (0, redis_1.getRedisClient)();
    tenantManager = (0, unified_tenant_manager_1.getTenantManager)();
    i18n = (0, factory_1.getGlobalI18nInstance)();
    config = {};
    constructor() { }
    /**
     * シングルトンインスタンス取得
     */
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    /**
     * 通知サービス設定
     */
    configure(config) {
        this.config = {
            ...this.config,
            ...config
        };
        this.logger.info('通知サービス設定完了', {
            data: {
                emailProvider: config.email?.provider,
                smsProvider: config.sms?.provider,
                pushProvider: config.push?.provider
            }
        });
    }
    /**
     * メール通知送信
     */
    async sendEmail(to, templateId, data, options = {}) {
        try {
            if (!this.config.email) {
                throw new Error('メール設定が構成されていません');
            }
            // テンプレート取得
            const template = await this.getTemplate(templateId, options.locale || 'ja');
            if (!template || template.type !== 'email') {
                throw new Error(`有効なメールテンプレートが見つかりません: ${templateId}`);
            }
            // テンプレート変数置換
            const subject = this.replaceVariables(template.subject || '', data);
            const body = this.replaceVariables(template.body, data);
            // メール送信（プロバイダー別）
            const result = await this.sendEmailByProvider(this.config.email.provider, {
                from: this.config.email.from,
                to: Array.isArray(to) ? to : [to],
                cc: options.cc,
                bcc: options.bcc,
                subject,
                body,
                html: template.html,
                attachments: options.attachments
            }, this.config.email.config);
            // イベント発行
            await this.publishNotificationEvent('email', {
                template_id: templateId,
                recipient: to,
                success: result,
                metadata: options.metadata
            });
            return result;
        }
        catch (error) {
            this.logger.error('メール送信エラー', {
                templateId,
                to,
                error: new Error(error instanceof Error ? error.message : String(error))
            });
            return false;
        }
    }
    /**
     * SMS通知送信
     */
    async sendSms(to, templateId, data, options = {}) {
        try {
            if (!this.config.sms) {
                throw new Error('SMS設定が構成されていません');
            }
            // テンプレート取得
            const template = await this.getTemplate(templateId, options.locale || 'ja');
            if (!template || template.type !== 'sms') {
                throw new Error(`有効なSMSテンプレートが見つかりません: ${templateId}`);
            }
            // テンプレート変数置換
            const body = this.replaceVariables(template.body, data);
            // SMS送信（プロバイダー別）
            const result = await this.sendSmsByProvider(this.config.sms.provider, {
                to: Array.isArray(to) ? to : [to],
                body
            }, this.config.sms.config);
            // イベント発行
            await this.publishNotificationEvent('sms', {
                template_id: templateId,
                recipient: to,
                success: result,
                metadata: options.metadata
            });
            return result;
        }
        catch (error) {
            this.logger.error('SMS送信エラー', {
                templateId,
                to,
                error: new Error(error instanceof Error ? error.message : String(error))
            });
            return false;
        }
    }
    /**
     * プッシュ通知送信
     */
    async sendPushNotification(to, templateId, data, options = {}) {
        try {
            if (!this.config.push) {
                throw new Error('プッシュ通知設定が構成されていません');
            }
            // テンプレート取得
            const template = await this.getTemplate(templateId, options.locale || 'ja');
            if (!template || template.type !== 'push') {
                throw new Error(`有効なプッシュ通知テンプレートが見つかりません: ${templateId}`);
            }
            // テンプレート変数置換
            const title = this.replaceVariables(template.subject || '', data);
            const body = this.replaceVariables(template.body, data);
            // プッシュ通知送信（プロバイダー別）
            const result = await this.sendPushByProvider(this.config.push.provider, {
                to: Array.isArray(to) ? to : [to],
                title,
                body,
                data
            }, this.config.push.config);
            // イベント発行
            await this.publishNotificationEvent('push', {
                template_id: templateId,
                recipient: to,
                success: result,
                metadata: options.metadata
            });
            return result;
        }
        catch (error) {
            this.logger.error('プッシュ通知送信エラー', {
                templateId,
                to,
                error: new Error(error instanceof Error ? error.message : String(error))
            });
            return false;
        }
    }
    /**
     * アプリ内通知送信
     */
    async sendInAppNotification(userId, templateId, data, options = {}) {
        try {
            // テンプレート取得
            const template = await this.getTemplate(templateId, options.locale || 'ja');
            if (!template || template.type !== 'in_app') {
                throw new Error(`有効なアプリ内通知テンプレートが見つかりません: ${templateId}`);
            }
            // テンプレート変数置換
            const title = this.replaceVariables(template.subject || '', data);
            const body = this.replaceVariables(template.body, data);
            // Redis経由でアプリ内通知保存
            const userIds = Array.isArray(userId) ? userId : [userId];
            for (const id of userIds) {
                const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                await this.redis.hset(`in_app_notifications:${id}`, notificationId, JSON.stringify({
                    id: notificationId,
                    title,
                    body,
                    data,
                    read: false,
                    created_at: new Date().toISOString()
                }));
            }
            // イベント発行
            await this.publishNotificationEvent('in_app', {
                template_id: templateId,
                recipient: userId,
                success: true,
                metadata: options.metadata
            });
            return true;
        }
        catch (error) {
            this.logger.error('アプリ内通知送信エラー', {
                templateId,
                userId: typeof userId === 'string' ? userId : String(userId),
                error: new Error(error instanceof Error ? error.message : String(error))
            });
            return false;
        }
    }
    /**
     * Webhook通知送信
     */
    async sendWebhook(templateId, data, options = {}) {
        try {
            if (!this.config.webhook || !this.config.webhook.endpoints.length) {
                throw new Error('Webhook設定が構成されていません');
            }
            // テンプレート取得
            const template = await this.getTemplate(templateId, options.locale || 'ja');
            if (!template || template.type !== 'webhook') {
                throw new Error(`有効なWebhookテンプレートが見つかりません: ${templateId}`);
            }
            // テンプレート変数置換
            const body = this.replaceVariables(template.body, data);
            // Webhook送信（エンドポイント別）
            const results = await Promise.all(this.config.webhook.endpoints.map(endpoint => this.sendWebhookToEndpoint(endpoint, {
                event: templateId,
                payload: JSON.parse(body),
                metadata: options.metadata
            })));
            const success = results.every(r => r);
            // イベント発行
            await this.publishNotificationEvent('webhook', {
                template_id: templateId,
                recipient: this.config.webhook.endpoints.join(','),
                success,
                metadata: options.metadata
            });
            return success;
        }
        catch (error) {
            this.logger.error('Webhook送信エラー', {
                templateId,
                error: new Error(error instanceof Error ? error.message : String(error))
            });
            return false;
        }
    }
    /**
     * テンプレート取得
     */
    async getTemplate(templateId, locale) {
        try {
            // キャッシュから取得を試みる
            const cacheKey = `template:${templateId}:${locale}`;
            const cachedTemplate = await this.redis.get(cacheKey);
            if (cachedTemplate) {
                return JSON.parse(cachedTemplate);
            }
            // DBから取得
            const db = await Promise.resolve().then(() => __importStar(require('../database'))).then(m => m.hotelDb.getAdapter());
            const template = await db.notificationTemplate.findFirst({
                where: {
                    id: templateId,
                    locale
                }
            });
            if (!template) {
                // フォールバック: デフォルト言語（日本語）で再試行
                if (locale !== 'ja') {
                    return this.getTemplate(templateId, 'ja');
                }
                return null;
            }
            const result = {
                id: template.id,
                type: template.type,
                subject: template.subject || undefined,
                body: template.body,
                variables: template.variables,
                html: template.html || false
            };
            // キャッシュに保存（TTL: 1時間）
            await this.redis.set(cacheKey, JSON.stringify(result));
            return result;
        }
        catch (error) {
            this.logger.error('テンプレート取得エラー', {
                templateId,
                locale,
                error: new Error(error instanceof Error ? error.message : String(error))
            });
            return null;
        }
    }
    /**
     * テンプレート変数置換
     */
    replaceVariables(template, data) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : match;
        });
    }
    /**
     * メール送信（プロバイダー別）
     */
    async sendEmailByProvider(provider, emailData, config) {
        // 実際の実装では各プロバイダーのSDKを使用
        this.logger.info('メール送信', {
            data: { provider },
            to: emailData.to,
            subject: emailData.subject
        });
        // 実装例（実際にはプロバイダーSDKを使用）
        return true;
    }
    /**
     * SMS送信（プロバイダー別）
     */
    async sendSmsByProvider(provider, smsData, config) {
        // 実際の実装では各プロバイダーのSDKを使用
        this.logger.info('SMS送信', {
            data: { provider },
            to: smsData.to,
            bodyLength: smsData.body.length
        });
        // 実装例（実際にはプロバイダーSDKを使用）
        return true;
    }
    /**
     * プッシュ通知送信（プロバイダー別）
     */
    async sendPushByProvider(provider, pushData, config) {
        // 実際の実装では各プロバイダーのSDKを使用
        this.logger.info('プッシュ通知送信', {
            data: { provider },
            to: pushData.to,
            title: pushData.title
        });
        // 実装例（実際にはプロバイダーSDKを使用）
        return true;
    }
    /**
     * Webhook送信
     */
    async sendWebhookToEndpoint(endpoint, data) {
        try {
            // 実際の実装ではfetchやaxiosを使用
            this.logger.info('Webhook送信', {
                data: { endpoint },
                event: data.event
            });
            // 実装例（実際にはHTTPリクエスト）
            return true;
        }
        catch (error) {
            this.logger.error('Webhook送信エラー', {
                data: { endpoint },
                error: new Error(error instanceof Error ? error.message : String(error))
            });
            return false;
        }
    }
    /**
     * 通知イベント発行
     */
    async publishNotificationEvent(type, data) {
        try {
            const eventPublisher = (0, event_publisher_1.getEventPublisher)();
            await eventPublisher.publishEvent({
                event_id: `notification_${Date.now()}`,
                type: 'system',
                // @ts-ignore - 型定義が不完全
                action: 'notification_sent',
                priority: 'LOW',
                sync_mode: 'realtime',
                targets: ['hotel-common'],
                delivery_guarantee: 'at_least_once',
                timestamp: new Date(),
                origin_system: 'hotel-common',
                updated_by_system: 'hotel-common',
                synced_at: new Date(),
                tenant_id: 'system',
                data: {
                    // @ts-ignore - 型定義が不完全
                    notification_type: type,
                    template_id: data.template_id,
                    recipient: data.recipient,
                    success: data.success,
                    metadata: data.metadata
                }
            });
        }
        catch (error) {
            this.logger.warn('通知イベント発行エラー', error);
        }
    }
}
exports.NotificationService = NotificationService;
/**
 * 通知サービス取得
 */
function getNotificationService() {
    return NotificationService.getInstance();
}
