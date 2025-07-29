export interface TokenOptimizationResult {
    originalTokens: number;
    optimizedTokens: number;
    reductionPercentage: number;
    optimizedContent: string;
    optimizationStrategies: string[];
    processingTime: number;
}
export interface OptimizationContext {
    project: string;
    fileType: string;
    intent: string;
    relevantRAG: any[];
    guardrailResults: any[];
}
/**
 * トークン最適化システム
 * 90%削減を実現する複数戦略の組み合わせ
 */
export declare class TokenOptimizer {
    private readonly TARGET_REDUCTION;
    private readonly MAX_TOKENS_PER_REQUEST;
    /**
     * メイン最適化処理
     */
    optimize(content: string, context: OptimizationContext): Promise<TokenOptimizationResult>;
    /**
     * 戦略1: 不要情報の除去
     * Custom Instructionsの冗長な指示を除去
     */
    private removeIrrelevantInfo;
    /**
     * 戦略2: RAG情報の圧縮
     * 関連情報のみを抽出・要約
     */
    private optimizeRAGContent;
    /**
     * 戦略3: コンテキスト最適化
     * プロジェクト固有情報のみに絞り込み
     */
    private optimizeContext;
    /**
     * 戦略4: プロンプト圧縮
     * 簡潔で効果的な表現に変換
     */
    private compressPrompt;
    /**
     * 戦略5: セマンティック圧縮
     * 意味を保持しながら表現を最適化
     */
    private semanticCompression;
    /**
     * 戦略6: 最終最適化
     * 仕上げの調整
     */
    private finalOptimization;
    /**
     * トークン数推定
     */
    private estimateTokens;
    /**
     * 重複品質基準除去
     */
    private removeDuplicateQualityStandards;
    /**
     * 形式的指示除去
     */
    private removeFormalInstructions;
    /**
     * RAG重要情報抽出
     */
    private extractKeyInfo;
    /**
     * ソース略語化
     */
    private abbreviateSource;
    /**
     * プロジェクト特化情報取得
     */
    private getProjectSpecificInfo;
    /**
     * ファイル種別最適化追加
     */
    private addFileTypeOptimization;
    /**
     * 意図最適化追加
     */
    private addIntentOptimization;
    /**
     * 箇条書き圧縮
     */
    private compressBulletPoints;
    /**
     * 不要な例文除去
     */
    private removeUnnecessaryExamples;
    /**
     * トークン上限強制
     */
    private enforceTokenLimit;
    /**
     * 最重要情報確保
     */
    private ensureEssentialInfo;
    /**
     * 最終品質確認
     */
    private finalQualityCheck;
    /**
     * 最重要部分抽出
     */
    private extractMostImportant;
    /**
     * 行の重要度付け
     */
    private prioritizeLines;
    /**
     * 行の重要度スコア計算
     */
    private getLineImportanceScore;
    /**
     * キーワード抽出
     */
    private extractKeywords;
}
export default TokenOptimizer;
