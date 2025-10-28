/**
 * Google Playアプリ選択機能のサービス実装
 */
import type { GooglePlayAppCreateInput, GooglePlayAppUpdateInput, GooglePlayAppListQuery, HotelAppCreateInput, HotelAppUpdateInput, HotelAppListQuery, LayoutAppBlockUpdateInput } from './types';
import type { PrismaClient } from '@prisma/client';
export declare class AppLauncherService {
    private prisma;
    constructor(prismaClient: PrismaClient);
    /**
     * Google Playアプリ一覧を取得
     */
    listGooglePlayApps(query?: GooglePlayAppListQuery): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    /**
     * Google Playアプリの詳細を取得
     */
    getGooglePlayApp(id: string): Promise<any>;
    /**
     * Google Playアプリを作成
     */
    createGooglePlayApp(data: GooglePlayAppCreateInput): Promise<any>;
    /**
     * Google Playアプリを更新
     */
    updateGooglePlayApp(id: string, data: GooglePlayAppUpdateInput): Promise<any>;
    /**
     * Google Playアプリの承認状態を更新
     */
    approveGooglePlayApp(id: string, isApproved: boolean): Promise<any>;
    /**
     * 場所別アプリ一覧を取得
     */
    listHotelApps(placeId: number, query?: HotelAppListQuery): Promise<any>;
    /**
     * 場所別アプリを追加
     */
    createHotelApp(data: HotelAppCreateInput): Promise<any>;
    /**
     * 場所別アプリを更新
     */
    updateHotelApp(placeId: number, appId: string, data: HotelAppUpdateInput): Promise<any>;
    /**
     * 場所別アプリを削除
     */
    deleteHotelApp(placeId: number, appId: string): Promise<any>;
    /**
     * レイアウトブロック別アプリ設定を取得
     */
    getLayoutAppBlock(layoutId: number, blockId: string): Promise<any>;
    /**
     * レイアウトブロック別アプリ設定を更新または作成
     */
    updateLayoutAppBlock(data: LayoutAppBlockUpdateInput): Promise<any>;
}
