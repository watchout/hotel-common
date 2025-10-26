import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from './prisma-adapter';
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
    get page(): import(".prisma/client").Prisma.pagesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get pageHistory(): import(".prisma/client").Prisma.page_historiesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get responseNode(): import(".prisma/client").Prisma.response_nodesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get responseTree(): import(".prisma/client").Prisma.response_treesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get responseTreeVersion(): import(".prisma/client").Prisma.response_tree_versionsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get responseTreeSession(): import(".prisma/client").Prisma.response_tree_sessionsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get responseTreeMobileLink(): import(".prisma/client").Prisma.response_tree_mobile_linksDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get responseTreeHistory(): import(".prisma/client").Prisma.response_tree_historyDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get responseNodeTranslation(): import(".prisma/client").Prisma.response_node_translationsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get campaign(): import(".prisma/client").Prisma.campaignsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get campaignCategory(): import(".prisma/client").Prisma.campaign_categoriesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get campaignCategoryRelation(): import(".prisma/client").Prisma.campaign_category_relationsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get campaignItem(): import(".prisma/client").Prisma.campaign_itemsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get campaignTranslation(): import(".prisma/client").Prisma.campaign_translationsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get campaignUsageLog(): import(".prisma/client").Prisma.campaign_usage_logsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get deviceVideoCache(): import(".prisma/client").Prisma.device_video_cachesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get notificationTemplate(): import(".prisma/client").Prisma.notification_templatesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get tenantAccessLog(): import(".prisma/client").Prisma.tenant_access_logsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get systemEvent(): import(".prisma/client").Prisma.system_eventDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get deviceRoom(): import(".prisma/client").Prisma.device_roomsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get order(): any;
    get orderItem(): any;
    get schemaVersion(): import(".prisma/client").Prisma.schema_versionDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get systemPlanRestrictions(): import(".prisma/client").Prisma.SystemPlanRestrictionsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get tenantSystemPlan(): import(".prisma/client").Prisma.TenantSystemPlanDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
}
export declare const hotelDb: HotelDatabaseClient;
export declare function getHotelDb(): HotelDatabaseClient;
export declare function withTransaction<T>(fn: (tx: any) => Promise<T>, options?: Parameters<PrismaClient['$transaction']>[1]): Promise<T>;
export declare const prisma: PrismaAdapter;
