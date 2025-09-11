/**
 * レスポンスモバイル連携リポジトリ
 * データベースとのやり取りを担当
 */
export declare class ResponseMobileLinkRepository {
    /**
     * モバイル連携を作成
     */
    createMobileLink(data: {
        sessionId: string;
        deviceId?: number;
        roomId?: string;
        expiresInMinutes?: number;
    }): Promise<any>;
    /**
     * モバイル連携を取得
     */
    findMobileLinkByCode(linkCode: string): Promise<any>;
    /**
     * モバイル連携を実行
     */
    connectMobileLink(linkCode: string, data: {
        userId?: string;
        deviceInfo?: any;
    }): Promise<any>;
    /**
     * モバイル連携を無効化
     */
    invalidateMobileLink(linkId: string): Promise<any>;
}
