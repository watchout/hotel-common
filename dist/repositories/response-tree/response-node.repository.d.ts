/**
 * レスポンスノードリポジトリ
 * データベースとのやり取りを担当
 */
export declare class ResponseNodeRepository {
    /**
     * ノード詳細を取得
     */
    findNodeById(nodeId: string, language: string): Promise<any>;
    /**
     * 子ノード一覧を取得
     */
    findChildNodes(parentId: string, language: string): Promise<any[]>;
    /**
     * ノード検索
     */
    searchNodes(query: string, treeId: string | undefined, language: string, limit: number): Promise<any[]>;
    /**
     * ノードを作成
     */
    createNode(data: {
        treeId: string;
        type: string;
        title: string;
        description?: string;
        icon?: string;
        order?: number;
        parentId?: string;
        isRoot?: boolean;
        answer?: any;
    }): Promise<any>;
    /**
     * ノード翻訳を作成
     */
    createNodeTranslation(data: {
        nodeId: string;
        language: string;
        title: string;
        answer?: any;
    }): Promise<any>;
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
    }): Promise<any>;
    /**
     * ノード翻訳を更新
     */
    updateNodeTranslation(nodeId: string, language: string, data: {
        title?: string;
        answer?: any;
    }): Promise<any>;
}
