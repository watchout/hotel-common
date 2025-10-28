/**
 * Prismaアダプター
 *
 * このファイルは自動生成されています。
 * Prismaスキーマで@@mapディレクティブを使用した後、コードの互換性を維持するための
 * アダプターレイヤーです。
 */
import type { PrismaClient } from '@prisma/client';
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
    get tenant(): any;
    /**
     * staff -> staff のマッピング
     */
    get staff(): any;
    /**
     * responseNode -> response_nodes のマッピング
     */
    get responseNode(): any;
    /**
     * responseTree -> response_trees のマッピング
     */
    get responseTree(): any;
    /**
     * responseTreeVersion -> response_tree_versions のマッピング
     */
    get responseTreeVersion(): any;
    /**
     * responseNodeTranslation -> response_node_translations のマッピング
     */
    get responseNodeTranslation(): any;
    /**
     * campaign -> campaigns のマッピング
     */
    get campaign(): any;
    /**
     * campaignCategory -> campaign_categories のマッピング
     */
    get campaignCategory(): any;
    /**
     * campaignCategoryRelation -> campaign_category_relations のマッピング
     */
    get campaignCategoryRelation(): any;
    /**
     * campaignItem -> campaign_items のマッピング
     */
    get campaignItem(): any;
    /**
     * campaignTranslation -> campaign_translations のマッピング
     */
    get campaignTranslation(): any;
    /**
     * campaignUsageLog -> campaign_usage_logs のマッピング
     */
    get campaignUsageLog(): any;
    /**
     * deviceVideoCache -> device_video_caches のマッピング
     */
    get deviceVideoCache(): any;
    /**
     * systemEvent -> system_event のマッピング
     */
    get systemEvent(): any;
    /**
     * deviceRoom -> device_rooms のマッピング
     */
    get deviceRoom(): any;
    /**
     * order -> order のマッピング
     */
    get order(): any;
    get orders(): any;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * orderItem -> orderItem のマッピング
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    get schemaVersion(): any;
    /**
     * systemPlanRestrictions -> systemPlanRestrictions のマッピング
     */
    get systemPlanRestrictions(): any;
    /**
     * tenantSystemPlan -> tenantSystemPlan のマッピング
     */
    get tenantSystemPlan(): any;
    /**
     * page -> pages のマッピング
     */
    get page(): any;
    /**
     * pageHistory -> page_histories のマッピング
     */
    get pageHistory(): any;
    /**
     * notificationTemplate -> notification_templates のマッピング
     */
    get notificationTemplate(): any;
    /**
     * tenantAccessLog -> tenant_access_logs のマッピング
     */
    get tenantAccessLog(): any;
    /**
     * responseTreeSession -> response_tree_sessions のマッピング
     */
    get responseTreeSession(): any;
    /**
     * responseTreeMobileLink -> response_tree_mobile_links のマッピング
     */
    get responseTreeMobileLink(): any;
    /**
     * responseTreeHistory -> response_tree_history のマッピング
     */
    get responseTreeHistory(): any;
    /**
     * room -> rooms のマッピング
     */
    get room(): any;
    /**
     * room_grades -> room_grades のマッピング
     */
    get room_grades(): any;
    /**
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * invoice -> invoices のマッピング
     */
    get invoice(): any;
    /**
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     * payment -> payments のマッピング
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    get payment(): any;
    /**
     * transaction -> transactions のマッピング
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    get transaction(): any;
    /**
     * reservation -> reservations のマッピング
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     */
    get reservation(): any;
    /**
     * roomMemo -> room_memos のマッピング
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    $connect(): any;
    $disconnect(): any;
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
