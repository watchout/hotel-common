/**
 * マルチテナント管理のための統一インターフェース
 * 各システムでテナント管理を統一するための基盤クラス
 */
export interface TenantConfig {
    id: string;
    name: string;
    domain?: string;
    settings?: Record<string, any>;
    features?: string[];
    status: 'active' | 'inactive' | 'suspended';
}
export interface TenantContext {
    tenantId: string;
    userId?: string;
    sourceSystem: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common';
    requestId?: string;
}
export declare class UnifiedTenantManager {
    private static instance;
    private logger;
    private db;
    private redis;
    private constructor();
    /**
     * シングルトンインスタンスを取得
     */
    static getInstance(): UnifiedTenantManager;
    /**
     * テナントの存在確認
     */
    validateTenant(tenantId: string): Promise<boolean>;
    /**
     * テナント情報の取得
     */
    getTenant(tenantId: string): Promise<TenantConfig | null>;
    /**
     * テナントコンテキストの作成
     */
    createTenantContext(tenantId: string, sourceSystem: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common', userId?: string): TenantContext;
    /**
     * リクエストヘッダーからテナントコンテキストを抽出
     */
    extractTenantContextFromHeaders(headers: Record<string, string | string[] | undefined>): TenantContext | null;
    /**
     * テナントアクセスログの記録
     */
    logTenantAccess(context: TenantContext, resource: string, action: string): Promise<void>;
    /**
     * テナント固有の設定値を取得
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    getTenantSetting(tenantId: string, key: string, defaultValue?: any): Promise<any>;
    /**
     * テナント固有の機能フラグをチェック
     */
    hasTenantFeature(tenantId: string, feature: string): Promise<boolean>;
    /**
     * ヘッダー値の抽出ヘルパー
     */
    private extractHeaderValue;
    /**
     * リクエストIDの生成
     */
    private generateRequestId;
}
/**
 * 便利なファクトリー関数
 */
export declare function getTenantManager(): UnifiedTenantManager;
