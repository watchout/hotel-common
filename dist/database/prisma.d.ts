import { PrismaClient } from '@prisma/client';
import type { PrismaAdapter } from './prisma-adapter';
/**
 * ホテル共通データベースクライアント
 * シングルトンパターンを使用して、アプリケーション全体で一貫したPrismaClientインスタンスを提供します
 */
export declare class HotelDatabaseClient {
    private static instance;
    private prisma;
    private adapter;
    private constructor();
    /**
     * シングルトンインスタンスを取得
     */
    static getInstance(): HotelDatabaseClient;
    /**
     * Prismaクライアントインスタンスを取得
     * 注意: 直接Prismaクライアントを使用する場合は、テーブル名がスネークケース・複数形であることに注意
     */
    getClient(): PrismaClient;
    /**
     * アダプターを使用したPrismaクライアントを取得
     * 従来のキャメルケース・単数形のモデル名でアクセス可能
     */
    getAdapter(): PrismaAdapter;
    /**
     * トランザクションを実行
     */
    transaction<T>(fn: (tx: any) => Promise<T>, options?: Parameters<PrismaClient['$transaction']>[1]): Promise<T>;
    /**
     * 以下のゲッターは互換性のために残していますが、
     * 将来的には getAdapter() を使用することを推奨します
     */
    get page(): any;
    get pageHistory(): any;
    get responseNode(): any;
    get responseTree(): any;
    get responseTreeVersion(): any;
    get responseTreeSession(): any;
    get responseTreeMobileLink(): any;
    get responseTreeHistory(): any;
    get responseNodeTranslation(): any;
    get campaign(): any;
    get campaignCategory(): any;
    get campaignCategoryRelation(): any;
    get campaignItem(): any;
    get campaignTranslation(): any;
    get campaignUsageLog(): any;
    get deviceVideoCache(): any;
    get notificationTemplate(): any;
    get tenantAccessLog(): any;
    get systemEvent(): any;
    get deviceRoom(): any;
    get order(): any;
    get orderItem(): any;
    get schemaVersion(): any;
    get systemPlanRestrictions(): any;
    get tenantSystemPlan(): any;
}
export declare const hotelDb: HotelDatabaseClient;
export declare function getHotelDb(): HotelDatabaseClient;
export declare function withTransaction<T>(fn: (tx: any) => Promise<T>, options?: Parameters<PrismaClient['$transaction']>[1]): Promise<T>;
export declare const prisma: PrismaAdapter;
