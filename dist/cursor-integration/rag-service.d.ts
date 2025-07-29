export interface RAGSearchParams {
    query: string;
    project: string;
    fileType: string;
    maxResults: number;
}
export interface RAGSearchResult {
    content: string;
    source: string;
    relevanceScore: number;
    type: 'documentation' | 'implementation' | 'best-practice';
}
export interface RAGResponse {
    results: RAGSearchResult[];
    totalFound: number;
    processingTime: number;
    tokensUsed: number;
}
/**
 * 実際のRAGシステム実装
 * hotel-common/docs から関連情報を実際に検索・抽出
 */
export declare class RealRAGService {
    private docsPath;
    private knowledgeIndex;
    private initialized;
    constructor();
    /**
     * RAGシステム初期化
     * ドキュメントインデックス作成
     */
    initialize(): Promise<void>;
    /**
     * 実際の検索実行
     * Custom Instructionsの「参照せよ」を実際の検索に置換
     */
    search(params: RAGSearchParams): Promise<RAGResponse>;
    /**
     * プロジェクト特化検索
     */
    searchProjectSpecific(project: string, query: string): Promise<RAGSearchResult[]>;
    /**
     * ベストプラクティス検索
     */
    searchBestPractices(intent: string, project: string): Promise<RAGSearchResult[]>;
    /**
     * 実装パターン検索
     */
    searchImplementationPatterns(technology: string, complexity: string): Promise<RAGSearchResult[]>;
    /**
     * ドキュメント索引化
     */
    private indexDocuments;
    /**
     * 実装パターン索引化
     */
    private indexImplementationPatterns;
    /**
     * ベストプラクティス索引化
     */
    private indexBestPractices;
    /**
     * 検索語句抽出
     */
    private extractSearchTerms;
    /**
     * ドキュメント検索
     */
    private searchDocumentation;
    /**
     * 実装検索
     */
    searchImplementations(searchTerms: string[], params: RAGSearchParams): Promise<RAGSearchResult[]>;
    /**
     * ファイル内容読み込み
     */
    private readFileContent;
    /**
     * プロジェクトドキュメント検索
     */
    private findProjectDocuments;
    private extractSections;
    private extractKeywords;
    private extractCodePatterns;
    private extractBestPractices;
    private calculateDocumentRelevance;
    private scoreAndRankResults;
    private recalculateRelevance;
    private extractRelevantContent;
    private calculateTokensUsed;
    private searchInDocuments;
    private isRelevantToBestPractice;
    private extractRelevantSection;
    private calculateRelevance;
    private isRelevantToImplementation;
    private extractImplementationPattern;
    private calculateImplementationRelevance;
    private extractCodeExample;
}
export default RealRAGService;
