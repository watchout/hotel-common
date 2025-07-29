import { PrismaClient } from '../generated/prisma';
export declare class UnifiedPrismaClient {
    private prisma;
    private tenantId;
    private systemName;
    private logger;
    private connectionLimit;
    constructor(config: {
        tenantId: string;
        systemName: 'hotel-saas' | 'hotel-member' | 'hotel-pms';
        connectionLimit?: number;
    });
    setTenant(tenantId: string): Promise<void>;
    withTenant<T>(tenantId: string, operation: () => Promise<T>): Promise<T>;
    create<T>(model: string, data: any): Promise<T>;
    findMany<T>(model: string, where?: any): Promise<T[]>;
    findUnique<T>(model: string, where: any): Promise<T | null>;
    update<T>(model: string, where: any, data: any): Promise<T>;
    delete<T>(model: string, where: any): Promise<T>;
    logOperation(operation: string, model: string, data: any): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getRawClient(): PrismaClient;
    transaction<T>(fn: (client: UnifiedPrismaClient) => Promise<T>): Promise<T>;
    healthCheck(): Promise<boolean>;
    private generateId;
}
export default UnifiedPrismaClient;
