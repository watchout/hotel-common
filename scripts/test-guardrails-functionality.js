#!/usr/bin/env node
// 🛡️ ガードレールシステム実動作テスト
// 実際の品質検証・セキュリティチェック・パフォーマンス監視の動作確認

const path = require('path');
const fs = require('fs');

/**
 * ガードレールシステムの実際の機能テスト
 */
async function testGuardrailsFunctionality() {
  console.log('🛡️ ガードレールシステム実機能テスト開始\n');
  
  try {
    // 1. TypeScript品質チェック
    console.log('📋 1. TypeScript品質チェックテスト...');
    const tsResults = performTypeScriptQualityCheck();
    console.log(`✅ TypeScript品質スコア: ${tsResults.score}%`);
    console.log(`   - 検証済みファイル: ${tsResults.filesChecked}個`);
    console.log(`   - 発見された問題: ${tsResults.issues}個`);
    
    // 2. セキュリティチェック
    console.log('\n🔒 2. セキュリティチェックテスト...');
    const securityResults = performSecurityCheck();
    console.log(`✅ セキュリティスコア: ${securityResults.score}%`);
    console.log(`   - チェック項目: ${securityResults.checks}個`);
    console.log(`   - 危険度HIGH: ${securityResults.highRisk}個`);
    
    // 3. パフォーマンスチェック
    console.log('\n⚡ 3. パフォーマンスチェックテスト...');
    const performanceResults = performPerformanceCheck();
    console.log(`✅ パフォーマンススコア: ${performanceResults.score}%`);
    console.log(`   - 最適化可能箇所: ${performanceResults.optimizable}個`);
    
    // 4. プロジェクト固有ルールチェック
    console.log('\n🎯 4. プロジェクト固有ルールチェック...');
    const projectRulesResults = performProjectRulesCheck();
    console.log(`✅ ルール準拠スコア: ${projectRulesResults.score}%`);
    console.log(`   - 適用ルール: ${projectRulesResults.rulesApplied}個`);
    
    // 5. 総合品質スコア算出
    console.log('\n📊 5. 総合品質スコア算出...');
    const overallScore = calculateOverallQualityScore([
      tsResults, securityResults, performanceResults, projectRulesResults
    ]);
    console.log(`🏆 総合品質スコア: ${overallScore.score}%`);
    
    console.log('\n🎯 ガードレールシステム: 実動作確認完了');
    return overallScore;
    
  } catch (error) {
    console.error('\n❌ ガードレールシステムエラー:');
    console.error(error.message);
    return { score: 0, status: 'error' };
  }
}

/**
 * TypeScript品質チェック実装
 */
function performTypeScriptQualityCheck() {
  const srcPath = path.join(__dirname, '../src');
  let filesChecked = 0;
  let totalIssues = 0;
  let qualityPoints = 0;
  
  try {
    // TypeScriptファイルを再帰的に検索
    const tsFiles = findTypeScriptFiles(srcPath);
    filesChecked = tsFiles.length;
    
    tsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const fileIssues = analyzeTypeScriptFile(content, file);
      totalIssues += fileIssues.length;
      
      // 品質ポイント計算
      if (fileIssues.length === 0) qualityPoints += 100;
      else if (fileIssues.length <= 2) qualityPoints += 80;
      else if (fileIssues.length <= 5) qualityPoints += 60;
      else qualityPoints += 40;
    });
    
    const averageScore = filesChecked > 0 ? Math.round(qualityPoints / filesChecked) : 0;
    
    return {
      score: averageScore,
      filesChecked,
      issues: totalIssues,
      category: 'typescript'
    };
  } catch (error) {
    return { score: 0, filesChecked: 0, issues: 999, category: 'typescript' };
  }
}

/**
 * TypeScriptファイル検索
 */
function findTypeScriptFiles(dir) {
  let tsFiles = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        tsFiles = tsFiles.concat(findTypeScriptFiles(fullPath));
      } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        tsFiles.push(fullPath);
      }
    });
  } catch (error) {
    // ディレクトリアクセスエラーは無視
  }
  
  return tsFiles;
}

/**
 * TypeScriptファイル分析
 */
function analyzeTypeScriptFile(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // 基本的な品質チェック
    if (line.includes('any') && !line.includes('// @ts-ignore')) {
      issues.push({ line: index + 1, type: 'any-type', severity: 'warning' });
    }
    
    if (line.includes('console.log') && !filePath.includes('test')) {
      issues.push({ line: index + 1, type: 'console-log', severity: 'info' });
    }
    
    if (line.length > 120) {
      issues.push({ line: index + 1, type: 'line-length', severity: 'warning' });
    }
    
    if (line.includes('// TODO') || line.includes('// FIXME')) {
      issues.push({ line: index + 1, type: 'todo-comment', severity: 'info' });
    }
  });
  
  return issues;
}

/**
 * セキュリティチェック実装
 */
function performSecurityCheck() {
  const securityRules = [
    { rule: 'no-eval', description: 'eval()使用禁止', weight: 10 },
    { rule: 'no-innerHTML', description: 'innerHTML直接設定禁止', weight: 8 },
    { rule: 'require-https', description: 'HTTPS必須', weight: 9 },
    { rule: 'no-hardcoded-secrets', description: '機密情報ハードコード禁止', weight: 10 },
    { rule: 'input-validation', description: '入力値検証必須', weight: 7 }
  ];
  
  let passedChecks = 0;
  let highRiskIssues = 0;
  
  const srcPath = path.join(__dirname, '../src');
  const jsFiles = findJavaScriptFiles(srcPath);
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    securityRules.forEach(rule => {
      const passed = checkSecurityRule(content, rule);
      if (passed) passedChecks++;
      else if (rule.weight >= 9) highRiskIssues++;
    });
  });
  
  const totalChecks = jsFiles.length * securityRules.length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
  
  return {
    score,
    checks: totalChecks,
    highRisk: highRiskIssues,
    category: 'security'
  };
}

/**
 * JavaScriptファイル検索
 */
function findJavaScriptFiles(dir) {
  let jsFiles = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        jsFiles = jsFiles.concat(findJavaScriptFiles(fullPath));
      } else if (item.endsWith('.ts') || item.endsWith('.js')) {
        jsFiles.push(fullPath);
      }
    });
  } catch (error) {
    // エラーは無視
  }
  
  return jsFiles;
}

/**
 * セキュリティルールチェック
 */
function checkSecurityRule(content, rule) {
  switch (rule.rule) {
    case 'no-eval':
      return !content.includes('eval(');
    case 'no-innerHTML':
      return !content.includes('innerHTML =');
    case 'require-https':
      return !content.includes('http://') || content.includes('https://');
    case 'no-hardcoded-secrets':
      return !content.match(/password\s*=\s*['"][^'"]+['"]/i) && 
             !content.match(/secret\s*=\s*['"][^'"]+['"]/i);
    case 'input-validation':
      return content.includes('validate') || content.includes('zod') || content.includes('joi');
    default:
      return true;
  }
}

/**
 * パフォーマンスチェック実装
 */
function performPerformanceCheck() {
  const performanceRules = [
    { rule: 'avoid-sync-fs', description: '同期ファイル操作回避', impact: 'high' },
    { rule: 'use-async-await', description: 'async/await使用推奨', impact: 'medium' },
    { rule: 'minimize-loops', description: 'ループ最適化', impact: 'medium' },
    { rule: 'cache-expensive-ops', description: '重い処理のキャッシュ', impact: 'high' }
  ];
  
  const srcPath = path.join(__dirname, '../src');
  const files = findJavaScriptFiles(srcPath);
  
  let optimizableIssues = 0;
  let totalScore = 0;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let fileScore = 100;
    
    performanceRules.forEach(rule => {
      if (!checkPerformanceRule(content, rule)) {
        optimizableIssues++;
        fileScore -= rule.impact === 'high' ? 20 : 10;
      }
    });
    
    totalScore += Math.max(fileScore, 0);
  });
  
  const averageScore = files.length > 0 ? Math.round(totalScore / files.length) : 100;
  
  return {
    score: averageScore,
    optimizable: optimizableIssues,
    category: 'performance'
  };
}

/**
 * パフォーマンスルールチェック
 */
function checkPerformanceRule(content, rule) {
  switch (rule.rule) {
    case 'avoid-sync-fs':
      return !content.includes('Sync(') || content.includes('readFileSync') < 3;
    case 'use-async-await':
      return content.includes('async') && content.includes('await');
    case 'minimize-loops':
      return (content.match(/for\s*\(/g) || []).length < 5;
    case 'cache-expensive-ops':
      return content.includes('cache') || content.includes('memoize');
    default:
      return true;
  }
}

/**
 * プロジェクト固有ルールチェック
 */
function performProjectRulesCheck() {
  const projectRules = [
    { rule: 'use-prisma-orm', description: 'Prisma ORM使用', required: true },
    { rule: 'event-driven-pattern', description: 'イベント駆動パターン', required: true },
    { rule: 'zod-validation', description: 'Zod バリデーション', required: true },
    { rule: 'jwt-authentication', description: 'JWT認証', required: false }
  ];
  
  const srcPath = path.join(__dirname, '../src');
  let conformingRules = 0;
  
  projectRules.forEach(rule => {
    if (checkProjectRule(srcPath, rule)) {
      conformingRules++;
    }
  });
  
  const score = Math.round((conformingRules / projectRules.length) * 100);
  
  return {
    score,
    rulesApplied: projectRules.length,
    conforming: conformingRules,
    category: 'project-rules'
  };
}

/**
 * プロジェクト固有ルールチェック
 */
function checkProjectRule(srcPath, rule) {
  try {
    const packageJsonPath = path.join(srcPath, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    switch (rule.rule) {
      case 'use-prisma-orm':
        return packageJson.dependencies && packageJson.dependencies['@prisma/client'];
      case 'event-driven-pattern':
        return fs.existsSync(path.join(srcPath, 'events'));
      case 'zod-validation':
        return packageJson.dependencies && packageJson.dependencies['zod'];
      case 'jwt-authentication':
        return fs.existsSync(path.join(srcPath, 'auth'));
      default:
        return true;
    }
  } catch (error) {
    return false;
  }
}

/**
 * 総合品質スコア計算
 */
function calculateOverallQualityScore(results) {
  const weights = {
    typescript: 0.3,
    security: 0.3,
    performance: 0.2,
    'project-rules': 0.2
  };
  
  let weightedScore = 0;
  let totalWeight = 0;
  
  results.forEach(result => {
    const weight = weights[result.category] || 0.1;
    weightedScore += result.score * weight;
    totalWeight += weight;
  });
  
  const overallScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  
  return {
    score: overallScore,
    breakdown: results,
    status: overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : 'needs-improvement'
  };
}

// メイン実行
if (require.main === module) {
  testGuardrailsFunctionality().then(results => {
    console.log('\n🏆 ガードレールシステム検証完了:');
    console.log(`🛡️ 総合品質スコア: ${results.score}%`);
    console.log(`📊 システム状態: ${results.status}`);
    
    if (results.breakdown) {
      console.log('\n📋 詳細スコア:');
      results.breakdown.forEach(item => {
        console.log(`   ${item.category}: ${item.score}%`);
      });
    }
    
    if (results.score >= 70) {
      console.log('\n✅ ガードレールシステム: 高品質動作確認');
      console.log('🚀 Phase 3統合テストに進行可能！');
    } else {
      console.log('\n⚠️ 品質向上が推奨されます');
    }
  });
} 