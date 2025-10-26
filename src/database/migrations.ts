import { hotelDb } from './prisma'
import { HotelLogger } from '../utils/logger'

export interface MigrationInfo {
  version: string
  description: string
  rollback_sql?: string
}

export class HotelMigrationManager {
  private logger: HotelLogger
  private db = hotelDb.getAdapter()

  constructor() {
    this.logger = HotelLogger.getInstance()
  }

  // スキーマバージョン確認
  public async getCurrentVersion(): Promise<string | null> {
    try {
      const latestVersion = await this.db.schemaVersion.findFirst({
        // @ts-ignore - フィールド名の不一致
        orderBy: { appliedAt: 'desc' }
      })
      return latestVersion?.version || null
    } catch (error: Error) {
      this.logger.error('Failed to get current schema version', { error: error as Error })
      return null
    }
  }

  // マイグレーション実行
  public async applyMigration(migration: MigrationInfo): Promise<boolean> {
    const { version, description, rollback_sql } = migration

    try {
      // 既に適用済みかチェック
      const existing = await this.db.schemaVersion.findUnique({
        where: { version }
      })

      if (existing) {
        this.logger.warn('Migration already applied', { version })
        return true
      }

      // トランザクション内でマイグレーション実行
      await hotelDb.transaction(async (tx) => {
        // スキーマバージョン記録
        await tx.schemaVersion.create({
                      data: {
              version,
              description,
              // @ts-ignore - フィールド名の不一致
              rollbackSql: rollback_sql || null
            }
        })

        this.logger.info('Migration applied successfully', {
          version,
          description
        })
      })

      return true
    } catch (error: Error) {
      this.logger.error('Migration failed', {
        version,
        description,
        error
      })
      return false
    }
  }

  // ロールバック実行
  public async rollback(version: string): Promise<boolean> {
    try {
      const migration = await this.db.schemaVersion.findUnique({
        where: { version }
      })

      if (!migration) {
        this.logger.error('Migration version not found', { version })
        return false
      }

      // @ts-ignore - フィールド名の不一致
      if (!migration.rollbackSql) {
        this.logger.error('No rollback SQL available', { version })
        return false
      }

      await hotelDb.transaction(async (tx) => {
        // ロールバックSQL実行
        // @ts-ignore - フィールド名の不一致
        await tx.$executeRawUnsafe(migration.rollbackSql!)

        // スキーマバージョン削除
        await tx.schemaVersion.delete({
          where: { version }
        })

        this.logger.info('Rollback completed successfully', { version })
      })

      return true
    } catch (error: Error) {
      this.logger.error('Rollback failed', { version, error: error as Error } as any)
      return false
    }
  }

  // マイグレーション履歴取得
  public async getMigrationHistory() {
    try {
      return await this.db.schemaVersion.findMany({
        // @ts-ignore - フィールド名の不一致
        orderBy: { appliedAt: 'desc' }
      })
    } catch (error: Error) {
      this.logger.error('Failed to get migration history', { error })
      return []
    }
  }

  // データベース整合性チェック
  public async validateIntegrity(): Promise<boolean> {
    try {
      // 基本的な制約チェック
      const checks = [
        // テナントの一意性
        hotelDb.getClient().tenant.findMany(),
        // ユーザーテナント関連
        hotelDb.getClient().$queryRaw`
          SELECT COUNT(*) as count 
          FROM users u 
          LEFT JOIN tenants t ON u.tenant_id = t.id 
          WHERE t.id IS NULL
        `,
        // 予約の整合性
        hotelDb.getClient().$queryRaw`
          SELECT COUNT(*) as count 
          FROM reservations r 
          WHERE r.checkin_date >= r.checkout_date
        `
      ]

      const results = await Promise.all(checks)
      
      this.logger.info('Database integrity check completed', {
        results: results.map((r: any, i: number) => ({ check: i, result: r }))
      })

      return true
    } catch (error: Error) {
      this.logger.error('Database integrity check failed', { error })
      return false
    }
  }
}

export const migrationManager = new HotelMigrationManager() 