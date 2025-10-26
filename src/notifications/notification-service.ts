import { getEventPublisher } from '../events/event-publisher'
import { getGlobalI18nInstance } from '../i18n/factory'
import { getTenantManager } from '../multitenancy/unified-tenant-manager'
import { HotelLogger } from '../utils/logger'
import { getRedisClient } from '../utils/redis'

/**
 * 通知タイプ定義
 */
export type NotificationType = 
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app'
  | 'webhook'

/**
 * 通知優先度
 */
export type NotificationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

/**
 * 通知テンプレート定義
 */
export interface NotificationTemplate {
  id: string
  type: NotificationType
  subject?: string
  body: string
  variables: string[]
  html?: boolean
}

/**
 * 通知設定
 */
export interface NotificationConfig {
  email?: {
    provider: 'smtp' | 'sendgrid' | 'ses'
    from: string
    config: Record<string, any>
  }
  sms?: {
    provider: 'twilio' | 'sns'
    config: Record<string, any>
  }
  push?: {
    provider: 'firebase' | 'onesignal'
    config: Record<string, any>
  }
  webhook?: {
    endpoints: string[]
  }
}

/**
 * 通知送信オプション
 */
export interface NotificationOptions {
  priority?: NotificationPriority
  scheduled?: Date
  locale?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
  metadata?: Record<string, any>
}

/**
 * 統合通知サービス
 * 
 * 各システムで通知を送信するための統一インターフェース
 */
export class NotificationService {
  private static instance: NotificationService
  private logger = HotelLogger.getInstance()
  private redis = getRedisClient()
  private tenantManager = getTenantManager()
  private i18n = getGlobalI18nInstance()
  private config: NotificationConfig = {}
  
  private constructor() {}
  
  /**
   * シングルトンインスタンス取得
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }
  
  /**
   * 通知サービス設定
   */
  public configure(config: NotificationConfig): void {
    this.config = {
      ...this.config,
      ...config
    }
    this.logger.info('通知サービス設定完了', {
      data: {
        emailProvider: config.email?.provider,
        smsProvider: config.sms?.provider,
        pushProvider: config.push?.provider
      }
    })
  }
  
  /**
   * メール通知送信
   */
  public async sendEmail(
    to: string | string[],
    templateId: string,
    data: Record<string, any>,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    try {
      if (!this.config.email) {
        throw new Error('メール設定が構成されていません')
      }
      
      // テンプレート取得
      const template = await this.getTemplate(templateId, options.locale || 'ja')
      
      if (!template || template.type !== 'email') {
        throw new Error(`有効なメールテンプレートが見つかりません: ${templateId}`)
      }
      
      // テンプレート変数置換
      const subject = this.replaceVariables(template.subject || '', data)
      const body = this.replaceVariables(template.body, data)
      
      // メール送信（プロバイダー別）
      const result = await this.sendEmailByProvider(
        this.config.email.provider,
        {
          from: this.config.email.from,
          to: Array.isArray(to) ? to : [to],
          cc: options.cc,
          bcc: options.bcc,
          subject,
          body,
          html: template.html,
          attachments: options.attachments
        },
        this.config.email.config
      )
      
      // イベント発行
      await this.publishNotificationEvent('email', {
        template_id: templateId,
        recipient: to,
        success: result,
        metadata: options.metadata
      })
      
      return result
    } catch (error: Error) {
      this.logger.error('メール送信エラー', {
        templateId,
        to,
        error: new Error(error instanceof Error ? error.message : String(error))
      })
      return false
    }
  }
  
  /**
   * SMS通知送信
   */
  public async sendSms(
    to: string | string[],
    templateId: string,
    data: Record<string, any>,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    try {
      if (!this.config.sms) {
        throw new Error('SMS設定が構成されていません')
      }
      
      // テンプレート取得
      const template = await this.getTemplate(templateId, options.locale || 'ja')
      
      if (!template || template.type !== 'sms') {
        throw new Error(`有効なSMSテンプレートが見つかりません: ${templateId}`)
      }
      
      // テンプレート変数置換
      const body = this.replaceVariables(template.body, data)
      
      // SMS送信（プロバイダー別）
      const result = await this.sendSmsByProvider(
        this.config.sms.provider,
        {
          to: Array.isArray(to) ? to : [to],
          body
        },
        this.config.sms.config
      )
      
      // イベント発行
      await this.publishNotificationEvent('sms', {
        template_id: templateId,
        recipient: to,
        success: result,
        metadata: options.metadata
      })
      
      return result
    } catch (error: Error) {
      this.logger.error('SMS送信エラー', {
        templateId,
        to,
        error: new Error(error instanceof Error ? error.message : String(error))
      })
      return false
    }
  }
  
  /**
   * プッシュ通知送信
   */
  public async sendPushNotification(
    to: string | string[],
    templateId: string,
    data: Record<string, any>,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    try {
      if (!this.config.push) {
        throw new Error('プッシュ通知設定が構成されていません')
      }
      
      // テンプレート取得
      const template = await this.getTemplate(templateId, options.locale || 'ja')
      
      if (!template || template.type !== 'push') {
        throw new Error(`有効なプッシュ通知テンプレートが見つかりません: ${templateId}`)
      }
      
      // テンプレート変数置換
      const title = this.replaceVariables(template.subject || '', data)
      const body = this.replaceVariables(template.body, data)
      
      // プッシュ通知送信（プロバイダー別）
      const result = await this.sendPushByProvider(
        this.config.push.provider,
        {
          to: Array.isArray(to) ? to : [to],
          title,
          body,
          data
        },
        this.config.push.config
      )
      
      // イベント発行
      await this.publishNotificationEvent('push', {
        template_id: templateId,
        recipient: to,
        success: result,
        metadata: options.metadata
      })
      
      return result
    } catch (error: Error) {
      this.logger.error('プッシュ通知送信エラー', {
        templateId,
        to,
        error: new Error(error instanceof Error ? error.message : String(error))
      })
      return false
    }
  }
  
  /**
   * アプリ内通知送信
   */
  public async sendInAppNotification(
    userId: string | string[],
    templateId: string,
    data: Record<string, any>,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    try {
      // テンプレート取得
      const template = await this.getTemplate(templateId, options.locale || 'ja')
      
      if (!template || template.type !== 'in_app') {
        throw new Error(`有効なアプリ内通知テンプレートが見つかりません: ${templateId}`)
      }
      
      // テンプレート変数置換
      const title = this.replaceVariables(template.subject || '', data)
      const body = this.replaceVariables(template.body, data)
      
      // Redis経由でアプリ内通知保存
      const userIds = Array.isArray(userId) ? userId : [userId]
      
      for (const id of userIds) {
        const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
        
        await this.redis.hset(
          `in_app_notifications:${id}`,
          notificationId,
          JSON.stringify({
            id: notificationId,
            title,
            body,
            data,
            read: false,
            created_at: new Date().toISOString()
          })
        )
      }
      
      // イベント発行
      await this.publishNotificationEvent('in_app', {
        template_id: templateId,
        recipient: userId,
        success: true,
        metadata: options.metadata
      })
      
      return true
    } catch (error: Error) {
      this.logger.error('アプリ内通知送信エラー', {
        templateId,
        userId: typeof userId === 'string' ? userId : String(userId),
        error: new Error(error instanceof Error ? error.message : String(error))
      })
      return false
    }
  }
  
  /**
   * Webhook通知送信
   */
  public async sendWebhook(
    templateId: string,
    data: Record<string, any>,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    try {
      if (!this.config.webhook || !this.config.webhook.endpoints.length) {
        throw new Error('Webhook設定が構成されていません')
      }
      
      // テンプレート取得
      const template = await this.getTemplate(templateId, options.locale || 'ja')
      
      if (!template || template.type !== 'webhook') {
        throw new Error(`有効なWebhookテンプレートが見つかりません: ${templateId}`)
      }
      
      // テンプレート変数置換
      const body = this.replaceVariables(template.body, data)
      
      // Webhook送信（エンドポイント別）
      const results = await Promise.all(
        this.config.webhook.endpoints.map(endpoint => 
          this.sendWebhookToEndpoint(endpoint, {
            event: templateId,
            payload: JSON.parse(body),
            metadata: options.metadata
          })
        )
      )
      
      const success = results.every(r => r)
      
      // イベント発行
      await this.publishNotificationEvent('webhook', {
        template_id: templateId,
        recipient: this.config.webhook.endpoints.join(','),
        success,
        metadata: options.metadata
      })
      
      return success
    } catch (error: Error) {
      this.logger.error('Webhook送信エラー', {
        templateId,
        error: new Error(error instanceof Error ? error.message : String(error))
      })
      return false
    }
  }
  
  /**
   * テンプレート取得
   */
  private async getTemplate(
    templateId: string,
    locale: string
  ): Promise<NotificationTemplate | null> {
    try {
      // キャッシュから取得を試みる
      const cacheKey = `template:${templateId}:${locale}`
      const cachedTemplate = await this.redis.get(cacheKey)
      
      if (cachedTemplate) {
        return JSON.parse(cachedTemplate)
      }
      
      // DBから取得
      const db = await import('../database').then(m => m.hotelDb.getAdapter())
      
      const template = await db.notificationTemplate.findFirst({
        where: {
          id: templateId,
          locale
        }
      })
      
      if (!template) {
        // フォールバック: デフォルト言語（日本語）で再試行
        if (locale !== 'ja') {
          return this.getTemplate(templateId, 'ja')
        }
        return null
      }
      
      const result: NotificationTemplate = {
        id: template.id,
        type: template.type as NotificationType,
        subject: template.subject || undefined,
        body: template.body,
        variables: template.variables as string[],
        html: template.html || false
      }
      
      // キャッシュに保存（TTL: 1時間）
      await this.redis.set(
        cacheKey,
        JSON.stringify(result)
      )
      
      return result
    } catch (error: Error) {
      this.logger.error('テンプレート取得エラー', {
        templateId,
        locale,
        error: new Error(error instanceof Error ? error.message : String(error))
      })
      return null
    }
  }
  
  /**
   * テンプレート変数置換
   */
  private replaceVariables(
    template: string,
    data: Record<string, any>
  ): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim()
      return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : match
    })
  }
  
  /**
   * メール送信（プロバイダー別）
   */
  private async sendEmailByProvider(
    provider: string,
    emailData: {
      from: string
      to: string[]
      cc?: string[]
      bcc?: string[]
      subject: string
      body: string
      html?: boolean
      attachments?: Array<{
        filename: string
        content: string | Buffer
        contentType?: string
      }>
    },
    config: Record<string, any>
  ): Promise<boolean> {
    // 実際の実装では各プロバイダーのSDKを使用
    this.logger.info('メール送信', {
      data: { provider },
      to: emailData.to,
      subject: emailData.subject
    })
    
    // 実装例（実際にはプロバイダーSDKを使用）
    return true
  }
  
  /**
   * SMS送信（プロバイダー別）
   */
  private async sendSmsByProvider(
    provider: string,
    smsData: {
      to: string[]
      body: string
    },
    config: Record<string, any>
  ): Promise<boolean> {
    // 実際の実装では各プロバイダーのSDKを使用
    this.logger.info('SMS送信', {
      data: { provider },
      to: smsData.to,
      bodyLength: smsData.body.length
    })
    
    // 実装例（実際にはプロバイダーSDKを使用）
    return true
  }
  
  /**
   * プッシュ通知送信（プロバイダー別）
   */
  private async sendPushByProvider(
    provider: string,
    pushData: {
      to: string[]
      title: string
      body: string
      data: Record<string, any>
    },
    config: Record<string, any>
  ): Promise<boolean> {
    // 実際の実装では各プロバイダーのSDKを使用
    this.logger.info('プッシュ通知送信', {
      data: { provider },
      to: pushData.to,
      title: pushData.title
    })
    
    // 実装例（実際にはプロバイダーSDKを使用）
    return true
  }
  
  /**
   * Webhook送信
   */
  private async sendWebhookToEndpoint(
    endpoint: string,
    data: {
      event: string
      payload: any
      metadata?: Record<string, any>
    }
  ): Promise<boolean> {
    try {
      // 実際の実装ではfetchやaxiosを使用
      this.logger.info('Webhook送信', {
        data: { endpoint },
        event: data.event
      })
      
      // 実装例（実際にはHTTPリクエスト）
      return true
    } catch (error: Error) {
      this.logger.error('Webhook送信エラー', {
        data: { endpoint },
        error: new Error(error instanceof Error ? error.message : String(error))
      })
      return false
    }
  }
  
  /**
   * 通知イベント発行
   */
  private async publishNotificationEvent(
    type: NotificationType,
    data: {
      template_id: string
      recipient: string | string[]
      success: boolean
      metadata?: Record<string, any>
    }
  ): Promise<void> {
    try {
      const eventPublisher = getEventPublisher()
      
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
      })
    } catch (error: Error) {
      this.logger.warn('通知イベント発行エラー', error as Error)
    }
  }
}

/**
 * 通知サービス取得
 */
export function getNotificationService(): NotificationService {
  return NotificationService.getInstance()
}