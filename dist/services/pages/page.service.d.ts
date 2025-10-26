/**
 * ページ管理サービス
 */
export declare class PageService {
    /**
     * テナントIDに紐づくすべてのページを取得
     */
    getAllPages(tenantId: string): Promise<any>;
    /**
     * テナントIDとスラグでページを取得
     */
    getPageBySlug(tenantId: string, slug: string): Promise<any>;
    /**
     * 公開済みページをスラグで取得
     */
    getPublishedPageBySlug(tenantId: string, slug: string): Promise<any>;
    /**
     * ページを保存（新規作成または更新）
     */
    savePage(tenantId: string, slug: string, pageData: {
        Title: string;
        Html?: string;
        Css?: string;
        Content?: string;
        Template?: string;
    }): Promise<any>;
    /**
     * ページを公開する
     */
    publishPage(tenantId: string, slug: string, pageId: string): Promise<any>;
    /**
     * ページの履歴一覧を取得
     */
    getPageHistory(tenantId: string, slug: string): Promise<{
        current: any;
        history: any;
    }>;
    /**
     * 特定バージョンの履歴を取得
     */
    getPageHistoryVersion(tenantId: string, slug: string, version: number): Promise<any>;
    /**
     * 過去のバージョンを復元
     */
    restorePageVersion(tenantId: string, slug: string, version: number): Promise<any>;
}
declare const _default: PageService;
export default _default;
