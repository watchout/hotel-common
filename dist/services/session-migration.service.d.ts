/**
 * セッション移行サービス
 * 既存の注文データとセッションの紐付け処理
 */
export declare class SessionMigrationService {
    /**
     * 既存注文データのセッション紐付け処理
     */
    static migrateExistingOrders(tenantId: string): Promise<{
        success: boolean;
        migratedCount: number;
        errors: string[];
    }>;
    /**
     * 注文に対応するセッションを検索
     */
    private static findSessionForOrder;
    /**
     * フォールバックセッション作成
     */
    private static createFallbackSession;
    /**
     * セッション統計情報取得
     */
    static getSessionStatistics(tenantId: string): Promise<{
        sessions: {
            total: any;
            active: any;
            completed: number;
        };
        orders: {
            total: any;
            mapped: any;
            unmapped: any;
            mappingRate: string;
        };
    }>;
    /**
     * 後方互換性チェック
     */
    static checkBackwardCompatibility(tenantId: string): Promise<{
        isCompatible: boolean;
        issues: {
            ordersWithoutSession: any;
            reservationsWithoutSession: number;
            activeReservationsNeedingSessions: number;
        };
        recommendations: string[];
    }>;
    /**
     * 互換性改善の推奨事項生成
     */
    private static generateCompatibilityRecommendations;
}
export default SessionMigrationService;
