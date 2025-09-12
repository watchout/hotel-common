"use strict";
/**
 * Prismaアダプター
 *
 * このファイルは自動生成されています。
 * Prismaスキーマで@@mapディレクティブを使用した後、コードの互換性を維持するための
 * アダプターレイヤーです。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAdapter = void 0;
exports.createPrismaAdapter = createPrismaAdapter;
/**
 * Prismaクライアントのラッパークラス
 * 古い命名規則（キャメルケース・単数形）でのアクセスを、
 * 新しい命名規則（スネークケース・複数形）に変換します
 */
class PrismaAdapter {
    prisma;
    constructor(prismaClient) {
        this.prisma = prismaClient;
    }
    /**
     * tenant -> tenants のマッピング
     */
    get tenant() {
        return this.prisma.tenant;
    }
    /**
     * staff -> staff のマッピング
     */
    get staff() {
        return this.prisma.staff;
    }
    /**
     * responseNode -> response_nodes のマッピング
     */
    get responseNode() {
        return this.prisma.response_nodes;
    }
    /**
     * responseTree -> response_trees のマッピング
     */
    get responseTree() {
        return this.prisma.response_trees;
    }
    /**
     * responseTreeVersion -> response_tree_versions のマッピング
     */
    get responseTreeVersion() {
        return this.prisma.response_tree_versions;
    }
    /**
     * responseNodeTranslation -> response_node_translations のマッピング
     */
    get responseNodeTranslation() {
        return this.prisma.response_node_translations;
    }
    /**
     * campaign -> campaigns のマッピング
     */
    get campaign() {
        return this.prisma.campaigns;
    }
    /**
     * campaignCategory -> campaign_categories のマッピング
     */
    get campaignCategory() {
        return this.prisma.campaign_categories;
    }
    /**
     * campaignCategoryRelation -> campaign_category_relations のマッピング
     */
    get campaignCategoryRelation() {
        return this.prisma.campaign_category_relations;
    }
    /**
     * campaignItem -> campaign_items のマッピング
     */
    get campaignItem() {
        return this.prisma.campaign_items;
    }
    /**
     * campaignTranslation -> campaign_translations のマッピング
     */
    get campaignTranslation() {
        return this.prisma.campaign_translations;
    }
    /**
     * campaignUsageLog -> campaign_usage_logs のマッピング
     */
    get campaignUsageLog() {
        return this.prisma.campaign_usage_logs;
    }
    /**
     * deviceVideoCache -> device_video_caches のマッピング
     */
    get deviceVideoCache() {
        return this.prisma.device_video_caches;
    }
    /**
     * systemEvent -> system_event のマッピング
     */
    get systemEvent() {
        return this.prisma.system_event;
    }
    /**
     * deviceRoom -> device_rooms のマッピング
     */
    get deviceRoom() {
        return this.prisma.device_rooms;
    }
    /**
     * order -> order のマッピング
     */
    get order() {
        return this.prisma.order;
    }
    /**
     * orderItem -> orderItem のマッピング
     */
    get orderItem() {
        return this.prisma.orderItem;
    }
    /**
     * schemaVersion -> schema_version のマッピング
     */
    get schemaVersion() {
        return this.prisma.schema_version;
    }
    /**
     * systemPlanRestrictions -> systemPlanRestrictions のマッピング
     */
    get systemPlanRestrictions() {
        return this.prisma.systemPlanRestrictions;
    }
    /**
     * tenantSystemPlan -> tenantSystemPlan のマッピング
     */
    get tenantSystemPlan() {
        return this.prisma.tenantSystemPlan;
    }
    /**
     * page -> pages のマッピング
     */
    get page() {
        return this.prisma.pages;
    }
    /**
     * pageHistory -> page_histories のマッピング
     */
    get pageHistory() {
        return this.prisma.page_histories;
    }
    /**
     * notificationTemplate -> notification_templates のマッピング
     */
    get notificationTemplate() {
        return this.prisma.notification_templates;
    }
    /**
     * tenantAccessLog -> tenant_access_logs のマッピング
     */
    get tenantAccessLog() {
        return this.prisma.tenant_access_logs;
    }
    /**
     * responseTreeSession -> response_tree_sessions のマッピング
     */
    get responseTreeSession() {
        return this.prisma.response_tree_sessions;
    }
    /**
     * responseTreeMobileLink -> response_tree_mobile_links のマッピング
     */
    get responseTreeMobileLink() {
        return this.prisma.response_tree_mobile_links;
    }
    /**
     * responseTreeHistory -> response_tree_history のマッピング
     */
    get responseTreeHistory() {
        return this.prisma.response_tree_history;
    }
    /**
     * room -> rooms のマッピング
     */
    get room() {
        return this.prisma.room;
    }
    /**
     * room_grades -> room_grades のマッピング
     */
    get room_grades() {
        return this.prisma.room_grades;
    }
    /**
     * invoice -> invoices のマッピング
     */
    get invoice() {
        return this.prisma.invoice;
    }
    /**
     * payment -> payments のマッピング
     */
    get payment() {
        return this.prisma.payment;
    }
    /**
     * transaction -> transactions のマッピング
     */
    get transaction() {
        return this.prisma.transaction;
    }
    /**
     * reservation -> reservations のマッピング
     */
    get reservation() {
        return this.prisma.reservations;
    }
    /**
     * roomMemo -> room_memos のマッピング
     */
    get roomMemo() {
        return this.prisma.roomMemo;
    }
    get roomMemoComment() {
        return this.prisma.roomMemoComment;
    }
    get roomMemoStatusLog() {
        return this.prisma.roomMemoStatusLog;
    }
    get roomMemoRead() {
        return this.prisma.roomMemoRead;
    }
    /**
     * checkinSession -> checkin_sessions のマッピング
     */
    get checkinSession() {
        return this.prisma.checkin_sessions;
    }
    /**
     * sessionBilling -> session_billings のマッピング
     */
    get sessionBilling() {
        return this.prisma.session_billings;
    }
    /**
     * トランザクション実行のラッパー
     * トランザクション内でも同じマッピングを適用します
     */
    async $transaction(action, options) {
        return this.prisma.$transaction(async (tx) => {
            const txAdapter = new TransactionAdapter(tx);
            return action(txAdapter);
        }, options);
    }
    // 他のPrismaClientメソッドを直接転送
    $connect() { return this.prisma.$connect(); }
    $disconnect() { return this.prisma.$disconnect(); }
    // Prismaの型定義の問題を回避するため、any型を使用
    $on(eventType, callback) {
        // @ts-ignore
        return this.prisma.$on(eventType, callback);
    }
}
exports.PrismaAdapter = PrismaAdapter;
/**
 * トランザクション用アダプター
 */
class TransactionAdapter {
    tx;
    constructor(tx) {
        this.tx = tx;
    }
    get page() {
        return this.tx.pages;
    }
    get pageHistory() {
        return this.tx.page_histories;
    }
    get responseNode() {
        return this.tx.response_nodes;
    }
    get responseTree() {
        return this.tx.response_trees;
    }
    get responseTreeVersion() {
        return this.tx.response_tree_versions;
    }
    get responseTreeSession() {
        return this.tx.response_tree_sessions;
    }
    get responseTreeMobileLink() {
        return this.tx.response_tree_mobile_links;
    }
    get responseTreeHistory() {
        return this.tx.response_tree_history;
    }
    get responseNodeTranslation() {
        return this.tx.response_node_translations;
    }
    get campaign() {
        return this.tx.campaigns;
    }
    get campaignCategory() {
        return this.tx.campaign_categories;
    }
    get campaignCategoryRelation() {
        return this.tx.campaign_category_relations;
    }
    get campaignItem() {
        return this.tx.campaign_items;
    }
    get campaignTranslation() {
        return this.tx.campaign_translations;
    }
    get campaignUsageLog() {
        return this.tx.campaign_usage_logs;
    }
    get deviceVideoCache() {
        return this.tx.device_video_caches;
    }
    get notificationTemplate() {
        return this.tx.notification_templates;
    }
    get tenantAccessLog() {
        return this.tx.tenant_access_logs;
    }
    get systemEvent() {
        return this.tx.system_event;
    }
    get deviceRoom() {
        return this.tx.device_rooms;
    }
    get order() {
        return this.tx.order;
    }
    get orderItem() {
        return this.tx.orderItem;
    }
    get schemaVersion() {
        return this.tx.schema_version;
    }
    get systemPlanRestrictions() {
        return this.tx.systemPlanRestrictions;
    }
    get tenantSystemPlan() {
        return this.tx.tenantSystemPlan;
    }
    get room() {
        return this.tx.room;
    }
    get invoice() {
        return this.tx.invoice;
    }
    get payment() {
        return this.tx.payment;
    }
    get transaction() {
        return this.tx.transaction;
    }
    get reservation() {
        return this.tx.reservation;
    }
    get checkinSession() {
        return this.tx.checkinSession;
    }
    get sessionBilling() {
        return this.tx.sessionBilling;
    }
    get roomMemo() {
        return this.tx.roomMemo;
    }
    get roomMemoComment() {
        return this.tx.roomMemoComment;
    }
    get roomMemoStatusLog() {
        return this.tx.roomMemoStatusLog;
    }
    get roomMemoRead() {
        return this.tx.roomMemoRead;
    }
}
/**
 * Prismaクライアントをアダプターでラップする関数
 */
function createPrismaAdapter(prismaClient) {
    return new PrismaAdapter(prismaClient);
}
