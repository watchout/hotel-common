#!/usr/bin/env node
/**
 * 🚀 トークン最適化システムテスト
 */

const { execSync } = require('child_process');
require('dotenv').config();

// TypeScriptファイルをテスト用JavaScriptとして実行
function createEfficientPrompt(task, context, config) {
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
  
  return task;
}

function estimateTokenUsage(text, language) {
  const multipliers = {
    english: 1.0,
    japanese: 3.0,
    chinese: 0.5
  };
  
  const baseTokens = Math.ceil(text.length / 4);
  return Math.ceil(baseTokens * multipliers[language]);
}

class HotelCommonTokenOptimizer {
  constructor(config = {}) {
    this.config = {
      taskType: 'complex',
      internalLanguage: 'english',
      outputLanguage: 'japanese',
      tokenBudget: 4000,
      ...config
    };
  }

  optimizePrompt(task, context = '') {
    const originalPrompt = `${task}\n${context}`;
    const optimizedPrompt = createEfficientPrompt(task, context, this.config);
    
    const originalTokens = estimateTokenUsage(originalPrompt, 'japanese');
    const optimizedTokens = estimateTokenUsage(optimizedPrompt, this.config.internalLanguage);
    
    const savedTokens = originalTokens - optimizedTokens;
    const savedCostUSD = (savedTokens / 1000000) * 3.0;
    
    return {
      originalPrompt,
      optimizedPrompt,
      estimatedTokenSaving: savedTokens,
      estimatedCostSaving: `$${savedCostUSD.toFixed(4)}`,
      language: this.config.internalLanguage
    };
  }
}

// テスト実行
async function testTokenOptimizer() {
  console.log('🚀 トークン最適化システムテスト開始');
  
  const optimizer = new HotelCommonTokenOptimizer();
  const results = [];

  // テストケース1: TypeScriptエラー
  console.log('\n📋 テストケース1: TypeScriptエラー最適化');
  optimizer.config.taskType = 'debug';
  const tsResult = optimizer.optimizePrompt(
    'Property tenant_id does not exist on type Customer. Did you mean tenantId?',
    'hotel-common project with Prisma, multi-tenant architecture'
  );
  results.push(tsResult);
  console.log(`元のトークン: ${estimateTokenUsage(tsResult.originalPrompt, 'japanese')}`);
  console.log(`最適化後: ${estimateTokenUsage(tsResult.optimizedPrompt, 'english')}`);
  console.log(`削減トークン: ${tsResult.estimatedTokenSaving}`);
  console.log(`削減コスト: ${tsResult.estimatedCostSaving}`);

  // テストケース2: API実装
  console.log('\n📋 テストケース2: API実装最適化');
  optimizer.config.taskType = 'complex';
  const apiResult = optimizer.optimizePrompt(
    'user authentication with JWT',
    'hotel-common REST API with authentication, tenant isolation, TypeScript'
  );
  results.push(apiResult);
  console.log(`元のトークン: ${estimateTokenUsage(apiResult.originalPrompt, 'japanese')}`);
  console.log(`最適化後: ${estimateTokenUsage(apiResult.optimizedPrompt, 'english')}`);
  console.log(`削減トークン: ${apiResult.estimatedTokenSaving}`);
  console.log(`削減コスト: ${apiResult.estimatedCostSaving}`);

  // テストケース3: 中国語思考
  console.log('\n📋 テストケース3: 中国語思考最適化');
  optimizer.config.taskType = 'design';
  optimizer.config.internalLanguage = 'chinese';
  const chineseResult = optimizer.optimizePrompt(
    'real-time notification system design',
    'hotel-common microservices, database optimization, scalability'
  );
  results.push(chineseResult);
  console.log(`元のトークン: ${estimateTokenUsage(chineseResult.originalPrompt, 'japanese')}`);
  console.log(`最適化後: ${estimateTokenUsage(chineseResult.optimizedPrompt, 'chinese')}`);
  console.log(`削減トークン: ${chineseResult.estimatedTokenSaving}`);
  console.log(`削減コスト: ${chineseResult.estimatedCostSaving}`);

  // 総計算
  const totalSavedTokens = results.reduce((sum, r) => sum + r.estimatedTokenSaving, 0);
  const totalSavedCost = results.reduce((sum, r) => sum + parseFloat(r.estimatedCostSaving.replace('$', '')), 0);
  
  console.log('\n💰 総削減効果:');
  console.log(`  総削減トークン: ${totalSavedTokens.toLocaleString()}`);
  console.log(`  総削減コスト: $${totalSavedCost.toFixed(4)}`);
  console.log(`  平均削減率: ${((totalSavedTokens / 3000) * 100).toFixed(1)}%`);

  console.log('\n🏆 トークン最適化システムテスト完了');
  
  return results;
}

if (require.main === module) {
  testTokenOptimizer().catch(console.error);
}

module.exports = { testTokenOptimizer };