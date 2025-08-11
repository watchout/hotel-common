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
export function createEfficientPrompt(
  task: string, 
  context: string,
  config: EfficientPromptConfig
): string {
  
  if (config.taskType === 'simple') {
    return `Task: ${task}. Context: ${context}. Output in ${config.outputLanguage} with Japanese comments.`;
  }
  
  if (config.taskType === 'complex') {
    return `Think step-by-step in English (save tokens):
1. Analyze: ${task}
2. Design solution for: ${context}
3. Implement with hotel-common constraints

Output final result in Japanese with detailed comments.
Token budget: ${config.tokenBudget}`;
  }
  
  if (config.taskType === 'debug') {
    return `Debug efficiently in English:
Issue: ${task}
Context: ${context}
Output: Japanese solution with explanation.
Max tokens: ${config.tokenBudget}`;
  }
  
  return task; // fallback
}

/**
 * トークン使用量推定
 */
export function estimateTokenUsage(text: string, language: 'japanese' | 'english' | 'chinese'): number {
  // 文献2に基づく推定値
  const multipliers = {
    english: 1.0,
    japanese: 3.0,    // 日本語は3倍のトークン
    chinese: 0.5      // 中国語は50%のトークン
  };
  
  const baseTokens = Math.ceil(text.length / 4); // 基準：英語4文字=1トークン
  return Math.ceil(baseTokens * multipliers[language]);
}

/**
 * hotel-common特化最適化クラス
 */
export class HotelCommonTokenOptimizer {
  private config: EfficientPromptConfig;

  constructor(config: Partial<EfficientPromptConfig> = {}) {
    this.config = {
      taskType: 'complex',
      internalLanguage: 'english',
      outputLanguage: 'japanese',
      tokenBudget: 4000,
      ...config
    };
  }

  optimizePrompt(task: string, context: string = ''): TokenOptimizationResult {
    const originalPrompt = `${task}\n${context}`;
    const optimizedPrompt = createEfficientPrompt(task, context, this.config);
    
    const originalTokens = estimateTokenUsage(originalPrompt, 'japanese');
    const optimizedTokens = estimateTokenUsage(optimizedPrompt, this.config.internalLanguage);
    
    const savedTokens = originalTokens - optimizedTokens;
    const savedCostUSD = (savedTokens / 1000000) * 3.0; // $3/1M tokens
    
    return {
      originalPrompt,
      optimizedPrompt,
      estimatedTokenSaving: savedTokens,
      estimatedCostSaving: `$${savedCostUSD.toFixed(4)}`,
      language: this.config.internalLanguage
    };
  }
}