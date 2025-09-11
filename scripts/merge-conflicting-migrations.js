/**
 * 競合するマイグレーションを統合するスクリプト
 * 
 * このスクリプトは以下の手順を実行します：
 * 1. 問題のある2つのマイグレーションファイルを特定
 * 2. それらを統合した新しいマイグレーションファイルを作成
 * 3. 元のマイグレーションファイルをバックアップ
 * 
 * 使用方法:
 * $ node scripts/merge-conflicting-migrations.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// パスの設定
const MIGRATIONS_DIR = path.join(__dirname, '..', 'prisma', 'migrations');
const BACKUP_DIR = path.join(__dirname, '..', 'prisma', 'migrations_backup');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// 問題のあるマイグレーションファイルのパス
const MIGRATION1_DIR = path.join(MIGRATIONS_DIR, '20250731020156_add_tenant_service_management');
const MIGRATION2_DIR = path.join(MIGRATIONS_DIR, '20250731123000_add_tenant_service_management');
const MIGRATION1_SQL = path.join(MIGRATION1_DIR, 'migration.sql');
const MIGRATION2_SQL = path.join(MIGRATION2_DIR, 'migration.sql');

// 新しいマイグレーションディレクトリ
const NEW_MIGRATION_NAME = '20250731999999_merged_tenant_service_management';
const NEW_MIGRATION_DIR = path.join(MIGRATIONS_DIR, NEW_MIGRATION_NAME);
const NEW_MIGRATION_SQL = path.join(NEW_MIGRATION_DIR, 'migration.sql');

// バックアップディレクトリの作成
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// マイグレーションファイルが存在するか確認
if (!fs.existsSync(MIGRATION1_SQL) || !fs.existsSync(MIGRATION2_SQL)) {
  console.error('指定されたマイグレーションファイルが見つかりません。');
  process.exit(1);
}

try {
  console.log('競合するマイグレーションの統合を開始します...');
  
  // マイグレーションファイルの内容を読み込む
  const migration1Content = fs.readFileSync(MIGRATION1_SQL, 'utf8');
  const migration2Content = fs.readFileSync(MIGRATION2_SQL, 'utf8');
  
  // バックアップを作成
  const backupDir1 = path.join(BACKUP_DIR, `20250731020156_add_tenant_service_management_${TIMESTAMP}`);
  const backupDir2 = path.join(BACKUP_DIR, `20250731123000_add_tenant_service_management_${TIMESTAMP}`);
  
  fs.mkdirSync(backupDir1, { recursive: true });
  fs.mkdirSync(backupDir2, { recursive: true });
  
  fs.copyFileSync(MIGRATION1_SQL, path.join(backupDir1, 'migration.sql'));
  fs.copyFileSync(MIGRATION2_SQL, path.join(backupDir2, 'migration.sql'));
  
  console.log('元のマイグレーションファイルをバックアップしました。');
  
  // 新しいマイグレーションファイルの内容を作成
  let newMigrationContent = `-- 統合されたマイグレーション: 20250731020156_add_tenant_service_management と 20250731123000_add_tenant_service_management
-- 作成日時: ${new Date().toISOString()}
-- 注意: このマイグレーションは手動で作成されたものです

-- 以下は最初のマイグレーションから取得した内容（service_usage_statisticsの削除を除く）
`;

  // 最初のマイグレーションからservice_usage_statisticsの削除を除外
  const migration1Modified = migration1Content
    .replace(/-- DropTable\nDROP TABLE "service_usage_statistics";/g, '-- service_usage_statisticsテーブルの削除をスキップ');

  newMigrationContent += migration1Modified;
  
  newMigrationContent += `

-- 以下は2番目のマイグレーションから取得した内容
-- service_usage_statisticsテーブルの作成と関連する操作を含む

`;

  newMigrationContent += migration2Content;
  
  // 新しいマイグレーションディレクトリを作成
  console.log('注意: このスクリプトは実際にファイルを変更しません。以下の手順を手動で実行してください:');
  console.log('\n1. 以下のディレクトリを作成してください:');
  console.log(`   mkdir -p ${NEW_MIGRATION_DIR}`);
  
  console.log('\n2. 以下の内容で新しいマイグレーションファイルを作成してください:');
  console.log(`   nano ${NEW_MIGRATION_SQL}`);
  
  console.log('\n3. 以下の内容をコピーしてください:');
  console.log('-----------------------------------');
  console.log(newMigrationContent.substring(0, 500) + '...');
  console.log('-----------------------------------');
  
  console.log('\n4. 元のマイグレーションファイルを無効化するには、ディレクトリ名を変更してください:');
  console.log(`   mv ${MIGRATION1_DIR} ${MIGRATION1_DIR}_disabled`);
  console.log(`   mv ${MIGRATION2_DIR} ${MIGRATION2_DIR}_disabled`);
  
  console.log('\n5. Prismaのマイグレーション履歴を更新するには、_prisma_migrationsテーブルを確認してください。');
  
  console.log('\n注意: これらの操作を行う前に、必ずデータベースのバックアップを取ってください。');
  
  // 新しいマイグレーションファイルの内容をファイルに保存（参考用）
  const PREVIEW_FILE = path.join(__dirname, '..', 'prisma', 'merged_migration_preview.sql');
  fs.writeFileSync(PREVIEW_FILE, newMigrationContent);
  console.log(`\n新しいマイグレーションのプレビューを以下に保存しました: ${PREVIEW_FILE}`);
  
} catch (error) {
  console.error('エラーが発生しました:', error);
} finally {
  console.log('\n処理が完了しました。');
}
