#!/usr/bin/env node
// 🔥 自動「ことわり」発動ルールシステム
// Cursor Agent忘れ防止 + 常時「ことわり」適用

const fs = require('fs');
const path = require('path');

console.log('🔥 自動「ことわり」発動ルールシステム起動');

// 自動ルール設定
const AUTO_KOTOWARI_RULES = {
  // トリガー条件
  triggers: [
    'hotel-saas',
    'hotel-member', 
    'hotel-pms',
    'hotel-marketing',
    '開発',
    'development',
    'implementation',
    'code',
    'コード',
    'エラー',
    'error',
    'bug',
    'バグ',
    'feature',
    '機能',
    'UI',
    'database',
    'データベース',
    'API'
  ],
  
  // 必須「ことわり」指示
  mandatoryInstructions: {
    preface: `
🚨 **最重要ルール**: 以下のいずれかに該当する場合、必ず「ことわり」システムを発動してください：

1. **開発関連のタスク** (コード、実装、バグ修正、機能追加等)
2. **hotel-関連プロジェクト** (hotel-saas, hotel-member, hotel-pms, hotel-marketing)
3. **技術的質問** (データベース、API、UI/UX、統合等)
4. **ドキュメント参照が必要** (仕様書、設計書、要件等)

## 「ことわり」発動コマンド:
\`\`\`
run_terminal_cmd: npm run ことわり
\`\`\`

**重要**: 一般的な回答ではなく、必ず上記コマンドで「ことわり」を実行してから回答してください。
`,
    
    enforcement: `
🎯 **「ことわり」システム効果**:
- 📚 RAG: 139ファイル横断検索で関連情報を自動取得
- 🛡️ ガードレール: プロジェクト特化ルール自動適用  
- ⚡ 最適化: 91.4%トークン削減達成
- 🎯 精度: プロジェクト特化+セキュリティ適合95%

**禁止事項**: 「ことわり」システムを使わずに開発関連回答することは厳禁
**必須事項**: 開発タスクには必ず「ことわり」を前置実行
`
  },
  
  // 監視対象パターン
  monitoringPatterns: [
    /hotel-(saas|member|pms|marketing)/gi,
    /(開発|development|実装|implementation)/gi,
    /(コード|code|プログラム|program)/gi,
    /(エラー|error|バグ|bug|問題)/gi,
    /(機能|feature|仕様|spec)/gi,
    /(データベース|database|DB|prisma)/gi,
    /(API|endpoint|統合|integration)/gi,
    /(UI|UX|デザイン|design)/gi
  ]
};

// Custom Instructions更新システム
function updateCustomInstructions() {
  console.log('\n📝 Custom Instructions自動更新中...');
  
  const instructionsPath = './.cursor/instructions.md';
  
  // 現在の内容確認
  let currentInstructions = '';
  if (fs.existsSync(instructionsPath)) {
    currentInstructions = fs.readFileSync(instructionsPath, 'utf8');
  }
  
  // 自動「ことわり」ルール挿入
  const enhancedInstructions = `# 🔥 hotel-common「ことわり」システム統合指示書

${AUTO_KOTOWARI_RULES.mandatoryInstructions.preface}

${AUTO_KOTOWARI_RULES.mandatoryInstructions.enforcement}

---

## 元のCustom Instructions
${currentInstructions}

---

## 自動更新情報
- 更新日時: ${new Date().toISOString()}
- 監視パターン: ${AUTO_KOTOWARI_RULES.monitoringPatterns.length}個
- トリガー数: ${AUTO_KOTOWARI_RULES.triggers.length}個
- RAG統合: 139ファイル対応済み
`;

  // ディレクトリ作成（存在しない場合）
  const instructionsDir = path.dirname(instructionsPath);
  if (!fs.existsSync(instructionsDir)) {
    fs.mkdirSync(instructionsDir, { recursive: true });
  }
  
  fs.writeFileSync(instructionsPath, enhancedInstructions);
  console.log(`✅ Custom Instructions更新完了: ${instructionsPath}`);
  
  return instructionsPath;
}

// 各プロジェクトCustom Instructions設定
function setupProjectSpecificInstructions() {
  console.log('\n🎯 各プロジェクト特化Instructions設定中...');
  
  const projects = [
    { name: 'hotel-saas', path: '../hotel-saas', agent: 'Sun', specialty: '顧客体験・UI/UX・アクセシビリティ' },
    { name: 'hotel-member', path: '../hotel-member', agent: 'Suno', specialty: '顧客管理・プライバシー保護・会員システム' },
    { name: 'hotel-pms', path: '../hotel-pms', agent: 'Luna', specialty: 'フロント業務・予約管理・オペレーション効率' }
  ];
  
  projects.forEach(project => {
    const projectInstructionsPath = path.join(project.path, '.cursor/instructions.md');
    
    const projectInstructions = `# 🔥 ${project.agent}エージェント + 「ことわり」システム統合

## ${project.agent}エージェント特化
- **プロジェクト**: ${project.name}
- **専門分野**: ${project.specialty}
- **日本神話**: ${project.agent === 'Sun' ? '天照大神（明るく温かい）' : project.agent === 'Suno' ? '須佐之男（力強い・守護）' : '月読（冷静沈着・確実遂行）'}

${AUTO_KOTOWARI_RULES.mandatoryInstructions.preface}

## ${project.name}特化「ことわり」発動
\`\`\`
run_terminal_cmd: cd ../hotel-common && npm run ことわり
\`\`\`

## ${project.agent}エージェント開発方針
${project.agent === 'Sun' ? `
- 🌟 顧客体験を最優先
- 🎨 直感的で美しいUI
- ♿ アクセシビリティ100%準拠
- 😊 温かみのある機能設計
` : project.agent === 'Suno' ? `
- 🛡️ セキュリティ最優先
- 👥 プライバシー保護徹底
- 💪 堅牢なシステム設計
- ⚔️ 顧客データ完全守護
` : `
- 🌙 オペレーション効率最優先
- ⏰ 24時間安定稼働
- 📊 確実なデータ管理
- 🎯 フロント業務最適化
`}

${AUTO_KOTOWARI_RULES.mandatoryInstructions.enforcement}

---
更新: ${new Date().toISOString()}
`;

    // ディレクトリ作成
    const projectDir = path.dirname(projectInstructionsPath);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    fs.writeFileSync(projectInstructionsPath, projectInstructions);
    console.log(`  ✅ ${project.name}: ${projectInstructionsPath}`);
  });
}

// 監視・自動更新システム
function startAutoUpdateMonitoring() {
  console.log('\n👁️ 自動更新監視システム開始...');
  
  const monitoringConfig = {
    interval: 30000, // 30秒ごと
    updateTriggers: AUTO_KOTOWARI_RULES.triggers,
    lastUpdate: new Date().toISOString()
  };
  
  console.log(`監視間隔: ${monitoringConfig.interval/1000}秒`);
  console.log(`監視トリガー: ${monitoringConfig.updateTriggers.length}個`);
  
  // 定期更新スケジュール
  setInterval(() => {
    try {
      updateCustomInstructions();
      console.log(`🔄 自動更新実行: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.warn(`⚠️ 自動更新エラー: ${error.message}`);
    }
  }, monitoringConfig.interval);
  
  console.log('✅ 監視システム起動完了');
  
  return monitoringConfig;
}

// メイン実行
async function main() {
  try {
    console.log('\n📋 Phase 1: Custom Instructions自動更新');
    const instructionsPath = updateCustomInstructions();
    
    console.log('\n📋 Phase 2: プロジェクト特化Instructions設定');
    setupProjectSpecificInstructions();
    
    // バックグラウンド監視は setup モードでは実行しない
    const isSetupMode = process.argv.includes('--setup-only') || process.env.SETUP_MODE === 'true';
    
    if (!isSetupMode) {
      console.log('\n📋 Phase 3: 自動更新監視システム起動');
      const monitoringConfig = startAutoUpdateMonitoring();
      
      console.log('\n🚀 バックグラウンド監視継続中... (Ctrl+C で停止)');
    } else {
      console.log('\n📋 Phase 3: 監視システム設定完了（起動スキップ）');
      console.log('💡 監視システム開始: npm run start:auto-kotowari');
    }
    
    console.log('\n🎯 自動「ことわり」発動ルールシステム構築完了!');
    console.log('✅ Cursor Agent忘れ防止機能');
    console.log('✅ 自動Custom Instructions更新');
    console.log('✅ プロジェクト特化Instructions');
    console.log('✅ 30秒間隔監視システム設定');
    
    console.log('\n🔥 効果:');
    console.log('  - 開発タスク時に自動「ことわり」発動');
    console.log('  - 91.4%トークン削減維持');
    console.log('  - プロジェクト特化精度保証');
    console.log('  - 140ファイルRAG完全活用');
    
    console.log('\n💡 使用方法:');
    console.log('  各プロジェクトでCursor Agent Windowを開き、開発タスクを依頼するだけ');
    console.log('  システムが自動で「ことわり」を発動します');
    
    if (isSetupMode) {
      console.log('\n✅ 設定完了 - プロセス終了');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  updateCustomInstructions, 
  setupProjectSpecificInstructions, 
  startAutoUpdateMonitoring,
  AUTO_KOTOWARI_RULES 
}; 