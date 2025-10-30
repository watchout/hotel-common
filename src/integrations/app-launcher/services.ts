/**
 * Google Playアプリ選択機能のサービス実装
 */

import type { PrismaClient } from '../../generated/prisma';
import type {
  GooglePlayAppCreateInput,
  GooglePlayAppListQuery,
  GooglePlayAppUpdateInput,
  HotelAppCreateInput,
  HotelAppListQuery,
  HotelAppUpdateInput,
  LayoutAppBlockUpdateInput
} from './types';


export class AppLauncherService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Google Playアプリ一覧を取得
   */
  async listGooglePlayApps(query: GooglePlayAppListQuery = {}) {
    const { category, approved, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (approved !== undefined) {
      where.isApproved = approved;
    }

    const [apps, total] = await Promise.all([
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      this.prisma.googlePlayApp.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { displayName: 'asc' }
        ]
      }),
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      this.prisma.googlePlayApp.count({ where })
    ]);

    return {
      data: apps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Google Playアプリの詳細を取得
   */
  async getGooglePlayApp(id: string) {
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.googlePlayApp.findUnique({
      where: { id }
    });
  }

  /**
   * Google Playアプリを作成
   */
  async createGooglePlayApp(data: GooglePlayAppCreateInput) {
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.googlePlayApp.create({
      data: {
        ...data,
        id: undefined // cuidが自動生成されるようにする
      }
    });
  }

  /**
   * Google Playアプリを更新
   */
  async updateGooglePlayApp(id: string, data: GooglePlayAppUpdateInput) {
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.googlePlayApp.update({
      where: { id },
      data
    });
  }

  /**
   * Google Playアプリの承認状態を更新
   */
  async approveGooglePlayApp(id: string, isApproved: boolean) {
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.googlePlayApp.update({
      where: { id },
      data: { isApproved }
    });
  }

  /**
   * 場所別アプリ一覧を取得
   */
  async listHotelApps(placeId: number, query: HotelAppListQuery = {}) {
    const { isEnabled } = query;

    const where: any = { placeId };

    if (isEnabled !== undefined) {
      where.isEnabled = isEnabled;
    }

    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    const hotelApps = await this.prisma.hotelApp.findMany({
      where,
      include: {
        GooglePlayApp: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    return hotelApps;
  }

  /**
   * 場所別アプリを追加
   */
  async createHotelApp(data: HotelAppCreateInput) {
    // 一意のIDを生成
    const id = `${data.placeId}-${data.appId}`;

    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.hotelApp.create({
      data: {
        id,
        ...data
      },
      include: {
        GooglePlayApp: true
      }
    });
  }

  /**
   * 場所別アプリを更新
   */
  async updateHotelApp(placeId: number, appId: string, data: HotelAppUpdateInput) {
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.hotelApp.update({
      where: {
        placeId_appId: {
          placeId,
          appId
        }
      },
      data,
      include: {
        GooglePlayApp: true
      }
    });
  }

  /**
   * 場所別アプリを削除
   */
  async deleteHotelApp(placeId: number, appId: string) {
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.hotelApp.delete({
      where: {
        placeId_appId: {
          placeId,
          appId
        }
      }
    });
  }

  /**
   * レイアウトブロック別アプリ設定を取得
   */
  async getLayoutAppBlock(layoutId: number, blockId: string) {
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.layoutAppBlock.findUnique({
      where: {
        layoutId_blockId: {
          layoutId,
          blockId
        }
      }
    });
  }

  /**
   * レイアウトブロック別アプリ設定を更新または作成
   */
  async updateLayoutAppBlock(data: LayoutAppBlockUpdateInput) {
    const { layoutId, blockId, appConfig } = data;

    // 一意のIDを生成
    const id = `${layoutId}-${blockId}`;

    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    return this.prisma.layoutAppBlock.upsert({
      where: {
        layoutId_blockId: {
          layoutId,
          blockId
        }
      },
      update: {
        appConfig
      },
      create: {
        id,
        layoutId,
        blockId,
        appConfig
      }
    });
  }
}
