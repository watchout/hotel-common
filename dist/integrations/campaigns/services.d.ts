import type { CampaignBasicInfo, CampaignDetailInfo, CampaignCreateInput, CampaignUpdateInput } from './types';
export declare class CampaignService {
    /**
     * キャンペーンの適用可能性をチェック
     */
    checkCampaignApplicability(productId: string, categoryCode: string, orderAmount: number, userId?: string): Promise<CampaignBasicInfo | null>;
    /**
     * アクティブなキャンペーンを取得
     */
    getActiveCampaigns(): Promise<CampaignBasicInfo[]>;
    /**
     * カテゴリ別キャンペーンを取得
     */
    getCampaignsByCategory(code: string, language: string): Promise<CampaignBasicInfo[]>;
    /**
     * キャンペーン一覧を取得
     * @param options 検索オプション
     * @returns キャンペーン一覧
     */
    getCampaigns(options?: {
        page?: number;
        limit?: number;
        status?: string;
        displayType?: string;
        search?: string;
    }): Promise<{
        data: CampaignBasicInfo[];
        meta: {
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    /**
     * キャンペーンを作成
     * @param data キャンペーン作成データ
     * @returns 作成されたキャンペーン
     */
    createCampaign(data: CampaignCreateInput): Promise<CampaignDetailInfo>;
    /**
     * キャンペーンを更新
     * @param id キャンペーンID
     * @param data 更新データ
     * @returns 更新されたキャンペーン
     */
    updateCampaign(id: string, data: CampaignUpdateInput): Promise<CampaignDetailInfo>;
    /**
     * キャンペーンを削除
     * @param id キャンペーンID
     */
    deleteCampaign(id: string): Promise<void>;
    /**
     * キャンペーン詳細を取得
     * @param id キャンペーンID
     * @returns キャンペーン詳細
     */
    getCampaignById(id: string): Promise<CampaignDetailInfo | null>;
}
