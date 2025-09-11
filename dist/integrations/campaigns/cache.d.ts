export declare const CACHE_TYPES: {
    ACTIVE_CAMPAIGNS: string;
    CAMPAIGN_BY_ID: string;
    CAMPAIGNS_BY_CATEGORY: string;
    WELCOME_SCREEN_CONFIG: string;
    CAMPAIGN_CATEGORIES: string;
};
export declare class CampaignCache {
    private static instance;
    private cache;
    private defaultTTL;
    constructor();
    static getInstance(): CampaignCache;
    /**
     * キャッシュにデータを設定
     * @param key キャッシュキー
     * @param value 値
     * @param ttl 有効期限（秒）、省略時はデフォルト値
     */
    set<T>(key: string, value: T, ttl?: number): boolean;
    /**
     * キャッシュからデータを取得
     * @param key キャッシュキー
     */
    get<T>(key: string): T | undefined;
    /**
     * キャッシュからデータを削除
     * @param key キャッシュキー
     */
    delete(key: string): number;
    /**
     * 指定したタイプのキャッシュをすべて削除
     * @param type キャッシュタイプ
     */
    deleteByType(type: string): void;
    /**
     * すべてのキャッシュをクリア
     */
    flush(): void;
    /**
     * 期限切れのキャッシュをクリーンアップ
     */
    private cleanup;
    /**
     * キャッシュのキー一覧を取得
     */
    keys(): string[];
}
