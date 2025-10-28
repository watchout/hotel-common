#!/usr/bin/env node
/**
 * 未使用変数を_接頭辞化するスクリプト（安全系のみ）
 * ランタイム非変更を保証
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 未使用変数の_接頭辞化開始...\n');

// ESLintから未使用変数エラーを取得
let eslintOutput;
try {
  eslintOutput = execSync('npx eslint "src/**/*.ts" -f json', {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
} catch (error) {
  // ESLintはエラーがある場合exit code 1を返すが、outputは取得可能
  eslintOutput = error.stdout;
}

const results = JSON.parse(eslintOutput);
const fixes = new Map(); // filePath -> [{line, column, oldName, newName}]

let totalUnused = 0;
let safeToFix = 0;

// 未使用変数を収集（関数引数のみ - 安全）
results.forEach(result => {
  const filePath = result.filePath;
  result.messages.forEach(msg => {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      totalUnused++;

      // "Allowed unused args must match /^_/u" を含む場合のみ処理（関数引数）
      if (msg.message.includes('Allowed unused args must match')) {
        const match = msg.message.match(/'([^']+)' is defined but never used/);
        if (match) {
          const varName = match[1];

          // すでに_で始まっている場合はスキップ
          if (varName.startsWith('_')) return;

          // 予約語・特殊な名前はスキップ
          if (['req', 'res', 'next', 'error', 'err', 'e'].includes(varName)) {
            safeToFix++;
            if (!fixes.has(filePath)) {
              fixes.set(filePath, []);
            }
            fixes.get(filePath).push({
              line: msg.line,
              column: msg.column,
              oldName: varName,
              newName: `_${varName}`
            });
          }
        }
      }
    }
  });
});

console.log(`📊 未使用変数統計:`);
console.log(`   - 総未使用変数: ${totalUnused}件`);
console.log(`   - 安全に修正可能（関数引数）: ${safeToFix}件`);
console.log(`   - 影響ファイル数: ${fixes.size}件\n`);

if (fixes.size === 0) {
  console.log('✅ 修正対象なし');
  process.exit(0);
}

// ファイルごとに修正
let fixedCount = 0;
fixes.forEach((fileFixes, filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 行番号でソート（降順 - 後ろから修正）
    fileFixes.sort((a, b) => b.line - a.line || b.column - a.column);

    fileFixes.forEach(fix => {
      const lineIdx = fix.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) return;

      const line = lines[lineIdx];
      // 関数引数の形式を検出: (xxx, oldName, yyy) または (oldName) など
      const patterns = [
        // 関数引数パターン
        new RegExp(`\\b${fix.oldName}\\b(?=\\s*[,)])`),
        // 分割代入パターン
        new RegExp(`\\b${fix.oldName}\\b(?=\\s*[}])`),
      ];

      let modified = false;
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          lines[lineIdx] = line.replace(pattern, fix.newName);
          modified = true;
          fixedCount++;
          break;
        }
      }

      if (!modified) {
        console.log(`⚠️  スキップ (パターン不一致): ${path.relative(process.cwd(), filePath)}:${fix.line} - ${fix.oldName}`);
      }
    });

    // ファイル書き込み
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  } catch (error) {
    console.error(`❌ エラー: ${filePath} - ${error.message}`);
  }
});

console.log(`\n✅ 完了: ${fixedCount}件の未使用変数を_接頭辞化しました`);
console.log(`\n🔍 次のコマンドで確認してください:`);
console.log(`   git diff --stat`);

