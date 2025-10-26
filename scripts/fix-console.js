#!/usr/bin/env node
/**
 * console→HotelLogger置換スクリプト（安全系のみ）
 * 既存のloggerインスタンスがある場合のみ置換
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 console→HotelLogger置換開始...\n');

// ESLintからconsoleエラーを取得
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
const consoleErrors = new Map(); // filePath -> [{line, message}]

let totalConsole = 0;

// consoleエラーを収集
results.forEach(result => {
  const filePath = result.filePath;
  result.messages.forEach(msg => {
    if (msg.ruleId === 'no-console') {
      totalConsole++;
      
      if (!consoleErrors.has(filePath)) {
        consoleErrors.set(filePath, []);
      }
      consoleErrors.get(filePath).push({
        line: msg.line,
        column: msg.column,
        message: msg.message
      });
    }
  });
});

console.log(`📊 console統計:`);
console.log(`   - 総console使用: ${totalConsole}件`);
console.log(`   - 影響ファイル数: ${consoleErrors.size}件\n`);

if (consoleErrors.size === 0) {
  console.log('✅ 修正対象なし');
  process.exit(0);
}

// ファイルごとに処理
let fixedCount = 0;
let skippedCount = 0;
let addedImportCount = 0;

consoleErrors.forEach((errors, filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // loggerが既に定義されているか確認
    const hasLogger = /const logger = |const\s+\w+\s*=\s*HotelLogger|import.*HotelLogger/.test(content);
    
    if (!hasLogger) {
      // HotelLoggerのimportを追加
      let importAdded = false;
      for (let i = 0; i < lines.length; i++) {
        // 最初のimport文の後に追加
        if (lines[i].startsWith('import ') && !importAdded) {
          // 既存のimportの後を探す
          let lastImportIdx = i;
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].startsWith('import ') || lines[j].startsWith('import{') || lines[j].trim() === '') {
              lastImportIdx = j;
            } else {
              break;
            }
          }
          
          // HotelLoggerのimportを追加
          const relativePath = path.relative(path.dirname(filePath), path.join(path.dirname(filePath), '../utils/logger'));
          const depth = (filePath.match(/\//g) || []).length - (process.cwd().match(/\//g) || []).length - 2;
          const prefix = depth > 0 ? '../'.repeat(depth) : './';
          
          lines.splice(lastImportIdx + 1, 0, `import { HotelLogger } from '${prefix}utils/logger'`);
          importAdded = true;
          addedImportCount++;
          
          // loggerインスタンスを追加（importの後、空行の後）
          let insertIdx = lastImportIdx + 2;
          while (insertIdx < lines.length && lines[insertIdx].trim() === '') {
            insertIdx++;
          }
          lines.splice(insertIdx, 0, 'const logger = HotelLogger.getInstance()');
          break;
        }
      }
      
      if (!importAdded) {
        console.log(`⚠️  スキップ (import追加失敗): ${path.relative(process.cwd(), filePath)}`);
        skippedCount += errors.length;
        return;
      }
      
      // 再パース
      content = lines.join('\n');
    }
    
    // console → loggerに置換
    errors.forEach(error => {
      const lineIdx = error.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) return;
      
      const line = lines[lineIdx];
      
      // console.log → logger.info
      // console.error → logger.error
      // console.warn → logger.warn
      // console.debug → logger.debug
      
      if (/console\.log\(/.test(line)) {
        lines[lineIdx] = line.replace(/console\.log\(/g, 'logger.info(');
        fixedCount++;
      } else if (/console\.error\(/.test(line)) {
        lines[lineIdx] = line.replace(/console\.error\(/g, 'logger.error(');
        fixedCount++;
      } else if (/console\.warn\(/.test(line)) {
        lines[lineIdx] = line.replace(/console\.warn\(/g, 'logger.warn(');
        fixedCount++;
      } else if (/console\.debug\(/.test(line)) {
        lines[lineIdx] = line.replace(/console\.debug\(/g, 'logger.debug(');
        fixedCount++;
      } else if (/console\.info\(/.test(line)) {
        lines[lineIdx] = line.replace(/console\.info\(/g, 'logger.info(');
        fixedCount++;
      } else {
        console.log(`⚠️  スキップ (不明なパターン): ${path.relative(process.cwd(), filePath)}:${error.line}`);
        skippedCount++;
      }
    });
    
    // ファイル書き込み
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  } catch (error) {
    console.error(`❌ エラー: ${filePath} - ${error.message}`);
    skippedCount += consoleErrors.get(filePath).length;
  }
});

console.log(`\n✅ 完了: ${fixedCount}件のconsoleをloggerに置換しました`);
console.log(`📦 追加: ${addedImportCount}ファイルにHotelLogger importを追加`);
console.log(`⚠️  スキップ: ${skippedCount}件`);
console.log(`\n🔍 次のコマンドで確認してください:`);
console.log(`   git diff --stat`);

