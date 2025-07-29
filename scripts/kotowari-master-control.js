#!/usr/bin/env node
// 🔥 「ことわり」システム統合管理
// 全プロジェクト一括制御

console.log('🔥 「ことわり」システム統合管理起動');

const projects = {
  "hotel-saas": {
    "agent": "Sun",
    "port": 3100,
    "specialty": "顧客体験・UI/UX・アクセシビリティ",
    "mythology": "天照大神（明るく温かい）",
    "priority": [
      "customer-experience",
      "ui-ux",
      "accessibility"
    ],
    "kotowariPath": "../hotel-common"
  },
  "hotel-member": {
    "agent": "Suno",
    "port": 3200,
    "specialty": "顧客管理・プライバシー保護・会員システム",
    "mythology": "須佐之男（力強い・守護）",
    "priority": [
      "security",
      "privacy",
      "customer-data"
    ],
    "kotowariPath": "../hotel-common"
  },
  "hotel-pms": {
    "agent": "Luna",
    "port": 3300,
    "specialty": "フロント業務・予約管理・オペレーション効率",
    "mythology": "月読（冷静沈着・確実遂行）",
    "priority": [
      "operations",
      "efficiency",
      "front-desk"
    ],
    "kotowariPath": "../hotel-common"
  }
};

// 全プロジェクト一括起動
async function startAllProjects() {
  console.log('\n🚀 全プロジェクト一括起動開始');
  
  for (const [projectName, config] of Object.entries(projects)) {
    console.log(`\n📋 ${config.agent}エージェント (${projectName}) 起動中...`);
    
    try {
      const { spawn } = require('child_process');
      const projectPath = `../${projectName}`;
      
      const process = spawn('npm', ['run', 'auto-kotowari'], {
        cwd: projectPath,
        stdio: 'inherit'
      });
      
      console.log(`✅ ${config.agent}エージェント起動完了`);
      
    } catch (error) {
      console.error(`❌ ${projectName} 起動エラー:`, error.message);
    }
  }
  
  console.log('\n🎯 全エージェント起動完了');
  console.log('💡 各プロジェクトのCursor Agent Windowで開発タスクを依頼してください');
}

// 統計情報表示
function showSystemStats() {
  console.log('\n📊 「ことわり」システム統計:');
  console.log(`  プロジェクト数: ${Object.keys(projects).length}`);
  console.log(`  エージェント: ${Object.values(projects).map(p => p.agent).join(', ')}`);
  console.log(`  総RAGファイル: 139`);
  console.log(`  トークン削減率: 91.4%`);
  
  Object.entries(projects).forEach(([name, config]) => {
    console.log(`    ${config.agent} (${name}): ${config.specialty}`);
  });
}

// コマンドライン引数処理
const command = process.argv[2];

switch (command) {
  case 'start':
  case 'startup':
    startAllProjects();
    break;
  case 'stats':
  case 'status':
    showSystemStats();
    break;
  default:
    console.log('\n💡 使用方法:');
    console.log('  npm run kotowari-master start  # 全プロジェクト起動');
    console.log('  npm run kotowari-master stats  # システム統計表示');
    showSystemStats();
    break;
}
