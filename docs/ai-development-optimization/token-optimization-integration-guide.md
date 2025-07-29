# 🔗 トークン最適化システム - 連携・統合ガイド

**ドキュメントID**: token-optimization-integration-guide  
**作成日**: 2025年1月27日  
**対象**: hotel-common統合開発者・各プロジェクト開発者  
**前提**: token-optimization-specification.md 参照

---

## 📋 **連携方法一覧**

### **🎯 連携レベル別対応**

| 連携レベル | 対象 | 実装方法 | 複雑度 |
|-----------|------|----------|--------|
| **Level 1** | 直接利用 | NPMパッケージインポート | 低 |
| **Level 2** | 設定ベース | .hotel-config.js自動適用 | 中 |
| **Level 3** | システム統合 | UnifiedPrismaClient統合 | 高 |
| **Level 4** | オーケストレーター | SevenIntegration経由 | 最高 |

---

## 🏗️ **Level 1: 直接利用パターン**

### **基本インポート・利用**

```typescript
// hotel-member/src/services/optimized-service.ts
import { 
  TokenOptimizationSystem, 
  HotelMemberAdapter 
} from 'hotel-common/seven-integration/token-optimization';

export class OptimizedMemberService {
  private optimizer: TokenOptimizationSystem;
  private memberAdapter: HotelMemberAdapter;

  constructor() {
    // 基本システム初期化
    this.optimizer = new TokenOptimizationSystem({
      projectType: 'hotel-member',
      languageOptimization: {
        taskType: 'complex',
        thinkingLanguage: 'english',
        outputLanguage: 'japanese'
      },
      contextManagement: {
        maxTokens: 4000,
        autoOptimize: true
      }
    });

    // 専用アダプター初期化
    this.memberAdapter = new HotelMemberAdapter({
      securityFocus: true,
      privacyCompliance: true,
      gdprMode: true
    });
  }

  async optimizeRequest(request: string, context?: string) {
    return await this.optimizer.optimizeRequest(request, context);
  }

  async optimizeSecurityRequest(request: string, context?: string) {
    return await this.memberAdapter.optimizeSecurityRequest(request, context);
  }

  async optimizeGDPRRequest(request: string, context?: string) {
    return await this.memberAdapter.optimizeGDPRRequest(request, context);
  }
}
```

### **プロジェクト固有の利用例**

#### **hotel-member（セキュリティ特化）**
```typescript
// セキュリティ重視の最適化
const securityResult = await memberAdapter.optimizeSecurityRequest(
  "JWT認証システムを実装してください",
  "ブルートフォース攻撃対策も含めてください"
);

console.log('Optimized prompt:', securityResult.optimizedPrompt);
console.log('Security checklist:', securityResult.securityChecklist);
console.log('Token reduction:', securityResult.tokenReduction);
```

#### **hotel-saas（UX特化）**
```typescript
// UX・デザイン重視の最適化
const saasOptimizer = new TokenOptimizationSystem({
  projectType: 'hotel-saas',
  languageOptimization: {
    taskType: 'design',
    thinkingLanguage: 'english',
    outputLanguage: 'japanese'
  }
});

const uxResult = await saasOptimizer.optimizeRequest(
  "レスポンシブ対応の予約フォームを実装してください",
  "アクセシビリティとSEO最適化も考慮してください"
);
```

#### **hotel-pms（効率重視）**
```typescript
// シンプル・効率重視の最適化
const pmsOptimizer = new TokenOptimizationSystem({
  projectType: 'hotel-pms',
  languageOptimization: {
    taskType: 'simple',
    thinkingLanguage: 'english',
    outputLanguage: 'japanese'
  }
});

const efficiencyResult = await pmsOptimizer.optimizeRequest(
  "チェックイン処理を自動化してください"
);
```

---

## ⚙️ **Level 2: 設定ベース自動適用**

### **各プロジェクトの設定ファイル**

#### **hotel-member/.hotel-config.js**
```javascript
module.exports = {
  projectType: 'hotel-member',
  tokenOptimization: {
    enabled: true,
    languageOptimization: {
      taskType: 'complex',
      thinkingLanguage: 'english',
      outputLanguage: 'japanese',
      tokenBudget: 4000
    },
    contextManagement: {
      maxTokens: 4000,
      autoOptimize: true
    },
    // hotel-member固有設定
    securityFocus: true,
    privacyCompliance: true,
    gdprMode: true,
    customConstraints: [
      'Security: All queries MUST include tenantId',
      'Models: customers (NOT customer), Staff (NOT User)',
      'GDPR: Data deletion capability required',
      'Privacy: Encryption for all PII data'
    ]
  },
  hotelCommonIntegration: '../hotel-common'
};
```

#### **hotel-saas/.hotel-config.js**
```javascript
module.exports = {
  projectType: 'hotel-saas',
  tokenOptimization: {
    enabled: true,
    languageOptimization: {
      taskType: 'design',
      thinkingLanguage: 'english',
      outputLanguage: 'japanese'
    },
    contextManagement: {
      maxTokens: 4000,
      autoOptimize: true
    },
    // hotel-saas固有設定
    uxFocus: true,
    responsiveDesign: true,
    accessibilityCompliance: true,
    customConstraints: [
      'UX: Mobile-first responsive design',
      'Accessibility: WCAG 2.1 AA compliance',
      'Performance: Core Web Vitals optimization',
      'SEO: Structured data implementation'
    ]
  },
  hotelCommonIntegration: '../hotel-common'
};
```

#### **hotel-pms/.hotel-config.js**
```javascript
module.exports = {
  projectType: 'hotel-pms',
  tokenOptimization: {
    enabled: true,
    languageOptimization: {
      taskType: 'simple',
      thinkingLanguage: 'english',
      outputLanguage: 'japanese'
    },
    contextManagement: {
      maxTokens: 3000,
      autoOptimize: true
    },
    // hotel-pms固有設定
    operationFocus: true,
    efficiency: true,
    reliabilityPriority: true,
    customConstraints: [
      'Operations: 24/7 availability required',
      'Reliability: 99.9% uptime target',
      'Efficiency: Minimal staff intervention',
      'Integration: PMS system compatibility'
    ]
  },
  hotelCommonIntegration: '../hotel-common'
};
```

### **自動セットアップシステム**

```typescript
// hotel-common/src/seven-integration/token-optimization/setup.ts
import path from 'path';
import { TokenOptimizationSystem } from './index';
import { HotelMemberAdapter } from './project-adapters/member-adapter';

export interface ProjectSetupResult {
  success: boolean;
  optimizer?: TokenOptimizationSystem;
  adapter?: any;
  config?: any;
  error?: string;
}

export async function setupProjectOptimization(
  projectPath: string
): Promise<ProjectSetupResult> {
  try {
    const configPath = path.join(projectPath, '.hotel-config.js');
    const config = require(configPath);
    
    if (!config.tokenOptimization?.enabled) {
      return {
        success: false,
        error: 'Token optimization not enabled in config'
      };
    }

    // 基本最適化システム設定
    const optimizer = new TokenOptimizationSystem({
      projectType: config.projectType,
      ...config.tokenOptimization
    });

    // プロジェクト固有アダプター設定
    let adapter;
    if (config.projectType === 'hotel-member') {
      adapter = new HotelMemberAdapter(config.tokenOptimization);
    }
    // 他プロジェクトのアダプターも将来追加

    // グローバル設定
    global.hotelTokenOptimizer = optimizer;
    global.hotelProjectAdapter = adapter;

    return {
      success: true,
      optimizer,
      adapter,
      config: config.tokenOptimization
    };

  } catch (error) {
    return {
      success: false,
      error: `Setup failed: ${error.message}`
    };
  }
}

export function getGlobalOptimizer(): TokenOptimizationSystem | null {
  return global.hotelTokenOptimizer || null;
}

export function getGlobalAdapter(): any | null {
  return global.hotelProjectAdapter || null;
}
```

### **各プロジェクトでの自動適用**

```typescript
// hotel-member/src/app.ts
import { setupProjectOptimization } from 'hotel-common/seven-integration/token-optimization/setup';

async function initializeApp() {
  // トークン最適化自動セットアップ
  const setupResult = await setupProjectOptimization(__dirname);
  
  if (setupResult.success) {
    console.log('✅ Token optimization setup completed');
    console.log('Project type:', setupResult.config?.projectType);
    console.log('Security focus:', setupResult.config?.securityFocus);
  } else {
    console.error('❌ Token optimization setup failed:', setupResult.error);
  }

  // アプリケーション初期化続行
  // ...
}

initializeApp();
```

---

## 🔗 **Level 3: システム統合パターン**

### **UnifiedPrismaClient統合**

```typescript
// hotel-common/src/api/unified-client.ts に追加
import { TokenOptimizationSystem } from '../seven-integration/token-optimization';

export class UnifiedPrismaClient {
  private tokenOptimizers: Map<string, TokenOptimizationSystem> = new Map();
  private currentProject: string = 'hotel-member';

  constructor() {
    this.initializeOptimizers();
  }

  private initializeOptimizers(): void {
    // プロジェクト別最適化システム初期化
    this.tokenOptimizers.set('hotel-member', new TokenOptimizationSystem({
      projectType: 'hotel-member',
      languageOptimization: { taskType: 'complex' },
      contextManagement: { maxTokens: 4000 }
    }));

    this.tokenOptimizers.set('hotel-saas', new TokenOptimizationSystem({
      projectType: 'hotel-saas',
      languageOptimization: { taskType: 'design' },
      contextManagement: { maxTokens: 4000 }
    }));

    this.tokenOptimizers.set('hotel-pms', new TokenOptimizationSystem({
      projectType: 'hotel-pms',
      languageOptimization: { taskType: 'simple' },
      contextManagement: { maxTokens: 3000 }
    }));
  }

  async optimizedQuery(
    query: string, 
    context?: string,
    projectOverride?: string
  ): Promise<{
    result: any;
    optimization: {
      originalQuery: string;
      optimizedPrompt: string;
      tokenReduction: number;
      projectType: string;
    };
  }> {
    const project = projectOverride || this.currentProject;
    const optimizer = this.tokenOptimizers.get(project);
    
    if (!optimizer) {
      throw new Error(`No optimizer configured for project: ${project}`);
    }

    // 最適化実行
    const optimized = await optimizer.optimizeRequest(query, context);
    
    // 最適化されたプロンプトでクエリ実行
    const result = await this.executeQuery(optimized.optimizedPrompt);

    return {
      result,
      optimization: {
        originalQuery: query,
        optimizedPrompt: optimized.optimizedPrompt,
        tokenReduction: optimized.tokenReduction,
        projectType: project
      }
    };
  }

  setCurrentProject(project: 'hotel-saas' | 'hotel-member' | 'hotel-pms'): void {
    this.currentProject = project;
  }

  async with_tenant_optimized<T>(
    tenantId: string,
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const optimizedContext = context ? 
      await this.optimizeContext(context, tenantId) : 
      undefined;

    return this.with_tenant(tenantId, operation);
  }

  private async optimizeContext(context: string, tenantId: string): Promise<string> {
    const optimizer = this.tokenOptimizers.get(this.currentProject);
    if (optimizer) {
      const result = await optimizer.optimizeRequest(
        `Tenant context: ${tenantId}`,
        context
      );
      return result.optimizedPrompt;
    }
    return context;
  }
}
```

---

## 🎭 **Level 4: オーケストレーター統合**

### **SevenIntegrationOrchestrator拡張**

```typescript
// hotel-common/src/seven-integration/orchestrator.ts に追加
import { TokenOptimizationSystem } from './token-optimization';
import { HotelMemberAdapter } from './token-optimization/project-adapters/member-adapter';

export class SevenIntegrationOrchestrator {
  private tokenOptimizers: Map<string, TokenOptimizationSystem> = new Map();
  private projectAdapters: Map<string, any> = new Map();

  constructor() {
    this.initializeOptimization();
  }

  private initializeOptimization(): void {
    // プロジェクト別最適化システム初期化
    this.tokenOptimizers.set('hotel-member', new TokenOptimizationSystem({
      projectType: 'hotel-member',
      languageOptimization: { 
        taskType: 'complex',
        thinkingLanguage: 'english',
        outputLanguage: 'japanese'
      },
      contextManagement: { 
        maxTokens: 4000,
        autoOptimize: true 
      }
    }));

    this.tokenOptimizers.set('hotel-saas', new TokenOptimizationSystem({
      projectType: 'hotel-saas',
      languageOptimization: { 
        taskType: 'design',
        thinkingLanguage: 'english',
        outputLanguage: 'japanese'
      },
      contextManagement: { 
        maxTokens: 4000,
        autoOptimize: true 
      }
    }));

    this.tokenOptimizers.set('hotel-pms', new TokenOptimizationSystem({
      projectType: 'hotel-pms',
      languageOptimization: { 
        taskType: 'simple',
        thinkingLanguage: 'english',
        outputLanguage: 'japanese'
      },
      contextManagement: { 
        maxTokens: 3000,
        autoOptimize: true 
      }
    }));

    // プロジェクト固有アダプター初期化
    this.projectAdapters.set('hotel-member', new HotelMemberAdapter({
      securityFocus: true,
      privacyCompliance: true,
      gdprMode: true
    }));
  }

  async executeWithOptimization(
    request: string,
    targetProject: 'hotel-saas' | 'hotel-member' | 'hotel-pms',
    context?: string,
    optimizationType?: 'standard' | 'security' | 'gdpr' | 'performance'
  ): Promise<{
    result: any;
    optimization: {
      originalRequest: string;
      optimizedPrompt: string;
      tokenReduction: number;
      optimizationType: string;
      projectType: string;
    };
  }> {
    const optimizer = this.tokenOptimizers.get(targetProject);
    const adapter = this.projectAdapters.get(targetProject);

    if (!optimizer) {
      throw new Error(`No optimizer configured for ${targetProject}`);
    }

    let optimized;

    // 最適化タイプに応じた処理
    if (optimizationType === 'security' && adapter?.optimizeSecurityRequest) {
      optimized = await adapter.optimizeSecurityRequest(request, context);
    } else if (optimizationType === 'gdpr' && adapter?.optimizeGDPRRequest) {
      optimized = await adapter.optimizeGDPRRequest(request, context);
    } else {
      optimized = await optimizer.optimizeRequest(request, context);
    }

    // 最適化されたプロンプトで実際の処理実行
    const result = await this.routeToProject(targetProject, optimized.optimizedPrompt);

    return {
      result,
      optimization: {
        originalRequest: request,
        optimizedPrompt: optimized.optimizedPrompt,
        tokenReduction: optimized.tokenReduction || 0,
        optimizationType: optimizationType || 'standard',
        projectType: targetProject
      }
    };
  }

  async getOptimizationStats(): Promise<{
    [project: string]: {
      language: any;
      context: any;
      adapter?: any;
    };
  }> {
    const stats: any = {};

    for (const [project, optimizer] of this.tokenOptimizers.entries()) {
      stats[project] = {
        ...optimizer.getStats(),
        adapter: this.projectAdapters.get(project)?.getAdapterStats?.()
      };
    }

    return stats;
  }
}
```

---

## 📞 **コマンドライン・NPMスクリプト連携**

### **hotel-common/package.json 拡張**

```json
{
  "scripts": {
    "token-optimize:member": "node scripts/token-optimize.js hotel-member",
    "token-optimize:saas": "node scripts/token-optimize.js hotel-saas",
    "token-optimize:pms": "node scripts/token-optimize.js hotel-pms",
    "token-optimize:all": "npm run token-optimize:member && npm run token-optimize:saas && npm run token-optimize:pms",
    
    "seven-integration:suno-optimized": "node scripts/seven-integration-optimized.js suno",
    "seven-integration:sun-optimized": "node scripts/seven-integration-optimized.js sun",
    "seven-integration:luna-optimized": "node scripts/seven-integration-optimized.js luna",
    
    "optimization:stats": "node scripts/optimization-stats.js",
    "optimization:benchmark": "node scripts/optimization-benchmark.js"
  }
}
```

### **使用例**

```bash
# hotel-commonから各プロジェクトに最適化指示
cd /Users/kaneko/hotel-common

# セキュリティ特化最適化でhotel-memberに指示
npm run seven-integration:suno-optimized -- "GDPR準拠の会員データ削除機能を実装してください" --type=security

# UX特化最適化でhotel-saasに指示
npm run seven-integration:sun-optimized -- "レスポンシブ対応の予約フォームを実装してください" --type=design

# 効率重視最適化でhotel-pmsに指示  
npm run seven-integration:luna-optimized -- "チェックイン処理を自動化してください" --type=simple

# 全プロジェクトの最適化統計確認
npm run optimization:stats

# 最適化効果のベンチマーク実行
npm run optimization:benchmark
```

---

## 📊 **統計・監視連携**

### **統計確認方法**

```typescript
// 基本統計確認
const optimizer = new TokenOptimizationSystem({
  projectType: 'hotel-member',
  languageOptimization: { taskType: 'complex' },
  contextManagement: { maxTokens: 4000 }
});

const stats = optimizer.getStats();
console.log('Language optimization:', stats.language);
console.log('Context management:', stats.context);
console.log('Project type:', stats.projectType);

// アダプター統計確認
const memberAdapter = new HotelMemberAdapter();
const adapterStats = memberAdapter.getAdapterStats();
console.log('Security mode:', adapterStats.securityMode);
console.log('GDPR compliant:', adapterStats.gdprCompliant);
console.log('Optimization stats:', adapterStats.optimizationStats);

// オーケストレーター統計確認
const orchestrator = new SevenIntegrationOrchestrator();
const allStats = await orchestrator.getOptimizationStats();
console.log('All project stats:', allStats);
```

### **リアルタイム監視**

```typescript
// 継続的監視システム
class OptimizationMonitor {
  private optimizers: Map<string, TokenOptimizationSystem> = new Map();

  startMonitoring(): void {
    setInterval(async () => {
      const stats = await this.collectAllStats();
      this.reportStats(stats);
    }, 60000); // 1分間隔
  }

  private async collectAllStats(): Promise<any> {
    const stats: any = {};
    for (const [project, optimizer] of this.optimizers.entries()) {
      stats[project] = optimizer.getStats();
    }
    return stats;
  }

  private reportStats(stats: any): void {
    console.log('=== Token Optimization Stats ===');
    for (const [project, projectStats] of Object.entries(stats)) {
      console.log(`${project}:`, projectStats);
    }
  }
}
```

---

## ✅ **連携確認チェックリスト**

### **導入前確認**
- [ ] hotel-common依存関係追加済み
- [ ] .hotel-config.js設定完了
- [ ] package.jsonスクリプト設定完了

### **機能確認**
- [ ] TokenOptimizationSystemインスタンス化成功
- [ ] プロジェクト固有アダプター動作確認
- [ ] 最適化実行・結果取得成功
- [ ] 統計情報取得成功

### **統合確認**  
- [ ] UnifiedPrismaClient統合動作確認
- [ ] SevenIntegrationOrchestrator統合動作確認
- [ ] 自動セットアップ機能動作確認
- [ ] コマンドライン連携動作確認

### **効果確認**
- [ ] トークン削減効果測定
- [ ] パフォーマンス向上確認
- [ ] エラー削減効果確認
- [ ] 開発効率向上確認

---

**🎯 このガイドに従って、トークン最適化システムを他システムと段階的に連携させることで、全プロジェクトでの効率化を実現できます。**

---

*最終更新: 2025年1月27日*  
*hotel-common開発チーム - ⚡ Suno (須佐之男)* 