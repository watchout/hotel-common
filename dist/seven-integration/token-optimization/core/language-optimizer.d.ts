export interface LanguageOptimizationConfig {
    thinkingLanguage: 'english' | 'chinese';
    outputLanguage: 'japanese' | 'english';
    taskType: 'simple' | 'complex' | 'debug' | 'design';
    tokenBudget?: number;
}
export interface OptimizationResult {
    optimizedPrompt: string;
    estimatedTokenReduction: number;
    config: LanguageOptimizationConfig;
}
export declare class LanguageOptimizer {
    private readonly defaultConfig;
    optimizePrompt(task: string, context?: string, config?: Partial<LanguageOptimizationConfig>): Promise<OptimizationResult>;
    private buildOptimizedPrompt;
    private calculateTokenReduction;
    getOptimizationStats(): {
        supportedLanguages: string[];
        supportedTaskTypes: string[];
        averageTokenReduction: string;
    };
}
