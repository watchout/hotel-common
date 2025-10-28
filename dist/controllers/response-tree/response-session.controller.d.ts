import type { Request, Response } from 'express';
/**
 * レスポンスセッションコントローラー
 * HTTPリクエスト/レスポンスの処理を担当
 */
export declare class ResponseSessionController {
    private responseSessionService;
    private logger;
    constructor();
    /**
     * セッション開始
     */
    startSession(req: Request, res: Response): Promise<void>;
    /**
     * セッション状態取得
     */
    getSession(req: Request, res: Response): Promise<void>;
    /**
     * セッション更新
     */
    updateSession(req: Request, res: Response): Promise<void>;
    /**
     * セッション終了
     */
    endSession(req: Request, res: Response): Promise<void>;
}
