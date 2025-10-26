import { PrismaClient } from '@prisma/client';
import { createPrismaAdapter, PrismaAdapter } from './prisma-adapter';
import { setupSoftDeleteMiddleware } from './soft-delete-middleware';

/**
 * ホテル共通データベースクライアント
 * シングルトンパターンを使用して、アプリケーション全体で一貫したPrismaClientインスタンスを提供します
 */
export class HotelDatabaseClient {
  private static instance: HotelDatabaseClient;
  private prisma: PrismaClient;
  private adapter: PrismaAdapter;

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    // ソフトデリートミドルウェアを設定（一時的に無効化）
    // setupSoftDeleteMiddleware(this.prisma);
    
    this.adapter = createPrismaAdapter(this.prisma);
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): HotelDatabaseClient {
    if (!HotelDatabaseClient.instance) {
      HotelDatabaseClient.instance = new HotelDatabaseClient();
    }
    return HotelDatabaseClient.instance;
  }

  /**
   * Prismaクライアントインスタンスを取得
   * 注意: 直接Prismaクライアントを使用する場合は、テーブル名がスネークケース・複数形であることに注意
   */
  public getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * アダプターを使用したPrismaクライアントを取得
   * 従来のキャメルケース・単数形のモデル名でアクセス可能
   */
  public getAdapter(): PrismaAdapter {
    return this.adapter;
  }

  /**
   * トランザクションを実行
   */
  public async transaction<T>(
    fn: (tx: any) => Promise<T>,
    options?: Parameters<PrismaClient['$transaction']>[1]
  ): Promise<T> {
    return this.adapter.$transaction(fn, options);
  }

  /**
   * 以下のゲッターは互換性のために残していますが、
   * 将来的には getAdapter() を使用することを推奨します
   */
  public get page() { return this.adapter.page; }
  public get pageHistory() { return this.adapter.pageHistory; }
  public get responseNode() { return this.adapter.responseNode; }
  public get responseTree() { return this.adapter.responseTree; }
  public get responseTreeVersion() { return this.adapter.responseTreeVersion; }
  public get responseTreeSession() { return this.adapter.responseTreeSession; }
  public get responseTreeMobileLink() { return this.adapter.responseTreeMobileLink; }
  public get responseTreeHistory() { return this.adapter.responseTreeHistory; }
  public get responseNodeTranslation() { return this.adapter.responseNodeTranslation; }
  public get campaign() { return this.adapter.campaign; }
  public get campaignCategory() { return this.adapter.campaignCategory; }
  public get campaignCategoryRelation() { return this.adapter.campaignCategoryRelation; }
  public get campaignItem() { return this.adapter.campaignItem; }
  public get campaignTranslation() { return this.adapter.campaignTranslation; }
  public get campaignUsageLog() { return this.adapter.campaignUsageLog; }
  public get deviceVideoCache() { return this.adapter.deviceVideoCache; }
  public get notificationTemplate() { return this.adapter.notificationTemplate; }
  public get tenantAccessLog() { return this.adapter.tenantAccessLog; }
  public get systemEvent() { return this.adapter.systemEvent; }
  public get deviceRoom() { return this.adapter.deviceRoom; }
  public get order() { return this.adapter.order; }
  public get orderItem() { return this.adapter.orderItem; }
  public get schemaVersion() { return this.adapter.schemaVersion; }
  public get systemPlanRestrictions() { return this.adapter.systemPlanRestrictions; }
  public get tenantSystemPlan() { return this.adapter.tenantSystemPlan; }
}

// エクスポートするデフォルトインスタンス
export const hotelDb = HotelDatabaseClient.getInstance();

// 便利なヘルパー関数
export function getHotelDb(): HotelDatabaseClient {
  return HotelDatabaseClient.getInstance();
}

// トランザクション用のヘルパー関数
export async function withTransaction<T>(
  fn: (tx: any) => Promise<T>,
  options?: Parameters<PrismaClient['$transaction']>[1]
): Promise<T> {
  return hotelDb.transaction(fn, options);
}

// 互換のためのエクスポート（既存コードの import { prisma } from '../../database/prisma' 対応）
export const prisma = hotelDb.getAdapter();
