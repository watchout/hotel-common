#!/usr/bin/env node
/*
  規約違反の静的検知スクリプト。
  - res.json 直呼び
  - Prisma の誤った import (@prisma/client 以外)
  - any / as any の使用
  - StandardResponseBuilder.error(res, ...) の誤用
  - ログの誤用（endpoints 等を data 以外に直置き）
*/

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      if (/(node_modules|dist|coverage|\.git)/.test(fp)) continue;
      filelist = walk(fp, filelist);
    } else if (/\.(ts|tsx)$/.test(file)) {
      filelist.push(fp);
    }
  }
  return filelist;
}

function read(fp) {
  try {
    return fs.readFileSync(fp, 'utf8');
  } catch (_) {
    return '';
  }
}

const patterns = [
  {
    name: 'Direct res.json/res.status(...).json usage',
    regex: /\bres\.(status\s*\(\s*\d+\s*\)\s*\.)?json\s*\(/,
    hint: 'StandardResponseBuilder を使用してください',
  },
  {
    name: 'Prisma import from generated path',
    regex: /from\s+['"][^'"]*generated\/prisma[^'"]*['"]/,
    hint: "@prisma/client から import してください",
  },
  {
    name: 'Usage of any / as any',
    regex: /:\s*any\b|\bas\s+any\b/,
    hint: '暗黙的 any は禁止です（型定義を追加）',
  },
  {
    name: 'StandardResponseBuilder.error misuse with res as first arg',
    regex: /StandardResponseBuilder\.error\s*\(\s*res\s*,/,
    hint: 'error は（コード, メッセージ, 詳細, ステータス）の順で渡してください',
  },
  {
    name: 'Logger misuse: endpoints at top-level (not under data)',
    regex: /logger\.(info|error)\s*\([^,]+,\s*\{[^}]*\bendpoints\s*:/,
    hint: 'カスタム項目は data オブジェクト内に配置してください',
  },
];

const srcDir = fs.existsSync(path.join(projectRoot, 'src'))
  ? path.join(projectRoot, 'src')
  : projectRoot;

const files = walk(srcDir);
const violations = [];

for (const fp of files) {
  const content = read(fp);
  for (const p of patterns) {
    if (p.regex.test(content)) {
      violations.push({ file: fp, rule: p.name, hint: p.hint });
    }
  }
}

if (violations.length > 0) {
  console.error('規約違反が検出されました:');
  for (const v of violations) {
    console.error(`- ${v.rule}: ${path.relative(projectRoot, v.file)} (${v.hint})`);
  }
  process.exit(1);
} else {
  console.log('✅ 規約違反は検出されませんでした');
}


