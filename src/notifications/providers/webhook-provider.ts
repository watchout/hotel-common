/**
 * Webhook通知プロバイダー
 * 
 * 外部システムへのWebhook通知を送信するための機能を提供
 */

import { HotelLogger } from '../../utils/logger'

/**
 * Webhook設定
 */
export interface WebhookConfig {
  endpoints: string[]
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  secret?: string
}

/**
 * Webhook送信データ
 */
export interface WebhookData {
  event: string
  payload: any
  metadata?: Record<string, any>
}

/**
 * Webhook送信結果
 */
export interface WebhookResult {
  success: boolean
  statusCode?: number
  error?: string
  endpoint: string
  responseTime?: number
}

/**
 * Webhook通知プロバイダー
 */
export class WebhookProvider {
  private logger = HotelLogger.getInstance()
  private config: WebhookConfig
  private fetch: any
  
  constructor(config: WebhookConfig) {
    this.config = {
      timeout: 10000, // デフォルト10秒
      retries: 3,     // デフォルト3回リトライ
      ...config
    }
    
    // Node.jsのfetchまたはnode-fetch
    this.fetch = globalThis.fetch || require('node-fetch')
    
    this.logger.info('Webhook provider initialized', {
      data: {
        endpoints: config.endpoints.length,
        timeout: this.config.timeout,
        retries: this.config.retries
      }
    })
  }
  
  /**
   * 単一エンドポイントにWebhook送信
   */
  async sendWebhook(endpoint: string, data: WebhookData): Promise<WebhookResult> {
    const startTime = Date.now()
    let currentRetry = 0
    
    while (currentRetry <= (this.config.retries || 0)) {
      try {
        // リクエストヘッダー
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'HotelCommon-Webhook/1.0',
          'X-Webhook-Event': data.event,
          ...this.config.headers
        }
        
        // シークレットがある場合は署名を追加
        if (this.config.secret) {
          headers['X-Webhook-Signature'] = this.generateSignature(data, this.config.secret)
        }
        
        // POSTリクエスト送信
        const response = await this.fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            event: data.event,
            payload: data.payload,
            metadata: {
              ...data.metadata,
              timestamp: new Date().toISOString(),
              webhook_id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
            }
          }),
          timeout: this.config.timeout
        })
        
        const responseTime = Date.now() - startTime
        
        // 成功レスポンス
        if (response.ok) {
          this.logger.info('Webhook sent successfully', {
            data: {
              endpoint,
              event: data.event,
              statusCode: response.status,
              responseTime
            }
          })
          
          return {
            success: true,
            statusCode: response.status,
            endpoint,
            responseTime
          }
        }
        
        // エラーレスポンス
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
        
      } catch (error: unknown) {
        currentRetry++
        
        // 最大リトライ回数に達した場合
        if (currentRetry > (this.config.retries || 0)) {
          const responseTime = Date.now() - startTime
          
          this.logger.error('Webhook send failed after retries', {
            data: {
              endpoint,
              event: data.event,
              retries: currentRetry - 1,
              responseTime
            },
            error: error instanceof Error ? error : new Error(String(error))
          })
          
          return {
            success: false,
            endpoint,
            error: error instanceof Error ? error.message : String(error),
            responseTime
          }
        }
        
        // リトライ
        this.logger.warn('Webhook send failed, retrying', {
          data: {
            endpoint,
            event: data.event,
            retry: currentRetry
          },
          error: error instanceof Error ? error : new Error(String(error))
        })
        
        // 指数バックオフ（1秒、2秒、4秒...）
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetry - 1)))
      }
    }
    
    // ここには到達しないはず
    return {
      success: false,
      endpoint,
      error: 'Unknown error'
    }
  }
  
  /**
   * 複数エンドポイントにWebhook送信
   */
  async sendWebhooks(data: WebhookData): Promise<WebhookResult[]> {
    // 並列で全エンドポイントに送信
    const results = await Promise.all(
      this.config.endpoints.map(endpoint => this.sendWebhook(endpoint, data))
    )
    
    // 結果集計
    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount
    
    this.logger.info('Webhook batch completed', {
      data: {
        event: data.event,
        total: results.length,
        success: successCount,
        failure: failureCount
      }
    })
    
    return results
  }
  
  /**
   * Webhook署名生成
   */
  private generateSignature(data: WebhookData, secret: string): string {
    try {
      const crypto = require('crypto')
      const payload = JSON.stringify({
        event: data.event,
        payload: data.payload,
        timestamp: new Date().toISOString()
      })
      
      return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')
    } catch (error: unknown) {
      const { createErrorLogOption } = require('../../utils/error-helper');
      this.logger.error('Failed to generate webhook signature', createErrorLogOption(error))
      return ''
    }
  }
}

/**
 * Webhookプロバイダー作成
 */
export function createWebhookProvider(config: WebhookConfig): WebhookProvider {
  return new WebhookProvider(config)
}