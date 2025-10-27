#!/usr/bin/env node
/**
 * catch句の型指定スクリプト（安全系のみ）
 * Implicit any in catch clause → catch (error: Error)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 catch句の型指定開始...\n');

// ESLintからcatch句エラーを取得
let eslintOutput;
try {
  eslintOutput = execSync('npx eslint "src/**/*.ts" -f json', {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
} catch (error) {
  eslintOutput = error.stdout;
}

const results = JSON.parse(eslintOutput);
const fixes = new Map(); // filePath -> [{line, column}]

let totalCatch = 0;
let safeToFix = 0;

// catch句エラーを収集
results.forEach(result => {
  const filePath = result.filePath;
  result.messages.forEach(msg => {
    if (msg.ruleId === '@typescript-eslint/no-implicit-any-catch') {
      totalCatch++;

      if (!fixes.has(filePath)) {
        fixes.set(filePath, []);
      }
      fixes.get(filePath).push({
        line: msg.line,
        column: msg.column
      });
      safeToFix++;
    }
  });
});

console.log(`📊 catch句統計:`);
console.log(`   - 総catch句エラー: ${totalCatch}件`);
console.log(`   - 修正対象: ${safeToFix}件`);
console.log(`   - 影響ファイル数: ${fixes.size}件\n`);

if (fixes.size === 0) {
  console.log('✅ 修正対象なし');
  process.exit(0);
}

// ファイルごとに修正
let fixedCount = 0;
let skippedCount = 0;

fixes.forEach((fileFixes, filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 行番号でソート（降順 - 後ろから修正）
    fileFixes.sort((a, b) => b.line - a.line);

    fileFixes.forEach(fix => {
      const lineIdx = fix.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) return;

      const line = lines[lineIdx];

      // catch句のパターン検出
      // Pattern 1: } catch (error) {
      // Pattern 2: } catch (e) {
      // Pattern 3: } catch (err) {
      const patterns = [
        { regex: /}\s*catch\s*\(\s*error\s*\)\s*{/, replacement: '} catch (error: unknown) {' },
        { regex: /}\s*catch\s*\(\s*e\s*\)\s*{/, replacement: '} catch (e: unknown) {' },
        { regex: /}\s*catch\s*\(\s*err\s*\)\s*{/, replacement: '} catch (err: unknown) {' },
        { regex: /catch\s*\(\s*error\s*\)\s*{/, replacement: 'catch (error: unknown) {' },
        { regex: /catch\s*\(\s*e\s*\)\s*{/, replacement: 'catch (e: unknown) {' },
        { regex: /catch\s*\(\s*err\s*\)\s*{/, replacement: 'catch (err: unknown) {' }
      ];

      let modified = false;
      for (const pattern of patterns) {
        if (pattern.regex.test(line)) {
          lines[lineIdx] = line.replace(pattern.regex, pattern.replacement);
          modified = true;
          fixedCount++;
          break;
        }
      }

      if (!modified) {
        console.log(`⚠️  スキップ (パターン不一致): ${path.relative(process.cwd(), filePath)}:${fix.line}`);
        skippedCount++;
      }
    });

    // ファイル書き込み
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  } catch (error) {
    console.error(`❌ エラー: ${filePath} - ${error.message}`);
  }
});

console.log(`\n✅ 完了: ${fixedCount}件のcatch句に型指定を追加しました`);
console.log(`⚠️  スキップ: ${skippedCount}件`);
console.log(`\n🔍 次のコマンドで確認してください:`);
console.log(`   git diff --stat`);

