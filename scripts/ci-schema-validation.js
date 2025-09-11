/**
 * CI/CDパイプラインでのスキーマ検証スクリプト
 * 
 * このスクリプトは以下の検証を行います：
 * 1. Prismaスキーマの構文検証
 * 2. マイグレーションの整合性検証
 * 3. スキーマとデータベースの同期状態検証
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 色付きログ出力のための関数
const log = {
  info: (msg) => console.log('\x1b[36m%s\x1b[0m', '[INFO] ' + msg),
  success: (msg) => console.log('\x1b[32m%s\x1b[0m', '[SUCCESS] ' + msg),
  warning: (msg) => console.log('\x1b[33m%s\x1b[0m', '[WARNING] ' + msg),
  error: (msg) => console.log('\x1b[31m%s\x1b[0m', '[ERROR] ' + msg)
};

// 検証ステップの実行
async function runValidation() {
  try {
    log.info('スキーマ検証を開始します...');
    
    // 1. Prismaスキーマの構文検証
    log.info('Prismaスキーマの構文を検証中...');
    try {
      execSync('npx prisma validate', { stdio: 'inherit' });
      log.success('Prismaスキーマの構文は有効です');
    } catch (error) {
      log.error('Prismaスキーマの構文エラーが見つかりました');
      process.exit(1);
    }
    
    // 2. マイグレーションの整合性検証
    log.info('マイグレーションの整合性を検証中...');
    
    // マイグレーションディレクトリの存在確認
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      log.warning('マイグレーションディレクトリが見つかりません');
    } else {
      // マイグレーションファイルの検証
      const migrationDirs = fs.readdirSync(migrationsDir)
        .filter(dir => !dir.endsWith('.toml') && !dir.startsWith('.'));
      
      log.info(`${migrationDirs.length}個のマイグレーションが見つかりました`);
      
      // マイグレーション名の重複チェック
      const migrationNames = migrationDirs.map(dir => {
        const parts = dir.split('_');
        return parts.slice(1).join('_');
      });
      
      const duplicateNames = migrationNames.filter((name, index) => 
        migrationNames.indexOf(name) !== index
      );
      
      if (duplicateNames.length > 0) {
        log.warning(`重複するマイグレーション名が見つかりました: ${duplicateNames.join(', ')}`);
      } else {
        log.success('マイグレーション名に重複はありません');
      }
      
      // 各マイグレーションファイルの存在確認
      let hasInvalidMigration = false;
      
      for (const dir of migrationDirs) {
        const migrationFile = path.join(migrationsDir, dir, 'migration.sql');
        if (!fs.existsSync(migrationFile)) {
          log.error(`マイグレーションファイルが見つかりません: ${migrationFile}`);
          hasInvalidMigration = true;
        }
      }
      
      if (hasInvalidMigration) {
        log.error('無効なマイグレーションが見つかりました');
        process.exit(1);
      } else {
        log.success('すべてのマイグレーションファイルが有効です');
      }
    }
    
    // 3. スキーマとデータベースの同期状態検証
    log.info('スキーマとデータベースの同期状態を検証中...');
    
    try {
      // テスト用のデータベースにマイグレーションを適用
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      log.success('マイグレーションが正常に適用されました');
      
      // データベースからスキーマを生成して比較
      const tempSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.temp.prisma');
      execSync(`npx prisma db pull --schema=${tempSchemaPath}`, { stdio: 'inherit' });
      log.info('データベースからスキーマを生成しました');
      
      // 生成されたスキーマの検証
      if (fs.existsSync(tempSchemaPath)) {
        log.success('データベースとスキーマの同期が確認されました');
        
        // 一時ファイルの削除
        fs.unlinkSync(tempSchemaPath);
      } else {
        log.error('データベースからのスキーマ生成に失敗しました');
        process.exit(1);
      }
    } catch (error) {
      log.error('スキーマとデータベースの同期検証に失敗しました');
      log.error(error.message);
      process.exit(1);
    }
    
    log.success('すべての検証が完了しました！');
    
  } catch (error) {
    log.error('検証中にエラーが発生しました');
    log.error(error.message);
    process.exit(1);
  }
}

// 検証の実行
runValidation();
