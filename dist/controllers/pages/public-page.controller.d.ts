import { Request, Response } from 'express';
/**
 * 公開向けページコントローラー
 */
export declare class PublicPageController {
    /**
     * 公開ページ取得
     */
    getPublicPage(req: Request, res: Response): Promise<any>;
}
declare const _default: PublicPageController;
export default _default;
