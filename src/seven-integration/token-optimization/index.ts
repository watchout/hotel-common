// Core system exports
export { LanguageOptimizer } from './core/language-optimizer';
export type {
    LanguageOptimizationConfig,
    OptimizationResult
} from './core/language-optimizer';

export { HotelCommonContextManager } from './core/context-manager';
export type {
    ContextMessage,
    ContextOptimizationResult
} from './core/context-manager';

// Imports for internal use
import { HotelCommonContextManager } from './core/context-manager';
import { LanguageOptimizer } from './core/language-optimizer';

import type { LanguageOptimizationConfig } from './core/language-optimizer';

// Main optimization system
export interface TokenOptimizationConfig {
    languageOptimization: Partial<LanguageOptimizationConfig>;
    contextManagement: {
        maxTokens?: number;
        autoOptimize?: boolean;
    };
    projectType: 'hotel-saas' | 'hotel-member' | 'hotel-pms';
}

export class TokenOptimizationSystem {
    private languageOptimizer: LanguageOptimizer;
    private contextManager: HotelCommonContextManager;
    private config: TokenOptimizationConfig;

    constructor(config: TokenOptimizationConfig) {
        this.config = config;
        this.languageOptimizer = new LanguageOptimizer();
        this.contextManager = new HotelCommonContextManager();
    }

    async optimizeRequest(request: string, context?: string): Promise<{
        optimizedPrompt: string;
        tokenReduction: number;
        contextStats: any;
    }> {
        // コンテキスト追加
        if (context) {
            this.contextManager.addMessage(context, 'implementation');
        }

        // コンテキスト最適化
        const contextResult = this.contextManager.getOptimizedContext();

        // 言語最適化
        const languageResult = await this.languageOptimizer.optimizePrompt(
            request,
            contextResult.optimizedContext,
            this.config.languageOptimization
        );

        return {
            optimizedPrompt: languageResult.optimizedPrompt,
            tokenReduction: languageResult.estimatedTokenReduction,
            contextStats: this.contextManager.getStats()
        };
    }

    getStats(): {
        language: any;
        context: any;
        projectType: string;
    } {
        return {
            language: this.languageOptimizer.getOptimizationStats(),
            context: this.contextManager.getStats(),
            projectType: this.config.projectType
        };
    }
} 