import { ResponseNodeDto, ResponseNodeDetailDto, ResponseNodeSearchResultDto, CreateNodeRequestDto } from '../../dtos/response-tree/response-tree.dto';
/**
 * レスポンスノードサービス
 * ビジネスロジックを担当
 */
export declare class ResponseNodeService {
    private responseNodeRepository;
    constructor();
    /**
     * ノード詳細を取得
     */
    getNodeById(nodeId: string, language: string, includeChildren: boolean): Promise<ResponseNodeDetailDto | null>;
    /**
     * 子ノード一覧を取得
     */
    getChildNodes(nodeId: string, language: string): Promise<ResponseNodeDto[]>;
    /**
     * ノード検索
     */
    searchNodes(query: string, treeId: string | undefined, language: string, limit: number): Promise<ResponseNodeSearchResultDto[]>;
    /**
     * ノードを作成
     */
    createNode(treeId: string, data: CreateNodeRequestDto): Promise<ResponseNodeDto>;
    /**
     * ノードを更新
     */
    updateNode(nodeId: string, data: {
        title?: string;
        description?: string;
        icon?: string;
        order?: number;
        parentId?: string;
        answer?: any;
        translations?: Array<{
            language: string;
            title: string;
            answer?: any;
        }>;
    }): Promise<ResponseNodeDto | null>;
}
