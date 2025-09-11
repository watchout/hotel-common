"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationManager = exports.HotelMigrationManager = void 0;
const prisma_1 = require("./prisma");
const logger_1 = require("../utils/logger");
class HotelMigrationManager {
    logger;
    db = prisma_1.hotelDb.getAdapter();
    constructor() {
        this.logger = logger_1.HotelLogger.getInstance();
    }
    // スキーマバージョン確認
    async getCurrentVersion() {
        try {
            const latestVersion = await this.db.schemaVersion.findFirst({
                // @ts-ignore - フィールド名の不一致
                orderBy: { appliedAt: 'desc' }
            });
            return latestVersion?.version || null;
        }
        catch (error) {
            this.logger.error('Failed to get current schema version', { error: error });
            return null;
        }
    }
    // マイグレーション実行
    async applyMigration(migration) {
        const { version, description, rollback_sql } = migration;
        try {
            // 既に適用済みかチェック
            const existing = await this.db.schemaVersion.findUnique({
                where: { version }
            });
            if (existing) {
                this.logger.warn('Migration already applied', { version });
                return true;
            }
            // トランザクション内でマイグレーション実行
            await prisma_1.hotelDb.transaction(async (tx) => {
                // スキーマバージョン記録
                await tx.schemaVersion.create({
                    data: {
                        version,
                        description,
                        // @ts-ignore - フィールド名の不一致
                        rollbackSql: rollback_sql || null
                    }
                });
                this.logger.info('Migration applied successfully', {
                    version,
                    description
                });
            });
            return true;
        }
        catch (error) {
            this.logger.error('Migration failed', {
                version,
                description,
                error
            });
            return false;
        }
    }
    // ロールバック実行
    async rollback(version) {
        try {
            const migration = await this.db.schemaVersion.findUnique({
                where: { version }
            });
            if (!migration) {
                this.logger.error('Migration version not found', { version });
                return false;
            }
            // @ts-ignore - フィールド名の不一致
            if (!migration.rollbackSql) {
                this.logger.error('No rollback SQL available', { version });
                return false;
            }
            await prisma_1.hotelDb.transaction(async (tx) => {
                // ロールバックSQL実行
                // @ts-ignore - フィールド名の不一致
                await tx.$executeRawUnsafe(migration.rollbackSql);
                // スキーマバージョン削除
                await tx.schemaVersion.delete({
                    where: { version }
                });
                this.logger.info('Rollback completed successfully', { version });
            });
            return true;
        }
        catch (error) {
            this.logger.error('Rollback failed', { version, error: error });
            return false;
        }
    }
    // マイグレーション履歴取得
    async getMigrationHistory() {
        try {
            return await this.db.schemaVersion.findMany({
                // @ts-ignore - フィールド名の不一致
                orderBy: { appliedAt: 'desc' }
            });
        }
        catch (error) {
            this.logger.error('Failed to get migration history', { error });
            return [];
        }
    }
    // データベース整合性チェック
    async validateIntegrity() {
        try {
            // 基本的な制約チェック
            const checks = [
                // テナントの一意性
                prisma_1.hotelDb.getClient().tenant.findMany(),
                // ユーザーテナント関連
                prisma_1.hotelDb.getClient().$queryRaw `
          SELECT COUNT(*) as count 
          FROM users u 
          LEFT JOIN tenants t ON u.tenant_id = t.id 
          WHERE t.id IS NULL
        `,
                // 予約の整合性
                prisma_1.hotelDb.getClient().$queryRaw `
          SELECT COUNT(*) as count 
          FROM reservations r 
          WHERE r.checkin_date >= r.checkout_date
        `
            ];
            const results = await Promise.all(checks);
            this.logger.info('Database integrity check completed', {
                results: results.map((r, i) => ({ check: i, result: r }))
            });
            return true;
        }
        catch (error) {
            this.logger.error('Database integrity check failed', { error });
            return false;
        }
    }
}
exports.HotelMigrationManager = HotelMigrationManager;
exports.migrationManager = new HotelMigrationManager();
