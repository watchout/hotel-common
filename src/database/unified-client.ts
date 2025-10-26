
import { hotelDb } from './prisma';
import { HotelLogger } from '../utils/logger';

import type { PrismaClient } from '@prisma/client';

// マルチテナント対応統一Prismaクライアント
export class UnifiedPrismaClient {
  private prisma: PrismaClient;
  private tenantId: string;
  private systemName: string;
  private logger: HotelLogger;
  private connectionLimit: number;

  constructor(config: {
    tenantId: string;
    systemName: 'hotel-saas' | 'hotel-member' | 'hotel-pms';
    connectionLimit?: number;
  }) {
    this.tenantId = config.tenantId;
    this.systemName = config.systemName;
    this.connectionLimit = config.connectionLimit || 20;
    this.logger = HotelLogger.getInstance();

    // PrismaClientの直接インスタンス化ではなく、hotelDb.getClient()を使用
    this.prisma = hotelDb.getClient();
  }

  // マルチテナント対応
  async setTenant(tenantId: string): Promise<void> {
    this.tenantId = tenantId;
    this.logger.info(`[${this.systemName}] Tenant switched to: ${tenantId}`);
  }

  async withTenant<T>(tenantId: string, operation: () => Promise<T>): Promise<T> {
    const originalTenantId = this.tenantId;
    try {
      await this.setTenant(tenantId);
      const result = await operation();
      return result;
    } finally {
      this.tenantId = originalTenantId;
    }
  }

  // 統一CRUD操作
  async create<T>(model: string, data: any): Promise<T> {
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
      const result = await (this.prisma as any)[model].create({
        data: enhancedData
      });

      return result;
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] Create operation failed`, {
        error: error as Error
      });
      throw error;
    }
  }

  async findMany<T>(model: string, where?: any): Promise<T[]> {
    // テナント分離の自動適用
    const enhancedWhere = {
      ...where,
      tenant_id: this.tenantId
    };

    this.logger.info(`[${this.systemName}] Finding many ${model}`, {
      tenantId: this.tenantId
    });

    try {
      const result = await (this.prisma as any)[model].findMany({
        where: enhancedWhere
      });

      return result;
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] FindMany operation failed`, {
        error: error as Error
      });
      throw error;
    }
  }

  async findUnique<T>(model: string, where: any): Promise<T | null> {
    // テナント分離の自動適用
    const enhancedWhere = {
      ...where,
      tenant_id: this.tenantId
    };

    try {
      const result = await (this.prisma as any)[model].findUnique({
        where: enhancedWhere
      });

      return result;
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] FindUnique operation failed`, {
        error: error as Error
      });
      throw error;
    }
  }

  async update<T>(model: string, where: any, data: any): Promise<T> {
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
      
      const result = await (this.prisma as any)[model].update({
        where: enhancedWhere,
        data: enhancedData
      });

      return result;
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] Update operation failed`, {
        error: error as Error
      });
      throw error;
    }
  }

  async delete<T>(model: string, where: any): Promise<T> {
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
      
      const result = await (this.prisma as any)[model].delete({
        where: enhancedWhere
      });

      return result;
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] Delete operation failed`, {
        error: error as Error
      });
      throw error;
    }
  }

  // 監査ログ記録
  async logOperation(operation: string, model: string, data: any): Promise<void> {
    try {
      // TODO: audit_logsテーブルのスキーマ確認後に実装
      this.logger.info(`[${this.systemName}] Operation: ${operation} on ${model} for tenant: ${this.tenantId}`);
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] Audit log creation failed`, {
        error: error as Error
      });
      // 監査ログ失敗は操作を止めない
    }
  }

  // 接続管理
  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.logger.info(`[${this.systemName}] Database connected successfully`, {
        tenantId: this.tenantId
      });
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] Failed to connect to database`, {
        error: error as Error
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.logger.info(`[${this.systemName}] Database disconnected successfully`, {
        tenantId: this.tenantId
      });
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] Failed to disconnect from database`, {
        error: error as Error
      });
      throw error;
    }
  }

  // 生のPrismaクライアントアクセス（高度な操作用）
  getRawClient(): PrismaClient {
    return this.prisma;
  }

  // トランザクション実行
  async transaction<T>(fn: (client: UnifiedPrismaClient) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      // トランザクション用の統一クライアントを作成
      const txClient = new UnifiedPrismaClient({
        tenantId: this.tenantId,
        systemName: this.systemName as 'hotel-saas' | 'hotel-member' | 'hotel-pms',
        connectionLimit: this.connectionLimit
      });
      // トランザクション用のPrismaクライアントに置き換え
      (txClient as any).prisma = tx;
      
      return await fn(txClient);
    });
  }

  // ヘルスチェック
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error: unknown) {
      this.logger.error(`[${this.systemName}] Health check failed`, {
        error: error as Error
      });
      return false;
    }
  }

  // ID生成ユーティリティ
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// エクスポート
export default UnifiedPrismaClient;