"use strict";
// キャッシュ設定（node-cacheを使用しない緊急対応版）
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignCache = exports.CACHE_TYPES = void 0;
exports.CACHE_TYPES = {
    ACTIVE_CAMPAIGNS: 'active_campaigns',
    CAMPAIGN_BY_ID: 'campaign_by_id',
    CAMPAIGNS_BY_CATEGORY: 'campaigns_by_category',
    WELCOME_SCREEN_CONFIG: 'welcome_screen_config',
    CAMPAIGN_CATEGORIES: 'campaign_categories'
};
// シンプルなインメモリキャッシュ実装
class CampaignCache {
    static instance;
    cache;
    defaultTTL = 300; // デフォルト5分
    constructor() {
        this.cache = new Map();
        // 定期的に期限切れのキャッシュをクリーンアップ
        setInterval(() => this.cleanup(), 60000); // 1分ごと
    }
    static getInstance() {
        if (!CampaignCache.instance) {
            CampaignCache.instance = new CampaignCache();
        }
        return CampaignCache.instance;
    }
    /**
     * キャッシュにデータを設定
     * @param key キャッシュキー
     * @param value 値
     * @param ttl 有効期限（秒）、省略時はデフォルト値
     */
    set(key, value, ttl) {
        const expiry = Date.now() + (ttl || this.defaultTTL) * 1000;
        this.cache.set(key, { value, expiry });
        return true;
    }
    /**
     * キャッシュからデータを取得
     * @param key キャッシュキー
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return undefined;
        // 期限切れチェック
        if (item.expiry < Date.now()) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value;
    }
    /**
     * キャッシュからデータを削除
     * @param key キャッシュキー
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        return deleted ? 1 : 0;
    }
    /**
     * 指定したタイプのキャッシュをすべて削除
     * @param type キャッシュタイプ
     */
    deleteByType(type) {
        // Array.fromを使用してイテレーションの問題を回避
        Array.from(this.cache.keys()).forEach(key => {
            if (key.startsWith(type)) {
                this.cache.delete(key);
            }
        });
    }
    /**
     * すべてのキャッシュをクリア
     */
    flush() {
        this.cache.clear();
    }
    /**
     * 期限切れのキャッシュをクリーンアップ
     */
    cleanup() {
        const now = Date.now();
        // Array.fromを使用してイテレーションの問題を回避
        Array.from(this.cache.entries()).forEach(([key, item]) => {
            if (item.expiry < now) {
                this.cache.delete(key);
            }
        });
    }
    /**
     * キャッシュのキー一覧を取得
     */
    keys() {
        return Array.from(this.cache.keys());
    }
}
exports.CampaignCache = CampaignCache;
