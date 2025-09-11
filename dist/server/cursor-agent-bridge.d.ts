/**
 * 🎯 Cursor Agent Bridge - agentウィンドウ自動実行システム
 *
 * agentウィンドウから入力 → 自動RAG・ガードレール実行 → 最適化回答
 */
interface OptimizationResult {
    ragResults: any[];
    guardrailsResults: any;
    tokenOptimization: any;
    finalResponse: string;
    executionTime: number;
}
export declare class CursorAgentBridge {
    private projectContext;
    constructor();
    /**
     * プロジェクトコンテキストの自動検出
     */
    private detectProjectContext;
    private determineContext;
    /**
     * agentウィンドウからの入力を処理
     */
    processAgentInput(userInput: string): Promise<OptimizationResult>;
    /**
     * RAG検索の実行
     */
    private executeRAGSearch;
    /**
     * ガードレール検証の実行
     */
    private executeGuardrails;
    /**
     * トークン最適化の実行
     */
    private executeTokenOptimization;
    /**
     * 最適化された回答の生成
     */
    private generateOptimizedResponse;
    private fileExists;
    private getHotelCommonPath;
    private parseRAGResults;
    private parseGuardrailsResults;
    private determineTaskType;
    private compressContext;
    private estimateTokenUsage;
}
export {};
