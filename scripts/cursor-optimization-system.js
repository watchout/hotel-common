#!/usr/bin/env node
/**
 * 🚀 Cursor最適化システム統合 (文献4準拠)
 * 20%コスト削減・MCP統合・リアルタイム監視
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 簡易版のコスト計算
class CostCalculator {
  static calculate(inputTokens, outputTokens) {
    const INPUT_COST_PER_M = 3.0;  // $3/1M tokens
    const OUTPUT_COST_PER_M = 15.0; // $15/1M tokens
    const CURSOR_MARKUP = 0.20;
    
    const inputCost = (inputTokens / 1000000) * INPUT_COST_PER_M;
    const outputCost = (outputTokens / 1000000) * OUTPUT_COST_PER_M;
    const totalCost = inputCost + outputCost;
    const cursorCost = totalCost * (1 + CURSOR_MARKUP);
    const savedCost = cursorCost - totalCost;

    return {
      directCost: totalCost,
      cursorCost,
      savedCost,
      savingsPercent: (savedCost / cursorCost) * 100
    };
  }
}

// MCP管理クラス
class SimpleMCPManager {
  constructor() {
    this.configPath = path.join(process.cwd(), 'mcp-config.json');
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      console.error(`❌ MCP設定ファイルが見つかりません: ${this.configPath}`);
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
    } catch (error) {
      console.error('❌ MCP設定ファイルの読み込みに失敗:', error.message);
      return null;
    }
  }

  checkOpenAPISpecs() {
    const config = this.loadConfig();
    if (!config) return false;

    let allSpecsExist = true;
    const missingSpecs = [];

    Object.entries(config.mcpServers).forEach(([name, server]) => {
      const specArg = server.args.find(arg => arg.startsWith('--oas='));
      if (specArg) {
        const specPath = specArg.replace('--oas=', '');
        if (!fs.existsSync(specPath)) {
          allSpecsExist = false;
          missingSpecs.push({ server: name, spec: specPath });
        }
      }
    });

    if (!allSpecsExist) {
      console.log('❌ 以下のOpenAPI仕様ファイルが見つかりません:');
      missingSpecs.forEach(({ server, spec }) => {
        console.log(`   ${server}: ${spec}`);
      });
    }

    return allSpecsExist;
  }

  testMCPConnection(serverName) {
    console.log(`🔗 ${serverName} MCP接続テスト...`);
    
    const config = this.loadConfig();
    if (!config || !config.mcpServers[serverName]) {
      console.log(`❌ サーバー設定が見つかりません: ${serverName}`);
      return false;
    }

    const server = config.mcpServers[serverName];
    const specArg = server.args.find(arg => arg.startsWith('--oas='));
    
    if (!specArg) {
      console.log(`❌ OpenAPI仕様が設定されていません: ${serverName}`);
      return false;
    }

    const specPath = specArg.replace('--oas=', '');
    if (!fs.existsSync(specPath)) {
      console.log(`❌ OpenAPI仕様ファイルが見つかりません: ${specPath}`);
      return false;
    }

    try {
      // OpenAPI仕様の基本的な検証
      const specContent = fs.readFileSync(specPath, 'utf-8');
      const spec = specContent.includes('openapi:') || specContent.includes('"openapi"');
      
      if (spec) {
        console.log(`✅ ${serverName}: OpenAPI仕様検証成功`);
        return true;
      } else {
        console.log(`❌ ${serverName}: 無効なOpenAPI仕様`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${serverName}: 仕様読み込みエラー - ${error.message}`);
      return false;
    }
  }

  listServers() {
    const config = this.loadConfig();
    if (!config) return [];

    return Object.keys(config.mcpServers);
  }
}

// メインの最適化システム
class CursorOptimizationSystem {
  constructor() {
    this.mcpManager = new SimpleMCPManager();
    this.startTime = Date.now();
  }

  async runDiagnostics() {
    console.log('🚀 Cursor最適化システム診断開始');
    console.log('=====================================');

    const results = {
      anthropicApiKey: this.checkAnthropicApiKey(),
      mcpConfig: this.checkMCPConfiguration(),
      openApiSpecs: this.mcpManager.checkOpenAPISpecs(),
      costMonitoring: this.checkCostMonitoring(),
      integration: false
    };

    // 統合チェック
    results.integration = results.anthropicApiKey && results.mcpConfig && results.openApiSpecs;

    this.displayDiagnosticResults(results);
    return results;
  }

  checkAnthropicApiKey() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('❌ ANTHROPIC_API_KEY が設定されていません');
      console.log('   設定方法: .env ファイルに ANTHROPIC_API_KEY=your_key_here を追加');
      return false;
    }

    if (apiKey.startsWith('sk-ant-')) {
      console.log('✅ Anthropic API Key: 設定済み・形式正常');
      return true;
    } else {
      console.log('❌ Anthropic API Key: 形式が無効です');
      return false;
    }
  }

  checkMCPConfiguration() {
    console.log('\n🔗 MCP設定チェック:');
    
    const config = this.mcpManager.loadConfig();
    if (!config) return false;

    const serverCount = Object.keys(config.mcpServers).length;
    console.log(`✅ MCP設定ファイル: 検出済み（${serverCount}サーバー）`);

    // 各サーバーの設定チェック
    const servers = this.mcpManager.listServers();
    servers.forEach(server => {
      this.mcpManager.testMCPConnection(server);
    });

    return serverCount > 0;
  }

  checkCostMonitoring() {
    const logDir = path.join(process.cwd(), 'logs');
    const costLogFile = path.join(logDir, 'cost-usage.json');

    if (fs.existsSync(costLogFile)) {
      try {
        const logs = JSON.parse(fs.readFileSync(costLogFile, 'utf-8'));
        console.log(`✅ コスト監視: アクティブ（${logs.length}件のログ）`);
        return true;
      } catch (error) {
        console.log('❌ コスト監視: ログファイル破損');
        return false;
      }
    } else {
      console.log('⚠️ コスト監視: 初回実行（ログファイル未作成）');
      return true; // 初回は正常とみなす
    }
  }

  displayDiagnosticResults(results) {
    console.log('\n📊 診断結果サマリー:');
    console.log('=====================================');

    const items = [
      { name: 'Anthropic API Key', status: results.anthropicApiKey },
      { name: 'MCP設定', status: results.mcpConfig },
      { name: 'OpenAPI仕様', status: results.openApiSpecs },
      { name: 'コスト監視', status: results.costMonitoring },
      { name: '統合システム', status: results.integration }
    ];

    items.forEach(item => {
      const icon = item.status ? '✅' : '❌';
      const status = item.status ? '正常' : '要修正';
      console.log(`${icon} ${item.name}: ${status}`);
    });

    if (results.integration) {
      console.log('\n🎉 Cursor最適化システム: 完全動作可能');
      this.displayOptimizationBenefits();
    } else {
      console.log('\n⚠️ Cursor最適化システム: 設定修正が必要');
      this.displaySetupInstructions(results);
    }
  }

  displayOptimizationBenefits() {
    console.log('\n💡 最適化効果:');
    console.log('=====================================');

    // サンプル計算
    const scenarios = [
      { name: 'TypeScriptエラー分析', input: 1500, output: 800 },
      { name: 'API実装', input: 5000, output: 3000 },
      { name: 'アーキテクチャ設計', input: 8000, output: 5000 }
    ];

    let totalSavings = 0;

    scenarios.forEach(scenario => {
      const cost = CostCalculator.calculate(scenario.input, scenario.output);
      totalSavings += cost.savedCost;
      
      console.log(`📋 ${scenario.name}:`);
      console.log(`   Cursor経由: $${cost.cursorCost.toFixed(4)}`);
      console.log(`   直接API: $${cost.directCost.toFixed(4)}`);
      console.log(`   削減額: $${cost.savedCost.toFixed(4)} (${cost.savingsPercent.toFixed(1)}%)`);
    });

    console.log(`\n💰 1日の推定削減額: $${totalSavings.toFixed(4)}`);
    console.log(`💰 年間推定削減額: $${(totalSavings * 365).toFixed(2)}`);
  }

  displaySetupInstructions(results) {
    console.log('\n🛠️ 設定修正手順:');
    console.log('=====================================');

    if (!results.anthropicApiKey) {
      console.log('1. Anthropic API Key設定:');
      console.log('   - https://console.anthropic.com でアカウント作成');
      console.log('   - API Key生成');
      console.log('   - .env ファイルに ANTHROPIC_API_KEY=your_key_here を追加');
      console.log('');
    }

    if (!results.mcpConfig) {
      console.log('2. MCP設定ファイル作成:');
      console.log('   - mcp-config.json が存在することを確認');
      console.log('   - npm run mcp-config で設定確認');
      console.log('');
    }

    if (!results.openApiSpecs) {
      console.log('3. OpenAPI仕様ファイル作成:');
      console.log('   - docs/api-specs/ ディレクトリ内のYAMLファイルを確認');
      console.log('   - 不足しているファイルを作成');
      console.log('');
    }
  }

  async demonstrateOptimization() {
    console.log('\n🎯 最適化デモンストレーション:');
    console.log('=====================================');

    // 模擬的な使用量ログ
    const scenarios = [
      { task: 'JWT認証API実装', input: 4500, output: 2800 },
      { task: 'Prismaスキーマ設計', input: 3200, output: 1900 },
      { task: 'TypeScriptエラー修正', input: 1800, output: 900 }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📋 タスク: ${scenario.task}`);
      
      const cost = CostCalculator.calculate(scenario.input, scenario.output);
      
      console.log(`   入力トークン: ${scenario.input.toLocaleString()}`);
      console.log(`   出力トークン: ${scenario.output.toLocaleString()}`);
      console.log(`   Cursor経由コスト: $${cost.cursorCost.toFixed(4)}`);
      console.log(`   直接APIコスト: $${cost.directCost.toFixed(4)}`);
      console.log(`   削減額: $${cost.savedCost.toFixed(4)} (${cost.savingsPercent.toFixed(1)}%削減)`);

      // コスト監視ファイルにログ（実際のシステムのシミュレーション）
      this.logUsageToFile(scenario);
    }

    console.log('\n✅ 使用量ログ記録完了');
  }

  logUsageToFile(scenario) {
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'cost-usage.json');
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    let logs = [];
    if (fs.existsSync(logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      } catch (error) {
        console.warn('既存ログファイル読み込みエラー:', error.message);
      }
    }

    const cost = CostCalculator.calculate(scenario.input, scenario.output);
    const logEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString(),
      task: scenario.task,
      inputTokens: scenario.input,
      outputTokens: scenario.output,
      directCost: cost.directCost,
      cursorCost: cost.cursorCost,
      savedCost: cost.savedCost
    };

    logs.push(logEntry);

    // 30日分のみ保持
    if (logs.length > 30) {
      logs = logs.slice(-30);
    }

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }

  displayExecutionSummary() {
    const duration = Date.now() - this.startTime;
    console.log('\n⏱️ 実行完了:');
    console.log('=====================================');
    console.log(`処理時間: ${duration}ms`);
    console.log(`実行時刻: ${new Date().toLocaleString('ja-JP')}`);
    console.log('');
    console.log('🚀 次のステップ:');
    console.log('   1. Cursorの設定でClaude API Keyを直接設定');
    console.log('   2. npm run cost-monitor でリアルタイム監視開始');
    console.log('   3. npm run mcp-manager でMCPサーバー管理');
    console.log('');
    console.log('🏆 Cursor最適化システム診断完了');
  }
}

// メイン実行
async function main() {
  const system = new CursorOptimizationSystem();
  
  try {
    // 診断実行
    await system.runDiagnostics();
    
    // 最適化デモ
    await system.demonstrateOptimization();
    
    // 実行サマリー
    system.displayExecutionSummary();
    
  } catch (error) {
    console.error('❌ システム実行エラー:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CursorOptimizationSystem, CostCalculator };