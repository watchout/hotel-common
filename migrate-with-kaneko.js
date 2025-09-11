const { execSync } = require('child_process');

// kaneko権限でのマイグレーション実行
const kanekoDbUrl = 'postgresql://kaneko:@localhost:5432/hotel_unified_db';

console.log('🔧 kaneko権限でのマイグレーション実行開始...');

try {
  // 環境変数を一時的に変更してマイグレーション実行
  process.env.DATABASE_URL = kanekoDbUrl;
  
  console.log('1. Prismaクライアント生成...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('2. データベーススキーマ適用...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  
  console.log('✅ マイグレーション完了！');
  
} catch (error) {
  console.error('❌ マイグレーションエラー:', error.message);
} finally {
  // 元の接続情報に戻す
  process.env.DATABASE_URL = 'postgresql://hotel_app:hotel_password@localhost:5432/hotel_unified_db';
}


