/**
 * このスクリプトは、既存のコードをPrismaアダプターを使用するように更新するためのものです。
 * 直接Prismaクライアントを使用している箇所を、アダプターを使用するように変更します。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 検索対象のディレクトリ
const searchDirs = [
  'src',
];

// 検索対象の拡張子
const extensions = ['.ts', '.js'];

// 無視するディレクトリ
const ignoreDirs = ['node_modules', '.git', 'dist', 'build'];

// ファイルを再帰的に検索
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// ファイル内のインポート文を更新
function updateImports(filePath, dryRun = false) {
  console.log(`処理中: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changed = false;

  // PrismaClientの直接インポートをアダプターのインポートに変更
  const importRegex = /import\s+{\s*PrismaClient\s*}\s+from\s+['"]@prisma\/client['"]/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, `import { hotelDb } from '../database/prisma'`);
    changed = true;
  }

  // hotelDb.getClient()の呼び出しをhotelDb.getAdapter()に変更
  const clientRegex = /hotelDb\.getClient\(\)/g;
  if (clientRegex.test(content)) {
    content = content.replace(clientRegex, `hotelDb.getAdapter()`);
    changed = true;
  }

  // new PrismaClient()の呼び出しをhotelDb.getAdapter()に変更
  const newPrismaRegex = /new\s+PrismaClient\(/g;
  if (newPrismaRegex.test(content)) {
    content = content.replace(newPrismaRegex, `/* 注意: PrismaClientの直接インスタンス化は避けてください。代わりにhotelDb.getAdapter()を使用してください */\n  // hotelDb.getAdapter(`);
    changed = true;
  }

  if (changed) {
    if (dryRun) {
      console.log(`  変更が必要: ${filePath}`);
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  更新しました: ${filePath}`);
    }
    return true;
  } else {
    return false;
  }
}

// メイン処理
function main(dryRun = false) {
  console.log(`Prismaインポートの更新を開始します (ドライラン: ${dryRun})`);
  
  let changedFiles = 0;
  let processedFiles = 0;
  
  for (const dir of searchDirs) {
    const files = findFiles(dir);
    console.log(`${dir}ディレクトリで${files.length}個のファイルを検索します`);
    
    files.forEach(file => {
      processedFiles++;
      if (updateImports(file, dryRun)) {
        changedFiles++;
      }
    });
  }
  
  console.log(`処理完了: ${processedFiles}ファイル中${changedFiles}ファイルを更新しました`);
}

// コマンドライン引数をパース
const dryRun = process.argv.includes('--dry-run');

// スクリプト実行
main(dryRun);
