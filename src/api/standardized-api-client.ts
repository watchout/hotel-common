import axios, { AxiosResponse } from 'axios'

import { getTenantManager } from '../multitenancy/unified-tenant-manager'
import { HotelLogger } from '../utils/logger'
import { getRedisClient } from '../utils/redis'

import type { TenantContext } from '../multitenancy/unified-tenant-manager';
import type { AxiosInstance, AxiosRequestConfig} from 'axios';

/**
 * 標準化されたAPIクライアント設定
 */
export interface StandardizedApiClientConfig {
  baseURL: string
  tenantId: string
  sourceSystem: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common'
  timeout?: number
  userId?: string
  apiKey?: string
  enableCache?: boolean
  cacheTTL?: number
  retryConfig?: RetryConfig
}

/**
 * リトライ設定
 */
export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryableStatuses: number[]
}

/**
 * 標準化されたAPIクライアント
 * 
 * 機能:
 * - 統一認証ヘッダー
 * - テナントコンテキスト自動設定
 * - エラーハンドリング
 * - キャッシュ
 * - リトライ
 * - メトリクス収集
 */
export class StandardizedApiClient {
  private client: AxiosInstance
  private logger = HotelLogger.getInstance()
  private redis = getRedisClient()
  private tenantManager = getTenantManager()
  private config: StandardizedApiClientConfig
  
  constructor(config: StandardizedApiClientConfig) {
    this.config = {
      timeout: 30000,
      enableCache: false,
      cacheTTL: 300,
      ...config,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
        ...config.retryConfig
      }
    }
    
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    this.setupInterceptors()
  }
  
  /**
   * インターセプター設定
   */
  private setupInterceptors(): void {
    // リクエストインターセプター
    this.client.interceptors.request.use(
      async (config) => {
        const startTime = Date.now()
        
        // テナントコンテキスト設定
        const tenantContext: TenantContext = {
          tenantId: this.config.tenantId,
          userId: this.config.userId,
          sourceSystem: this.config.sourceSystem,
          requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
        }
        
        // 統一ヘッダー設定
        // @ts-ignore - ヘッダーの型定義の問題
        config.headers = {
          ...config.headers,
          'X-Tenant-ID': tenantContext.tenantId,
          'X-Source-System': tenantContext.sourceSystem,
          'X-Request-ID': tenantContext.requestId
        }
        
        if (tenantContext.userId) {
          config.headers['X-User-ID'] = tenantContext.userId
        }
        
        if (this.config.apiKey) {
          config.headers['X-API-Key'] = this.config.apiKey
        }
        
        // リクエストログ
        this.logger.debug('API Request', {
          method: config.method,
          url: config.url,
          tenant: tenantContext.tenantId,
          requestId: tenantContext.requestId
        })
        
        // メトリクス用データ保存
        // @ts-ignore - メタデータの型定義の問題
        config.metadata = {
          startTime,
          tenantContext,
          retryCount: 0
        }
        
        return config
      },
      (error) => {
        this.logger.error('リクエスト準備エラー', error)
        return Promise.reject(error)
      }
    )
    
    // レスポンスインターセプター
    this.client.interceptors.response.use(
      async (response) => {
        const config = response.config as any
        const endTime = Date.now()
        const duration = endTime - config.metadata.startTime
        
        // レスポンスログ
        this.logger.debug('API Response', {
          method: config.method,
          url: config.url,
          status: response.status,
          duration: `${duration}ms`,
          tenant: config.metadata.tenantContext.tenantId,
          requestId: config.metadata.tenantContext.requestId
        })
        
        // キャッシュ保存（GETリクエストのみ）
        if (this.config.enableCache && config.method === 'get') {
          await this.cacheResponse(config.url, response.data)
        }
        
        // テナントアクセスログ記録
        await this.tenantManager.logTenantAccess(
          config.metadata.tenantContext,
          `API:${config.url}`,
          config.method
        )
        
        // メトリクス記録
        this.recordMetrics({
          url: config.url,
          method: config.method,
          status: response.status,
          duration,
          tenantId: config.metadata.tenantContext.tenantId,
          retryCount: config.metadata.retryCount
        })
        
        return response
      },
      async (error) => {
        if (!error.config) {
          this.logger.error('API Error (No Config)', error)
          return Promise.reject(error)
        }
        
        const config = error.config
        const endTime = Date.now()
        const duration = endTime - (config.metadata?.startTime || endTime)
        const retryCount = config.metadata?.retryCount || 0
        
        // エラーログ
        this.logger.error('API Error', {
          method: config.method,
          url: config.url,
          status: error.response?.status,
          duration: `${duration}ms`,
          tenant: config.metadata?.tenantContext?.tenantId,
          requestId: config.metadata?.tenantContext?.requestId,
          retryCount,
          error: error.message
        })
        
        // リトライ処理
        if (this.shouldRetry(error, retryCount)) {
          config.metadata.retryCount = retryCount + 1
          
          this.logger.info('API Retry', {
            method: config.method,
            url: config.url,
            attempt: config.metadata.retryCount,
            maxRetries: this.config.retryConfig?.maxRetries
          })
          
          // 遅延を入れてリトライ
          await new Promise(resolve => 
            setTimeout(resolve, this.calculateRetryDelay(retryCount))
          )
          
          return this.client(config)
        }
        
        // メトリクス記録（失敗）
        if (config.metadata?.tenantContext) {
          this.recordMetrics({
            url: config.url,
            method: config.method,
            status: error.response?.status || 0,
            duration,
            tenantId: config.metadata.tenantContext.tenantId,
            retryCount,
            error: error.message
          })
        }
        
        return Promise.reject(error)
      }
    )
  }
  
  /**
   * リトライ判断
   */
  private shouldRetry(error: any, retryCount: number): boolean {
    // リトライ設定がなければリトライしない
    if (!this.config.retryConfig) return false
    
    // 最大リトライ回数を超えていればリトライしない
    if (retryCount >= this.config.retryConfig.maxRetries) return false
    
    // レスポンスがなければネットワークエラーとしてリトライ
    if (!error.response) return true
    
    // 設定されたステータスコードならリトライ
    return this.config.retryConfig.retryableStatuses.includes(error.response.status)
  }
  
  /**
   * リトライ遅延計算（指数バックオフ）
   */
  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = this.config.retryConfig?.retryDelay || 1000
    return baseDelay * Math.pow(2, retryCount)
  }
  
  /**
   * レスポンスキャッシュ
   */
  private async cacheResponse(url: string, data: any): Promise<void> {
    try {
      const cacheKey = `api:${this.config.tenantId}:${url}`
      // @ts-ignore - Redisクライアントの型定義の問題
      await this.redis.set(
        cacheKey,
        JSON.stringify(data)
      )
    } catch (error: unknown) {
      this.logger.warn('キャッシュ保存エラー', error)
    }
  }
  
  /**
   * キャッシュからデータ取得
   */
  private async getFromCache(url: string): Promise<any | null> {
    try {
      const cacheKey = `api:${this.config.tenantId}:${url}`
      const cached = await this.redis.get(cacheKey)
      
      if (cached) {
        return JSON.parse(cached)
      }
      
      return null
    } catch (error: unknown) {
      this.logger.warn('キャッシュ取得エラー', error)
      return null
    }
  }
  
  /**
   * メトリクス記録
   */
  private recordMetrics(metrics: {
    url: string
    method: string
    status: number
    duration: number
    tenantId: string
    retryCount: number
    error?: string
  }): void {
    try {
      // メトリクス記録（実装は別途）
    } catch (error: unknown) {
      this.logger.warn('メトリクス記録エラー', error)
    }
  }
  
  /**
   * GET リクエスト
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    // キャッシュチェック
    if (this.config.enableCache) {
      const cached = await this.getFromCache(url)
      if (cached) {
        this.logger.debug('Cache Hit', { url, tenant: this.config.tenantId })
        return cached
      }
    }
    
    const response = await this.client.get<T>(url, config)
    return response.data
  }
  
  /**
   * POST リクエスト
   */
  async post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }
  
  /**
   * PUT リクエスト
   */
  async put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }
  
  /**
   * PATCH リクエスト
   */
  async patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }
  
  /**
   * DELETE リクエスト
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

/**
 * 標準化APIクライアントファクトリー
 */
export function createStandardizedApiClient(
  config: StandardizedApiClientConfig
): StandardizedApiClient {
  return new StandardizedApiClient(config)
}