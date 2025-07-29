import { PrismaClient } from '../generated/prisma'

export interface UnifiedClientConfig {
  tenantId: string
  systemName: 'hotel-saas' | 'hotel-member' | 'hotel-pms'
  connectionLimit?: number
}

export class UnifiedPrismaClient {
  private prisma: PrismaClient
  private tenantId: string
  private systemName: string
  private static instances: Map<string, UnifiedPrismaClient> = new Map()

  constructor(config: UnifiedClientConfig) {
    this.tenantId = config.tenantId
    this.systemName = config.systemName
    
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })

    // インスタンス管理
    const key = `${config.systemName}_${config.tenantId}`
    UnifiedPrismaClient.instances.set(key, this)
  }

  public static getInstance(config: UnifiedClientConfig): UnifiedPrismaClient {
    const key = `${config.systemName}_${config.tenantId}`
    let instance = UnifiedPrismaClient.instances.get(key)
    
    if (!instance) {
      instance = new UnifiedPrismaClient(config)
    }
    
    return instance
  }

  /**
   * マルチテナント対応 - テナント設定
   */
  async setTenant(tenantId: string): Promise<void> {
    this.tenantId = tenantId
    console.log(`[${this.systemName}] Tenant switched to: ${tenantId}`)
  }

  /**
   * マルチテナント対応 - テナント分離付き操作実行
   */
  async withTenant<T>(tenantId: string, operation: () => Promise<T>): Promise<T> {
    const previousTenantId = this.tenantId
    try {
      await this.setTenant(tenantId)
      return await operation()
    } finally {
      await this.setTenant(previousTenantId)
    }
  }

  /**
   * 統一CREATE操作
   */
  async create<T>(model: string, data: any): Promise<T> {
    // テナントIDを自動追加
    const enhancedData = {
      ...data,
      tenant_id: this.tenantId,
      created_at: new Date(),
      updated_at: new Date()
    }

    const result = await (this.prisma as any)[model].create({
      data: enhancedData
    })

    console.log(`[${this.systemName}] Created ${model} for tenant ${this.tenantId}`)
    return result
  }

  /**
   * 統一FIND_MANY操作
   */
  async findMany<T>(model: string, where: any = {}): Promise<T[]> {
    // テナントIDフィルターを自動追加
    const enhancedWhere = {
      ...where,
      tenant_id: this.tenantId
    }

    const results = await (this.prisma as any)[model].findMany({
      where: enhancedWhere
    })

    console.log(`[${this.systemName}] Found ${results.length} ${model} records for tenant ${this.tenantId}`)
    return results
  }

  /**
   * 統一UPDATE操作
   */
  async update<T>(model: string, where: any, data: any): Promise<T> {
    // テナントIDフィルターを自動追加
    const enhancedWhere = {
      ...where,
      tenant_id: this.tenantId
    }

    const enhancedData = {
      ...data,
      updated_at: new Date()
    }

    const result = await (this.prisma as any)[model].update({
      where: enhancedWhere,
      data: enhancedData
    })

    console.log(`[${this.systemName}] Updated ${model} for tenant ${this.tenantId}`)
    return result
  }

  /**
   * 統一DELETE操作
   */
  async delete<T>(model: string, where: any): Promise<T> {
    // テナントIDフィルターを自動追加
    const enhancedWhere = {
      ...where,
      tenant_id: this.tenantId
    }

    const result = await (this.prisma as any)[model].delete({
      where: enhancedWhere
    })

    console.log(`[${this.systemName}] Deleted ${model} for tenant ${this.tenantId}`)
    return result
  }

  /**
   * 接続管理
   */
  async connect(): Promise<void> {
    await this.prisma.$connect()
    console.log(`[${this.systemName}] Unified Prisma Client connected for tenant ${this.tenantId}`)
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
    console.log(`[${this.systemName}] Unified Prisma Client disconnected`)
  }

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error(`[${this.systemName}] Health check failed:`, error)
      return false
    }
  }

  /**
   * 生Prismaクライアントアクセス（高度な操作用）
   */
  getRawClient(): PrismaClient {
    return this.prisma
  }
}

// 便利な関数エクスポート
export function createUnifiedClient(config: UnifiedClientConfig): UnifiedPrismaClient {
  return UnifiedPrismaClient.getInstance(config)
}

export default UnifiedPrismaClient 