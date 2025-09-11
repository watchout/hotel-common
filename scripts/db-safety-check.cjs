#!/usr/bin/env node

/**
 * db-safety-check.cjs
 * データベース操作の安全性をチェックするスクリプト
 * 
 * 使用方法:
 * node scripts/db-safety-check.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 安全性チェック関数
async function checkDatabaseSafety() {
  console.log('🔍 データベース安全性チェックを実行中...');
  
  // 1. 環境変数のチェック
  console.log('\n📋 環境変数チェック:');
  const envVars = ['DATABASE_URL'];
  let envErrors = 0;
  
  envVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`❌ ${varName} 環境変数が設定されていません`);
      envErrors++;
    } else {
      console.log(`✅ ${varName} 環境変数が設定されています`);
    }
  });
  
  // 2. データベース接続チェック
  console.log('\n📋 データベース接続チェック:');
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const dbUrlParts = new URL(dbUrl);
      const dbName = dbUrlParts.pathname.substring(1);
      const dbUser = dbUrlParts.username;
      const dbHost = dbUrlParts.hostname;
      const dbPort = dbUrlParts.port || '5432';
      const dbPassword = dbUrlParts.password || '';
      
      // パスワードがある場合は環境変数にセット
      const pgPasswordEnv = dbPassword ? { PGPASSWORD: dbPassword } : {};
      
      // 接続テスト
      execSync(`psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -c "SELECT 1;"`, {
        stdio: 'ignore',
        env: { ...process.env, ...pgPasswordEnv }
      });
      console.log('✅ データベース接続に成功しました');
    }
  } catch (error) {
    console.error('❌ データベース接続に失敗しました');
    console.error('  エラー詳細:', error.message);
  }
  
  // 3. Prismaスキーマチェック
  console.log('\n📋 Prismaスキーマチェック:');
  const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (fs.existsSync(prismaSchemaPath)) {
    console.log('✅ schema.prisma ファイルが存在します');
    
    // スキーマの内容をチェック
    const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // データソース設定のチェック
    if (schemaContent.includes('provider = "postgresql"')) {
      console.log('✅ PostgreSQLプロバイダが設定されています');
    } else {
      console.error('❌ PostgreSQLプロバイダが設定されていません');
    }
    
    // 環境変数参照のチェック
    if (schemaContent.includes('url      = env("DATABASE_URL")')) {
      console.log('✅ DATABASE_URL環境変数が参照されています');
    } else {
      console.error('❌ DATABASE_URL環境変数が参照されていません');
    }
  } else {
    console.error('❌ schema.prisma ファイルが見つかりません');
  }
  
  // 4. バックアップディレクトリチェック
  console.log('\n📋 バックアップディレクトリチェック:');
  const backupDir = path.join(__dirname, '../prisma/backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('⚠️ バックアップディレクトリが存在しません。作成します...');
    try {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('✅ バックアップディレクトリを作成しました');
    } catch (error) {
      console.error('❌ バックアップディレクトリの作成に失敗しました');
    }
  } else {
    console.log('✅ バックアップディレクトリが存在します');
    
    // 最新のバックアップをチェック
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
      const daysSinceBackup = Math.floor((Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`✅ 最新のバックアップ: ${latestBackup.name} (${backupDate.toLocaleString()})`);
      
      if (daysSinceBackup > 7) {
        console.log(`⚠️ 最新のバックアップから${daysSinceBackup}日経過しています。新しいバックアップを作成することをお勧めします。`);
      }
    } else {
      console.log('⚠️ バックアップファイルが見つかりません。バックアップを作成することをお勧めします。');
    }
  }
  
  // 5. Gitフックチェック
  console.log('\n📋 Gitフックチェック:');
  const preCommitHookPath = path.join(__dirname, '../.git/hooks/pre-commit');
  
  if (fs.existsSync(preCommitHookPath)) {
    const hookContent = fs.readFileSync(preCommitHookPath, 'utf8');
    if (hookContent.includes('DANGEROUS_PATTERNS') && hookContent.includes('migrate reset')) {
      console.log('✅ データベース保護用のGitフックが設定されています');
    } else {
      console.log('⚠️ Gitフックが存在しますが、データベース保護の設定が含まれていない可能性があります');
    }
  } else {
    console.log('⚠️ データベース保護用のGitフックが設定されていません');
    console.log('  推奨: scripts/git-hooks/pre-commit を .git/hooks/ にコピーして実行権限を付与してください');
  }
  
  console.log('\n✅ データベース安全性チェックが完了しました');
}

// スクリプト実行
checkDatabaseSafety().catch(error => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});