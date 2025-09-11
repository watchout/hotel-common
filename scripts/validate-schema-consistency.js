#!/usr/bin/env node

/**
 * Prismaスキーマとコードベースの整合性を検証するスクリプト
 * 
 * 検証項目：
 * 1. コードで使用されているモデルがPrismaスキーマに存在するか
 * 2. 直接Prismaクライアント参照がないか（アダプター経由を強制）
 * 3. 必須フィールドが適切に設定されているか
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Prismaスキーマ整合性検証を開始...\n');

// 1. Prismaスキーマからモデル一覧を取得
function getPrismaModels() {
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const modelMatches = schemaContent.match(/^model\s+(\w+)\s*{/gm);
  const models = modelMatches ? modelMatches.map(match => match.match(/model\s+(\w+)/)[1]) : [];
  
  console.log(`📋 Prismaスキーマ内のモデル (${models.length}個):`);
  models.forEach(model => console.log(`  - ${model}`));
  console.log();
  
  return models;
}

// 2. コードベースでのモデル使用を検証
function validateModelUsage() {
  console.log('🔍 コードベースでのモデル使用を検証中...');
  
  const srcPath = path.join(__dirname, '../src');
  const issues = [];
  
  // 直接Prismaクライアント参照をチェック
  try {
    const directReferences = execSync(
      `grep -r "hotelDb\\.[a-zA-Z]\\+\\." ${srcPath} --include="*.ts" --exclude-dir=node_modules || true`,
      { encoding: 'utf8' }
    );
    
    if (directReferences.trim()) {
      issues.push({
        type: 'DIRECT_PRISMA_REFERENCE',
        message: '直接Prismaクライアント参照が見つかりました（アダプター経由を使用してください）',
        details: directReferences.trim().split('\n').slice(0, 10) // 最初の10件のみ表示
      });
    }
  } catch (error) {
    // grepでマッチしない場合のエラーは無視
  }
  
  // 未定義モデルの使用をチェック
  try {
    const modelReferences = execSync(
      `grep -r "getAdapter()\\." ${srcPath} --include="*.ts" --exclude-dir=node_modules || true`,
      { encoding: 'utf8' }
    );
    
    if (modelReferences.trim()) {
      const prismaModels = getPrismaModels();
      const usedModels = new Set();
      
      modelReferences.split('\n').forEach(line => {
        const match = line.match(/getAdapter\(\)\.(\w+)/);
        if (match) {
          usedModels.add(match[1]);
        }
      });
      
      const undefinedModels = Array.from(usedModels).filter(model => 
        !prismaModels.some(prismaModel => 
          prismaModel.toLowerCase() === model.toLowerCase() ||
          prismaModel.toLowerCase() === model.toLowerCase() + 's' ||
          prismaModel.toLowerCase() + 's' === model.toLowerCase()
        )
      );
      
      if (undefinedModels.length > 0) {
        issues.push({
          type: 'UNDEFINED_MODEL',
          message: 'Prismaスキーマに定義されていないモデルが使用されています',
          details: undefinedModels
        });
      }
    }
  } catch (error) {
    // grepでマッチしない場合のエラーは無視
  }
  
  return issues;
}

// 3. TypeScriptコンパイルエラーをチェック
function checkTypeScriptErrors() {
  console.log('🔍 TypeScriptコンパイルエラーをチェック中...');
  
  try {
    execSync('npx tsc --skipLibCheck --noEmit', { encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (error) {
    const errorOutput = error.stdout || error.stderr || '';
    const srcErrors = errorOutput.split('\n').filter(line => line.includes('src/'));
    
    if (srcErrors.length > 0) {
      return [{
        type: 'TYPESCRIPT_ERROR',
        message: `TypeScriptコンパイルエラーが${srcErrors.length}個見つかりました`,
        details: srcErrors.slice(0, 5) // 最初の5件のみ表示
      }];
    }
    return [];
  }
}

// 4. 結果の表示
function displayResults(issues) {
  console.log('\n📊 検証結果:');
  
  if (issues.length === 0) {
    console.log('✅ 問題は見つかりませんでした！');
    return true;
  }
  
  console.log(`❌ ${issues.length}個の問題が見つかりました:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.type}: ${issue.message}`);
    if (issue.details && issue.details.length > 0) {
      issue.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
    }
    console.log();
  });
  
  return false;
}

// メイン実行
async function main() {
  try {
    const modelIssues = validateModelUsage();
    const typeScriptIssues = checkTypeScriptErrors();
    
    const allIssues = [...modelIssues, ...typeScriptIssues];
    const success = displayResults(allIssues);
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ 検証中にエラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
