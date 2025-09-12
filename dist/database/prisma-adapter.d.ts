/**
 * Prismaアダプター
 *
 * このファイルは自動生成されています。
 * Prismaスキーマで@@mapディレクティブを使用した後、コードの互換性を維持するための
 * アダプターレイヤーです。
 */
import { PrismaClient } from '../generated/prisma';
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
    get tenant(): import("../generated/prisma").Prisma.TenantDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * staff -> staff のマッピング
     */
    get staff(): import("../generated/prisma").Prisma.staffDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * responseNode -> response_nodes のマッピング
     */
    get responseNode(): import("../generated/prisma").Prisma.response_nodesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * responseTree -> response_trees のマッピング
     */
    get responseTree(): import("../generated/prisma").Prisma.response_treesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * responseTreeVersion -> response_tree_versions のマッピング
     */
    get responseTreeVersion(): import("../generated/prisma").Prisma.response_tree_versionsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * responseNodeTranslation -> response_node_translations のマッピング
     */
    get responseNodeTranslation(): import("../generated/prisma").Prisma.response_node_translationsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * campaign -> campaigns のマッピング
     */
    get campaign(): import("../generated/prisma").Prisma.campaignsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * campaignCategory -> campaign_categories のマッピング
     */
    get campaignCategory(): import("../generated/prisma").Prisma.campaign_categoriesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * campaignCategoryRelation -> campaign_category_relations のマッピング
     */
    get campaignCategoryRelation(): import("../generated/prisma").Prisma.campaign_category_relationsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * campaignItem -> campaign_items のマッピング
     */
    get campaignItem(): import("../generated/prisma").Prisma.campaign_itemsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * campaignTranslation -> campaign_translations のマッピング
     */
    get campaignTranslation(): import("../generated/prisma").Prisma.campaign_translationsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * campaignUsageLog -> campaign_usage_logs のマッピング
     */
    get campaignUsageLog(): import("../generated/prisma").Prisma.campaign_usage_logsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * deviceVideoCache -> device_video_caches のマッピング
     */
    get deviceVideoCache(): import("../generated/prisma").Prisma.device_video_cachesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * systemEvent -> system_event のマッピング
     */
    get systemEvent(): import("../generated/prisma").Prisma.system_eventDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * deviceRoom -> device_rooms のマッピング
     */
    get deviceRoom(): import("../generated/prisma").Prisma.device_roomsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * order -> order のマッピング
     */
    get order(): import("../generated/prisma").Prisma.OrderDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * orderItem -> orderItem のマッピング
     */
    get orderItem(): import("../generated/prisma").Prisma.OrderItemDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * schemaVersion -> schema_version のマッピング
     */
    get schemaVersion(): import("../generated/prisma").Prisma.schema_versionDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * systemPlanRestrictions -> systemPlanRestrictions のマッピング
     */
    get systemPlanRestrictions(): import("../generated/prisma").Prisma.SystemPlanRestrictionsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * tenantSystemPlan -> tenantSystemPlan のマッピング
     */
    get tenantSystemPlan(): import("../generated/prisma").Prisma.TenantSystemPlanDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * page -> pages のマッピング
     */
    get page(): import("../generated/prisma").Prisma.pagesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * pageHistory -> page_histories のマッピング
     */
    get pageHistory(): import("../generated/prisma").Prisma.page_historiesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * notificationTemplate -> notification_templates のマッピング
     */
    get notificationTemplate(): import("../generated/prisma").Prisma.notification_templatesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * tenantAccessLog -> tenant_access_logs のマッピング
     */
    get tenantAccessLog(): import("../generated/prisma").Prisma.tenant_access_logsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * responseTreeSession -> response_tree_sessions のマッピング
     */
    get responseTreeSession(): import("../generated/prisma").Prisma.response_tree_sessionsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * responseTreeMobileLink -> response_tree_mobile_links のマッピング
     */
    get responseTreeMobileLink(): import("../generated/prisma").Prisma.response_tree_mobile_linksDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * responseTreeHistory -> response_tree_history のマッピング
     */
    get responseTreeHistory(): import("../generated/prisma").Prisma.response_tree_historyDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * room -> rooms のマッピング
     */
    get room(): import("../generated/prisma").Prisma.RoomDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * room_grades -> room_grades のマッピング
     */
    get room_grades(): import("../generated/prisma").Prisma.room_gradesDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * invoice -> invoices のマッピング
     */
    get invoice(): import("../generated/prisma").Prisma.InvoiceDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * payment -> payments のマッピング
     */
    get payment(): import("../generated/prisma").Prisma.PaymentDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * transaction -> transactions のマッピング
     */
    get transaction(): import("../generated/prisma").Prisma.TransactionDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * reservation -> reservations のマッピング
     */
    get reservation(): import("../generated/prisma").Prisma.reservationsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * roomMemo -> room_memos のマッピング
     */
    get roomMemo(): import("../generated/prisma").Prisma.RoomMemoDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get roomMemoComment(): import("../generated/prisma").Prisma.RoomMemoCommentDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get roomMemoStatusLog(): import("../generated/prisma").Prisma.RoomMemoStatusLogDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    get roomMemoRead(): import("../generated/prisma").Prisma.RoomMemoReadDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * checkinSession -> checkin_sessions のマッピング
     */
    get checkinSession(): import("../generated/prisma").Prisma.checkin_sessionsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
    /**
     * sessionBilling -> session_billings のマッピング
     */
    get sessionBilling(): import("../generated/prisma").Prisma.session_billingsDelegate<import("../generated/prisma/runtime/library").DefaultArgs>;
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
    get orderItem(): any;
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
