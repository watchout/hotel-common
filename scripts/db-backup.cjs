#!/usr/bin/env node

/**
 * db-backup.cjs
 * データベースのバックアップを作成するスクリプト
 * 
 * 使用方法:
 * node scripts/db-backup.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 現在の日時を取得してバックアップファイル名を生成
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, '../prisma/backups');
const backupFileName = `db-backup-${timestamp}.sql`;
const backupPath = path.join(backupDir, backupFileName);

// バックアップディレクトリが存在しない場合は作成
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  // PostgreSQLデータベースのバックアップを作成
  console.log('📦 データベースバックアップを作成中...');
  
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
    
    // pg_dumpコマンドを実行
    execSync(`pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -f ${backupPath}`, {
      stdio: 'inherit',
      env: { ...process.env, ...pgPasswordEnv }
    });
    
    console.log(`✅ バックアップが正常に作成されました: ${backupPath}`);
    
    // 古いバックアップファイルを削除（最新の5つだけ保持）
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('db-backup-'))
      .map(file => path.join(backupDir, file));
    
    if (files.length > 5) {
      files.sort((a, b) => {
        return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
      });
      
      // 最新の5つを除いて削除
      const filesToDelete = files.slice(5);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file);
        console.log(`🗑️ 古いバックアップを削除しました: ${path.basename(file)}`);
      });
    }
  } catch (error) {
    console.error('❌ データベース接続情報の解析中にエラーが発生しました:', error);
    console.error('DATABASE_URL環境変数が正しく設定されているか確認してください。');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ バックアップ作成中にエラーが発生しました:', error);
  process.exit(1);
}