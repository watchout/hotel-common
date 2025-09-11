#!/bin/bash
# データベースドキュメント整理スクリプト
# 生成日時: 2025-09-01T09:21:24.765Z

echo "📚 データベースドキュメント整理開始..."

# 削除すべきドキュメントをバックアップディレクトリに移動
mkdir -p docs/database/archived/$(date +%Y%m%d)
BACKUP_DIR="docs/database/archived/$(date +%Y%m%d)"

echo "🗑️ 古いドキュメントをアーカイブ中..."
mv "docs/database/SCHEMA_UPDATE_2025_08_15.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ SCHEMA_UPDATE_2025_08_15.md not found"
mv "docs/database/database-migration-guidelines.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ database-migration-guidelines.md not found"
mv "docs/database/database-schema-drift-analysis.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ database-schema-drift-analysis.md not found"
mv "docs/database/hotel-saas-connection-fix.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ hotel-saas-connection-fix.md not found"
mv "docs/database/hotel-saas-device-room-analysis.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ hotel-saas-device-room-analysis.md not found"
mv "docs/database/hotel-saas-implementation-notification.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ hotel-saas-implementation-notification.md not found"
mv "docs/database/hotel-saas-unified-client-issue.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ hotel-saas-unified-client-issue.md not found"
mv "docs/database/migration-issue-analysis.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ migration-issue-analysis.md not found"
mv "docs/database/naming-convention-and-mapping-analysis.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ naming-convention-and-mapping-analysis.md not found"
mv "docs/database/naming-convention-migration-risk-assessment.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ naming-convention-migration-risk-assessment.md not found"
mv "docs/database/order-table-missing-analysis.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ order-table-missing-analysis.md not found"
mv "docs/database/prisma-adapter-migration-guide.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-adapter-migration-guide.md not found"
mv "docs/database/prisma-adapter-next-steps.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-adapter-next-steps.md not found"
mv "docs/database/prisma-migration-implementation-report-update.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-migration-implementation-report-update.md not found"
mv "docs/database/prisma-migration-test-plan.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-migration-test-plan.md not found"
mv "docs/database/prisma-naming-convention-guide.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-naming-convention-guide.md not found"
mv "docs/database/prisma-naming-conventions.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-naming-conventions.md not found"
mv "docs/database/prisma-note-select-scopes.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-note-select-scopes.md not found"
mv "docs/database/prisma-schema-sync-best-practices.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-schema-sync-best-practices.md not found"
mv "docs/database/schema-database-inconsistency-report.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ schema-database-inconsistency-report.md not found"
mv "docs/database/schema-database-synchronization-plan.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ schema-database-synchronization-plan.md not found"
mv "docs/database/schema-sync-analysis.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ schema-sync-analysis.md not found"
mv "docs/database/staff-auth-integration-plan.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ staff-auth-integration-plan.md not found"
mv "docs/database/staff-users-discrepancy-analysis.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ staff-users-discrepancy-analysis.md not found"
mv "docs/database/team-communication-template.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ team-communication-template.md not found"

echo "🔄 統合対象ドキュメントをアーカイブ中..."
mv "docs/database/DATABASE_SCHEMA_DOCUMENTATION.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ DATABASE_SCHEMA_DOCUMENTATION.md not found"
mv "docs/database/SYSTEM_PLAN_MANAGEMENT_SUMMARY.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ SYSTEM_PLAN_MANAGEMENT_SUMMARY.md not found"
mv "docs/database/database-management-summary.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ database-management-summary.md not found"
mv "docs/database/prisma-adapter-implementation-summary.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-adapter-implementation-summary.md not found"
mv "docs/database/prisma-migration-implementation-report.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-migration-implementation-report.md not found"
mv "docs/database/prisma-migration-progress-summary.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ prisma-migration-progress-summary.md not found"
mv "docs/database/project-summary.md" "$BACKUP_DIR/" 2>/dev/null || echo "   ⚠️ project-summary.md not found"

echo "✅ ドキュメント整理完了！"
echo "📁 アーカイブ場所: $BACKUP_DIR"
echo "📋 残存ドキュメント:"
ls -la docs/database/*.md 2>/dev/null || echo "   No .md files found"

echo ""
echo "🎯 次のステップ:"
echo "1. docs/database/CURRENT_DATABASE_STATE_MASTER.md を確認"
echo "2. 必要に応じて残存ドキュメントを更新"
echo "3. 他のドキュメントからの参照を更新"
