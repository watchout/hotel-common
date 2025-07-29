import { PrismaClient } from '../generated/prisma';
export class UnifiedPrismaClient {
    prisma;
    tenantId;
    systemName;
    static instances = new Map();
    constructor(config) {
        this.tenantId = config.tenantId;
        this.systemName = config.systemName;
        this.prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
        // インスタンス管理
        const key = `${config.systemName}_${config.tenantId}`;
        UnifiedPrismaClient.instances.set(key, this);
    }
    static getInstance(config) {
        const key = `${config.systemName}_${config.tenantId}`;
        let instance = UnifiedPrismaClient.instances.get(key);
        if (!instance) {
            instance = new UnifiedPrismaClient(config);
        }
        return instance;
    }
    /**
     * マルチテナント対応 - テナント設定
     */
    async setTenant(tenantId) {
        this.tenantId = tenantId;
        console.log(`[${this.systemName}] Tenant switched to: ${tenantId}`);
    }
    /**
     * マルチテナント対応 - テナント分離付き操作実行
     */
    async withTenant(tenantId, operation) {
        const previousTenantId = this.tenantId;
        try {
            await this.setTenant(tenantId);
            return await operation();
        }
        finally {
            await this.setTenant(previousTenantId);
        }
    }
    /**
     * 統一CREATE操作
     */
    async create(model, data) {
        // テナントIDを自動追加
        const enhancedData = {
            ...data,
            tenant_id: this.tenantId,
            created_at: new Date(),
            updated_at: new Date()
        };
        const result = await this.prisma[model].create({
            data: enhancedData
        });
        console.log(`[${this.systemName}] Created ${model} for tenant ${this.tenantId}`);
        return result;
    }
    /**
     * 統一FIND_MANY操作
     */
    async findMany(model, where = {}) {
        // テナントIDフィルターを自動追加
        const enhancedWhere = {
            ...where,
            tenant_id: this.tenantId
        };
        const results = await this.prisma[model].findMany({
            where: enhancedWhere
        });
        console.log(`[${this.systemName}] Found ${results.length} ${model} records for tenant ${this.tenantId}`);
        return results;
    }
    /**
     * 統一UPDATE操作
     */
    async update(model, where, data) {
        // テナントIDフィルターを自動追加
        const enhancedWhere = {
            ...where,
            tenant_id: this.tenantId
        };
        const enhancedData = {
            ...data,
            updated_at: new Date()
        };
        const result = await this.prisma[model].update({
            where: enhancedWhere,
            data: enhancedData
        });
        console.log(`[${this.systemName}] Updated ${model} for tenant ${this.tenantId}`);
        return result;
    }
    /**
     * 統一DELETE操作
     */
    async delete(model, where) {
        // テナントIDフィルターを自動追加
        const enhancedWhere = {
            ...where,
            tenant_id: this.tenantId
        };
        const result = await this.prisma[model].delete({
            where: enhancedWhere
        });
        console.log(`[${this.systemName}] Deleted ${model} for tenant ${this.tenantId}`);
        return result;
    }
    /**
     * 接続管理
     */
    async connect() {
        await this.prisma.$connect();
        console.log(`[${this.systemName}] Unified Prisma Client connected for tenant ${this.tenantId}`);
    }
    async disconnect() {
        await this.prisma.$disconnect();
        console.log(`[${this.systemName}] Unified Prisma Client disconnected`);
    }
    /**
     * ヘルスチェック
     */
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error(`[${this.systemName}] Health check failed:`, error);
            return false;
        }
    }
    /**
     * 生Prismaクライアントアクセス（高度な操作用）
     */
    getRawClient() {
        return this.prisma;
    }
}
// 便利な関数エクスポート
export function createUnifiedClient(config) {
    return UnifiedPrismaClient.getInstance(config);
}
export default UnifiedPrismaClient;
