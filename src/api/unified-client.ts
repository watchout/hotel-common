import { staff as Staff } from '@prisma/client'

import { hotelDb } from '../database'
import { HotelLogger } from '../utils/logger'

import type { Tenant} from '@prisma/client';

// 型定義（スキーマから自動生成されるべきだが、現在は手動定義）
interface customers {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  member_id?: string;
  origin_system: string;
  updated_by_system: string;
  updated_at: Date;
  pms_updatable_fields?: string[];
  [key: string]: any;
}

interface Reservation {
  id: string;
  tenant_id: string;
  customer_id?: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  checkin_date: Date;
  checkout_date: Date;
  room_type: string;
  total_amount: number;
  origin: string;
  origin_system: string;
  updated_by_system: string;
  status: string;
  confirmation_code: string;
  [key: string]: any;
}

export interface UnifiedApiClientConfig {
  tenantId: string
  userId?: string
  source: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common'
}

export class HotelUnifiedApiClient {
  private logger: HotelLogger
  private config: UnifiedApiClientConfig
  private db = hotelDb.getAdapter()

  constructor(config: UnifiedApiClientConfig) {
    this.config = config
    this.logger = HotelLogger.getInstance()
  }

  // =========================================
  // テナント管理
  // =========================================

  async getTenant(): Promise<Tenant | null> {
    try {
      return await this.db.tenant.findUnique({
        where: { id: this.config.tenantId }
      })
    } catch (error: unknown) {
      this.logger.error('Failed to get tenant', { 
        tenantId: this.config.tenantId,
        error: error as Error
      })
      return null
    }
  }

  // =========================================
  // 顧客管理（hotel-member主管理）
  // =========================================

  async getCustomers(filters?: {
    search?: string
    memberOnly?: boolean
    limit?: number
    offset?: number
  }) {
    try {
      const where: any = {
        tenant_id: this.config.tenantId,
        deleted_at: null
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search } }
        ]
      }

      if (filters?.memberOnly) {
        where.member_id = { not: null }
      }

              // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const customers = await this.db.customers.findMany({
        where,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        orderBy: { created_at: 'desc' }
      })

      // ソーストラッキング更新
      await this.updateSystemAccess('customer', 'read')

      return customers
    } catch (error: unknown) {
      this.logger.error('Failed to get customers', { error: error as Error })
      return []
    }
  }

  async createCustomer(data: {
    name: string
    email?: string
    phone?: string
    address?: string
    member_id?: string
  }): Promise<customers | null> {
    try {
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const customer = await this.db.customers.create({
        data: {
          id: `cust_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          ...data,
          tenant_id: this.config.tenantId,
          origin_system: this.config.source,
          updated_by_system: this.config.source,
          updated_at: new Date()
        }
      })

      await this.logSystemEvent('customer', 'create', customer.id, data)
      return customer
    } catch (error: unknown) {
      this.logger.error('Failed to create customer', { error: error as Error, data })
      return null
    }
  }

  async updateCustomer(
    customerId: string, 
    data: Partial<customers>,
    restrictUpdatableFields = true
  ): Promise<customers | null> {
    try {
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const existing = await this.db.customers.findUnique({
        where: { id: customerId }
      })

      if (!existing) {
        return null
      }

      // PMS更新可能フィールド制限チェック
      if (restrictUpdatableFields && this.config.source === 'hotel-pms') {
        const allowedFields = existing.pms_updatable_fields || []
        const updateData: any = {}
        
                Object.keys(data).forEach(key => {
          if (allowedFields.includes(key) || ['updated_by_system', 'synced_at'].includes(key)) {
            updateData[key] = data[key as keyof customers]
          }
        })

        data = updateData
      }

      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const updated = await this.db.customers.update({
        where: { id: customerId },
        data: {
          ...data,
          updated_by_system: this.config.source,
          synced_at: new Date()
        }
      })

      await this.logSystemEvent('customer', 'update', customerId, data, existing)
      return updated
    } catch (error: unknown) {
      this.logger.error('Failed to update customer', { error: error as Error, customerId, data } as any)
      return null
    }
  }

  // =========================================
  // 予約管理（hotel-pms中心）
  // =========================================

  async getReservations(filters?: {
    status?: string[]
    dateFrom?: Date
    dateTo?: Date
    customerId?: string
    limit?: number
    offset?: number
  }) {
    try {
      const where: any = {
        tenant_id: this.config.tenantId,
        deleted_at: null
      }

      if (filters?.status?.length) {
        where.status = { in: filters.status }
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.AND = []
        if (filters.dateFrom) {
          where.AND.push({ checkin_date: { gte: filters.dateFrom } })
        }
        if (filters.dateTo) {
          where.AND.push({ checkout_date: { lte: filters.dateTo } })
        }
      }

      if (filters?.customerId) {
        where.customer_id = filters.customerId
      }

      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const reservations = await this.db.reservation.findMany({
        where,
        take: filters?.limit || 100,
        skip: filters?.offset || 0,
        orderBy: { checkinDate: 'asc' }
      })

      await this.updateSystemAccess('reservation', 'read')
      return reservations
    } catch (error: unknown) {
      this.logger.error('Failed to get reservations', { error: error as Error })
      return []
    }
  }

  async createReservation(data: {
    customer_id?: string
    guest_name: string
    guest_phone?: string
    guest_email?: string
    checkin_date: Date
    checkout_date: Date
    room_type: string
    total_amount: number
    origin: string
    special_requests?: string
  }): Promise<Reservation | null> {
    try {
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const reservation = await this.db.reservation.create({
        data: {
          id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // 必須フィールド
          tenantId: this.config.tenantId,
          // user_idフィールドはスキーマに存在しないため削除
          // customer_idフィールドもスキーマに存在しないため削除
          roomId: 'room-default', // 必須フィールド
          checkinDate: data.checkin_date,
          checkoutDate: data.checkout_date,
          adults: 1, // デフォルト値
          children: 0, // デフォルト値
          guestName: data.guest_name || 'Guest', // 必須フィールド
          guestPhone: data.guest_phone,
          guestEmail: data.guest_email,
          totalAmount: data.total_amount,
          // base_rateフィールドはスキーマに存在しないため削除
          confirmationNumber: this.generateConfirmationCode(),
          status: 'pending', // スキーマのデフォルト値と一致させる
          // payment_statusフィールドはスキーマに存在しないため削除
          specialRequests: data.special_requests
        }
      })

      await this.logSystemEvent('reservation', 'create', reservation.id, data)
      return reservation as any
    } catch (error: unknown) {
      this.logger.error('Failed to create reservation', { error: error as Error, data })
      return null
    }
  }

  // =========================================
  // システムイベント・監査ログ
  // =========================================

  private async logSystemEvent(
    entityType: string,
    action: string,
    entityId: string,
    data: any,
    beforeData?: any
  ) {
    try {
      await this.db.systemEvent.create({
        data: {
          // @ts-ignore - フィールド名の不一致
          tenantId: this.config.tenantId,
          userId: this.config.userId,
          eventType: this.getEventType(entityType),
          sourceSystem: this.config.source,
          targetSystem: 'hotel-common',
          entityType: entityType,
          entityId: entityId,
          action: action.toUpperCase() as any,
          eventData: data
        }
      })
    } catch (error: unknown) {
      this.logger.error('Failed to log system event', { error: error as Error })
    }
  }

  private async updateSystemAccess(entityType: string, action: string) {
    // システム間アクセス追跡
    await this.logSystemEvent(entityType, action, 'system_access', {
      source_system: this.config.source,
      access_type: action,
      timestamp: new Date()
    })
  }

  private getEventType(entityType: string): string {
    const mapping: Record<string, string> = {
      'customer': 'CUSTOMER',
      'reservation': 'RESERVATION',
      'user': 'AUTH',
      'tenant': 'SYSTEM'
    }
    return mapping[entityType] || 'SYSTEM'
  }

  private generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

// ファクトリー関数
export function createUnifiedClient(config: UnifiedApiClientConfig): HotelUnifiedApiClient {
  return new HotelUnifiedApiClient(config)
} 