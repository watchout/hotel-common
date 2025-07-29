import Redis from 'redis'
import { SessionInfo } from '../types/auth'

export interface RedisConfig {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
}

export class HotelRedisClient {
  private client: Redis.RedisClientType
  private config: RedisConfig
  private connected: boolean = false

  constructor(config: RedisConfig = {}) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'hotel:',
      ...config
    }

    this.client = Redis.createClient({
      socket: {
        host: this.config.host,
        port: this.config.port
      },
      password: this.config.password,
      database: this.config.db
    })

    this.setupEventHandlers()
  }

  /**
   * Redis接続
   */
  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect()
      this.connected = true
    }
  }

  /**
   * Redis切断
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect()
      this.connected = false
    }
  }

  /**
   * イベントハンドラー設定
   */
  private setupEventHandlers(): void {
    this.client.on('error', (error) => {
      console.error('Redis error:', error)
    })

    this.client.on('connect', () => {
      console.log('Redis connected')
    })

    this.client.on('disconnect', () => {
      console.log('Redis disconnected')
      this.connected = false
    })
  }

  /**
   * キーにプレフィックスを追加
   */
  private prefixKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  /**
   * セッション保存
   */
  async saveSession(sessionInfo: SessionInfo): Promise<void> {
    if (!this.connected) await this.connect()
    
    const key = this.prefixKey(`session:${sessionInfo.tenant_id}:${sessionInfo.user_id}`)
    const ttl = Math.floor((sessionInfo.expires_at.getTime() - Date.now()) / 1000)
    
    await this.client.setEx(key, ttl, JSON.stringify(sessionInfo))
  }

  /**
   * セッション取得
   */
  async getSession(tenantId: string, userId: string): Promise<SessionInfo | null> {
    if (!this.connected) await this.connect()
    
    const key = this.prefixKey(`session:${tenantId}:${userId}`)
    const data = await this.client.get(key)
    
    if (!data) return null
    
    try {
      const sessionInfo = JSON.parse(data) as SessionInfo
      // 日付フィールドをDateオブジェクトに変換
      sessionInfo.expires_at = new Date(sessionInfo.expires_at)
      sessionInfo.created_at = new Date(sessionInfo.created_at)
      sessionInfo.last_activity = new Date(sessionInfo.last_activity)
      return sessionInfo
    } catch (error) {
      console.error('Error parsing session data:', error)
      return null
    }
  }

  /**
   * セッション削除
   */
  async deleteSession(tenantId: string, userId: string): Promise<void> {
    if (!this.connected) await this.connect()
    
    const key = this.prefixKey(`session:${tenantId}:${userId}`)
    await this.client.del(key)
  }

  /**
   * セッション更新（最終アクティビティ時間）
   */
  async updateSessionActivity(tenantId: string, userId: string): Promise<void> {
    const session = await this.getSession(tenantId, userId)
    if (session) {
      session.last_activity = new Date()
      await this.saveSession(session)
    }
  }

  /**
   * キャッシュ保存
   */
  async setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.connected) await this.connect()
    
    const prefixedKey = this.prefixKey(`cache:${key}`)
    const serialized = JSON.stringify(value)
    
    if (ttlSeconds) {
      await this.client.setEx(prefixedKey, ttlSeconds, serialized)
    } else {
      await this.client.set(prefixedKey, serialized)
    }
  }

  /**
   * キャッシュ取得
   */
  async getCache<T = any>(key: string): Promise<T | null> {
    if (!this.connected) await this.connect()
    
    const prefixedKey = this.prefixKey(`cache:${key}`)
    const data = await this.client.get(prefixedKey)
    
    if (!data) return null
    
    try {
      return JSON.parse(data) as T
    } catch (error) {
      console.error('Error parsing cache data:', error)
      return null
    }
  }

  /**
   * キャッシュ削除
   */
  async deleteCache(key: string): Promise<void> {
    if (!this.connected) await this.connect()
    
    const prefixedKey = this.prefixKey(`cache:${key}`)
    await this.client.del(prefixedKey)
  }

  /**
   * パターンマッチでキー取得
   */
  async getKeysByPattern(pattern: string): Promise<string[]> {
    if (!this.connected) await this.connect()
    
    const prefixedPattern = this.prefixKey(pattern)
    return await this.client.keys(prefixedPattern)
  }

  /**
   * リストの末尾に追加（キューとして使用）
   */
  async pushToQueue(queueName: string, item: any): Promise<void> {
    if (!this.connected) await this.connect()
    
    const key = this.prefixKey(`queue:${queueName}`)
    await this.client.rPush(key, JSON.stringify(item))
  }

  /**
   * リストの先頭から取得（キューとして使用）
   */
  async popFromQueue<T = any>(queueName: string): Promise<T | null> {
    if (!this.connected) await this.connect()
    
    const key = this.prefixKey(`queue:${queueName}`)
    const data = await this.client.lPop(key)
    
    if (!data) return null
    
    try {
      return JSON.parse(data) as T
    } catch (error) {
      console.error('Error parsing queue data:', error)
      return null
    }
  }

  /**
   * イベントログ保存
   */
  async logEvent(event: any): Promise<void> {
    const logKey = this.prefixKey(`events:${new Date().toISOString().split('T')[0]}`)
    await this.client.rPush(logKey, JSON.stringify({
      ...event,
      timestamp: new Date().toISOString()
    }))
    
    // 30日後に自動削除
    await this.client.expire(logKey, 30 * 24 * 60 * 60)
  }
}

// シングルトンインスタンス
let redisInstance: HotelRedisClient | null = null

export function getRedisClient(config?: RedisConfig): HotelRedisClient {
  if (!redisInstance) {
    redisInstance = new HotelRedisClient(config)
  }
  return redisInstance
} 