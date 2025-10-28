/**
 * SMS通知プロバイダーインターフェース
 * 
 * 複数のSMSプロバイダー（Twilio, AWS SNS等）を統一インターフェースで扱うための抽象化レイヤー
 */

import { HotelLogger } from '../../utils/logger'

/**
 * SMS送信設定
 */
export interface SMSConfig {
  provider: 'twilio' | 'sns' | 'mock'
  // Twilio設定
  accountSid?: string
  authToken?: string
  fromNumber?: string
  // AWS SNS設定
  region?: string
  // 共通設定
  apiKey?: string
}

/**
 * SMS送信データ
 */
export interface SMSData {
  to: string[]
  body: string
  mediaUrls?: string[]
}

/**
 * SMS送信結果
 */
export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

/**
 * SMSプロバイダー基底クラス
 */
export abstract class SMSProvider {
  protected logger = HotelLogger.getInstance()
  protected config: SMSConfig
  
  constructor(config: SMSConfig) {
    this.config = config
  }
  
  /**
   * SMS送信抽象メソッド
   */
  abstract sendSMS(data: SMSData): Promise<SMSResult>
}

/**
 * Twilioプロバイダー
 */
export class TwilioProvider extends SMSProvider {
  private client: any
  
  constructor(config: SMSConfig) {
    super(config)
    
    if (!config.accountSid || !config.authToken || !config.fromNumber) {
      throw new Error('Twilio accountSid, authToken, and fromNumber are required')
    }
    
    try {
      // Twilioクライアント初期化
      const twilio = require('twilio')
      this.client = twilio(config.accountSid, config.authToken)
      
      this.logger.info('Twilio provider initialized')
    } catch (error: unknown) {
      this.logger.error('Failed to initialize Twilio client', { error: error instanceof Error ? error : new Error(String(error)) })
      throw new Error('Twilio initialization failed')
    }
  }
  
  /**
   * TwilioでSMS送信
   */
  async sendSMS(data: SMSData): Promise<SMSResult> {
    try {
      // 各宛先に送信
      const results = await Promise.all(data.to.map(async (to) => {
        const messageParams = {
          body: data.body,
          from: this.config.fromNumber,
          to: to,
          mediaUrl: data.mediaUrls
        }
        
        return await this.client.messages.create(messageParams)
      }))
      
      // 最初のメッセージIDを返す
      const messageId = results[0]?.sid
      
            this.logger.info('SMS sent via Twilio', {
        data: {
          data: { to: data.to },
          messageId: messageId
        }
      })
      
      return {
        success: true,
        messageId: messageId,
        provider: 'twilio'
      }
    } catch (error: unknown) {
      const { createErrorLogOption } = require('../../utils/error-helper');
      this.logger.error('Failed to send SMS via Twilio', createErrorLogOption(error))
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: 'twilio'
      }
    }
  }
}

/**
 * AWS SNSプロバイダー
 */
export class SNSProvider extends SMSProvider {
  private client: any
  
  constructor(config: SMSConfig) {
    super(config)
    
    if (!config.region) {
      throw new Error('AWS region is required for SNS')
    }
    
    try {
      // AWS SDK初期化
      const AWS = require('aws-sdk')
      this.client = new AWS.SNS({
        apiVersion: '2010-03-31',
        region: config.region
      })
      
      this.logger.info('AWS SNS provider initialized')
    } catch (error: unknown) {
      this.logger.error('Failed to initialize AWS SNS client', { error: error instanceof Error ? error : new Error(String(error)) })
      throw new Error('AWS SNS initialization failed')
    }
  }
  
  /**
   * AWS SNSでSMS送信
   */
  async sendSMS(data: SMSData): Promise<SMSResult> {
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
        }
        
        return await this.client.publish(params).promise()
      }))
      
      // 最初のメッセージIDを返す
      const messageId = results[0]?.MessageId
      
      this.logger.info('SMS sent via AWS SNS', { 
        data: { to: data.to }, 
        messageId: messageId
      })
      
      return {
        success: true,
        messageId: messageId,
        provider: 'sns'
      }
    } catch (error: unknown) {
      this.logger.error('Failed to send SMS via AWS SNS', { error: error instanceof Error ? error : new Error(String(error)) })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        provider: 'sns'
      }
    }
  }
}

/**
 * モックSMSプロバイダー（開発・テスト用）
 */
export class MockSMSProvider extends SMSProvider {
  constructor(config: SMSConfig) {
    super({
      ...config,
      provider: 'mock'
    })
    this.logger.info('Mock SMS provider initialized')
  }
  
  /**
   * モックSMS送信（実際には送信せず）
   */
  async sendSMS(data: SMSData): Promise<SMSResult> {
    const mockMessageId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    
    this.logger.info('Mock SMS sent', { 
      data: { to: data.to }, 
      body: data.body,
      messageId: mockMessageId
    })
    
    return {
      success: true,
      messageId: mockMessageId,
      provider: 'mock'
    }
  }
}

/**
 * SMSプロバイダーファクトリー
 */
export function createSMSProvider(config: SMSConfig): SMSProvider {
  switch (config.provider) {
    case 'twilio':
      return new TwilioProvider(config)
    case 'sns':
      return new SNSProvider(config)
    case 'mock':
      return new MockSMSProvider(config)
    default:
      throw new Error(`Unsupported SMS provider: ${config.provider}`)
  }
}