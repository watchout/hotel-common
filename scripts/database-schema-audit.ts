// database-schema-audit.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

/**
 * データベースとPrismaスキーマの整合性を監査し、ドキュメントを生成する
 */
async function auditDatabaseSchema() {
  console.log('🔍 データベースとPrismaスキーマの整合性監査開始...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://kaneko@localhost:5432/hotel_unified_db"
      }
    }
  });
  
  try {
    // データベースの全テーブル一覧を取得
    console.log('📋 データベーステーブル一覧を取得中...');
    const dbTables = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    // 各テーブルの詳細情報を取得
    console.log('🔍 各テーブルの詳細情報を取得中...');
    const tableDetails: any = {};
    
    for (const table of dbTables) {
      const columns = await prisma.$queryRaw<Array<{
        column_name: string,
        data_type: string,
        is_nullable: string,
        column_default: string,
        character_maximum_length: number
      }>>`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;
      
      const indexes = await prisma.$queryRaw<Array<{
        index_name: string,
        column_name: string,
        is_unique: boolean
      }>>`
        SELECT 
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relname = ${table.table_name}
        AND t.relkind = 'r'
        ORDER BY i.relname, a.attname
      `;
      
      tableDetails[table.table_name] = {
        columns: columns,
        indexes: indexes
      };
    }
    
    // Prismaスキーマファイルを読み込み
    console.log('📖 Prismaスキーマファイルを解析中...');
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf-8');
    const modelMatches = schemaContent.match(/model\s+(\w+)\s*\{[^}]+\}/g) || [];
    const prismaModels = modelMatches.map(match => {
      const modelName = match.match(/model\s+(\w+)/)?.[1] || '';
      const mapMatch = match.match(/@@map\("([^"]+)"\)/);
      const tableName = mapMatch ? mapMatch[1] : modelName.toLowerCase();
      return { modelName, tableName, definition: match };
    });
    
    // 整合性チェック
    console.log('⚖️ 整合性チェック実行中...');
    const auditReport = {
      timestamp: new Date().toISOString(),
      database_tables: 0, // 後で設定
      prisma_models: prismaModels.length,
      tables_in_db_only: [] as string[],
      models_in_prisma_only: [] as string[],
      matched_tables: [] as string[],
      table_details: tableDetails,
      prisma_models: prismaModels
    };
    
    // データベースにのみ存在するテーブル
    const prismaTableNames = prismaModels.map(m => m.tableName);
    const dbTableNames = dbTables.map(t => t.table_name);
    
    // Prisma内部テーブルを除外してフィルタリング
    const filteredDbTableNames = dbTableNames.filter(table => 
      table !== '_prisma_migrations' // Prisma内部テーブルを除外
    );
    
    auditReport.tables_in_db_only = filteredDbTableNames.filter(table => 
      !prismaTableNames.includes(table)
    );
    
    // Prismaにのみ存在するモデル
    auditReport.models_in_prisma_only = prismaTableNames.filter(table => 
      !filteredDbTableNames.includes(table)
    );
    
    // 一致するテーブル
    auditReport.matched_tables = filteredDbTableNames.filter(table => 
      prismaTableNames.includes(table)
    );
    
    // フィルタリング後のデータベーステーブル数を設定
    auditReport.database_tables = filteredDbTableNames.length;
    
    // レポートをファイルに出力
    const reportPath = 'docs/database/database-schema-audit-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
    
    // Markdownドキュメントを生成
    const markdownReport = generateMarkdownReport(auditReport);
    const markdownPath = 'docs/database/DATABASE_SCHEMA_CONSISTENCY_REPORT.md';
    fs.writeFileSync(markdownPath, markdownReport);
    
    // 結果を表示
    console.log('\n📊 整合性監査結果:');
    console.log(`   📋 データベーステーブル数: ${auditReport.database_tables}`);
    console.log(`   🏗️ Prismaモデル数: ${auditReport.prisma_models.length}`);
    console.log(`   ✅ 一致するテーブル数: ${auditReport.matched_tables.length}`);
    console.log(`   ⚠️ データベースのみ: ${auditReport.tables_in_db_only.length}`);
    console.log(`   ⚠️ Prismaのみ: ${auditReport.models_in_prisma_only.length}`);
    
    if (auditReport.tables_in_db_only.length > 0) {
      console.log(`\n   📋 データベースのみのテーブル:`);
      auditReport.tables_in_db_only.forEach(table => console.log(`      - ${table}`));
    }
    
    if (auditReport.models_in_prisma_only.length > 0) {
      console.log(`\n   🏗️ Prismaのみのモデル:`);
      auditReport.models_in_prisma_only.forEach(model => console.log(`      - ${model}`));
    }
    
    console.log(`\n📄 詳細レポート:`);
    console.log(`   - JSON: ${reportPath}`);
    console.log(`   - Markdown: ${markdownPath}`);
    
    console.log('\n🎉 データベーススキーマ監査完了！');
    
  } catch (error) {
    console.error('❌ 監査中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateMarkdownReport(auditReport: any): string {
  return `# データベーススキーマ整合性レポート

**生成日時**: ${auditReport.timestamp}

## 概要

- **データベーステーブル数**: ${auditReport.database_tables}
- **Prismaモデル数**: ${auditReport.prisma_models}
- **一致するテーブル数**: ${auditReport.matched_tables.length}
- **データベースのみのテーブル数**: ${auditReport.tables_in_db_only.length}
- **Prismaのみのモデル数**: ${auditReport.models_in_prisma_only.length}

## 整合性ステータス

${auditReport.tables_in_db_only.length === 0 && auditReport.models_in_prisma_only.length === 0 
  ? '✅ **完全に整合性が取れています**' 
  : '⚠️ **整合性に問題があります**'}

## 一致するテーブル (${auditReport.matched_tables.length}個)

${auditReport.matched_tables.map((table: string) => `- \`${table}\``).join('\n')}

${auditReport.tables_in_db_only.length > 0 ? `
## データベースのみのテーブル (${auditReport.tables_in_db_only.length}個)

${auditReport.tables_in_db_only.map((table: string) => `- \`${table}\` - Prismaモデルが不足`).join('\n')}
` : ''}

${auditReport.models_in_prisma_only.length > 0 ? `
## Prismaのみのモデル (${auditReport.models_in_prisma_only.length}個)

${auditReport.models_in_prisma_only.map((model: string) => `- \`${model}\` - データベーステーブルが不足`).join('\n')}
` : ''}

## テーブル詳細

${Object.entries(auditReport.table_details).map(([tableName, details]: [string, any]) => `
### \`${tableName}\`

**カラム**:
${details.columns.map((col: any) => 
  `- \`${col.column_name}\`: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`
).join('\n')}

**インデックス**:
${details.indexes.length > 0 
  ? details.indexes.map((idx: any) => `- \`${idx.index_name}\`: ${idx.column_name} ${idx.is_unique ? '(UNIQUE)' : ''}`).join('\n')
  : '- なし'}
`).join('\n')}

## 推奨アクション

${auditReport.tables_in_db_only.length > 0 || auditReport.models_in_prisma_only.length > 0 ? `
### 整合性の修正が必要

1. **データベースのみのテーブル**: 対応するPrismaモデルを追加するか、不要なテーブルを削除
2. **Prismaのみのモデル**: 対応するデータベーステーブルを作成するか、不要なモデルを削除
3. **マイグレーション**: \`npx prisma db push\` または適切なマイグレーションを実行
4. **Prismaクライアント再生成**: \`npx prisma generate\`
` : `
### 整合性は完璧です ✅

現在のデータベースとPrismaスキーマは完全に整合性が取れています。
`}

---

*このレポートは自動生成されました。最新の状態を確認するには、監査スクリプトを再実行してください。*
`;
}

// スクリプト実行
auditDatabaseSchema().catch(e => {
  console.error('❌ 監査スクリプト実行中にエラーが発生しました:', e);
  process.exit(1);
});
