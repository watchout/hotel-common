// 段階的監視システム動作デモンストレーション
import { governanceManager, SystemId, GovernanceLevel } from '../src/governance/config';

console.log('🔍 Hotel Common 段階的監視システム デモンストレーション\n');

// ==========================================
// 1. 現在の監視状態確認
// ==========================================

console.log('📊 現在の監視設定:');
const allConfigs = governanceManager.getCurrentConfig();
for (const [systemId, config] of Object.entries(allConfigs)) {
  console.log(`  ${systemId}: Level ${config.level} (監視: ${config.monitoring ? 'ON' : 'OFF'})`);
}
console.log();

// ==========================================
// 2. Level 0 システム（hotel-saas）の動作例
// ==========================================

console.log('🟡 Level 0 (hotel-saas) - 監視なし・開発継続');

// 非標準API形式のデータ（本来なら違反）
const nonStandardResponse = {
  result: "success",  // 'success'フィールドがない
  items: [{ id: 1, name: "商品A" }]
  // timestamp, request_id がない
};

const level0Check = await governanceManager.checkCompliance(
  'hotel-saas', 
  'api', 
  nonStandardResponse
);

console.log('  結果:', level0Check.compliant ? '✅ 通過' : '❌ 違反');
console.log('  理由:', level0Check.notes);
console.log('  違反数:', level0Check.violations.length);
console.log('  警告数:', level0Check.warnings.length);
console.log();

// ==========================================
// 3. Level 1 移行後の動作例
// ==========================================

console.log('🟠 Level 1 移行シミュレーション (hotel-member)');

// hotel-memberをLevel 1に移行
governanceManager.updateGovernanceLevel(
  'hotel-member',
  1,
  new Date(),
  'PostgreSQL移行完了により段階移行開始'
);

const level1Check = await governanceManager.checkCompliance(
  'hotel-member',
  'api',
  nonStandardResponse
);

console.log('  結果:', level1Check.compliant ? '✅ 通過' : '⚠️ 警告あり');
console.log('  ブロッキング:', level1Check.blocking ? 'YES' : 'NO (開発継続可能)');
console.log('  違反数:', level1Check.violations.length);
console.log('  警告数:', level1Check.warnings.length);

if (level1Check.warnings.length > 0) {
  console.log('  警告内容:');
  level1Check.warnings.forEach(warning => {
    console.log(`    - ${warning.message}`);
    console.log(`      提案: ${warning.suggestion}`);
  });
}
console.log();

// ==========================================
// 4. 標準準拠レスポンスの動作確認
// ==========================================

console.log('✅ 標準準拠レスポンスでの動作確認');

const standardResponse = {
  success: true,
  data: [{ id: 1, name: "商品A" }],
  timestamp: new Date(),
  request_id: "req_12345"
};

const standardCheck = await governanceManager.checkCompliance(
  'hotel-member',
  'api',
  standardResponse
);

console.log('  結果:', standardCheck.compliant ? '✅ 完全準拠' : '❌ 違反');
console.log('  違反数:', standardCheck.violations.length);
console.log('  警告数:', standardCheck.warnings.length);
console.log();

// ==========================================
// 5. Level 3 システム（hotel-common）の厳格監視
// ==========================================

console.log('🔴 Level 3 (hotel-common) - 厳格監視');

const level3Check = await governanceManager.checkCompliance(
  'hotel-common',
  'api',
  nonStandardResponse
);

console.log('  結果:', level3Check.compliant ? '✅ 通過' : '🚫 ブロック');
console.log('  ブロッキング:', level3Check.blocking ? 'YES (commit/push 停止)' : 'NO');
console.log('  違反数:', level3Check.violations.length);

if (level3Check.violations.length > 0) {
  console.log('  ブロッキング違反:');
  level3Check.violations.forEach(violation => {
    console.log(`    - ${violation.message} (${violation.severity})`);
    console.log(`      自動修正: ${violation.autoFixable ? 'YES' : 'NO'}`);
  });
}
console.log();

// ==========================================
// 6. 移行計画生成デモ
// ==========================================

console.log('📋 移行計画生成デモ (hotel-saas: Level 0 → Level 3)');

const migrationPlan = governanceManager.generateMigrationPlan('hotel-saas', 3);

console.log(`  現在レベル: ${migrationPlan.currentLevel}`);
console.log(`  目標レベル: ${migrationPlan.targetLevel}`);
console.log(`  予想期間: ${migrationPlan.estimatedDuration}週間`);
console.log(`  移行段階数: ${migrationPlan.phases.length}段階`);

console.log('\n  段階別計画:');
migrationPlan.phases.forEach((phase, index) => {
  console.log(`    Phase ${index + 1}: Level ${phase.level} (${phase.duration}週間)`);
  console.log(`      適用ルール: ${phase.rules.length}個`);
  phase.rules.forEach(rule => {
    console.log(`        - ${rule.name} (${rule.severity})`);
  });
  if (phase.dependencies.length > 0) {
    console.log(`      事前要件: ${phase.dependencies.join(', ')}`);
  }
});

console.log('\n  リスク評価:');
migrationPlan.risks.forEach(risk => {
  console.log(`    - ${risk.type} (${risk.severity}): ${risk.description}`);
  console.log(`      対策: ${risk.mitigation}`);
});

console.log('\n  緊急時ロールバック:');
console.log(`    最大時間: ${migrationPlan.rollbackPlan.maxRollbackTime}`);
console.log(`    データ保護: ${migrationPlan.rollbackPlan.dataPreservation ? 'YES' : 'NO'}`);
console.log();

// ==========================================
// 7. 実際の開発ワークフロー例
// ==========================================

console.log('⚙️ 実際の開発ワークフロー例');

console.log('\n  シナリオ1: hotel-saasでの新機能開発');
console.log('    1. 開発者がコード作成');
console.log('    2. commit前チェック → Level 0なので監視なし');
console.log('    3. ✅ commit成功（開発継続）');

console.log('\n  シナリオ2: hotel-memberでの段階移行中開発');
console.log('    1. 開発者がAPI作成（非標準形式）');
console.log('    2. commit前チェック → Level 1で警告発生');
console.log('    3. ⚠️ 警告表示（でも開発継続可能）');
console.log('    4. 警告内容に基づく段階的改善');

console.log('\n  シナリオ3: hotel-pmsでの新規開発');
console.log('    1. 開発者がAPI作成（非標準形式）');
console.log('    2. commit前チェック → Level 3で違反検出');
console.log('    3. 🚫 commit ブロック');
console.log('    4. 自動修正提案の適用');
console.log('    5. ✅ 修正後にcommit成功');

console.log('\n🎯 デモンストレーション完了\n');

// ==========================================
// 8. パフォーマンス統計
// ==========================================

console.log('📈 期待される効果:');
console.log('  ✅ 開発停止リスク: 0% (段階的移行のため)');
console.log('  ✅ API統一度向上: 段階的に100%に到達');
console.log('  ✅ システム間整合性: 自動維持');
console.log('  ✅ 緊急時復旧: 15分以内');
console.log('  ✅ 移行コスト: 最小化（各システムのペースで実施）'); 