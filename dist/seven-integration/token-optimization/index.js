// Core system exports
export { LanguageOptimizer } from './core/language-optimizer';
export { HotelCommonContextManager } from './core/context-manager';
// Imports for internal use
import { LanguageOptimizer } from './core/language-optimizer';
import { HotelCommonContextManager } from './core/context-manager';
export class TokenOptimizationSystem {
    languageOptimizer;
    contextManager;
    config;
    constructor(config) {
        this.config = config;
        this.languageOptimizer = new LanguageOptimizer();
        this.contextManager = new HotelCommonContextManager();
    }
    async optimizeRequest(request, context) {
        // コンテキスト追加
        if (context) {
            this.contextManager.addMessage(context, 'implementation');
        }
        // コンテキスト最適化
        const contextResult = this.contextManager.getOptimizedContext();
        // 言語最適化
        const languageResult = await this.languageOptimizer.optimizePrompt(request, contextResult.optimizedContext, this.config.languageOptimization);
        return {
            optimizedPrompt: languageResult.optimizedPrompt,
            tokenReduction: languageResult.estimatedTokenReduction,
            contextStats: this.contextManager.getStats()
        };
    }
    getStats() {
        return {
            language: this.languageOptimizer.getOptimizationStats(),
            context: this.contextManager.getStats(),
            projectType: this.config.projectType
        };
    }
}
