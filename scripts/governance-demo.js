#!/usr/bin/env node

// 段階的監視システム体験ツール
const { governanceManager } = require('../dist/governance/config');

async function runDemo() {
  console.log('🏨 Hotel Common 段階的監視システム体験ツール\n');
  
  // 現在の設定表示
  console.log('📊 現在の監視設定:');
  const configs = governanceManager.getCurrentConfig();
  Object.entries(configs).forEach(([systemId, config]) => {
    const status = config.monitoring ? '🟢 監視中' : '⚪ 停止中';
    console.log(`  ${systemId.padEnd(15)} Level ${config.level} ${status}`);
  });
  console.log();

  // テストデータ
  const testCases = [
    {
      name: '標準準拠レスポンス',
      data: {
        success: true,
        data: { id: 1, name: "テストデータ" },
        timestamp: new Date(),
        request_id: "req_demo_001"
      }
    },
    {
      name: '非標準レスポンス',
      data: {
        result: "OK",
        items: [{ id: 1, name: "テストデータ" }]
        // success, timestamp, request_id がない
      }
    }
  ];

  // 各システムでテスト実行
  for (const [systemId, config] of Object.entries(configs)) {
    console.log(`\n🔍 ${systemId} での動作テスト (Level ${config.level})`);
    console.log('─'.repeat(50));
    
    for (const testCase of testCases) {
      console.log(`\n  📝 テスト: ${testCase.name}`);
      
      try {
        const result = await governanceManager.checkCompliance(
          systemId,
          'api',
          testCase.data
        );
        
        // 結果表示
        if (result.compliant) {
          console.log('    ✅ 結果: 準拠');
        } else {
          console.log('    ⚠️ 結果: 違反あり');
        }
        
        if (result.blocking) {
          console.log('    🚫 アクション: ブロック（commit停止）');
        } else if (result.warnings.length > 0) {
          console.log('    ⚠️ アクション: 警告表示（開発継続）');
        } else {
          console.log('    ✅ アクション: 通過');
        }
        
        // 違反・警告の詳細
        if (result.violations.length > 0) {
          console.log('    🔍 ブロッキング違反:');
          result.violations.forEach(v => {
            console.log(`      - ${v.message}`);
            if (v.suggestion) {
              console.log(`        💡 提案: ${v.suggestion}`);
            }
          });
        }
        
        if (result.warnings.length > 0) {
          console.log('    ⚠️ 警告:');
          result.warnings.forEach(w => {
            console.log(`      - ${w.message}`);
            if (w.suggestion) {
              console.log(`        💡 提案: ${w.suggestion}`);
            }
          });
        }
        
        if (result.notes) {
          console.log(`    📄 備考: ${result.notes}`);
        }
        
      } catch (error) {
        console.log(`    ❌ エラー: ${error.message}`);
      }
    }
  }

  // 移行計画デモ
  console.log('\n\n📋 移行計画デモ');
  console.log('─'.repeat(50));
  
  const migrationPlan = governanceManager.generateMigrationPlan('hotel-saas', 3);
  
  console.log(`システム: ${migrationPlan.systemId}`);
  console.log(`現在レベル: ${migrationPlan.currentLevel} → 目標レベル: ${migrationPlan.targetLevel}`);
  console.log(`予想期間: ${migrationPlan.estimatedDuration}週間`);
  console.log(`移行段階: ${migrationPlan.phases.length}段階\n`);
  
  migrationPlan.phases.forEach((phase, index) => {
    console.log(`  Phase ${index + 1}: Level ${phase.level} (${phase.duration}週間)`);
    console.log(`    適用ルール: ${phase.rules.length}個`);
    phase.rules.forEach(rule => {
      const icon = rule.severity === 'critical' ? '🔴' : 
                   rule.severity === 'error' ? '🟠' : '🟡';
      console.log(`      ${icon} ${rule.name}`);
    });
    
    if (phase.dependencies.length > 0) {
      console.log(`    📋 事前要件: ${phase.dependencies.join(', ')}`);
    }
    console.log();
  });

  // リスク評価
  if (migrationPlan.risks.length > 0) {
    console.log('⚠️ リスク評価:');
    migrationPlan.risks.forEach(risk => {
      const icon = risk.severity === 'critical' ? '🔴' : 
                   risk.severity === 'high' ? '🟠' : '🟡';
      console.log(`  ${icon} ${risk.type}: ${risk.description}`);
      console.log(`     対策: ${risk.mitigation}\n`);
    });
  }

  // 動的レベル変更デモ
  console.log('🔄 動的レベル変更デモ');
  console.log('─'.repeat(50));
  
  console.log('hotel-memberを Level 0 → Level 1 に変更...');
  governanceManager.updateGovernanceLevel(
    'hotel-member',
    1,
    new Date(),
    'デモ用レベル変更'
  );
  
  const updatedConfig = governanceManager.getCurrentConfig('hotel-member');
  console.log(`✅ 変更完了: Level ${updatedConfig.level}, モード: ${updatedConfig.mode}`);
  
  // 変更後の動作確認
  const afterChange = await governanceManager.checkCompliance(
    'hotel-member',
    'api',
    testCases[1].data // 非標準レスポンス
  );
  
  console.log('\n変更後の動作:');
  console.log(`  結果: ${afterChange.compliant ? '準拠' : '違反あり'}`);
  console.log(`  警告数: ${afterChange.warnings.length}`);
  console.log(`  ブロッキング: ${afterChange.blocking ? 'YES' : 'NO'}`);

  console.log('\n🎯 体験完了！');
  console.log('\n📊 監視システムの特徴:');
  console.log('  ✅ システムごとに異なる監視レベルを同時適用');
  console.log('  ✅ 段階的な移行で開発を停止させない');
  console.log('  ✅ 自動修正提案で学習効果を促進');
  console.log('  ✅ リアルタイムでの設定変更が可能');
  console.log('  ✅ 移行計画の自動生成とリスク評価');
}

// 実行
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo }; 