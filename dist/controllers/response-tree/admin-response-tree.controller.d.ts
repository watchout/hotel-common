import type { Request, Response } from 'express';
/**
 * 管理者向けレスポンスツリーコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export declare class AdminResponseTreeController {
    private responseTreeService;
    private responseNodeService;
    private logger;
    constructor();
    /**
     * レスポンスツリーを作成
     */
    createTree(req: Request, res: Response): Promise<void>;
    /**
     * レスポンスツリーを更新
     */
    updateTree(req: Request, res: Response): Promise<void>;
    /**
     * レスポンスツリーを公開
     */
    publishTree(req: Request, res: Response): Promise<void>;
    /**
     * ノードを作成
     */
    createNode(req: Request, res: Response): Promise<void>;
}
