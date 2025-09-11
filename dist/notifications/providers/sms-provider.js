"use strict";
/**
 * SMS通知プロバイダーインターフェース
 *
 * 複数のSMSプロバイダー（Twilio, AWS SNS等）を統一インターフェースで扱うための抽象化レイヤー
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSMSProvider = exports.SNSProvider = exports.TwilioProvider = exports.SMSProvider = void 0;
exports.createSMSProvider = createSMSProvider;
const logger_1 = require("../../utils/logger");
/**
 * SMSプロバイダー基底クラス
 */
class SMSProvider {
    logger = logger_1.HotelLogger.getInstance();
    config;
    constructor(config) {
        this.config = config;
    }
}
exports.SMSProvider = SMSProvider;
/**
 * Twilioプロバイダー
 */
class TwilioProvider extends SMSProvider {
    client;
    constructor(config) {
        super(config);
        if (!config.accountSid || !config.authToken || !config.fromNumber) {
            throw new Error('Twilio accountSid, authToken, and fromNumber are required');
        }
        try {
            // Twilioクライアント初期化
            const twilio = require('twilio');
            this.client = twilio(config.accountSid, config.authToken);
            this.logger.info('Twilio provider initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Twilio client', { error: error instanceof Error ? error : new Error(String(error)) });
            throw new Error('Twilio initialization failed');
        }
    }
    /**
     * TwilioでSMS送信
     */
    async sendSMS(data) {
        try {
            // 各宛先に送信
            const results = await Promise.all(data.to.map(async (to) => {
                const messageParams = {
                    body: data.body,
                    from: this.config.fromNumber,
                    to: to,
                    mediaUrl: data.mediaUrls
                };
                return await this.client.messages.create(messageParams);
            }));
            // 最初のメッセージIDを返す
            const messageId = results[0]?.sid;
            this.logger.info('SMS sent via Twilio', {
                data: {
                    data: { to: data.to },
                    messageId: messageId
                }
            });
            return {
                success: true,
                messageId: messageId,
                provider: 'twilio'
            };
        }
        catch (error) {
            const { createErrorLogOption } = require('../../utils/error-helper');
            this.logger.error('Failed to send SMS via Twilio', createErrorLogOption(error));
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                provider: 'twilio'
            };
        }
    }
}
exports.TwilioProvider = TwilioProvider;
/**
 * AWS SNSプロバイダー
 */
class SNSProvider extends SMSProvider {
    client;
    constructor(config) {
        super(config);
        if (!config.region) {
            throw new Error('AWS region is required for SNS');
        }
        try {
            // AWS SDK初期化
            const AWS = require('aws-sdk');
            this.client = new AWS.SNS({
                apiVersion: '2010-03-31',
                region: config.region
            });
            this.logger.info('AWS SNS provider initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize AWS SNS client', { error: error instanceof Error ? error : new Error(String(error)) });
            throw new Error('AWS SNS initialization failed');
        }
    }
    /**
     * AWS SNSでSMS送信
     */
    async sendSMS(data) {
        try {
            // 各宛先に送信
            const results = await Promise.all(data.to.map(async (to) => {
                const params = {
                    Message: data.body,
                    PhoneNumber: to,
                    MessageAttributes: {
                        'AWS.SNS.SMS.SenderID': {
                            DataType: 'String',
                            StringValue: 'HOTEL'
                        },
                        'AWS.SNS.SMS.SMSType': {
                            DataType: 'String',
                            StringValue: 'Transactional'
                        }
                    }
                };
                return await this.client.publish(params).promise();
            }));
            // 最初のメッセージIDを返す
            const messageId = results[0]?.MessageId;
            this.logger.info('SMS sent via AWS SNS', {
                data: { to: data.to },
                messageId: messageId
            });
            return {
                success: true,
                messageId: messageId,
                provider: 'sns'
            };
        }
        catch (error) {
            this.logger.error('Failed to send SMS via AWS SNS', { error: error instanceof Error ? error : new Error(String(error)) });
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                provider: 'sns'
            };
        }
    }
}
exports.SNSProvider = SNSProvider;
/**
 * モックSMSプロバイダー（開発・テスト用）
 */
class MockSMSProvider extends SMSProvider {
    constructor(config) {
        super({
            ...config,
            provider: 'mock'
        });
        this.logger.info('Mock SMS provider initialized');
    }
    /**
     * モックSMS送信（実際には送信せず）
     */
    async sendSMS(data) {
        const mockMessageId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        this.logger.info('Mock SMS sent', {
            data: { to: data.to },
            body: data.body,
            messageId: mockMessageId
        });
        return {
            success: true,
            messageId: mockMessageId,
            provider: 'mock'
        };
    }
}
exports.MockSMSProvider = MockSMSProvider;
/**
 * SMSプロバイダーファクトリー
 */
function createSMSProvider(config) {
    switch (config.provider) {
        case 'twilio':
            return new TwilioProvider(config);
        case 'sns':
            return new SNSProvider(config);
        case 'mock':
            return new MockSMSProvider(config);
        default:
            throw new Error(`Unsupported SMS provider: ${config.provider}`);
    }
}
