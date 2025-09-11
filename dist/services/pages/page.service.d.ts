/**
 * ページ管理サービス
 */
export declare class PageService {
    /**
     * テナントIDに紐づくすべてのページを取得
     */
    getAllPages(tenantId: string): Promise<{
        is_deleted: boolean;
        deleted_at: Date | null;
        deleted_by: string | null;
        Id: string;
        TenantId: string;
        Slug: string;
        Title: string;
        Html: string | null;
        Css: string | null;
        Content: string | null;
        Template: string | null;
        IsPublished: boolean;
        PublishedAt: Date | null;
        Version: number;
        CreatedAt: Date;
        UpdatedAt: Date;
    }[]>;
    /**
     * テナントIDとスラグでページを取得
     */
    getPageBySlug(tenantId: string, slug: string): Promise<{
        is_deleted: boolean;
        deleted_at: Date | null;
        deleted_by: string | null;
        Id: string;
        TenantId: string;
        Slug: string;
        Title: string;
        Html: string | null;
        Css: string | null;
        Content: string | null;
        Template: string | null;
        IsPublished: boolean;
        PublishedAt: Date | null;
        Version: number;
        CreatedAt: Date;
        UpdatedAt: Date;
    } | null>;
    /**
     * 公開済みページをスラグで取得
     */
    getPublishedPageBySlug(tenantId: string, slug: string): Promise<{
        is_deleted: boolean;
        deleted_at: Date | null;
        deleted_by: string | null;
        Id: string;
        TenantId: string;
        Slug: string;
        Title: string;
        Html: string | null;
        Css: string | null;
        Content: string | null;
        Template: string | null;
        IsPublished: boolean;
        PublishedAt: Date | null;
        Version: number;
        CreatedAt: Date;
        UpdatedAt: Date;
    } | null>;
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
    publishPage(tenantId: string, slug: string, pageId: string): Promise<{
        is_deleted: boolean;
        deleted_at: Date | null;
        deleted_by: string | null;
        Id: string;
        TenantId: string;
        Slug: string;
        Title: string;
        Html: string | null;
        Css: string | null;
        Content: string | null;
        Template: string | null;
        IsPublished: boolean;
        PublishedAt: Date | null;
        Version: number;
        CreatedAt: Date;
        UpdatedAt: Date;
    }>;
    /**
     * ページの履歴一覧を取得
     */
    getPageHistory(tenantId: string, slug: string): Promise<{
        current: {
            Id: string;
            Version: number;
            UpdatedAt: Date;
        };
        history: {
            Id: string;
            Version: number;
            CreatedAt: Date;
            CreatedBy: string | null;
        }[];
    }>;
    /**
     * 特定バージョンの履歴を取得
     */
    getPageHistoryVersion(tenantId: string, slug: string, version: number): Promise<{
        is_deleted: boolean;
        deleted_at: Date | null;
        deleted_by: string | null;
        Id: string;
        Html: string | null;
        Css: string | null;
        Content: string | null;
        Template: string | null;
        Version: number;
        CreatedAt: Date;
        PageId: string;
        CreatedBy: string | null;
    }>;
    /**
     * 過去のバージョンを復元
     */
    restorePageVersion(tenantId: string, slug: string, version: number): Promise<any>;
}
declare const _default: PageService;
export default _default;
