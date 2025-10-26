"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenOptimizationSystem = exports.HotelCommonContextManager = exports.LanguageOptimizer = void 0;
// Core system exports
var language_optimizer_1 = require("./core/language-optimizer");
Object.defineProperty(exports, "LanguageOptimizer", { enumerable: true, get: function () { return language_optimizer_1.LanguageOptimizer; } });
var context_manager_1 = require("./core/context-manager");
Object.defineProperty(exports, "HotelCommonContextManager", { enumerable: true, get: function () { return context_manager_1.HotelCommonContextManager; } });
// Imports for internal use
const context_manager_2 = require("./core/context-manager");
const language_optimizer_2 = require("./core/language-optimizer");
class TokenOptimizationSystem {
    languageOptimizer;
    contextManager;
    config;
    constructor(config) {
        this.config = config;
        this.languageOptimizer = new language_optimizer_2.LanguageOptimizer();
        this.contextManager = new context_manager_2.HotelCommonContextManager();
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
exports.TokenOptimizationSystem = TokenOptimizationSystem;
