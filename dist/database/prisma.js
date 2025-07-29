import { PrismaClient } from '../generated/prisma';
import { HotelLogger } from '../utils/logger';
export class HotelDatabaseClient {
    static instance;
    prisma;
    logger;
    constructor() {
        this.logger = HotelLogger.getInstance();
        this.prisma = new PrismaClient({
            log: [
                { emit: 'stdout', level: 'query' },
                { emit: 'stdout', level: 'error' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
            ],
        });
    }
    static getInstance() {
        if (!HotelDatabaseClient.instance) {
            HotelDatabaseClient.instance = new HotelDatabaseClient();
        }
        return HotelDatabaseClient.instance;
    }
    getClient() {
        return this.prisma;
    }
    // Prismaモデルプロパティの委譲
    get schemaVersion() { return this.prisma.schemaVersion; }
    get systemEvent() { return this.prisma.systemEvent; }
    get admin() { return this.prisma.admin; }
    get adminLog() { return this.prisma.adminLog; }
    get tenant() { return this.prisma.tenant; }
    get staff() { return this.prisma.staff; }
    get customers() { return this.prisma.customers; }
    get reservation() { return this.prisma.reservation; }
    get room() { return this.prisma.room; }
    get roomGrade() { return this.prisma.roomGrade; }
    get roomGradeMedia() { return this.prisma.roomGradeMedia; }
    get memberGradeAccess() { return this.prisma.memberGradeAccess; }
    get attendance() { return this.prisma.attendance; }
    get workSchedule() { return this.prisma.workSchedule; }
    get handoverNote() { return this.prisma.handoverNote; }
    get staffNotification() { return this.prisma.staffNotification; }
    get auditLog() { return this.prisma.auditLog; }
    // トランザクション実行
    async transaction(fn) {
        return await this.prisma.$transaction(async (tx) => {
            return await fn(tx);
        });
    }
    async connect() {
        try {
            await this.prisma.$connect();
            this.logger.info('Hotel Database connected successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to Hotel Database', { error: error });
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.logger.info('Hotel Database disconnected successfully');
        }
        catch (error) {
            this.logger.error('Failed to disconnect from Hotel Database', { error: error });
            throw error;
        }
    }
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed', { error: error });
            return false;
        }
    }
    async getDatabaseStats() {
        try {
            const tables = await this.prisma.$queryRaw `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
            return {
                name: 'hotel_unified_db',
                tables: Number(tables[0]?.count || 0),
                connected: true
            };
        }
        catch (error) {
            this.logger.error('Failed to get database stats', { error: error });
            return {
                name: 'hotel_unified_db',
                tables: 0,
                connected: false
            };
        }
    }
}
// シングルトンのエクスポート
export const hotelDb = HotelDatabaseClient.getInstance();
