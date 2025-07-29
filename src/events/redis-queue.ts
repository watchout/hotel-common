import Redis from 'redis'
import { HotelEvent, EventDeliveryLog, SystemId } from './types'
import { HotelLogger } from '../utils/logger'

export interface RedisQueueConfig {
  host: string
  port: number
  password?: string
  db: number
  maxRetries: number
  retryDelay: number
}

/**
 * Redis Streams基盤 - Event-driven連携の核心コンポーネント
 * 
 * 機能:
 * - イベントストリーム発行・消費
 * - コンシューマーグループ管理
 * - 配信保証・リトライ機能
 * - オフライン対応・差分同期
 */
export class RedisEventQueue {
  private redis: Redis.RedisClientType
  private logger: HotelLogger
  private isConnected: boolean = false
  private consumerGroups: Map<string, Set<string>> = new Map()

  constructor(private config: RedisQueueConfig) {
    this.logger = HotelLogger.getInstance()
    this.redis = Redis.createClient({
      url: `redis://${config.host}:${config.port}`,
      password: config.password,
      database: config.db
    }) as Redis.RedisClientType
    
    this.setupRedisEventHandlers()
  }

  /**
   * Redis接続・イベントハンドラ設定
   */
  private setupRedisEventHandlers(): void {
    this.redis.on('connect', () => {
      this.logger.info('Redis接続成功')
      this.isConnected = true
    })

    this.redis.on('error', (error) => {
      this.logger.error('Redisエラー:', error)
      this.isConnected = false
    })

    this.redis.on('end', () => {
      this.logger.warn('Redis接続終了')
      this.isConnected = false
    })
  }

  /**
   * Redis接続開始
   */
  async connect(): Promise<void> {
    try {
      await this.redis.connect()
      this.logger.info('RedisEventQueue接続完了')
    } catch (error) {
      this.logger.error('Redis接続エラー:', error as Error)
      throw error
    }
  }

  /**
   * Redis接続終了
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      this.logger.info('RedisEventQueue切断完了')
    } catch (error) {
      this.logger.error('Redis切断エラー:', error as Error)
      throw error
    }
  }

  /**
   * イベントストリーム発行
   * 
   * @param streamName ストリーム名（例: "hotel-events"）
   * @param event 発行するイベント
   * @returns イベントID
   */
  async publishToStream(streamName: string, event: HotelEvent): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis未接続です')
      }

      const enrichedEvent = this.enrichEventMetadata(event)
      
      const eventId = await this.redis.xAdd(
        streamName,
        '*', // auto-generate ID
        {
          event_type: event.type,
          event_action: event.action,
          event_data: JSON.stringify(enrichedEvent),
          priority: event.priority,
          sync_mode: event.sync_mode,
          targets: JSON.stringify(event.targets),
          origin_system: event.origin_system,
          tenant_id: event.tenant_id,
          timestamp: Date.now().toString()
        }
      )

      this.logger.info(`イベント発行成功: ${streamName}/${eventId}`, {
        eventType: event.type,
        action: event.action,
        targets: event.targets
      } as any)

      // 配信ログ記録
      await this.logEventDelivery({
        event_id: eventId,
        event_type: event.type,
        source_system: event.origin_system,
        target_systems: event.targets,
        delivery_status: 'success',
        delivery_time: 0, // Stream発行は即座
        retry_count: 0,
        timestamp: new Date()
      })

      return eventId

    } catch (error) {
      this.logger.error('イベント発行エラー:', error as Error)
      
      // エラーログ記録
      await this.logEventDelivery({
        event_id: 'failed',
        event_type: event.type,
        source_system: event.origin_system,
        target_systems: event.targets,
        delivery_status: 'failed',
        delivery_time: 0,
        retry_count: 0,
        error_message: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      })

      throw error
    }
  }

  /**
   * コンシューマーグループでのストリーム消費
   * 
   * @param streamName ストリーム名
   * @param consumerGroup コンシューマーグループ名
   * @param consumerId コンシューマーID
   * @param callback イベント処理コールバック
   */
  async consumeFromStream(
    streamName: string,
    consumerGroup: string,
    consumerId: string,
    callback: (event: HotelEvent, messageId: string) => Promise<void>
  ): Promise<void> {
    try {
      // コンシューマーグループ作成（存在しない場合）
      await this.ensureConsumerGroup(streamName, consumerGroup)
      
      this.logger.info(`ストリーム消費開始: ${streamName}/${consumerGroup}/${consumerId}`)

      while (this.isConnected) {
        try {
          // 未処理メッセージ確認（再配信）
          await this.processPendingMessages(streamName, consumerGroup, consumerId, callback)

          // 新しいメッセージ読み取り
          const results = await this.redis.xReadGroup(
            consumerGroup,
            consumerId,
            [
              {
                key: streamName,
                id: '>' // 新しいメッセージのみ
              }
            ],
            {
              COUNT: 10, // バッチサイズ
              BLOCK: 1000 // 1秒待機
            }
          )

          if (results && results.length > 0) {
            for (const stream of results) {
              for (const message of stream.messages) {
                await this.processMessage(message, streamName, consumerGroup, callback)
              }
            }
          }

        } catch (error) {
          this.logger.error('ストリーム消費エラー:', error as Error)
          // エラー時は5秒待機して再試行
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }

    } catch (error) {
      this.logger.error('ストリーム消費初期化エラー:', error as Error)
      throw error
    }
  }

  /**
   * コンシューマーグループ存在確認・作成
   */
  private async ensureConsumerGroup(streamName: string, consumerGroup: string): Promise<void> {
    try {
      await this.redis.xGroupCreate(streamName, consumerGroup, '$', {
        MKSTREAM: true
      })
      this.logger.info(`コンシューマーグループ作成: ${streamName}/${consumerGroup}`)
      
      // グループ追跡
      if (!this.consumerGroups.has(streamName)) {
        this.consumerGroups.set(streamName, new Set())
      }
      this.consumerGroups.get(streamName)!.add(consumerGroup)
      
    } catch (error) {
      // グループが既存の場合はOK
      if (error instanceof Error && error.message.includes('BUSYGROUP')) {
        this.logger.debug(`コンシューマーグループ既存: ${streamName}/${consumerGroup}`)
      } else {
        throw error
      }
    }
  }

  /**
   * 未処理メッセージの再処理
   */
  private async processPendingMessages(
    streamName: string,
    consumerGroup: string,
    consumerId: string,
    callback: (event: HotelEvent, messageId: string) => Promise<void>
  ): Promise<void> {
    try {
      const pending = await this.redis.xPending(streamName, consumerGroup)
      
      if (pending.count > 0) {
        this.logger.info(`未処理メッセージ再処理: ${pending.count}件`)
        
        const messages = await this.redis.xPendingRange(
          streamName,
          consumerGroup,
          '-',
          '+',
          10,
          consumerId
        )

        for (const message of messages) {
          const messageData = await this.redis.xRange(streamName, message.id, message.id)
          if (messageData.length > 0) {
            await this.processMessage(messageData[0], streamName, consumerGroup, callback)
          }
        }
      }
    } catch (error) {
      this.logger.error('未処理メッセージ処理エラー:', error)
    }
  }

  /**
   * 個別メッセージ処理
   */
  private async processMessage(
    message: any,
    streamName: string,
    consumerGroup: string,
    callback: (event: HotelEvent, messageId: string) => Promise<void>
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      const eventData = JSON.parse(message.message.event_data) as HotelEvent
      
      this.logger.debug(`メッセージ処理開始: ${message.id}`, {
        eventType: eventData.type,
        action: eventData.action
      })

      // コールバック実行
      await callback(eventData, message.id)

      // 処理完了をACK
      await this.redis.xAck(streamName, consumerGroup, message.id)

      const processingTime = Date.now() - startTime
      this.logger.info(`メッセージ処理完了: ${message.id} (${processingTime}ms)`)

      // 成功ログ記録
      await this.logEventDelivery({
        event_id: message.id,
        event_type: eventData.type,
        source_system: eventData.origin_system,
        target_systems: eventData.targets,
        delivery_status: 'success',
        delivery_time: processingTime,
        retry_count: 0,
        timestamp: new Date()
      })

    } catch (error) {
      const processingTime = Date.now() - startTime
      this.logger.error(`メッセージ処理エラー: ${message.id}`, error)

      // リトライ処理
      await this.handleMessageError(message, streamName, consumerGroup, error, processingTime)
    }
  }

  /**
   * メッセージ処理エラー・リトライ処理
   */
  private async handleMessageError(
    message: any,
    streamName: string,
    consumerGroup: string,
    error: any,
    processingTime: number
  ): Promise<void> {
    try {
      const eventData = JSON.parse(message.message.event_data) as HotelEvent
      const currentRetry = (eventData.retry_count || 0) + 1

      if (currentRetry <= this.config.maxRetries) {
        // リトライ待機
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * currentRetry)
        )

        // リトライログ記録
        await this.logEventDelivery({
          event_id: message.id,
          event_type: eventData.type,
          source_system: eventData.origin_system,
          target_systems: eventData.targets,
          delivery_status: 'retrying',
          delivery_time: processingTime,
          retry_count: currentRetry,
          error_message: error instanceof Error ? error.message : String(error),
          timestamp: new Date()
        })

        this.logger.warn(`メッセージリトライ: ${message.id} (${currentRetry}/${this.config.maxRetries})`)

      } else {
        // 最大リトライ到達 - デッドレターキューまたは手動処理待ち
        await this.redis.xAck(streamName, consumerGroup, message.id)
        
        await this.logEventDelivery({
          event_id: message.id,
          event_type: eventData.type,
          source_system: eventData.origin_system,
          target_systems: eventData.targets,
          delivery_status: 'failed',
          delivery_time: processingTime,
          retry_count: currentRetry,
          error_message: `最大リトライ到達: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date()
        })

        this.logger.error(`メッセージ処理失敗（最大リトライ到達）: ${message.id}`)
      }

    } catch (logError) {
      this.logger.error('エラーハンドリング中にエラー:', logError)
    }
  }

  /**
   * イベントメタデータの強化
   */
  private enrichEventMetadata(event: HotelEvent): HotelEvent {
    return {
      ...event,
      event_id: event.event_id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: event.timestamp || new Date(),
      synced_at: new Date(),
      retry_count: 0
    }
  }

  /**
   * イベント配信ログ記録
   */
  private async logEventDelivery(log: EventDeliveryLog): Promise<void> {
    try {
      // Redis Hashに配信ログ保存（7日間保持）
      const logKey = `event-delivery-log:${log.event_id}`
      await this.redis.hSet(logKey, {
        event_type: log.event_type,
        source_system: log.source_system,
        target_systems: JSON.stringify(log.target_systems),
        delivery_status: log.delivery_status,
        delivery_time: log.delivery_time.toString(),
        retry_count: log.retry_count.toString(),
        error_message: log.error_message || '',
        timestamp: log.timestamp.toISOString()
      })
      
      // 7日後に自動削除
      await this.redis.expire(logKey, 7 * 24 * 60 * 60)
      
    } catch (error) {
      this.logger.error('配信ログ記録エラー:', error)
    }
  }

  /**
   * ストリーム統計取得
   */
  async getStreamStats(streamName: string): Promise<any> {
    try {
      const info = await this.redis.xInfoStream(streamName)
      const groups = await this.redis.xInfoGroups(streamName)
      
      return {
        stream: info,
        consumer_groups: groups,
        length: info.length,
        first_entry: info['first-entry'],
        last_entry: info['last-entry']
      }
    } catch (error) {
      this.logger.error('ストリーム統計取得エラー:', error)
      return null
    }
  }

  /**
   * 健全性チェック
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const ping = await this.redis.ping()
      const info = await this.redis.info('replication')
      
      return {
        status: this.isConnected ? 'healthy' : 'unhealthy',
        details: {
          ping_response: ping,
          connected: this.isConnected,
          replication_info: info,
          consumer_groups: Array.from(this.consumerGroups.entries()).map(([stream, groups]) => ({
            stream,
            groups: Array.from(groups)
          }))
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }
} 