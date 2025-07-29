import { PrismaClient } from '../generated/prisma'
import { HotelLogger } from '../utils/logger'

export class HotelDatabaseClient {
  private static instance: HotelDatabaseClient
  private prisma: PrismaClient
  private logger: HotelLogger

  private constructor() {
    this.logger = HotelLogger.getInstance()
    this.prisma = new PrismaClient({
      log: [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    })
  }

  public static getInstance(): HotelDatabaseClient {
    if (!HotelDatabaseClient.instance) {
      HotelDatabaseClient.instance = new HotelDatabaseClient()
    }
    return HotelDatabaseClient.instance
  }

  public getClient(): PrismaClient {
    return this.prisma
  }

  // Prismaモデルプロパティの委譲
  public get schemaVersion() { return this.prisma.schemaVersion }
  public get systemEvent() { return this.prisma.systemEvent }
  public get admin() { return this.prisma.admin }
  public get adminLog() { return this.prisma.adminLog }
  public get tenant() { return this.prisma.tenant }
  public get staff() { return this.prisma.staff }
  public get customers() { return this.prisma.customers }
  public get reservation() { return this.prisma.reservation }
  public get room() { return this.prisma.room }
  public get roomGrade() { return this.prisma.roomGrade }
  public get roomGradeMedia() { return this.prisma.roomGradeMedia }
  public get memberGradeAccess() { return this.prisma.memberGradeAccess }
  public get attendance() { return this.prisma.attendance }
  public get workSchedule() { return this.prisma.workSchedule }
  public get handoverNote() { return this.prisma.handoverNote }
  public get staffNotification() { return this.prisma.staffNotification }
  public get auditLog() { return this.prisma.auditLog }

  // トランザクション実行
  public async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return await fn(tx as PrismaClient)
    })
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect()
      this.logger.info('Hotel Database connected successfully')
    } catch (error) {
      this.logger.error('Failed to connect to Hotel Database', { error: error as Error })
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      this.logger.info('Hotel Database disconnected successfully')
    } catch (error) {
      this.logger.error('Failed to disconnect from Hotel Database', { error: error as Error })
      throw error
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      this.logger.error('Database health check failed', { error: error as Error })
      return false
    }
  }

  public async getDatabaseStats(): Promise<{
    name: string
    size?: string
    tables: number
    connected: boolean
  }> {
    try {
      const tables = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      
      return {
        name: 'hotel_unified_db',
        tables: Number(tables[0]?.count || 0),
        connected: true
      }
    } catch (error) {
      this.logger.error('Failed to get database stats', { error: error as Error })
      return {
        name: 'hotel_unified_db',
        tables: 0,
        connected: false
      }
    }
  }
}

// シングルトンのエクスポート
export const hotelDb = HotelDatabaseClient.getInstance() 