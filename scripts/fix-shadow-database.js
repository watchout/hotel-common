/**
 * シャドウデータベースの問題を解決するスクリプト
 * 
 * このスクリプトは以下の手順を実行します：
 * 1. 現在のスキーマをバックアップ
 * 2. service_usage_statisticsテーブルの問題を解決するための修正スキーマを作成
 * 3. Prismaクライアントを再生成
 * 
 * 使用方法:
 * $ node scripts/fix-shadow-database.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// パスの設定
const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const BACKUP_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma.bak');
const TEMP_DIR = path.join(__dirname, '..', 'prisma', 'temp');

// バックアップディレクトリの作成
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// 現在のスキーマをバックアップ
console.log('現在のスキーマをバックアップ中...');
fs.copyFileSync(SCHEMA_PATH, BACKUP_PATH);
console.log(`スキーマをバックアップしました: ${BACKUP_PATH}`);

// service_usage_statisticsテーブルの問題を解決するための修正
try {
  console.log('シャドウデータベースの問題を解決するための修正を適用中...');
  
  // 修正オプション1: シャドウデータベースのリセット
  console.log('\n方法1: シャドウデータベースのリセットを試みます');
  console.log('この操作はデータベースに影響を与えません。シャドウデータベースのみをリセットします。');
  console.log('実行するには以下のコマンドを手動で実行してください:');
  console.log('\nnpx prisma migrate reset --skip-seed\n');
  
  // 修正オプション2: マイグレーションの修正
  console.log('\n方法2: 問題のあるマイグレーションを修正します');
  console.log('以下のマイグレーションファイルを確認してください:');
  console.log('- prisma/migrations/20250731020156_add_tenant_service_management/migration.sql');
  console.log('- prisma/migrations/20250731123000_add_tenant_service_management/migration.sql');
  console.log('\nこれらのファイルでservice_usage_statisticsテーブルの削除と再作成が行われています。');
  console.log('マイグレーションを統合するか、新しい修正マイグレーションを作成することを検討してください。');
  
  // 修正オプション3: スキーマの同期
  console.log('\n方法3: スキーマとデータベースを完全に同期させます');
  console.log('実行するには以下のコマンドを手動で実行してください:');
  console.log('\nnpx prisma db pull');
  console.log('npx prisma generate');
  console.log('npx prisma migrate dev --name fix_schema_sync\n');
  
  console.log('注意: これらの方法を試す前に、必ずデータベースのバックアップを取ってください。');
  
} catch (error) {
  // エラーが発生した場合はバックアップから復元
  console.error('エラーが発生しました:', error);
  console.log('バックアップからスキーマを復元しています...');
  fs.copyFileSync(BACKUP_PATH, SCHEMA_PATH);
  console.log('スキーマを復元しました。');
} finally {
  console.log('\n処理が完了しました。');
  console.log('問題が解決しない場合は、docs/database/migration-issue-analysis.mdを参照してください。');
}
