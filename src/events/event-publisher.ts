import { RedisEventQueue, RedisQueueConfig } from './redis-queue'
import { SystemId } from './types'
import { hotelDb } from '../database/prisma'
import { HotelLogger } from '../utils/logger'
import { HotelWebSocketClient } from '../websocket/client'

import type { HotelEvent, EventPublisherConfig, EventPriority } from './types';

/**
 * 統一EventPublisher - Event-driven連携の発行側統一インターフェース
 * 
 * 機能:
 * - 複数経路でのイベント配信（Redis Streams + WebSocket）
 * - 優先度別配信方式選択
 * - イベント検証・強化
 * - 監査ログ記録
 * - バッチイベントスケジューリング
 */
export class HotelEventPublisher {
  private redisQueue: RedisEventQueue
  private webSocketClient: HotelWebSocketClient | null = null
  private logger: HotelLogger
  private batchScheduler: Map<string, NodeJS.Timeout> = new Map()
  
  constructor(private config: EventPublisherConfig) {
    this.logger = HotelLogger.getInstance()
    
    // Redis Streams初期化
    this.redisQueue = new RedisEventQueue({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      maxRetries: config.queue.max_retries,
      retryDelay: config.queue.retry_delay
    })
    
    // WebSocketクライアント初期化（オプション）
    if (config.websocket) {
      this.webSocketClient = new HotelWebSocketClient({
        url: `ws://localhost:${config.websocket.port}${config.websocket.path}`,
        autoConnect: true,
        reconnection: true
      })
    }
    
    this.logger.info(`HotelEventPublisher初期化完了 - Redis: ${config.redis.host}:${config.redis.port}, WebSocket: ${config.websocket ? `port:${config.websocket.port}` : 'disabled'}`)
  }

  /**
   * 統一イベント発行メソッド
   * 
   * @param event 発行するイベント
   * @returns 発行されたイベントID
   */
  async publishEvent<T extends HotelEvent>(event: T): Promise<string> {
    try {
      // 1. イベント検証・強化
      const validatedEvent = await this.validateAndEnrichEvent(event)
      
      // 2. 優先度・同期方式による配信方法選択
      switch (validatedEvent.sync_mode) {
        case 'realtime':
          return await this.publishRealtimeEvent(validatedEvent)
        case 'batch':
          return await this.scheduleBatchEvent(validatedEvent)
        default:
          throw new Error(`未対応の同期方式: ${(validatedEvent as any).sync_mode}`)
      }
      
    } catch (error: Error) {
      this.logger.error('イベント発行エラー:', error as Error)
      await this.handlePublishError(event, error)
      throw error
    }
  }

  /**
   * リアルタイムイベント発行
   */
  private async publishRealtimeEvent(event: HotelEvent): Promise<string> {
    const startTime = Date.now()
    
    try {
      // Redis Streams配信（保証配信・永続化）
      const eventId = await this.redisQueue.publishToStream('hotel-events', event)
      
      // WebSocket即座配信（接続中システムへの高速配信）
      if (this.webSocketClient) {
        await this.broadcastWebSocketEvent(event)
      }
      
      // 重要イベントは追加経路でも配信
      if (event.priority === 'CRITICAL') {
        await this.publishCriticalEvent(event)
      }
      
      // PostgreSQL監査ログ記録
      await this.storeEventAuditLog(event, eventId)
      
      const publishTime = Date.now() - startTime
      this.logger.info(`リアルタイムイベント発行完了: ${eventId} (${publishTime}ms) - Type: ${event.type}.${event.action}, Priority: ${event.priority}, Targets: ${event.targets.join(',')}`)
      
      return eventId
      
    } catch (error: Error) {
      this.logger.error('リアルタイムイベント発行エラー:', error as Error)
      throw error
    }
  }

  /**
   * バッチイベントスケジューリング
   */
  private async scheduleBatchEvent(event: HotelEvent): Promise<string> {
    try {
      if (event.type !== 'analytics') {
        throw new Error('バッチ同期はanalyticsイベントのみ対応')
      }
      
      const analyticsEvent = event as any // AnalyticsEvent
      const scheduleKey = `${event.type}-${analyticsEvent.schedule}`
      
      // 既存スケジュールをクリア
      if (this.batchScheduler.has(scheduleKey)) {
        clearTimeout(this.batchScheduler.get(scheduleKey)!)
      }
      
      // スケジュール解析・実行時刻計算
      const nextExecutionTime = this.calculateNextExecution(analyticsEvent.schedule)
      const delay = nextExecutionTime.getTime() - Date.now()
      
      // スケジュール設定
      const timeoutId = setTimeout(async () => {
        try {
          await this.executeBatchEvent(event)
          this.batchScheduler.delete(scheduleKey)
        } catch (error: Error) {
          this.logger.error('バッチイベント実行エラー:', error as Error)
        }
      }, delay)
      
      this.batchScheduler.set(scheduleKey, timeoutId)
      
      const eventId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      this.logger.info(`バッチイベントスケジュール設定: ${eventId} - Schedule: ${analyticsEvent.schedule}, Next: ${nextExecutionTime.toISOString()}, Delay: ${delay}ms`)
      
      return eventId
      
    } catch (error: Error) {
      this.logger.error('バッチイベントスケジューリングエラー:', error as Error)
      throw error
    }
  }

  /**
   * WebSocketブロードキャスト
   */
  private async broadcastWebSocketEvent(event: HotelEvent): Promise<void> {
    try {
      if (!this.webSocketClient) return
      
      // 対象システムに即座配信
      for (const targetSystem of event.targets) {
        this.webSocketClient.send(`event:${targetSystem}`, {
          type: event.type,
          action: event.action,
          data: event.data,
          metadata: {
            event_id: event.event_id,
            timestamp: event.timestamp,
            origin_system: event.origin_system,
            priority: event.priority
          }
        })
      }
      
      this.logger.debug(`WebSocketブロードキャスト完了 - Targets: ${event.targets.join(',')}, Type: ${event.type}`)
      
    } catch (error: Error) {
      this.logger.warn('WebSocketブロードキャストエラー（継続）:', error as Error)
      // WebSocketエラーは致命的ではないため継続
    }
  }

  /**
   * 重要イベント追加配信
   */
  private async publishCriticalEvent(event: HotelEvent): Promise<void> {
    try {
      // 重要イベント専用ストリーム
      await this.redisQueue.publishToStream('hotel-critical-events', event)
      
      // 即座通知（将来的にSMS/Email等）
      this.logger.warn('重要イベント発生', {
        eventType: event.type,
        action: event.action,
        priority: event.priority,
        data: event.data
      })
      
    } catch (error: Error) {
      this.logger.error('重要イベント追加配信エラー:', error)
    }
  }

  /**
   * イベント検証・強化
   */
  private async validateAndEnrichEvent(event: HotelEvent): Promise<HotelEvent> {
    // 基本検証
    if (!event.type || !event.action) {
      throw new Error('イベントタイプ・アクションは必須です')
    }
    
    if (!event.targets || event.targets.length === 0) {
      throw new Error('配信対象システムは必須です')
    }
    
    if (!event.tenant_id) {
      throw new Error('テナントIDは必須です')
    }
    
    // メタデータ強化
    const enrichedEvent = {
      ...event,
      event_id: event.event_id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: event.timestamp || new Date(),
      synced_at: new Date(),
      retry_count: 0,
      correlation_id: event.correlation_id || `corr-${Date.now()}`
    }
    
    // ソーストラッキング検証
    if (!enrichedEvent.origin_system || !enrichedEvent.updated_by_system) {
      throw new Error('ソーストラッキング情報は必須です')
    }
    
    // 優先度デフォルト設定
    if (!enrichedEvent.priority) {
      enrichedEvent.priority = this.getDefaultPriority(event.type)
    }
    
    // 配信保証デフォルト設定
    if (!enrichedEvent.delivery_guarantee) {
      enrichedEvent.delivery_guarantee = enrichedEvent.priority === 'CRITICAL' 
        ? 'exactly_once' 
        : 'at_least_once'
    }
    
    return enrichedEvent
  }

  /**
   * デフォルト優先度決定
   */
  private getDefaultPriority(eventType: string): EventPriority {
    switch (eventType) {
      case 'checkin_checkout':
        return 'CRITICAL'
      case 'reservation':
      case 'customer':
      case 'room':
        return 'HIGH'
      case 'analytics':
        return 'MEDIUM'
      case 'system':
        return 'LOW'
      default:
        return 'MEDIUM'
    }
  }

  /**
   * バッチイベント実行
   */
  private async executeBatchEvent(event: HotelEvent): Promise<void> {
    try {
      this.logger.info('バッチイベント実行開始', {
        eventType: event.type,
        action: event.action
      })
      
      // Redis Streamsに配信
      await this.redisQueue.publishToStream('hotel-batch-events', event)
      
      // 次回スケジュール設定
      if (event.type === 'analytics') {
        const analyticsEvent = event as any
        await this.scheduleBatchEvent({
          ...event,
          timestamp: new Date()
        })
      }
      
    } catch (error: Error) {
      this.logger.error('バッチイベント実行エラー:', error)
    }
  }

  /**
   * 次回実行時刻計算
   */
  private calculateNextExecution(schedule: string): Date {
    const now = new Date()
    const nextExecution = new Date()
    
    switch (schedule) {
      case 'daily_23:00':
        nextExecution.setHours(23, 0, 0, 0)
        if (nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + 1)
        }
        break
        
      case 'weekly_sunday_01:00':
        nextExecution.setHours(1, 0, 0, 0)
        const daysUntilSunday = (7 - nextExecution.getDay()) % 7
        if (daysUntilSunday === 0 && nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + 7)
        } else {
          nextExecution.setDate(nextExecution.getDate() + daysUntilSunday)
        }
        break
        
      case 'monthly_1st_02:00':
        nextExecution.setDate(1)
        nextExecution.setHours(2, 0, 0, 0)
        if (nextExecution <= now) {
          nextExecution.setMonth(nextExecution.getMonth() + 1)
        }
        break
        
      default:
        // デフォルト: 1時間後
        nextExecution.setTime(now.getTime() + 60 * 60 * 1000)
    }
    
    return nextExecution
  }

  /**
   * PostgreSQL監査ログ記録
   */
  private async storeEventAuditLog(event: HotelEvent, eventId: string): Promise<void> {
    try {
      const db = hotelDb.getAdapter()
      
      await db.systemEvent.create({
        data: {
          tenant_id: event.tenant_id,
          user_id: event.user_id,
          event_type: 'INTEGRATION', // システム間連携イベント
          source_system: event.origin_system,
          target_system: event.targets.join(','),
          entity_type: event.type,
          entity_id: eventId,
          action: 'CREATE', // イベント発行
          event_data: {
            event_id: eventId,
            event_type: event.type,
            event_action: event.action,
            priority: event.priority,
            sync_mode: event.sync_mode,
            delivery_guarantee: event.delivery_guarantee,
            correlation_id: event.correlation_id
          },
          // @ts-ignore - フィールド名の不一致
          occurred_at: event.timestamp
        }
      })
      
    } catch (error: Error) {
      this.logger.error('監査ログ記録エラー:', error)
      // 監査ログエラーは致命的ではないため継続
    }
  }

  /**
   * 発行エラーハンドリング
   */
  private async handlePublishError(event: HotelEvent, error: any): Promise<void> {
    try {
      this.logger.error('イベント発行エラー詳細:', {
        eventType: event.type,
        action: event.action,
        priority: event.priority,
        targets: event.targets,
        error: error instanceof Error ? error.message : String(error)
      })
      
      // エラーイベント発行（循環防止のため最小限）
      if (event.type !== 'system') {
        await this.publishSystemErrorEvent(event, error)
      }
      
    } catch (errorHandlingError) {
      this.logger.error('エラーハンドリング中にエラー:', errorHandlingError)
    }
  }

  /**
   * システムエラーイベント発行
   */
  private async publishSystemErrorEvent(originalEvent: HotelEvent, error: any): Promise<void> {
    try {
      const errorEvent: HotelEvent = {
        event_id: `error-${Date.now()}`,
        type: 'system',
        action: 'error',
        priority: 'HIGH',
        sync_mode: 'realtime',
        targets: ['hotel-common'],
        delivery_guarantee: 'at_least_once',
        timestamp: new Date(),
        origin_system: 'hotel-common',
        updated_by_system: 'hotel-common',
        synced_at: new Date(),
        tenant_id: originalEvent.tenant_id,
        data: {
          system_status: 'degraded',
          message: `Event publish failed: ${originalEvent.type}.${originalEvent.action}`,
          error_details: {
            original_event: {
              type: originalEvent.type,
              action: originalEvent.action,
              event_id: originalEvent.event_id
            },
            error_message: error instanceof Error ? error.message : String(error)
          }
        }
      }
      
      // 直接Redis Streamsに送信（循環防止）
      await this.redisQueue.publishToStream('hotel-error-events', errorEvent)
      
    } catch (systemErrorError) {
      this.logger.error('システムエラーイベント発行エラー:', systemErrorError)
    }
  }

  /**
   * 接続開始
   */
  async connect(): Promise<void> {
    try {
      await this.redisQueue.connect()
      
      if (this.webSocketClient) {
        this.webSocketClient.connect()
      }
      
      this.logger.info('HotelEventPublisher接続完了')
      
    } catch (error: Error) {
      this.logger.error('HotelEventPublisher接続エラー:', error)
      throw error
    }
  }

  /**
   * 接続終了
   */
  async disconnect(): Promise<void> {
    try {
      // バッチスケジューラクリア
      for (const [key, timeoutId] of this.batchScheduler) {
        clearTimeout(timeoutId)
        this.logger.info(`バッチスケジュールクリア: ${key}`)
      }
      this.batchScheduler.clear()
      
      await this.redisQueue.disconnect()
      
      if (this.webSocketClient) {
        this.webSocketClient.disconnect()
      }
      
      this.logger.info('HotelEventPublisher切断完了')
      
    } catch (error: Error) {
      this.logger.error('HotelEventPublisher切断エラー:', error)
      throw error
    }
  }

  /**
   * 健全性チェック
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const redisHealth = await this.redisQueue.healthCheck()
      
      return {
        status: redisHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        details: {
          redis: redisHealth,
          websocket: this.webSocketClient ? 'enabled' : 'disabled',
          batch_schedules: Array.from(this.batchScheduler.keys()),
          config: {
            redis_host: this.config.redis.host,
            websocket_enabled: !!this.config.websocket
          }
        }
      }
    } catch (error: Error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }
}

// シングルトンインスタンス（設定後に使用）
let publisherInstance: HotelEventPublisher | null = null

export function createEventPublisher(config: EventPublisherConfig): HotelEventPublisher {
  if (publisherInstance) {
    throw new Error('EventPublisherは既に初期化されています')
  }
  
  publisherInstance = new HotelEventPublisher(config)
  return publisherInstance
}

export function getEventPublisher(): HotelEventPublisher {
  if (!publisherInstance) {
    throw new Error('EventPublisherが初期化されていません。createEventPublisher()を先に呼び出してください')
  }
  
  return publisherInstance
} 