import { PrismaClient } from '../generated/prisma';
export interface UnifiedClientConfig {
    tenantId: string;
    systemName: 'hotel-saas' | 'hotel-member' | 'hotel-pms';
    connectionLimit?: number;
}
export declare class UnifiedPrismaClient {
    private prisma;
    private tenantId;
    private systemName;
    private static instances;
    constructor(config: UnifiedClientConfig);
    static getInstance(config: UnifiedClientConfig): UnifiedPrismaClient;
    /**
     * マルチテナント対応 - テナント設定
     */
    setTenant(tenantId: string): Promise<void>;
    /**
     * マルチテナント対応 - テナント分離付き操作実行
     */
    withTenant<T>(tenantId: string, operation: () => Promise<T>): Promise<T>;
    /**
     * 統一CREATE操作
     */
    create<T>(model: string, data: any): Promise<T>;
    /**
     * 統一FIND_MANY操作
     */
    findMany<T>(model: string, where?: any): Promise<T[]>;
    /**
     * 統一UPDATE操作
     */
    update<T>(model: string, where: any, data: any): Promise<T>;
    /**
     * 統一DELETE操作
     */
    delete<T>(model: string, where: any): Promise<T>;
    /**
     * 接続管理
     */
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * ヘルスチェック
     */
    healthCheck(): Promise<boolean>;
    /**
     * 生Prismaクライアントアクセス（高度な操作用）
     */
    getRawClient(): PrismaClient;
}
export declare function createUnifiedClient(config: UnifiedClientConfig): UnifiedPrismaClient;
export default UnifiedPrismaClient;
