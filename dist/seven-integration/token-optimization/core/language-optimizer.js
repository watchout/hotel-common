"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageOptimizer = void 0;
class LanguageOptimizer {
    defaultConfig = {
        thinkingLanguage: 'english',
        outputLanguage: 'japanese',
        taskType: 'complex',
        tokenBudget: 4000
    };
    async optimizePrompt(task, context, config) {
        const finalConfig = { ...this.defaultConfig, ...config };
        const optimizedPrompt = this.buildOptimizedPrompt(task, context, finalConfig);
        const estimatedTokenReduction = this.calculateTokenReduction(finalConfig);
        return {
            optimizedPrompt,
            estimatedTokenReduction,
            config: finalConfig
        };
    }
    buildOptimizedPrompt(task, context = '', config) {
        const contextSection = context ? `Context: ${context}\n\n` : '';
        switch (config.taskType) {
            case 'simple':
                return `${contextSection}Task: ${task}. Output in ${config.outputLanguage}.`;
            case 'complex':
                return `${contextSection}Think step-by-step in ${config.thinkingLanguage}:
1. Analyze: ${task}
2. Plan solution approach
3. Consider constraints and requirements

Output final result in ${config.outputLanguage} with detailed comments.`;
            case 'debug':
                return `${contextSection}Debug task in ${config.thinkingLanguage}: ${task}
Provide solution in ${config.outputLanguage} with explanation.`;
            case 'design':
                return `${contextSection}Design task in ${config.thinkingLanguage}: ${task}
Provide architecture and implementation in ${config.outputLanguage}.`;
            default:
                return `${contextSection}Task: ${task}. Output in ${config.outputLanguage}.`;
        }
    }
    calculateTokenReduction(config) {
        // トークン削減率の推定（文献2ベース）
        const baseReduction = config.thinkingLanguage === 'english' ? 0.35 : 0.45;
        const complexityMultiplier = config.taskType === 'complex' ? 1.2 : 1.0;
        return Math.min(baseReduction * complexityMultiplier, 0.5);
    }
    getOptimizationStats() {
        return {
            supportedLanguages: ['english', 'chinese', 'japanese'],
            supportedTaskTypes: ['simple', 'complex', 'debug', 'design'],
            averageTokenReduction: '30-50%'
        };
    }
}
exports.LanguageOptimizer = LanguageOptimizer;
