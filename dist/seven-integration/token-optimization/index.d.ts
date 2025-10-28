export { LanguageOptimizer } from './core/language-optimizer';
export type { LanguageOptimizationConfig, OptimizationResult } from './core/language-optimizer';
export { HotelCommonContextManager } from './core/context-manager';
export type { ContextMessage, ContextOptimizationResult } from './core/context-manager';
import type { LanguageOptimizationConfig } from './core/language-optimizer';
export interface TokenOptimizationConfig {
    languageOptimization: Partial<LanguageOptimizationConfig>;
    contextManagement: {
        maxTokens?: number;
        autoOptimize?: boolean;
    };
    projectType: 'hotel-saas' | 'hotel-member' | 'hotel-pms';
}
export declare class TokenOptimizationSystem {
    private languageOptimizer;
    private contextManager;
    private config;
    constructor(config: TokenOptimizationConfig);
    optimizeRequest(request: string, context?: string): Promise<{
        optimizedPrompt: string;
        tokenReduction: number;
        contextStats: any;
    }>;
    getStats(): {
        language: any;
        context: any;
        projectType: string;
    };
}
