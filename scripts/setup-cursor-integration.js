#!/usr/bin/env node
// 🎯 hotel-common七重統合システム - Cursor統合自動セットアップ
// 全プロジェクトにCursor設定を自動適用

const fs = require('fs');
const path = require('path');

console.log('🎯'.repeat(60));
console.log('🎯 hotel-common七重統合システム - Cursor統合セットアップ');
console.log('🎯 Cursorエディタから直接AIエージェント実行可能に');
console.log('🎯'.repeat(60));

// プロジェクト別Cursor設定
const cursorConfigs = {
  'hotel-saas': {
    agent: 'sun',
    description: 'Sunエージェント（天照大神）- 明るく温かい顧客体験を提供',
    specialization: '顧客体験・UI/UX・アクセシビリティ',
    shortcuts: 'cmd+shift+a',
    tasks: [
      {
        label: "🤖 Sun AI開発 (基本)",
        command: "ai-dev",
        detail: "Sunエージェントで一般的な開発タスクを実行"
      },
      {
        label: "✨ Sun AI - 新機能開発", 
        command: "ai-dev:feature",
        detail: "Sunエージェントで新機能開発"
      },
      {
        label: "🐛 Sun AI - バグ修正",
        command: "ai-dev:bug", 
        detail: "Sunエージェントでバグ修正"
      },
      {
        label: "⚡ Sun AI - パフォーマンス最適化",
        command: "ai-dev:optimize",
        detail: "Sunエージェントでパフォーマンス最適化"
      }
    ]
  },
  'hotel-member': {
    agent: 'suno',
    description: 'Sunoエージェント（須佐之男）- 力強い顧客守護とセキュリティ',
    specialization: 'セキュリティ・プライバシー・GDPR',
    shortcuts: 'cmd+shift+s',
    tasks: [
      {
        label: "🛡️ Suno AI開発 (基本)",
        command: "ai-dev",
        detail: "Sunoエージェントでセキュリティ重視開発"
      },
      {
        label: "🔒 Suno AI - セキュリティ強化",
        command: "ai-dev:security",
        detail: "Sunoエージェントでセキュリティ機能開発"
      },
      {
        label: "⚖️ Suno AI - GDPR対応",
        command: "ai-dev:gdpr", 
        detail: "Sunoエージェントでコンプライアンス対応"
      },
      {
        label: "🔐 Suno AI - プライバシー保護",
        command: "ai-dev:privacy",
        detail: "Sunoエージェントでプライバシー機能強化"
      }
    ]
  },
  'hotel-pms': {
    agent: 'luna',
    description: 'Lunaエージェント（月読）- 冷静沈着な24時間運用管理',
    specialization: '運用・効率化・24時間対応',
    shortcuts: 'cmd+shift+l',
    tasks: [
      {
        label: "🌙 Luna AI開発 (基本)",
        command: "ai-dev",
        detail: "Lunaエージェントで運用効率化開発"
      },
      {
        label: "🏢 Luna AI - フロント業務",
        command: "ai-dev:front",
        detail: "Lunaエージェントでフロント業務最適化"
      },
      {
        label: "⚙️ Luna AI - 運用改善",
        command: "ai-dev:operation",
        detail: "Lunaエージェントで運用プロセス改善"
      },
      {
        label: "📈 Luna AI - 効率化",
        command: "ai-dev:efficiency",
        detail: "Lunaエージェントで業務効率化"
      }
    ]
  }
};

// 基盤ディレクトリ
const baseDir = path.dirname(__dirname);
const projectsBaseDir = path.dirname(baseDir);

// Cursor設定作成関数
function createCursorConfig(projectName, config) {
  const projectPath = path.join(projectsBaseDir, projectName);
  const vscodeDir = path.join(projectPath, '.vscode');
  
  console.log(`\n🎯 ${projectName} Cursor設定作成中...`);
  
  if (!fs.existsSync(projectPath)) {
    console.log(`  ⚠️  ${projectName} ディレクトリが見つかりません`);
    return false;
  }
  
  try {
    // .vscodeディレクトリ作成
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir, { recursive: true });
    }
    
    // 1. tasks.json作成
    const tasksConfig = {
      "version": "2.0.0",
      "tasks": config.tasks.map(task => ({
        "label": task.label,
        "type": "shell",
        "command": "npm",
        "args": ["run", task.command, "--", "${input:userPrompt}"],
        "group": "build",
        "presentation": {
          "echo": true,
          "reveal": "always",
          "focus": false,
          "panel": "new",
          "showReuseMessage": false
        },
        "problemMatcher": [],
        "detail": task.detail
      })).concat([
        {
          "label": "📝 現在のファイルを改善",
          "type": "shell",
          "command": "npm",
          "args": ["run", "ai-dev", "--", "現在開いている「${relativeFile}」を改善してください。${input:improvementType}"],
          "group": "build",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "new",
            "showReuseMessage": false
          },
          "problemMatcher": [],
          "detail": "現在Cursorで開いているファイルを自動改善"
        }
      ]),
      "inputs": [
        {
          "id": "userPrompt",
          "description": `🤖 ${config.agent.toUpperCase()}エージェントへの開発指示を入力してください`,
          "type": "promptString"
        },
        {
          "id": "improvementType",
          "description": "改善の方向性を指定してください",
          "type": "pickString",
          "options": [
            "パフォーマンス最適化",
            "アクセシビリティ向上", 
            "TypeScript型安全性強化",
            "エラーハンドリング改善",
            "コード品質向上",
            "セキュリティ強化",
            "UX/UI改善",
            "テストカバレッジ向上"
          ],
          "default": "コード品質向上"
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(vscodeDir, 'tasks.json'),
      JSON.stringify(tasksConfig, null, 2)
    );
    console.log(`  ✅ tasks.json 作成完了`);
    
    // 2. keybindings.json作成
    const keybindings = [
      {
        "key": config.shortcuts,
        "command": "workbench.action.tasks.runTask",
        "args": config.tasks[0].label,
        "when": "!terminalFocus"
      },
      {
        "key": "cmd+shift+i",
        "command": "workbench.action.tasks.runTask",
        "args": "📝 現在のファイルを改善",
        "when": "!terminalFocus && editorTextFocus"
      },
      {
        "key": "cmd+k cmd+t",
        "command": "workbench.action.tasks.runTask",
        "when": "!terminalFocus"
      }
    ];
    
    fs.writeFileSync(
      path.join(vscodeDir, 'keybindings.json'),
      JSON.stringify(keybindings, null, 2)
    );
    console.log(`  ✅ keybindings.json 作成完了`);
    
    // 3. settings.json作成
    const settings = {
      "hotel-common.aiAgents": {
        [config.agent]: {
          "project": projectName,
          "specialization": config.specialization,
          "shortcuts": [config.shortcuts],
          "description": config.description
        }
      },
      "hotel-common.contextAware": true,
      "hotel-common.autoDetectProject": true,
      "hotel-common.sevenIntegration": {
        "enabled": true,
        "optimizationLevel": "maximum",
        "guardrails": true,
        "ragKnowledge": true,
        "promptPerfection": true
      },
      "terminal.integrated.defaultProfile.osx": "zsh",
      "terminal.integrated.fontSize": 13,
      "editor.formatOnSave": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      }
    };
    
    fs.writeFileSync(
      path.join(vscodeDir, 'settings.json'),
      JSON.stringify(settings, null, 2)
    );
    console.log(`  ✅ settings.json 作成完了`);
    
    console.log(`🎉 ${projectName} Cursor統合設定完了！`);
    return true;
    
  } catch (error) {
    console.error(`❌ ${projectName} Cursor設定エラー:`, error.message);
    return false;
  }
}

// サマリー表示関数
function displaySetupSummary(results) {
  console.log('\n🎯 Cursor統合セットアップ完了サマリー:');
  console.log('━'.repeat(50));
  
  let successCount = 0;
  Object.entries(results).forEach(([project, success]) => {
    const status = success ? '✅ 完了' : '❌ 失敗';
    const agent = cursorConfigs[project].agent.toUpperCase();
    console.log(`  ${status} ${project} (${agent}エージェント)`);
    if (success) successCount++;
  });
  
  console.log('━'.repeat(50));
  console.log(`📊 成功率: ${successCount}/${Object.keys(results).length} (${Math.round(successCount/Object.keys(results).length*100)}%)`);
  
  if (successCount === Object.keys(results).length) {
    console.log('\n🎉 全プロジェクトCursor統合完了！');
    console.log('\n🚀 使用方法:');
    console.log('  1. Cursorで各プロジェクトを開く');
    console.log('  2. Cmd + Shift + P でコマンドパレット');
    console.log('  3. "Tasks: Run Task" を選択');
    console.log('  4. AIエージェントタスクを選択');
    console.log('  5. 開発指示を入力して実行');
    console.log('');
    console.log('📎 キーボードショートカット:');
    console.log('  Cmd + Shift + A: Sunエージェント (hotel-saas)');
    console.log('  Cmd + Shift + S: Sunoエージェント (hotel-member)');
    console.log('  Cmd + Shift + L: Lunaエージェント (hotel-pms)');
    console.log('  Cmd + Shift + I: 現在のファイル改善');
  } else {
    console.log('\n⚠️  一部プロジェクトのCursor設定に問題があります');
  }
}

// メイン実行
async function main() {
  console.log('\n📋 hotel-common七重統合システム Cursor統合セットアップ');
  console.log('🎯 目標: Cursorエディタから直接AIエージェント実行環境構築');
  
  const results = {};
  
  // 各プロジェクトのCursor設定作成
  for (const [projectName, config] of Object.entries(cursorConfigs)) {
    results[projectName] = createCursorConfig(projectName, config);
  }
  
  // サマリー表示
  displaySetupSummary(results);
  
  console.log('\n🎯 hotel-common七重統合システム Cursor統合完了！');
  console.log('🚀 Cursorから話すように指示するだけで完璧なコード生成！');
}

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Cursor統合セットアップエラー:', error);
    process.exit(1);
  });
}

module.exports = { createCursorConfig, cursorConfigs }; 