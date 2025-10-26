import type { Request, Response } from 'express';
/**
 * レスポンスツリーコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export declare class ResponseTreeController {
    private responseTreeService;
    private logger;
    constructor();
    /**
     * アクティブなレスポンスツリー一覧を取得
     */
    getActiveTrees(req: Request, res: Response): Promise<void>;
    /**
     * レスポンスツリー詳細を取得
     */
    getTreeById(req: Request, res: Response): Promise<void>;
}
