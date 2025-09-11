#!/usr/bin/env node

/**
 * db-status.cjs
 * データベースの状態を確認するスクリプト
 * 
 * 使用方法:
 * node scripts/db-status.cjs
 */

const { execSync } = require('child_process');

try {
  console.log('📊 データベース状態を確認中...');
  
  // 環境変数からデータベース接続情報を取得
  const dbUrl = process.env.DATABASE_URL || 'postgresql://kaneko@localhost:5432/hotel_unified_db';
  
  try {
    const dbUrlParts = new URL(dbUrl);
    const dbName = dbUrlParts.pathname.substring(1);
    const dbUser = dbUrlParts.username;
    const dbHost = dbUrlParts.hostname;
    const dbPort = dbUrlParts.port || '5432';
    const dbPassword = dbUrlParts.password || '';
    
    // パスワードがある場合は環境変数にセット
    const pgPasswordEnv = dbPassword ? { PGPASSWORD: dbPassword } : {};
    
    // 重要なテーブルのレコード数を取得
    const tables = ['Staff', 'Tenant', 'Order', 'Room', 'RoomGrade', 'Reservation'];
    
    console.log('=== データベース情報 ===');
    console.log(`データベース: ${dbName}`);
    console.log(`ホスト: ${dbHost}:${dbPort}`);
    console.log(`ユーザー: ${dbUser}`);
    console.log('\n=== テーブル状態 ===');
    
    tables.forEach(table => {
      try {
        const result = execSync(`psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -t -c "SELECT COUNT(*) FROM \\\"${table}\\\";"`, {
          encoding: 'utf8',
          env: { ...process.env, ...pgPasswordEnv }
        });
        const count = result.trim();
        console.log(`📋 ${table}: ${count} レコード`);
      } catch (err) {
        console.log(`❌ ${table}テーブルの確認中にエラーが発生しました`);
      }
    });
    
    // データベースサイズの確認
    try {
      const sizeResult = execSync(`psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -t -c "SELECT pg_size_pretty(pg_database_size('${dbName}'));"`, {
        encoding: 'utf8',
        env: { ...process.env, ...pgPasswordEnv }
      });
      console.log(`\n💾 データベースサイズ: ${sizeResult.trim()}`);
    } catch (err) {
      console.log('❌ データベースサイズの確認中にエラーが発生しました');
    }
    
    // 最後のバックアップ情報
    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, '../prisma/backups');
    
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('db-backup-'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
        }));
      
      if (backupFiles.length > 0) {
        backupFiles.sort((a, b) => b.time - a.time);
        const latestBackup = backupFiles[0];
        const backupDate = new Date(latestBackup.time);
        console.log(`\n📅 最新のバックアップ: ${latestBackup.name} (${backupDate.toLocaleString()})`);
      } else {
        console.log('\n⚠️ バックアップが見つかりません');
      }
    } else {
      console.log('\n⚠️ バックアップディレクトリが見つかりません');
    }
    
    console.log('\n✅ データベース状態確認完了');
  } catch (error) {
    console.error('❌ データベース接続情報の解析中にエラーが発生しました:', error);
    console.error('DATABASE_URL環境変数が正しく設定されているか確認してください。');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ データベース状態確認中にエラーが発生しました:', error);
  process.exit(1);
}