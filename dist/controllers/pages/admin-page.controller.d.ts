import { Request, Response } from 'express';
/**
 * 管理者向けページ管理コントローラー
 */
export declare class AdminPageController {
    /**
     * すべてのページ取得
     */
    getAllPages(req: Request, res: Response): Promise<any>;
    /**
     * ページ取得
     */
    getPage(req: Request, res: Response): Promise<any>;
    /**
     * ページ保存
     */
    savePage(req: Request, res: Response): Promise<any>;
    /**
     * ページ公開
     */
    publishPage(req: Request, res: Response): Promise<any>;
    /**
     * ページ履歴取得
     */
    getPageHistory(req: Request, res: Response): Promise<any>;
    /**
     * 特定バージョンの履歴取得（クエリパラメータ方式）
     */
    getPageHistoryVersion(req: Request, res: Response): Promise<any>;
    /**
     * バージョン復元
     */
    restorePageVersion(req: Request, res: Response): Promise<any>;
}
declare const _default: AdminPageController;
export default _default;
