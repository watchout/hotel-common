import type { ResponseTreeDto, CreateTreeRequestDto, UpdateTreeRequestDto, PublishTreeRequestDto } from '../../dtos/response-tree/response-tree.dto';
/**
 * レスポンスツリーサービス
 * ビジネスロジックを担当
 */
export declare class ResponseTreeService {
    private responseTreeRepository;
    private responseNodeRepository;
    constructor();
    /**
     * アクティブなレスポンスツリー一覧を取得
     */
    getActiveTrees(tenantId: string, language: string): Promise<ResponseTreeDto[]>;
    /**
     * レスポンスツリー詳細を取得
     */
    getTreeById(treeId: string, language: string, includeNodes: boolean): Promise<ResponseTreeDto | null>;
    /**
     * レスポンスツリーを作成
     */
    createTree(data: CreateTreeRequestDto, userId: string): Promise<ResponseTreeDto>;
    /**
     * レスポンスツリーを更新
     */
    updateTree(treeId: string, data: UpdateTreeRequestDto): Promise<ResponseTreeDto | null>;
    /**
     * レスポンスツリーを公開
     */
    publishTree(treeId: string, data: PublishTreeRequestDto, userId: string): Promise<ResponseTreeDto | null>;
}
