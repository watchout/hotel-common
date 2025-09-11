/**
 * レスポンスツリーリポジトリ
 * データベースとのやり取りを担当
 */
export declare class ResponseTreeRepository {
    /**
     * アクティブなレスポンスツリー一覧を取得
     */
    findActiveTrees(tenantId: string): Promise<any[]>;
    /**
     * レスポンスツリー詳細を取得
     */
    findTreeById(treeId: string): Promise<any>;
    /**
     * ルートノードを取得
     */
    findRootNodes(treeId: string, language: string): Promise<any[]>;
    /**
     * レスポンスツリーを作成
     */
    createTree(data: {
        name: string;
        description?: string;
        tenantId: string;
        isActive: boolean;
    }): Promise<any>;
    /**
     * レスポンスツリーを更新
     */
    updateTree(treeId: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<any>;
    /**
     * レスポンスツリーを公開
     */
    publishTree(treeId: string): Promise<any>;
    /**
     * レスポンスツリーバージョンを作成
     */
    createTreeVersion(data: {
        treeId: string;
        version: number;
        data: any;
        createdBy: string;
        comment?: string;
    }): Promise<any>;
}
