export interface CursorMessage {
    content: string;
    context: {
        project: string;
        file: string;
        selection: string;
    };
}
export interface OptimizedResponse {
    content: string;
    tokensUsed: number;
    guardrailsApplied: string[];
    ragSources: string[];
    qualityScore: number;
}
/**
 * ハイブリッドCursor統合
 * - 対話形式維持
 * - 実際のRAG検索実行
 * - 実際のガードレール適用
 * - 90%トークン削減実現
 */
export declare class HybridCursorIntegration {
    private orchestrator;
    private ragService;
    private guardrails;
    private contextExtractor;
    constructor();
    /**
     * メインの処理エントリーポイント
     * Custom Instructionsの制約を克服
     */
    processMessage(message: CursorMessage): Promise<OptimizedResponse>;
    /**
     * コンテキスト最適化抽出
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * Custom Instructionsの4,000トークンを200トークンに削減
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    private extractOptimizedContext;
    /**
     * 実際のRAG検索実行
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * hotel-common docsから関連情報を実際に検索
     */
    private performActualRAG;
    /**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     * 実際のガードレール適用
     * 「チェックせよ」ではなく実際の検証実行
     */
    private applyRealGuardrails;
    /**
     * エージェント特化処理
     * Sun/Suno/Luna個性の実際の適用
     */
    private applyAgentSpecialization;
    /**
     * トークン最適化
     * 90%削減の実現
     */
    private optimizeTokens;
    /**
     * 効果測定
     */
    private calculateMetrics;
    private detectProject;
    private detectFileType;
    private classifyIntent;
    private determineAgent;
    private applySunPersonality;
    private applySunoPersonality;
    private applyLunaPersonality;
    private fallbackResponse;
    private estimateTokens;
    private calculateQualityScore;
    private getAppliedGuardrails;
    private getRAGSources;
    private findRelevantPatterns;
    private detectTechnology;
    private assessComplexity;
    private integrateValidationResults;
    private removeIrrelevantInfo;
    private compressPrompt;
    private optimizeExpression;
}
export default HybridCursorIntegration;
