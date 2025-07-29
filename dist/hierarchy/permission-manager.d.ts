import type { HierarchyPermissionCheck, HierarchyAccessResult, OrganizationHierarchy, DataSharingPolicy, SharingScope } from './types';
/**
 * Hotel Group階層権限管理システム
 *
 * 機能:
 * - 階層スコープ内権限チェック
 * - アクセス可能テナント一覧取得
 * - データ共有ポリシー適用
 * - 階層クエリ最適化（キャッシュ付き）
 */
export declare class HierarchyPermissionManager {
    private static logger;
    private static redis;
    private static CACHE_TTL;
    /**
     * Redisクライアント初期化
     */
    private static getRedisClient;
    /**
     * 階層権限チェック（メインエントリーポイント）
     */
    static checkHierarchyAccess(params: HierarchyPermissionCheck): Promise<HierarchyAccessResult>;
    /**
     * 階層スコープ内チェック
     */
    private static checkHierarchyScope;
    /**
     * アクセス可能テナント一覧取得（キャッシュ付き）
     */
    static getAccessibleTenants(organizationId: string, scopeLevel?: SharingScope): Promise<string[]>;
    /**
     * 操作権限チェック
     */
    private static checkOperationPermission;
    /**
     * 条件付きアクセスチェック
     */
    private static checkAccessConditions;
    /**
     * 階層変更時のキャッシュ無効化
     */
    static invalidateHierarchyCache(organizationId: string): Promise<void>;
    /**
     * 組織階層ツリー取得
     */
    static getOrganizationTree(rootOrganizationId?: string, maxDepth?: number): Promise<OrganizationHierarchy[]>;
    /**
     * データ共有ポリシー取得
     */
    static getDataSharingPolicies(organizationId: string): Promise<DataSharingPolicy[]>;
}
