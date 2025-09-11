import { Request, Response } from 'express';
/**
 * レスポンスノードコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export declare class ResponseNodeController {
    private responseNodeService;
    private logger;
    constructor();
    /**
     * ノード詳細を取得
     */
    getNodeById(req: Request, res: Response): Promise<void>;
    /**
     * 子ノード一覧を取得
     */
    getChildNodes(req: Request, res: Response): Promise<void>;
    /**
     * ノード検索
     */
    searchNodes(req: Request, res: Response): Promise<void>;
}
