import { Request, Response } from 'express';
/**
 * レスポンスモバイル連携コントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export declare class ResponseMobileLinkController {
    private responseMobileLinkService;
    private logger;
    constructor();
    /**
     * モバイル連携を作成
     */
    createMobileLink(req: Request, res: Response): Promise<void>;
    /**
     * モバイル連携を取得
     */
    getMobileLink(req: Request, res: Response): Promise<void>;
    /**
     * モバイル連携を実行
     */
    connectMobileLink(req: Request, res: Response): Promise<void>;
    /**
     * QRコード画像を取得
     */
    getQRCode(req: Request, res: Response): Promise<void>;
}
