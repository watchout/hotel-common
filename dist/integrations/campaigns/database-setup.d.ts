/**
 * キャンペーン関連のデータベース初期設定を行う
 */
export declare function setupCampaignDatabase(): Promise<void>;
/**
 * キャンペーンデータベースの状態を確認
 */
export declare function checkCampaignDatabase(): Promise<{
    categories: number;
    campaigns: number;
    isReady: boolean;
}>;
