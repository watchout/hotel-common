/**
 * 🔗 プロンプトチェーン最適化システム (文献7準拠)
 * Tree of Thought・区切り文字・出力例提供
 */
export interface PromptChainConfig {
    taskType: 'simple' | 'complex' | 'design' | 'debug' | 'analysis';
    cotEnabled: boolean;
    useDelimiters: boolean;
    includeExamples: boolean;
    reasoningLevel: 'basic' | 'advanced' | 'expert';
}
export interface ChainOfThoughtStep {
    stepNumber: number;
    title: string;
    description: string;
    questions: string[];
    expectedOutput: string;
}
export interface PromptChainResult {
    originalPrompt: string;
    optimizedPrompt: string;
    cotSteps: ChainOfThoughtStep[];
    delimitersUsed: string[];
    examplesIncluded: number;
}
/**
 * Chain of Thought（CoT）テンプレート生成
 */
export declare class ChainOfThoughtBuilder {
    static buildHotelCommonCoT(taskType: string, context: string): ChainOfThoughtStep[];
    static formatCoTPrompt(steps: ChainOfThoughtStep[], originalTask: string): string;
}
/**
 * 区切り文字システム
 */
export declare class DelimiterSystem {
    private delimiters;
    structurePrompt(context: string, task: string, style?: string, audience?: string, format?: string, data?: string, constraints?: string[], examples?: string[]): string;
}
/**
 * 出力例データベース
 */
export declare class ExamplesDatabase {
    private static hotelCommonExamples;
    static getExamples(taskType: string, count?: number): string[];
    static formatExamples(examples: string[]): string;
}
/**
 * プロンプトチェーン最適化メインクラス
 */
export declare class PromptChainOptimizer {
    private config;
    private delimiterSystem;
    constructor(config?: Partial<PromptChainConfig>);
    optimizePrompt(task: string, context?: string): PromptChainResult;
}
