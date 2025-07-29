#!/usr/bin/env node
// ⚡ 軽量 Cursor Rules 統合 (処理速度重視)

const fs = require('fs');
const path = require('path');

console.log('⚡ 軽量Cursor Rules統合起動');

class LightweightCursorIntegration {
  constructor() {
    this.rulesPath = './.cursor/rules/';
  }

  // 軽量ガードレール検証 (TypeScript実行なし)
  validateCodeQuick(code, projectType = 'hotel-common') {
    console.log(`🔍 ${projectType} 軽量検証実行...`);
    
    const rules = this.getProjectRules(projectType);
    const violations = [];
    let score = 100;

    // 高速パターンマッチング検証
    rules.forEach(rule => {
      if (rule.pattern && !new RegExp(rule.pattern).test(code)) {
        violations.push(rule.message);
        score -= rule.penalty || 10;
      }
    });

    return {
      success: violations.length === 0,
      score: Math.max(0, score),
      violations,
      executionTime: '< 50ms'
    };
  }

  // プロジェクト別ルール定義
  getProjectRules(projectType) {
    const commonRules = [
      {
        pattern: 'tenant_id',
        message: 'tenant_id必須フィールドが見つかりません',
        penalty: 25
      }
    ];

    const projectRules = {
      'hotel-saas': [
        ...commonRules,
        {
          pattern: 'service\\.ordered',
          message: 'service.orderedイベント発行が必要です',
          penalty: 20
        }
      ],
      'hotel-member': [
        ...commonRules,
        {
          pattern: 'customer\\.updated',
          message: 'customer.updatedイベント発行が必要です',
          penalty: 20
        }
      ],
      'hotel-pms': [
        ...commonRules,
        {
          pattern: 'reservation\\.updated',
          message: 'reservation.updatedイベント発行が必要です',
          penalty: 20
        }
      ]
    };

    return projectRules[projectType] || commonRules;
  }

  // Cursor Rules更新 (軽量)
  updateCursorRulesQuick(projectType, result) {
    const rulesFile = path.join(this.rulesPath, `${projectType}-ai-rules.md`);
    
    if (!fs.existsSync(rulesFile)) {
      console.log(`⚠️ ${rulesFile} が見つかりません`);
      return;
    }

    const currentRules = fs.readFileSync(rulesFile, 'utf8');
    const timestamp = new Date().toLocaleString('ja-JP');
    
    const quickUpdate = `
<!-- 自動更新 ${timestamp} -->
### 🔥 直近検証: スコア ${result.score}/100 ${result.success ? '✅' : '❌'}
`;

    // 簡単な末尾追加 (重い正規表現処理なし)
    const updatedRules = currentRules + quickUpdate;
    
    fs.writeFileSync(rulesFile, updatedRules);
    console.log(`✅ ${projectType} Rules更新完了 (${result.executionTime})`);
  }
}

// 高速実行
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'demo';
  const projectType = args[1] || 'hotel-saas';
  
  const integration = new LightweightCursorIntegration();
  
  if (command === 'demo') {
    console.log('🧪 軽量デモ実行');
    const testCode = `
const customer = await prisma.customer.findUnique({
  where: { 
    id: customerId,
    tenant_id: tenantId 
  }
});
// service.ordered イベント発行
await eventPublisher.publish('service.ordered', orderData);
`;
    
    const startTime = Date.now();
    const result = integration.validateCodeQuick(testCode, projectType);
    const endTime = Date.now();
    
    result.executionTime = `${endTime - startTime}ms`;
    
    console.log('\n📊 軽量検証結果:');
    console.log(JSON.stringify(result, null, 2));
    
    // Cursor Rules更新
    integration.updateCursorRulesQuick(projectType, result);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LightweightCursorIntegration }; 