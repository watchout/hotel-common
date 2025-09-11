import { PrismaClient } from '../generated/prisma';
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
    get page(): import("../generated/prisma").Prisma.pagesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get pageHistory(): import("../generated/prisma").Prisma.page_historiesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get responseNode(): import("../generated/prisma").Prisma.response_nodesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get responseTree(): import("../generated/prisma").Prisma.response_treesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get responseTreeVersion(): import("../generated/prisma").Prisma.response_tree_versionsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get responseTreeSession(): import("../generated/prisma").Prisma.response_tree_sessionsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get responseTreeMobileLink(): import("../generated/prisma").Prisma.response_tree_mobile_linksDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get responseTreeHistory(): import("../generated/prisma").Prisma.response_tree_historyDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get responseNodeTranslation(): import("../generated/prisma").Prisma.response_node_translationsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get campaign(): import("../generated/prisma").Prisma.campaignsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get campaignCategory(): import("../generated/prisma").Prisma.campaign_categoriesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get campaignCategoryRelation(): import("../generated/prisma").Prisma.campaign_category_relationsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get campaignItem(): import("../generated/prisma").Prisma.campaign_itemsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get campaignTranslation(): import("../generated/prisma").Prisma.campaign_translationsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get campaignUsageLog(): import("../generated/prisma").Prisma.campaign_usage_logsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get deviceVideoCache(): import("../generated/prisma").Prisma.device_video_cachesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get notificationTemplate(): import("../generated/prisma").Prisma.notification_templatesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get tenantAccessLog(): import("../generated/prisma").Prisma.tenant_access_logsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get systemEvent(): import("../generated/prisma").Prisma.system_eventDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get deviceRoom(): import("../generated/prisma").Prisma.device_roomsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get order(): import("../generated/prisma").Prisma.OrderDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get orderItem(): import("../generated/prisma").Prisma.OrderItemDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get schemaVersion(): import("../generated/prisma").Prisma.schema_versionDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get systemPlanRestrictions(): import("../generated/prisma").Prisma.SystemPlanRestrictionsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get tenantSystemPlan(): import("../generated/prisma").Prisma.TenantSystemPlanDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
}
export declare const hotelDb: HotelDatabaseClient;
export declare function getHotelDb(): HotelDatabaseClient;
export declare function withTransaction<T>(fn: (tx: any) => Promise<T>, options?: Parameters<PrismaClient['$transaction']>[1]): Promise<T>;
