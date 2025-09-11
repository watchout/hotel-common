/**
 * スキーマとデータベースを同期させるスクリプト
 * 
 * このスクリプトは以下の手順を実行します：
 * 1. 現在のスキーマをバックアップ
 * 2. 実際のデータベース構造からスキーマを生成
 * 3. 生成されたスキーマと現在のスキーマの差分を表示
 * 4. 同期のためのマイグレーションを提案
 * 
 * 使用方法:
 * $ node scripts/sync-schema-database.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// パスの設定
const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const BACKUP_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma.sync-backup');
const PULLED_SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.pulled.prisma');
const DIFF_PATH = path.join(__dirname, '..', 'prisma', 'schema.diff.txt');

// バックアップの作成
console.log('現在のスキーマをバックアップ中...');
fs.copyFileSync(SCHEMA_PATH, BACKUP_PATH);
console.log(`スキーマをバックアップしました: ${BACKUP_PATH}`);

try {
  // データベースからスキーマを生成
  console.log('\nデータベースからスキーマを生成中...');
  console.log('注意: このスクリプトは実際にコマンドを実行しません。以下のコマンドを手動で実行してください:');
  
  console.log('\n1. データベースからスキーマを生成:');
  console.log(`   npx prisma db pull --schema=${PULLED_SCHEMA_PATH}`);
  
  console.log('\n2. 生成されたスキーマと現在のスキーマを比較:');
  console.log(`   diff ${SCHEMA_PATH} ${PULLED_SCHEMA_PATH} > ${DIFF_PATH}`);
  
  console.log('\n3. 差分を確認:');
  console.log(`   cat ${DIFF_PATH}`);
  
  console.log('\n4. スキーマを同期させるためのマイグレーションを作成:');
  console.log('   npx prisma migrate dev --name sync_schema_with_database');
  
  // 同期のための詳細な手順
  console.log('\n詳細な同期手順:');
  console.log('1. データベースからスキーマを生成し、差分を確認');
  console.log('2. 差分に基づいて、必要な変更を schema.prisma に手動で適用');
  console.log('3. 変更を適用した後、新しいマイグレーションを作成');
  console.log('4. 生成されたマイグレーションファイルを確認し、必要に応じて調整');
  console.log('5. マイグレーションをテスト環境に適用してテスト');
  console.log('6. 問題がなければ、本番環境に適用');
  
  console.log('\n特に注意が必要な点:');
  console.log('- service_usage_statistics テーブルの構造の違い');
  console.log('- Staff テーブルのフィールドの違い');
  console.log('- テーブル名とモデル名の命名規則の不一致（PascalCase vs snake_case）');
  
} catch (error) {
  console.error('エラーが発生しました:', error);
  // バックアップから復元
  console.log('バックアップからスキーマを復元しています...');
  fs.copyFileSync(BACKUP_PATH, SCHEMA_PATH);
  console.log('スキーマを復元しました。');
} finally {
  console.log('\n処理が完了しました。');
  console.log('スキーマとデータベースの同期に関する詳細は、docs/database/migration-issue-analysis.md を参照してください。');
}
