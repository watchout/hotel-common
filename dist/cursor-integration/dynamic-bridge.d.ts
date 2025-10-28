export interface ProjectContext {
    currentFile: string;
    project: string;
    recentChanges: string[];
    userQuery?: string;
}
/**
 * 動的Custom Instructions統合システム
 * agentウィンドウの利便性 + 「ことわり」システムの完全機能
 */
export declare class DynamicCursorIntegration {
    private ragService;
    private guardrails;
    private tokenOptimizer;
    private watchInterval;
    private lastContext;
    constructor();
    /**
     * バックグラウンド統合システム開始
     */
    startDynamicIntegration(): Promise<void>;
    /**
     * 統合システム停止
     */
    stopDynamicIntegration(): void;
    /**
     * 初期Custom Instructions生成
     */
    private generateInitialInstructions;
    /**
     * プロジェクトコンテキスト監視
     */
    private startContextMonitoring;
    /**
     * 現在のプロジェクト検出
     */
    private detectCurrentProject;
    /**
     * 現在のコンテキスト分析
     */
    private analyzeCurrentContext;
    /**
     * Cursorワークスペース情報取得
     */
    private getCursorWorkspaceInfo;
    /**
     * 最近の変更取得
  // eslint-disable-next-line @typescript-eslint/no-var-requires
     */
    private getRecentChanges;
    /**
     * 動的最適化実行
     */
    private performDynamicOptimization;
    /**
  // eslint-disable-next-line no-return-await
     * コンテキスト特化RAG検索
     */
    private performContextualRAG;
    /**
     * ガードレール情報生成
     */
    private generateGuardrailsInfo;
    /**
     * プロジェクト固有ルール取得
     */
    private getProjectSpecificRules;
    /**
     * 最適化情報生成
     */
    private generateOptimizationInfo;
    /**
     * 最適化Custom Instructions生成
     */
    private generateOptimizedInstructions;
    /**
     * Custom Instructions統合コンパイル
     */
    private compileOptimizedInstructions;
    /**
     * 基本指示取得
     */
    private getBaseInstructions;
    /**
     * RAG強化生成
     */
    private generateRAGEnhancement;
    /**
     * ガードレール強化生成
     */
    private generateGuardrailsEnhancement;
    /**
     * 最適化強化生成
     */
    private generateOptimizationEnhancement;
    /**
     * Custom Instructions更新
     */
    private updateCustomInstructions;
}
