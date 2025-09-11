/**
 * データベーススキーマとPrismaスキーマの整合性を検証する簡易スクリプト
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 一時ファイル名の設定
const tempSchemaPath = path.join(__dirname, '../prisma/schema.pulled.prisma');

try {
  console.log('データベース構造をエクスポート中...');
  // データベース構造をエクスポート
  execSync(`npx prisma db pull --schema=${tempSchemaPath}`, { stdio: 'inherit' });
  
  // 現在のスキーマを読み込み
  const currentSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
  const currentSchema = fs.readFileSync(currentSchemaPath, 'utf8');
  const dbSchema = fs.readFileSync(tempSchemaPath, 'utf8');
  
  // モデル定義を抽出
  const extractModelNames = (schema) => {
    const modelRegex = /model\s+(\w+)\s+{/g;
    const models = [];
    let match;
    
    while ((match = modelRegex.exec(schema)) !== null) {
      models.push(match[1]);
    }
    
    return models;
  };
  
  const currentModelNames = extractModelNames(currentSchema);
  const dbModelNames = extractModelNames(dbSchema);
  
  // データベースには存在するが、スキーマには存在しないモデル
  const missingInSchema = dbModelNames.filter(name => !currentModelNames.includes(name));
  
  // スキーマには存在するが、データベースには存在しないモデル
  const missingInDb = currentModelNames.filter(name => !dbModelNames.includes(name));
  
  console.log('\n=== スキーマ検証レポート ===');
  
  if (missingInSchema.length > 0) {
    console.log('\nデータベースには存在するが、schema.prismaに存在しないモデル:');
    missingInSchema.forEach(name => {
      console.log(`- ${name}`);
    });
  }
  
  if (missingInDb.length > 0) {
    console.log('\nschema.prismaには存在するが、データベースに存在しないモデル:');
    missingInDb.forEach(name => {
      console.log(`- ${name}`);
    });
  }
  
  if (missingInSchema.length === 0 && missingInDb.length === 0) {
    console.log('\nモデル定義の不一致はありません。');
  } else {
    console.log('\n注意: このレポートはモデル名のみを比較しています。フィールドレベルの詳細な比較は行っていません。');
  }
  
} catch (error) {
  console.error('検証中にエラーが発生しました:', error);
  process.exit(1);
} finally {
  // 一時ファイルを削除
  if (fs.existsSync(tempSchemaPath)) {
    try {
      fs.unlinkSync(tempSchemaPath);
    } catch (e) {
      console.error('一時ファイルの削除に失敗しました:', e);
    }
  }
}
