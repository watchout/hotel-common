#!/usr/bin/env node

/**
 * Prismaスキーマとアダプターレイヤーの不一致を検出するスクリプト
 * 
 * 使用方法:
 * node scripts/detect-prisma-adapter-mismatch.js
 */

const fs = require('fs');
const path = require('path');

// ファイルパス
const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');
const ADAPTER_PATH = path.join(__dirname, '../src/database/prisma-adapter.ts');

// スキーマファイルを読み込む
const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
const adapterContent = fs.readFileSync(ADAPTER_PATH, 'utf8');

// モデル名を抽出する正規表現
const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{/g;
const getterRegex = /get\s+([A-Za-z0-9_]+)\(\)\s*\{/g;

// スキーマからモデル名を抽出
const models = [];
let match;
while ((match = modelRegex.exec(schemaContent)) !== null) {
  models.push(match[1]);
}

// アダプターからゲッター名を抽出
const getters = [];
while ((match = getterRegex.exec(adapterContent)) !== null) {
  getters.push(match[1]);
}

// モデル名をキャメルケースに変換する関数
function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// スネークケースをキャメルケースに変換する関数
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 不一致を検出
const missingGetters = [];
models.forEach(model => {
  // モデル名がPascalCaseの場合はキャメルケースに変換
  const camelCaseModel = toCamelCase(model);
  // モデル名がスネークケースの場合はキャメルケースに変換
  const snakeCaseModel = snakeToCamel(model.toLowerCase());
  
  // どちらの形式でもゲッターが存在しない場合は不一致とみなす
  if (!getters.includes(camelCaseModel) && !getters.includes(snakeCaseModel)) {
    missingGetters.push({
      model,
      suggestedGetter: camelCaseModel
    });
  }
});

// 結果を表示
if (missingGetters.length > 0) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️ アダプターレイヤーに不足しているゲッターが見つかりました:');
  missingGetters.forEach(item => {
    console.log(`  - モデル: ${item.model}, 推奨ゲッター名: ${item.suggestedGetter}`);
  });
  
  console.log('\n\x1b[33m%s\x1b[0m', '以下のコードをsrc/database/prisma-adapter.tsに追加してください:');
  missingGetters.forEach(item => {
    console.log(`
// PrismaAdapterクラス内に追加
get ${item.suggestedGetter}() {
  return this.prisma.${item.model.toLowerCase()};
}

// TransactionAdapterクラス内に追加
get ${item.suggestedGetter}() {
  return this.tx.${item.model.toLowerCase()};
}
`);
  });
  
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ すべてのPrismaモデルにアダプターゲッターが存在します');
  process.exit(0);
}

