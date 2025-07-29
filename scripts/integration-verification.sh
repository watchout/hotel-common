#!/bin/bash

# 🔍 統合状況自動検証スクリプト
# 目的: 管理者の憶測報告を防止・実態把握の自動化
# 実行: 報告前に必ず実行が必要

echo "🔍 ホテルシステム統合状況 自動検証開始"
echo "実行日時: $(date)"
echo "=========================================="

# 検証結果保存
RESULTS_FILE="/tmp/integration_verification_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$RESULTS_FILE")

# 1. PostgreSQL統一基盤確認
echo ""
echo "📊 1. PostgreSQL統一基盤確認"
echo "----------------------------------------"
if psql postgresql://kaneko@localhost:5432/hotel_unified_db -c "SELECT 'DB接続成功' as status;" 2>/dev/null | grep -q "DB接続成功"; then
    echo "✅ PostgreSQL統一基盤: 接続成功"
    
    # テーブル存在確認
    TABLE_COUNT=$(psql postgresql://kaneko@localhost:5432/hotel_unified_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    echo "📋 テーブル数: $TABLE_COUNT個"
    
    # room_grades確認
    if psql postgresql://kaneko@localhost:5432/hotel_unified_db -c "SELECT COUNT(*) FROM room_grades;" 2>/dev/null | grep -q "[0-9]"; then
        ROOM_GRADES_COUNT=$(psql postgresql://kaneko@localhost:5432/hotel_unified_db -t -c "SELECT COUNT(*) FROM room_grades;" 2>/dev/null | tr -d ' ')
        echo "🏨 room_grades: $ROOM_GRADES_COUNT 件存在"
    else
        echo "❌ room_grades: アクセス不可"
    fi
else
    echo "❌ PostgreSQL統一基盤: 接続失敗"
fi

# 2. 各システムAPI確認
echo ""
echo "🌐 2. 各システムAPI確認"
echo "----------------------------------------"

# hotel-saas (Port 3100)
if curl -s --max-time 5 http://localhost:3100/api/health 2>/dev/null | grep -q "status\|health\|ok"; then
    echo "✅ hotel-saas (3100): API応答正常"
else
    echo "❌ hotel-saas (3100): API応答なし"
fi

# hotel-member (Port 3200)
if curl -s --max-time 5 http://localhost:3200/api/health 2>/dev/null | grep -q "status\|health\|ok"; then
    echo "✅ hotel-member (3200): API応答正常"
else
    echo "❌ hotel-member (3200): API応答なし"
fi

# hotel-pms (Port 3300)
if curl -s --max-time 5 http://localhost:3300/api/health 2>/dev/null | grep -q "status\|health\|ok"; then
    echo "✅ hotel-pms (3300): API応答正常"
else
    echo "❌ hotel-pms (3300): API応答なし"
fi

# hotel-common (Port 3400)
if curl -s --max-time 5 http://localhost:3400/health 2>/dev/null | grep -q "status\|health\|healthy"; then
    echo "✅ hotel-common (3400): API応答正常"
else
    echo "❌ hotel-common (3400): API応答なし"
fi

# 3. データベース統合状況確認
echo ""
echo "🗄️ 3. データベース統合状況確認"
echo "----------------------------------------"

# 各システムのDB設定確認
for system in hotel-saas hotel-member hotel-pms hotel-common; do
    env_file="/Users/kaneko/$system/.env"
    if [ -f "$env_file" ]; then
        if grep -q "hotel_unified_db" "$env_file" 2>/dev/null; then
            echo "✅ $system: 統一基盤DB設定済み"
        else
            db_url=$(grep "DATABASE_URL" "$env_file" 2>/dev/null | head -1)
            echo "❌ $system: 独立DB使用 ($db_url)"
        fi
    else
        echo "❌ $system: .envファイルなし"
    fi
done

# 4. プロセス稼働状況
echo ""
echo "⚡ 4. プロセス稼働状況"
echo "----------------------------------------"
for port in 3100 3200 3300 3400; do
    if lsof -i :$port 2>/dev/null | grep -q "LISTEN"; then
        process_name=$(lsof -i :$port 2>/dev/null | grep "LISTEN" | awk '{print $1}' | head -1)
        echo "✅ Port $port: $process_name 稼働中"
    else
        echo "❌ Port $port: プロセスなし"
    fi
done

# 5. 統合レベル算出
echo ""
echo "📈 5. 統合レベル算出"
echo "----------------------------------------"

integration_score=0
total_checks=4

# PostgreSQL統一基盤使用チェック
unified_db_count=0
for system in hotel-saas hotel-member hotel-pms; do
    env_file="/Users/kaneko/$system/.env"
    if [ -f "$env_file" ] && grep -q "hotel_unified_db" "$env_file" 2>/dev/null; then
        unified_db_count=$((unified_db_count + 1))
    fi
done

if [ $unified_db_count -eq 3 ]; then
    integration_score=$((integration_score + 1))
    echo "✅ 統一DB利用: 3/3 システム"
else
    echo "❌ 統一DB利用: $unified_db_count/3 システム"
fi

# API連携チェック（簡易）
api_working=0
for port in 3100 3200 3300 3400; do
    if curl -s --max-time 3 http://localhost:$port/health 2>/dev/null | grep -q "status\|health"; then
        api_working=$((api_working + 1))
    fi
done

if [ $api_working -ge 3 ]; then
    integration_score=$((integration_score + 1))
    echo "✅ API応答: $api_working/4 システム"
else
    echo "❌ API応答: $api_working/4 システム"
fi

# 最終統合レベル
integration_percentage=$((integration_score * 100 / total_checks))
echo ""
echo "🎯 最終結果"
echo "=========================================="
echo "統合スコア: $integration_score/$total_checks"
echo "統合レベル: $integration_percentage%"

if [ $integration_percentage -ge 80 ]; then
    echo "🟢 統合状況: 良好"
elif [ $integration_percentage -ge 50 ]; then
    echo "🟡 統合状況: 部分的"
else
    echo "🔴 統合状況: 不十分"
fi

echo ""
echo "📄 詳細ログ: $RESULTS_FILE"
echo "🕐 検証完了: $(date)"

# 管理者への警告
if [ $integration_percentage -lt 80 ]; then
    echo ""
    echo "⚠️  警告: 統合レベルが80%未満です"
    echo "   管理者は統合完了の報告を行わないでください"
    echo "   担当者への追加指示・サポートが必要です"
fi

echo "==========================================" 