"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedPrismaClient = void 0;
const prisma_1 = require("./prisma");
const logger_1 = require("../utils/logger");
// マルチテナント対応統一Prismaクライアント
class UnifiedPrismaClient {
    prisma;
    tenantId;
    systemName;
    logger;
    connectionLimit;
    constructor(config) {
        this.tenantId = config.tenantId;
        this.systemName = config.systemName;
        this.connectionLimit = config.connectionLimit || 20;
        this.logger = logger_1.HotelLogger.getInstance();
        // PrismaClientの直接インスタンス化ではなく、hotelDb.getClient()を使用
        this.prisma = prisma_1.hotelDb.getClient();
    }
    // マルチテナント対応
    async setTenant(tenantId) {
        this.tenantId = tenantId;
        this.logger.info(`[${this.systemName}] Tenant switched to: ${tenantId}`);
    }
    async withTenant(tenantId, operation) {
        const originalTenantId = this.tenantId;
        try {
            await this.setTenant(tenantId);
            const result = await operation();
            return result;
        }
        finally {
            this.tenantId = originalTenantId;
        }
    }
    // 統一CRUD操作
    async create(model, data) {
        // テナントIDの自動追加
        const enhancedData = {
            ...data,
            tenant_id: data.tenant_id || this.tenantId
        };
        this.logger.info(`[${this.systemName}] Creating ${model}`, {
            tenantId: this.tenantId
        });
        try {
            // 監査ログ記録
            await this.logOperation('CREATE', model, enhancedData);
            // 動的モデルアクセス
            const result = await this.prisma[model].create({
                data: enhancedData
            });
            return result;
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] Create operation failed`, {
                error: error
            });
            throw error;
        }
    }
    async findMany(model, where) {
        // テナント分離の自動適用
        const enhancedWhere = {
            ...where,
            tenant_id: this.tenantId
        };
        this.logger.info(`[${this.systemName}] Finding many ${model}`, {
            tenantId: this.tenantId
        });
        try {
            const result = await this.prisma[model].findMany({
                where: enhancedWhere
            });
            return result;
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] FindMany operation failed`, {
                error: error
            });
            throw error;
        }
    }
    async findUnique(model, where) {
        // テナント分離の自動適用
        const enhancedWhere = {
            ...where,
            tenant_id: this.tenantId
        };
        try {
            const result = await this.prisma[model].findUnique({
                where: enhancedWhere
            });
            return result;
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] FindUnique operation failed`, {
                error: error
            });
            throw error;
        }
    }
    async update(model, where, data) {
        // テナント分離の自動適用
        const enhancedWhere = {
            ...where,
            tenant_id: this.tenantId
        };
        const enhancedData = {
            ...data,
            updated_at: new Date(),
            updated_by_system: this.systemName
        };
        this.logger.info(`[${this.systemName}] Updating ${model}`, {
            tenantId: this.tenantId
        });
        try {
            // 監査ログ記録
            await this.logOperation('UPDATE', model, { where: enhancedWhere, data: enhancedData });
            const result = await this.prisma[model].update({
                where: enhancedWhere,
                data: enhancedData
            });
            return result;
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] Update operation failed`, {
                error: error
            });
            throw error;
        }
    }
    async delete(model, where) {
        // テナント分離の自動適用
        const enhancedWhere = {
            ...where,
            tenant_id: this.tenantId
        };
        this.logger.info(`[${this.systemName}] Deleting ${model}`, {
            tenantId: this.tenantId
        });
        try {
            // 監査ログ記録
            await this.logOperation('DELETE', model, enhancedWhere);
            const result = await this.prisma[model].delete({
                where: enhancedWhere
            });
            return result;
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] Delete operation failed`, {
                error: error
            });
            throw error;
        }
    }
    // 監査ログ記録
    async logOperation(operation, model, data) {
        try {
            // TODO: audit_logsテーブルのスキーマ確認後に実装
            this.logger.info(`[${this.systemName}] Operation: ${operation} on ${model} for tenant: ${this.tenantId}`);
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] Audit log creation failed`, {
                error: error
            });
            // 監査ログ失敗は操作を止めない
        }
    }
    // 接続管理
    async connect() {
        try {
            await this.prisma.$connect();
            this.logger.info(`[${this.systemName}] Database connected successfully`, {
                tenantId: this.tenantId
            });
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] Failed to connect to database`, {
                error: error
            });
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            this.logger.info(`[${this.systemName}] Database disconnected successfully`, {
                tenantId: this.tenantId
            });
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] Failed to disconnect from database`, {
                error: error
            });
            throw error;
        }
    }
    // 生のPrismaクライアントアクセス（高度な操作用）
    getRawClient() {
        return this.prisma;
    }
    // トランザクション実行
    async transaction(fn) {
        return await this.prisma.$transaction(async (tx) => {
            // トランザクション用の統一クライアントを作成
            const txClient = new UnifiedPrismaClient({
                tenantId: this.tenantId,
                systemName: this.systemName,
                connectionLimit: this.connectionLimit
            });
            // トランザクション用のPrismaクライアントに置き換え
            txClient.prisma = tx;
            return await fn(txClient);
        });
    }
    // ヘルスチェック
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error(`[${this.systemName}] Health check failed`, {
                error: error
            });
            return false;
        }
    }
    // ID生成ユーティリティ
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.UnifiedPrismaClient = UnifiedPrismaClient;
// エクスポート
exports.default = UnifiedPrismaClient;
