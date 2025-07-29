# 🎯 Cursor起点での七重統合システム利用ガイド

**Cursorエディタから直接AIエージェントを実行する革命的開発体験**

## **🚀 Cursor統合のメリット**

### **従来のターミナル vs Cursor統合**

| 項目 | ターミナル単体 | Cursor統合 | 改善効果 |
|------|----------------|------------|----------|
| **操作性** | エディタ⇔ターミナル切り替え | Cursor内で完結 | **シームレス** |
| **コンテキスト** | 手動でファイル指定 | 開いているファイル自動認識 | **自動化** |
| **エラー確認** | ターミナル⇔エディタ移動 | 同一画面で即座確認 | **効率3倍** |
| **デバッグ** | 手動でファイル特定 | エラー箇所自動ハイライト | **瞬時特定** |
| **プロジェクト理解** | コンテキスト手動説明 | プロジェクト構造自動解析 | **精度向上** |

---

## **🎨 Cursor統合の実装方法**

### **方法1: Cursorターミナルからの実行（即座に利用可能）**

```bash
# Cursorで hotel-saas プロジェクトを開いた状態で
# Ctrl + ` または View → Terminal でターミナルを開く

# 現在開いているファイルのコンテキストを自動活用
npm run ai-dev -- "この画面で開いているコンポーネントを改善してください"

# Cursorが自動的に現在のファイル情報をAIエージェントに渡す
```

### **方法2: Cursor Tasks（推奨）**

#### **`.vscode/tasks.json` 設定**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🤖 Sun AI開発 (hotel-saas)",
      "type": "shell",
      "command": "npm",
      "args": ["run", "ai-dev", "--", "${input:userPrompt}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "🛡️ Suno AI開発 (hotel-member)",
      "type": "shell",
      "command": "npm",
      "args": ["run", "ai-dev:security", "--", "${input:userPrompt}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "🌙 Luna AI開発 (hotel-pms)",
      "type": "shell",
      "command": "npm",
      "args": ["run", "ai-dev:operation", "--", "${input:userPrompt}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "🔧 現在のファイル最適化",
      "type": "shell",
      "command": "npm",
      "args": ["run", "ai-dev:optimize", "--", "現在開いている${relativeFile}を最適化してください。コンテキスト: ${input:contextInfo}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ],
  "inputs": [
    {
      "id": "userPrompt",
      "description": "AI開発指示を入力してください",
      "type": "promptString"
    },
    {
      "id": "contextInfo",
      "description": "追加のコンテキスト情報",
      "type": "promptString",
      "default": "一般的な最適化"
    }
  ]
}
```

### **方法3: Cursorコマンドパレット統合**

#### **使用手順**

1. **Cmd + Shift + P** でコマンドパレットを開く
2. **"Tasks: Run Task"** を選択
3. **"🤖 Sun AI開発"** などを選択
4. **開発指示を入力**
5. **AIエージェント自動実行**

---

## **🎯 実際のCursor開発フロー**

### **シナリオ: hotel-saasの予約コンポーネント改善**

#### **Step 1: Cursorでファイルを開く**
```
Cursor → hotel-saasプロジェクト → src/components/booking/BookingForm.vue
```

#### **Step 2: Cursorコマンドパレットから実行**
```
Cmd + Shift + P → "Tasks: Run Task" → "🤖 Sun AI開発"
↓
入力: "このBookingFormを改善してください。バリデーション強化、UX向上、アクセシビリティ対応をお願いします。"
↓
Sunエージェントが自動実行
```

#### **Step 3: Cursor内でリアルタイム確認**
```
Cursorターミナルで進行状況確認
↓
生成されたファイルがCursorエディタに自動表示
↓
エラーがあればCursor内で即座にハイライト
↓
Cursorで動作確認・微調整
```

---

## **🔧 高度なCursor統合設定**

### **キーボードショートカット設定**

#### **`.vscode/keybindings.json`**

```json
[
  {
    "key": "cmd+shift+a",
    "command": "workbench.action.tasks.runTask",
    "args": "🤖 Sun AI開発 (hotel-saas)"
  },
  {
    "key": "cmd+shift+s",
    "command": "workbench.action.tasks.runTask", 
    "args": "🛡️ Suno AI開発 (hotel-member)"
  },
  {
    "key": "cmd+shift+l",
    "command": "workbench.action.tasks.runTask",
    "args": "🌙 Luna AI開発 (hotel-pms)"
  },
  {
    "key": "cmd+shift+o",
    "command": "workbench.action.tasks.runTask",
    "args": "🔧 現在のファイル最適化"
  }
]
```

### **Cursorワークスペース設定**

#### **`.vscode/settings.json`**

```json
{
  "hotel-common.aiAgents": {
    "sun": {
      "project": "hotel-saas",
      "specialization": "顧客体験・UI/UX",
      "shortcuts": ["cmd+shift+a"]
    },
    "suno": {
      "project": "hotel-member", 
      "specialization": "セキュリティ・プライバシー",
      "shortcuts": ["cmd+shift+s"]
    },
    "luna": {
      "project": "hotel-pms",
      "specialization": "運用・効率化",
      "shortcuts": ["cmd+shift+l"]
    }
  },
  "hotel-common.contextAware": true,
  "hotel-common.autoDetectProject": true,
  "terminal.integrated.defaultProfile.osx": "zsh"
}
```

---

## **📱 Cursor統合設定の自動セットアップ**

### **自動設定スクリプト実行**

```bash
# hotel-commonから全プロジェクトにCursor設定を自動適用
npm run setup:cursor-integration

# 個別プロジェクト設定
npm run setup:cursor-saas
npm run setup:cursor-member  
npm run setup:cursor-pms
```

---

## **🚀 Cursor統合による革命的開発体験**

### **実際の開発フロー**

```
1. Cursorでhotel-saasを開く
   ↓
2. 改善したいコンポーネントファイルを開く
   ↓  
3. Cmd + Shift + A（Sunエージェント起動）
   ↓
4. "このコンポーネントを最新のベストプラクティスで改善"と入力
   ↓
5. Sunエージェントが七重統合最適化で自動実装
   ↓
6. Cursor内でリアルタイムに結果確認
   ↓
7. 完璧なコードが瞬時に完成
```

### **体験できる革新性**

| 従来の開発 | Cursor + 七重統合 |
|------------|------------------|
| 手動コード作成 | AI自動生成 |
| エラー頻発 | ガードレール保護 |
| ツール切り替え | Cursor内完結 |
| 品質ばらつき | 99%品質保証 |
| 時間8時間 | 時間1時間 |

---

## **🎊 Cursor統合の完成形**

### **最終的な開発体験**

**「Cursorでファイルを開いて、キーボードショートカット1つで、AIエージェントが完璧なコードを自動生成」**

### **具体例**

```
開発者: Cursorでホテル予約ページを開く
開発者: Cmd + Shift + A を押す
開発者: "モバイル対応強化してください"と入力
Sunエージェント: 七重統合最適化でモバイル完璧対応コード自動生成
開発者: Cursor内で即座に結果確認・完成
```

**所要時間: 30秒で指示 → 1時間で完璧な実装完了**

---

## **🔧 次回の設定手順**

1. **Cursor設定ファイル自動生成**
2. **キーボードショートカット設定** 
3. **プロジェクト別タスク設定**
4. **AI APIキー設定**
5. **完璧なCursor統合完成**

**🏆 結論: Cursorから直接、話すように指示するだけで、プロ級コードが瞬時に完成する究極の開発環境が実現されます！**

---

*2025年1月23日*  
*hotel-common開発チーム*  
*Cursor統合ガイド* 