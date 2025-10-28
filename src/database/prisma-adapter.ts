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
export class PrismaAdapter {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
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
    // 互換レイヤー: 新クライアントでは複数形/snake_caseに寄せる
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).orders || (this.prisma as any).order;
  }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // Detector互換: orders (snake_case plural)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  get orders() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - generated client naming
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).orders || this.prisma.order;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  /**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   * orderItem -> orderItem のマッピング
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   */
  get orderItem() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order_items || (this.prisma as any).orderItem;
  }

  // Detector互換: order_items (snake_case plural)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  get order_items() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).order_items || this.prisma.orderItem;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Permissions / Roles family (detector expects snake_case plural)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  get permissions() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).permissions;
  }

  get role_permissions() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).role_permissions;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  get role_templates() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).role_templates;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  get roles() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).roles;
  }

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  get security_logs() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).security_logs;
  }

  get staff_invitations() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).staff_invitations;
  }

  get staff_tenant_memberships() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).staff_tenant_memberships;
  }

  get unified_media() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).unified_media;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  /**
   * room -> rooms のマッピング
   */
  get room() {
    return this.prisma.room;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any

  /**
   * room_grades -> room_grades のマッピング
   */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  get room_grades() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.room_grades;
  }

  /**
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   * invoice -> invoices のマッピング
   */
  get invoice() {
    return this.prisma.invoice;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any

  /**
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
   * payment -> payments のマッピング
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   */
  get payment() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.payment;
  }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * transaction -> transactions のマッピング
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   */
  get transaction() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    return this.prisma.transaction;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

  /**
   * reservation -> reservations のマッピング
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
   */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  get reservation() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).reservations;
  }

  /**
   * roomMemo -> room_memos のマッピング
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   */
  get roomMemo() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).room_memos || (this.prisma as any).roomMemo;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any

  get roomMemoComment() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).room_memo_comments || (this.prisma as any).roomMemoComment;
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  get roomMemoStatusLog() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).room_memo_status_logs || (this.prisma as any).roomMemoStatusLog;
  }

  get roomMemoRead() {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).room_memo_reads || (this.prisma as any).roomMemoRead;
  }

  /**
   * checkinSession -> checkin_sessions のマッピング
   */
  get checkinSession() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).checkin_sessions;
  }

  /**
   * sessionBilling -> session_billings のマッピング
   */
  get sessionBilling() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any).session_billings;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any




  /**
   * トランザクション実行のラッパー
   * トランザクション内でも同じマッピングを適用します
   */
  async $transaction<T>(
    action: (tx: TransactionAdapter) => Promise<T>,
    options?: Parameters<PrismaClient['$transaction']>[1]
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const txAdapter = new TransactionAdapter(tx);
      return action(txAdapter);
    }, options);
  }

  // 他のPrismaClientメソッドを直接転送
  $connect() { return this.prisma.$connect(); }
  $disconnect() { return this.prisma.$disconnect(); }
  
  // Prismaの型定義の問題を回避するため、any型を使用
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  $on(eventType: any, callback: any): any {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.prisma.$on(eventType, callback);
  }
}

/**
 * トランザクション用アダプター
 */
class TransactionAdapter {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tx: any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(tx: any) {
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

  // Detector互換: orders
  get orders() {
    return this.tx.orders || this.tx.order;
  }

  get orderItem() {
    return this.tx.orderItem;
  }

  // Detector互換: order_items
  get order_items() {
    return this.tx.order_items || this.tx.orderItem;
  }

  // Permissions / Roles family
  get permissions() {
    return this.tx.permissions;
  }

  get role_permissions() {
    return this.tx.role_permissions;
  }

  get role_templates() {
    return this.tx.role_templates;
  }

  get roles() {
    return this.tx.roles;
  }

  get security_logs() {
    return this.tx.security_logs;
  }

  get staff_invitations() {
    return this.tx.staff_invitations;
  }

  get staff_tenant_memberships() {
    return this.tx.staff_tenant_memberships;
  }

  get unified_media() {
    return this.tx.unified_media;
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
export function createPrismaAdapter(prismaClient: PrismaClient): PrismaAdapter {
  return new PrismaAdapter(prismaClient);
}
