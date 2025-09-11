const fs = require('fs');
const path = require('path');

// マイグレーションの問題を分析
console.log('マイグレーションの問題分析:');

// 1. マイグレーションファイルの順序を確認
const migrationDir = path.join('prisma', 'migrations');
const migrationFiles = fs.readdirSync(migrationDir)
  .filter(file => !file.endsWith('.toml'))
  .sort();

console.log('マイグレーションファイルの順序:');
migrationFiles.forEach(file => console.log(` - ${file}`));

// 2. 問題のあるマイグレーションを特定
console.log('\n問題のあるマイグレーションの特定:');

// service_usage_statistics テーブルの削除と作成を確認
try {
  const dropServiceUsageStats = fs.readFileSync(
    path.join(migrationDir, '20250731020156_add_tenant_service_management', 'migration.sql'), 
    'utf8'
  ).includes('DROP TABLE "service_usage_statistics"');

  const createServiceUsageStats = fs.readFileSync(
    path.join(migrationDir, '20250731123000_add_tenant_service_management', 'migration.sql'), 
    'utf8'
  ).includes('CREATE TABLE "service_usage_statistics"');

  console.log(` - service_usage_statistics テーブルの削除: ${dropServiceUsageStats}`);
  console.log(` - service_usage_statistics テーブルの再作成: ${createServiceUsageStats}`);
} catch (err) {
  console.log(` - ファイル読み取りエラー: ${err.message}`);
}

// Staffテーブルの定義を確認
try {
  const staffTableDefinition = fs.readFileSync(
    path.join(migrationDir, '20250728005730_add_staff_management_system', 'migration.sql'), 
    'utf8'
  ).includes('CREATE TABLE "Staff"');

  const staffPasswordFields = fs.readFileSync(
    path.join(migrationDir, '20250728005730_add_staff_management_system', 'migration.sql'), 
    'utf8'
  ).includes('"password_hash" TEXT');

  console.log(` - Staffテーブルの定義: ${staffTableDefinition}`);
  console.log(` - Staffテーブルのパスワードフィールド: ${staffPasswordFields}`);
} catch (err) {
  console.log(` - ファイル読み取りエラー: ${err.message}`);
}

// 3. スキーマとマイグレーションの不一致を確認
console.log('\n根本的な問題:');
console.log(' - マイグレーション20250731020156でservice_usage_statisticsテーブルが削除されましたが、');
console.log(' - マイグレーション20250731123000で同じテーブルが再作成されています。');
console.log(' - これにより、シャドウデータベースとの不一致が発生している可能性があります。');
console.log(' - また、Staffモデルは最初からpassword_hashフィールドを持っていましたが、');
console.log(' - スキーマファイルとの同期が取れていない可能性があります。');

console.log('\n解決策:');
console.log(' 1. service_usage_statisticsテーブルの問題を解決するために、マイグレーションをリセットする');
console.log(' 2. または、シャドウデータベースを再構築する');
console.log(' 3. スキーマとデータベースを完全に同期させる');
