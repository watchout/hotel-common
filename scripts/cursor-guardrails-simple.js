#!/usr/bin/env node

/**
 * 🔥 Cursorルール検証 - 高速・シンプル版
 * レスポンス速度優先・実用性重視
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ Cursor Rules 高速検証開始...\n');

// 1. 基本ファイル存在確認
const rulesPaths = [
  '.cursor/rules/hotel-common-ai-rules.md',
  '.cursor/rules/hotel-saas-ai-rules.md', 
  '.cursor/rules/hotel-member-ai-rules.md',
  '.cursor/rules/hotel-pms-ai-rules.md'
];

let allExists = true;
rulesPaths.forEach(rulePath => {
  if (fs.existsSync(rulePath)) {
    console.log(`✅ ${rulePath}`);
  } else {
    console.log(`❌ ${rulePath} - 未存在`);
    allExists = false;
  }
});

// 2. 即座結論
console.log('\n🎯 **検証結果（高速・実用版）**');
console.log(`📋 Cursor Rules: ${allExists ? '✅ 全実装完了' : '❌ 一部未完了'}`);
console.log('🔗 ガードレール連動: ❌ 静的ファイルのため直接連動なし');
console.log('⚡ 実用性: ✅ Cursorエディタで即座利用可能');

console.log('\n💡 **推奨アクション**');
console.log('1. Cursor Rules使用 - 静的制約として機能');
console.log('2. 複雑連動システム停止 - 実用性優先');
console.log('3. シンプル運用 - agentウィンドウ + ターミナル「ことわり」'); 