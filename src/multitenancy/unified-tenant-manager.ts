import { hotelDb } from '../database'
import { HotelLogger } from '../utils/logger'
import { getRedisClient } from '../utils/redis'

/**
 * マルチテナント管理のための統一インターフェース
 * 各システムでテナント管理を統一するための基盤クラス
 */
export interface TenantConfig {
  id: string
  name: string
  domain?: string
  settings?: Record<string, any>
  features?: string[]
  status: 'active' | 'inactive' | 'suspended'
}

export interface TenantContext {
  tenantId: string
  userId?: string
  sourceSystem: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common'
  requestId?: string
}

export class UnifiedTenantManager {
  private static instance: UnifiedTenantManager
  private logger = HotelLogger.getInstance()
  private db = hotelDb.getAdapter()
  private redis = getRedisClient()

  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): UnifiedTenantManager {
    if (!UnifiedTenantManager.instance) {
      UnifiedTenantManager.instance = new UnifiedTenantManager()
    }
    return UnifiedTenantManager.instance
  }

  /**
   * テナントの存在確認
   */
  public async validateTenant(tenantId: string): Promise<boolean> {
    try {
      const tenant = await this.db.tenant.findUnique({
        where: { id: tenantId }
      })
      return !!tenant && tenant.status === 'active'
    } catch (error: unknown) {
      this.logger.error('テナント検証エラー', { tenantId, error })
      return false
    }
  }

  /**
   * テナント情報の取得
   */
  public async getTenant(tenantId: string): Promise<TenantConfig | null> {
    try {
      // キャッシュから取得を試みる
      const cachedTenant = await this.redis.get(`tenant:${tenantId}`)
      if (cachedTenant) {
        return JSON.parse(cachedTenant)
      }

      // DBから取得
      const tenant = await this.db.tenant.findUnique({
        where: { id: tenantId }
      })

      if (!tenant) {
        return null
      }

      const tenantConfig: TenantConfig = {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain || undefined,
        settings: tenant.settings as Record<string, any>,
        features: tenant.features as string[],
        status: tenant.status as 'active' | 'inactive' | 'suspended'
      }

      // キャッシュに保存（TTL: 1時間）
      // @ts-ignore - Redisクライアントの型定義の問題
      await this.redis.set(
        `tenant:${tenantId}`, 
        JSON.stringify(tenantConfig)
      )

      return tenantConfig
    } catch (error: unknown) {
      this.logger.error('テナント取得エラー', { tenantId, error })
      return null
    }
  }

  /**
   * テナントコンテキストの作成
   */
  public createTenantContext(
    tenantId: string,
    sourceSystem: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common',
    userId?: string
  ): TenantContext {
    const requestId = this.generateRequestId()
    
    return {
      tenantId,
      userId,
      sourceSystem,
      requestId
    }
  }

  /**
   * リクエストヘッダーからテナントコンテキストを抽出
   */
  public extractTenantContextFromHeaders(
    headers: Record<string, string | string[] | undefined>
  ): TenantContext | null {
    const tenantId = this.extractHeaderValue(headers, 'x-tenant-id')
    const userId = this.extractHeaderValue(headers, 'x-user-id')
    const sourceSystem = this.extractHeaderValue(headers, 'x-source-system') as
      | 'hotel-saas'
      | 'hotel-member'
      | 'hotel-pms'
      | 'hotel-common'
      | undefined
    const requestId = this.extractHeaderValue(headers, 'x-request-id')

    if (!tenantId || !sourceSystem) {
      return null
    }

    return {
      tenantId,
      userId,
      sourceSystem,
      requestId
    }
  }

  /**
   * テナントアクセスログの記録
   */
  public async logTenantAccess(
    context: TenantContext,
    resource: string,
    action: string
  ): Promise<void> {
    try {
      await this.db.tenantAccessLog.create({
        data: {
          tenant_id: context.tenantId,
          user_id: context.userId,
          source_system: context.sourceSystem,
          // @ts-ignore - フィールド名の不一致
          request_id: context.requestId,
          resource,
          action,
          timestamp: new Date()
        }
      })
    } catch (error: unknown) {
      this.logger.error('テナントアクセスログ記録エラー', { context, error })
    }
  }

  /**
   * テナント固有の設定値を取得
   */
  public async getTenantSetting(
    tenantId: string,
    key: string,
    defaultValue?: any
  ): Promise<any> {
    const tenant = await this.getTenant(tenantId)
    
    if (!tenant || !tenant.settings) {
      return defaultValue
    }

    return tenant.settings[key] !== undefined 
      ? tenant.settings[key] 
      : defaultValue
  }

  /**
   * テナント固有の機能フラグをチェック
   */
  public async hasTenantFeature(
    tenantId: string,
    feature: string
  ): Promise<boolean> {
    const tenant = await this.getTenant(tenantId)
    
    if (!tenant || !tenant.features) {
      return false
    }

    return tenant.features.includes(feature)
  }

  /**
   * ヘッダー値の抽出ヘルパー
   */
  private extractHeaderValue(
    headers: Record<string, string | string[] | undefined>,
    key: string
  ): string | undefined {
    const value = headers[key] || headers[key.toLowerCase()]
    
    if (Array.isArray(value)) {
      return value[0]
    }
    
    return value
  }

  /**
   * リクエストIDの生成
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  }
}

/**
 * 便利なファクトリー関数
 */
export function getTenantManager(): UnifiedTenantManager {
  return UnifiedTenantManager.getInstance()
}