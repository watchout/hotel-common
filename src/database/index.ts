// Hotel Common - 統一PostgreSQL基盤
export { HotelDatabaseClient, hotelDb } from './prisma'
export { HotelMigrationManager, migrationManager } from './migrations'
export type { MigrationInfo } from './migrations'

// Prismaクライアントの型定義をエクスポート
export type {
  Tenant,
  Staff,
  customers,
  Reservation,
  Room,
  SystemEvent,
  SchemaVersion,
  Admin,
  AdminLog,
  AdminLevel,
  PrismaClient
} from '../generated/prisma' 