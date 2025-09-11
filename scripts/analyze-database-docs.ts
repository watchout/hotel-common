// analyze-database-docs.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * データベース関連ドキュメントを分析し、統合・削除の推奨を行う
 */
async function analyzeDatabaseDocs() {
  console.log('📚 データベース関連ドキュメント分析開始...');
  
  const docsDir = 'docs/database';
  const files = fs.readdirSync(docsDir, { withFileTypes: true });
  
  const analysis = {
    current_valid: [] as string[],
    to_consolidate: [] as string[],
    to_delete: [] as string[],
    to_update: [] as string[],
    directories: [] as string[]
  };
  
  // 現在有効なドキュメント（保持）
  const validDocs = [
    'CURRENT_DATABASE_STATE_MASTER.md',
    'DATABASE_SCHEMA_CONSISTENCY_REPORT.md',
    'database-schema-audit-report.json',
    'DATABASE_SAFETY_RULES.md',
    'DATABASE_CONNECTION_GUIDE.md'
  ];
  
  // 統合すべきドキュメント（内容を統合後削除）
  const consolidateDocs = [
    'DATABASE_SCHEMA_DOCUMENTATION.md',
    'database-management-summary.md',
    'prisma-adapter-implementation-summary.md',
    'prisma-migration-implementation-report.md',
    'prisma-migration-progress-summary.md',
    'SYSTEM_PLAN_MANAGEMENT_SUMMARY.md',
    'project-summary.md'
  ];
  
  // 削除すべきドキュメント（問題解決済み・古い情報）
  const deleteDocs = [
    'database-migration-guidelines.md',
    'database-schema-drift-analysis.md',
    'hotel-saas-connection-fix.md',
    'hotel-saas-device-room-analysis.md',
    'hotel-saas-implementation-notification.md',
    'hotel-saas-unified-client-issue.md',
    'migration-issue-analysis.md',
    'naming-convention-and-mapping-analysis.md',
    'naming-convention-migration-risk-assessment.md',
    'order-table-missing-analysis.md',
    'prisma-adapter-migration-guide.md',
    'prisma-adapter-next-steps.md',
    'prisma-migration-implementation-report-update.md',
    'prisma-migration-test-plan.md',
    'prisma-naming-convention-guide.md',
    'prisma-naming-conventions.md',
    'prisma-note-select-scopes.md',
    'prisma-schema-sync-best-practices.md',
    'SCHEMA_UPDATE_2025_08_15.md',
    'schema-database-inconsistency-report.md',
    'schema-database-synchronization-plan.md',
    'schema-sync-analysis.md',
    'staff-auth-integration-plan.md',
    'staff-users-discrepancy-analysis.md',
    'team-communication-template.md'
  ];
  
  // 更新すべきドキュメント（現状に合わせて更新）
  const updateDocs = [
    'README.md',
    'implementation-checklist.md',
    'device-room-operations-guide.md',
    'SOFT_DELETE_IMPLEMENTATION_GUIDE.md',
    'SOFT_DELETE_STATUS_REPORT.md',
    'SQL_DIRECT_OPERATION_PREVENTION.md',
    'TEST_DATA_SETUP.md'
  ];
  
  files.forEach(file => {
    if (file.isDirectory()) {
      analysis.directories.push(file.name);
    } else {
      const fileName = file.name;
      
      if (validDocs.includes(fileName)) {
        analysis.current_valid.push(fileName);
      } else if (consolidateDocs.includes(fileName)) {
        analysis.to_consolidate.push(fileName);
      } else if (deleteDocs.includes(fileName)) {
        analysis.to_delete.push(fileName);
      } else if (updateDocs.includes(fileName)) {
        analysis.to_update.push(fileName);
      } else {
        // 未分類のファイル
        analysis.to_update.push(fileName);
      }
    }
  });
  
  // 結果を表示
  console.log('\n📊 分析結果:');
  console.log(`✅ 現在有効なドキュメント: ${analysis.current_valid.length}個`);
  analysis.current_valid.forEach(doc => console.log(`   - ${doc}`));
  
  console.log(`\n🔄 統合すべきドキュメント: ${analysis.to_consolidate.length}個`);
  analysis.to_consolidate.forEach(doc => console.log(`   - ${doc}`));
  
  console.log(`\n🗑️ 削除すべきドキュメント: ${analysis.to_delete.length}個`);
  analysis.to_delete.forEach(doc => console.log(`   - ${doc}`));
  
  console.log(`\n📝 更新すべきドキュメント: ${analysis.to_update.length}個`);
  analysis.to_update.forEach(doc => console.log(`   - ${doc}`));
  
  console.log(`\n📁 ディレクトリ: ${analysis.directories.length}個`);
  analysis.directories.forEach(dir => console.log(`   - ${dir}/`));
  
  // 分析結果をJSONファイルに出力
  const reportPath = 'docs/database/doc-analysis-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`\n📄 詳細レポート: ${reportPath}`);
  
  // 削除・統合スクリプトを生成
  generateCleanupScript(analysis);
  
  console.log('\n🎉 ドキュメント分析完了！');
}

function generateCleanupScript(analysis: any) {
  const scriptContent = `#!/bin/bash
# データベースドキュメント整理スクリプト
# 生成日時: ${new Date().toISOString()}

echo "📚 データベースドキュメント整理開始..."

# 削除すべきドキュメントをバックアップディレクトリに移動
mkdir -p docs/database/archived/$(date +%Y%m%d)
BACKUP_DIR="docs/database/archived/$(date +%Y%m%d)"

echo "🗑️ 古いドキュメントをアーカイブ中..."
${analysis.to_delete.map((doc: string) => `mv "docs/database/${doc}" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ ${doc} not found"`).join('\n')}

echo "🔄 統合対象ドキュメントをアーカイブ中..."
${analysis.to_consolidate.map((doc: string) => `mv "docs/database/${doc}" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ ${doc} not found"`).join('\n')}

echo "✅ ドキュメント整理完了！"
echo "📁 アーカイブ場所: $BACKUP_DIR"
echo "📋 残存ドキュメント:"
ls -la docs/database/*.md 2>/dev/null || echo "   No .md files found"

echo ""
echo "🎯 次のステップ:"
echo "1. docs/database/CURRENT_DATABASE_STATE_MASTER.md を確認"
echo "2. 必要に応じて残存ドキュメントを更新"
echo "3. 他のドキュメントからの参照を更新"
`;

  fs.writeFileSync('scripts/cleanup-database-docs.sh', scriptContent);
  fs.chmodSync('scripts/cleanup-database-docs.sh', '755');
  console.log('📜 整理スクリプト生成: scripts/cleanup-database-docs.sh');
}

// スクリプト実行
analyzeDatabaseDocs().catch(e => {
  console.error('❌ 分析中にエラーが発生しました:', e);
  process.exit(1);
});

