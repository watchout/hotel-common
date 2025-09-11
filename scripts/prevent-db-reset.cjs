#!/usr/bin/env node

/**
 * prevent-db-reset.cjs
 * データベースリセット操作を防止するスクリプト
 * 
 * 使用方法:
 * ./scripts/prevent-db-reset.cjs [コマンド]
 * 
 * 例:
 * ./scripts/prevent-db-reset.cjs prisma generate
 */

const { execSync } = require('child_process');

// コマンドライン引数をチェック
const args = process.argv.slice(2).join(' ');

// 危険なコマンドのパターン
const dangerousPatterns = [
  'migrate reset',
  'db push --force',
  'db push --force-reset',
  '--reset',
  'rm ./prisma/dev.db',
  'drop database',
  'DROP DATABASE',
  'DELETE FROM',
  'delete from',
  'TRUNCATE',
  'truncate'
];

// 危険なコマンドが含まれているかチェック
const isDangerous = dangerousPatterns.some(pattern => args.includes(pattern));

if (isDangerous) {
  console.error('\n🚨 危険なデータベース操作が検出されました！');
  console.error('⚠️ このコマンドはデータベースをリセットする可能性があります');
  console.error('❌ 実行を中止します\n');
  console.error('✅ 安全なコマンドを使用してください:');
  console.error('  - npm run db:safe-generate  # Prismaクライアント生成');
  console.error('  - npm run db:safe-push      # スキーマ変更を安全に適用');
  console.error('  - npm run db:backup         # データベースのバックアップ\n');
  process.exit(1);
}

console.log('✅ 安全なデータベース操作を実行します');