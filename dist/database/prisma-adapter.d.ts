/**
 * Prismaアダプター
 *
 * このファイルは自動生成されています。
 * Prismaスキーマで@@mapディレクティブを使用した後、コードの互換性を維持するための
 * アダプターレイヤーです。
 */
import { PrismaClient } from '@prisma/client';
/**
 * Prismaクライアントのラッパークラス
 * 古い命名規則（キャメルケース・単数形）でのアクセスを、
 * 新しい命名規則（スネークケース・複数形）に変換します
 */
export declare class PrismaAdapter {
    private prisma;
    constructor(prismaClient: PrismaClient);
    /**
     * tenant -> tenants のマッピング
     */
    get tenant(): import(".prisma/client").Prisma.TenantDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * staff -> staff のマッピング
     */
    get staff(): import(".prisma/client").Prisma.staffDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * responseNode -> response_nodes のマッピング
     */
    get responseNode(): import(".prisma/client").Prisma.response_nodesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * responseTree -> response_trees のマッピング
     */
    get responseTree(): import(".prisma/client").Prisma.response_treesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * responseTreeVersion -> response_tree_versions のマッピング
     */
    get responseTreeVersion(): import(".prisma/client").Prisma.response_tree_versionsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * responseNodeTranslation -> response_node_translations のマッピング
     */
    get responseNodeTranslation(): import(".prisma/client").Prisma.response_node_translationsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * campaign -> campaigns のマッピング
     */
    get campaign(): import(".prisma/client").Prisma.campaignsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * campaignCategory -> campaign_categories のマッピング
     */
    get campaignCategory(): import(".prisma/client").Prisma.campaign_categoriesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * campaignCategoryRelation -> campaign_category_relations のマッピング
     */
    get campaignCategoryRelation(): import(".prisma/client").Prisma.campaign_category_relationsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * campaignItem -> campaign_items のマッピング
     */
    get campaignItem(): import(".prisma/client").Prisma.campaign_itemsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * campaignTranslation -> campaign_translations のマッピング
     */
    get campaignTranslation(): import(".prisma/client").Prisma.campaign_translationsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * campaignUsageLog -> campaign_usage_logs のマッピング
     */
    get campaignUsageLog(): import(".prisma/client").Prisma.campaign_usage_logsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * deviceVideoCache -> device_video_caches のマッピング
     */
    get deviceVideoCache(): import(".prisma/client").Prisma.device_video_cachesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * systemEvent -> system_event のマッピング
     */
    get systemEvent(): import(".prisma/client").Prisma.system_eventDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * deviceRoom -> device_rooms のマッピング
     */
    get deviceRoom(): import(".prisma/client").Prisma.device_roomsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * order -> order のマッピング
     */
    get order(): any;
    get orders(): any;
    /**
     * orderItem -> orderItem のマッピング
     */
    get orderItem(): any;
    get order_items(): any;
    get permissions(): any;
    get role_permissions(): any;
    get role_templates(): any;
    get roles(): any;
    get security_logs(): any;
    get staff_invitations(): any;
    get staff_tenant_memberships(): any;
    get unified_media(): any;
    /**
     * schemaVersion -> schema_version のマッピング
     */
    get schemaVersion(): import(".prisma/client").Prisma.schema_versionDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * systemPlanRestrictions -> systemPlanRestrictions のマッピング
     */
    get systemPlanRestrictions(): import(".prisma/client").Prisma.SystemPlanRestrictionsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * tenantSystemPlan -> tenantSystemPlan のマッピング
     */
    get tenantSystemPlan(): import(".prisma/client").Prisma.TenantSystemPlanDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * page -> pages のマッピング
     */
    get page(): import(".prisma/client").Prisma.pagesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * pageHistory -> page_histories のマッピング
     */
    get pageHistory(): import(".prisma/client").Prisma.page_historiesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * notificationTemplate -> notification_templates のマッピング
     */
    get notificationTemplate(): import(".prisma/client").Prisma.notification_templatesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * tenantAccessLog -> tenant_access_logs のマッピング
     */
    get tenantAccessLog(): import(".prisma/client").Prisma.tenant_access_logsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * responseTreeSession -> response_tree_sessions のマッピング
     */
    get responseTreeSession(): import(".prisma/client").Prisma.response_tree_sessionsDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * responseTreeMobileLink -> response_tree_mobile_links のマッピング
     */
    get responseTreeMobileLink(): import(".prisma/client").Prisma.response_tree_mobile_linksDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * responseTreeHistory -> response_tree_history のマッピング
     */
    get responseTreeHistory(): import(".prisma/client").Prisma.response_tree_historyDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * room -> rooms のマッピング
     */
    get room(): import(".prisma/client").Prisma.RoomDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * room_grades -> room_grades のマッピング
     */
    get room_grades(): import(".prisma/client").Prisma.room_gradesDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * invoice -> invoices のマッピング
     */
    get invoice(): import(".prisma/client").Prisma.InvoiceDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * payment -> payments のマッピング
     */
    get payment(): import(".prisma/client").Prisma.PaymentDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * transaction -> transactions のマッピング
     */
    get transaction(): import(".prisma/client").Prisma.TransactionDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    /**
     * reservation -> reservations のマッピング
     */
    get reservation(): any;
    /**
     * roomMemo -> room_memos のマッピング
     */
    get roomMemo(): any;
    get roomMemoComment(): any;
    get roomMemoStatusLog(): any;
    get roomMemoRead(): any;
    /**
     * checkinSession -> checkin_sessions のマッピング
     */
    get checkinSession(): any;
    /**
     * sessionBilling -> session_billings のマッピング
     */
    get sessionBilling(): any;
    /**
     * トランザクション実行のラッパー
     * トランザクション内でも同じマッピングを適用します
     */
    $transaction<T>(action: (tx: TransactionAdapter) => Promise<T>, options?: Parameters<PrismaClient['$transaction']>[1]): Promise<T>;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(eventType: any, callback: any): any;
}
/**
 * トランザクション用アダプター
 */
declare class TransactionAdapter {
    private tx;
    constructor(tx: any);
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
    get orders(): any;
    get orderItem(): any;
    get order_items(): any;
    get permissions(): any;
    get role_permissions(): any;
    get role_templates(): any;
    get roles(): any;
    get security_logs(): any;
    get staff_invitations(): any;
    get staff_tenant_memberships(): any;
    get unified_media(): any;
    get schemaVersion(): any;
    get systemPlanRestrictions(): any;
    get tenantSystemPlan(): any;
    get room(): any;
    get invoice(): any;
    get payment(): any;
    get transaction(): any;
    get reservation(): any;
    get checkinSession(): any;
    get sessionBilling(): any;
    get roomMemo(): any;
    get roomMemoComment(): any;
    get roomMemoStatusLog(): any;
    get roomMemoRead(): any;
}
/**
 * Prismaクライアントをアダプターでラップする関数
 */
export declare function createPrismaAdapter(prismaClient: PrismaClient): PrismaAdapter;
export {};
