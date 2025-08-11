/**
 * 🚀 トークン最適化システム (文献2準拠)
 * 言語切り替えによる30-50%削減
 */
export interface EfficientPromptConfig {
    taskType: 'simple' | 'complex' | 'debug' | 'design';
    internalLanguage: 'english' | 'chinese';
    outputLanguage: 'japanese' | 'english';
    tokenBudget: number;
}
export interface TokenOptimizationResult {
    originalPrompt: string;
    optimizedPrompt: string;
    estimatedTokenSaving: number;
    estimatedCostSaving: string;
    language: string;
}
/**
 * トークン効率化プロンプト生成
 */
export declare function createEfficientPrompt(task: string, context: string, config: EfficientPromptConfig): string;
/**
 * トークン使用量推定
 */
export declare function estimateTokenUsage(text: string, language: 'japanese' | 'english' | 'chinese'): number;
/**
 * hotel-common特化最適化クラス
 */
export declare class HotelCommonTokenOptimizer {
    private config;
    constructor(config?: Partial<EfficientPromptConfig>);
    optimizePrompt(task: string, context?: string): TokenOptimizationResult;
}
