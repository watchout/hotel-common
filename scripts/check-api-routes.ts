#!/usr/bin/env node
/**
 * API ルート品質チェックツール
 * 問題のある動的パス構造を自動検出し、RESTful API設計違反を防ぐ
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface RouteIssue {
  file: string;
  line: number;
  route: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  suggestion: string;
}

class APIRouteChecker {
  private issues: RouteIssue[] = [];
  private routesDir = 'src/routes';

  /**
   * 問題のある動的パス構造をチェック
   */
  async checkRoutes(): Promise<RouteIssue[]> {
    console.log('🔍 API ルート品質チェック開始...');
    
    const routeFiles = this.findRouteFiles();
    
    for (const file of routeFiles) {
      await this.checkFile(file);
    }
    
    this.generateReport();
    return this.issues;
  }

  /**
   * ルートファイルを再帰的に検索
   */
  private findRouteFiles(): string[] {
    const files: string[] = [];
    
    const searchDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          searchDir(fullPath);
        } else if (entry.name.endsWith('.routes.ts') || entry.name.endsWith('.routes.js')) {
          files.push(fullPath);
        }
      }
    };
    
    searchDir(this.routesDir);
    return files;
  }

  /**
   * 個別ファイルをチェック
   */
  private async checkFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // router.method('path', ...) パターンを検索
      const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
      
      if (routeMatch) {
        const method = routeMatch[1];
        const routePath = routeMatch[2];
        
        this.checkRoutePath(filePath, lineNumber, method, routePath);
      }
    }
  }

  /**
   * ルートパスの問題をチェック
   */
  private checkRoutePath(file: string, line: number, method: string, route: string): void {
    // 1. 複数の動的パラメータが連続する問題
    const multipleParamsPattern = /\/:[^\/]+\/[^:]*\/:[^\/]+/;
    if (multipleParamsPattern.test(route)) {
      this.issues.push({
        file,
        line,
        route: `${method.toUpperCase()} ${route}`,
        issue: '複数の動的パラメータが連続しています',
        severity: 'error',
        suggestion: 'クエリパラメータまたはリソースIDのみの構造に変更してください'
      });
    }

    // 2. 深いネストの動的パス
    const deepNestPattern = /\/:[^\/]+\/[^:]*\/:[^\/]+\/[^:]*\/:[^\/]+/;
    if (deepNestPattern.test(route)) {
      this.issues.push({
        file,
        line,
        route: `${method.toUpperCase()} ${route}`,
        issue: '動的パスのネストが深すぎます（3層以上）',
        severity: 'error',
        suggestion: 'フラットな構造またはクエリパラメータを使用してください'
      });
    }

    // 3. 非RESTfulなパス構造
    const nonRestfulPattern = /\/:[^\/]+\/[a-zA-Z]+\/:[^\/]+$/;
    if (nonRestfulPattern.test(route)) {
      this.issues.push({
        file,
        line,
        route: `${method.toUpperCase()} ${route}`,
        issue: 'RESTful設計に準拠していません',
        severity: 'warning',
        suggestion: 'リソース指向の設計に変更するか、クエリパラメータを使用してください'
      });
    }

    // 4. 推奨されない動詞の使用
    const verbPattern = /\/(create|update|delete|get|fetch|retrieve|add|remove)[\/_]/i;
    if (verbPattern.test(route)) {
      this.issues.push({
        file,
        line,
        route: `${method.toUpperCase()} ${route}`,
        issue: 'URLに動詞が含まれています',
        severity: 'warning',
        suggestion: 'HTTPメソッドで操作を表現し、名詞のみでリソースを表現してください'
      });
    }

    // 5. 長すぎるパス
    const pathSegments = route.split('/').filter(s => s.length > 0);
    if (pathSegments.length > 6) {
      this.issues.push({
        file,
        line,
        route: `${method.toUpperCase()} ${route}`,
        issue: 'パスが長すぎます（6セグメント超）',
        severity: 'info',
        suggestion: 'より簡潔な構造に変更することを検討してください'
      });
    }

    // 6. 一貫性のないケース
    if (route.includes('_') && route.includes('-')) {
      this.issues.push({
        file,
        line,
        route: `${method.toUpperCase()} ${route}`,
        issue: 'アンダースコアとハイフンが混在しています',
        severity: 'info',
        suggestion: 'ケバブケース（ハイフン）に統一してください'
      });
    }
  }

  /**
   * レポート生成
   */
  private generateReport(): void {
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    const infos = this.issues.filter(i => i.severity === 'info');

    console.log('\n📊 API ルート品質チェック結果');
    console.log('=' .repeat(50));
    console.log(`🚨 エラー: ${errors.length}件`);
    console.log(`⚠️  警告: ${warnings.length}件`);
    console.log(`ℹ️  情報: ${infos.length}件`);
    console.log('=' .repeat(50));

    if (errors.length > 0) {
      console.log('\n🚨 エラー（修正必須）:');
      errors.forEach(issue => {
        console.log(`\n❌ ${issue.file}:${issue.line}`);
        console.log(`   ルート: ${issue.route}`);
        console.log(`   問題: ${issue.issue}`);
        console.log(`   提案: ${issue.suggestion}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ 警告（修正推奨）:');
      warnings.forEach(issue => {
        console.log(`\n⚠️  ${issue.file}:${issue.line}`);
        console.log(`   ルート: ${issue.route}`);
        console.log(`   問題: ${issue.issue}`);
        console.log(`   提案: ${issue.suggestion}`);
      });
    }

    if (infos.length > 0) {
      console.log('\nℹ️ 情報（改善提案）:');
      infos.forEach(issue => {
        console.log(`\nℹ️  ${issue.file}:${issue.line}`);
        console.log(`   ルート: ${issue.route}`);
        console.log(`   問題: ${issue.issue}`);
        console.log(`   提案: ${issue.suggestion}`);
      });
    }

    // 結果をファイルに保存
    const reportPath = 'docs/api-route-quality-report.md';
    this.saveReport(reportPath);
    console.log(`\n📄 詳細レポート: ${reportPath}`);
  }

  /**
   * Markdownレポート保存
   */
  private saveReport(filePath: string): void {
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    const infos = this.issues.filter(i => i.severity === 'info');

    const report = `# API ルート品質チェックレポート

生成日時: ${new Date().toISOString()}

## 📊 サマリー

- 🚨 エラー: ${errors.length}件
- ⚠️ 警告: ${warnings.length}件  
- ℹ️ 情報: ${infos.length}件

## 🚨 エラー（修正必須）

${errors.map(issue => `
### ${issue.file}:${issue.line}

- **ルート**: \`${issue.route}\`
- **問題**: ${issue.issue}
- **提案**: ${issue.suggestion}
`).join('\n')}

## ⚠️ 警告（修正推奨）

${warnings.map(issue => `
### ${issue.file}:${issue.line}

- **ルート**: \`${issue.route}\`
- **問題**: ${issue.issue}
- **提案**: ${issue.suggestion}
`).join('\n')}

## ℹ️ 情報（改善提案）

${infos.map(issue => `
### ${issue.file}:${issue.line}

- **ルート**: \`${issue.route}\`
- **問題**: ${issue.issue}
- **提案**: ${issue.suggestion}
`).join('\n')}

## 🎯 RESTful API設計ガイドライン

### ✅ 推奨パターン

\`\`\`
GET /api/v1/resources
GET /api/v1/resources/:id
POST /api/v1/resources
PUT /api/v1/resources/:id
DELETE /api/v1/resources/:id

# クエリパラメータでフィルタリング
GET /api/v1/resources?category=value&status=active
\`\`\`

### ❌ 避けるべきパターン

\`\`\`
# 複数の動的パラメータ
GET /api/v1/resources/:id/sub/:subId

# 動詞の使用
POST /api/v1/resources/create
GET /api/v1/resources/get/:id

# 深いネスト
GET /api/v1/a/:id/b/:id/c/:id
\`\`\`
`;

    fs.writeFileSync(filePath, report);
  }
}

// メイン実行
async function main() {
  const checker = new APIRouteChecker();
  const issues = await checker.checkRoutes();
  
  // エラーがある場合は終了コード1で終了
  if (issues.some(i => i.severity === 'error')) {
    console.log('\n🚨 エラーが検出されました。修正してください。');
    process.exit(1);
  }
  
  console.log('\n✅ チェック完了');
}

if (require.main === module) {
  main().catch(console.error);
}

export { APIRouteChecker };
