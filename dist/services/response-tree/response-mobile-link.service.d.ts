import type { CreateMobileLinkRequestDto, MobileLinkDto, ConnectMobileLinkRequestDto } from '../../dtos/response-tree/response-tree.dto';
/**
 * レスポンスモバイル連携サービス
 * ビジネスロジックを担当
 */
export declare class ResponseMobileLinkService {
    private responseMobileLinkRepository;
    private responseSessionRepository;
    constructor();
    /**
     * モバイル連携を作成
     */
    createMobileLink(data: CreateMobileLinkRequestDto): Promise<MobileLinkDto>;
    /**
     * モバイル連携を取得
     */
    getMobileLink(linkCode: string): Promise<any>;
    /**
     * モバイル連携を実行
     */
    connectMobileLink(linkCode: string, data: ConnectMobileLinkRequestDto): Promise<any>;
    /**
     * QRコード画像を生成
     */
    generateQRCode(linkCode: string): Promise<Buffer>;
}
