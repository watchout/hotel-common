#!/usr/bin/env node
/**
 * API ルート自動修正ツール
 * 検出された問題のある動的パス構造を自動で修正
 */

import * as fs from 'fs';
import * as path from 'path';
import { APIRouteChecker } from './check-api-routes';

interface FixSuggestion {
  file: string;
  line: number;
  oldRoute: string;
  newRoute: string;
  explanation: string;
}

class APIRouteFixer {
  private fixes: FixSuggestion[] = [];

  /**
   * 問題のあるルートを自動修正
   */
  async fixRoutes(): Promise<void> {
    console.log('🔧 API ルート自動修正開始...');
    
    const checker = new APIRouteChecker();
    const issues = await checker.checkRoutes();
    
    const errors = issues.filter(i => i.severity === 'error');
    
    if (errors.length === 0) {
      console.log('✅ 修正が必要なエラーはありません');
      return;
    }
    
    console.log(`\n🔧 ${errors.length}件のエラーを修正します...`);
    
    for (const issue of errors) {
      await this.fixIssue(issue);
    }
    
    this.generateFixReport();
  }

  /**
   * 個別の問題を修正
   */
  private async fixIssue(issue: any): Promise<void> {
    const content = fs.readFileSync(issue.file, 'utf-8');
    const lines = content.split('\n');
    const targetLine = lines[issue.line - 1];
    
    // 複数の動的パラメータが連続する問題の修正
    if (issue.issue.includes('複数の動的パラメータが連続')) {
      const fixedLine = this.fixMultipleParams(targetLine, issue);
      if (fixedLine !== targetLine) {
        lines[issue.line - 1] = fixedLine;
        fs.writeFileSync(issue.file, lines.join('\n'));
        
        this.fixes.push({
          file: issue.file,
          line: issue.line,
          oldRoute: targetLine.trim(),
          newRoute: fixedLine.trim(),
          explanation: '複数の動的パラメータをクエリパラメータに変更'
        });
      }
    }
  }

  /**
   * 複数の動的パラメータを修正
   */
  private fixMultipleParams(line: string, issue: any): string {
    // 例: /api/v1/admin/rooms/:roomNumber/memos
    // → /api/v1/admin/room-memos (クエリパラメータで room_number を指定)
    
    const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (!routeMatch) return line;
    
    const method = routeMatch[1];
    const route = routeMatch[2];
    
    // 特定のパターンを修正
    if (route.includes('/rooms/:roomNumber/memos')) {
      const newRoute = route.replace('/rooms/:roomNumber/memos', '/room-memos');
      return line.replace(route, newRoute);
    }
    
    if (route.includes('/pages/:slug/history/:version')) {
      const newRoute = route.replace('/pages/:slug/history/:version', '/page-history');
      return line.replace(route, newRoute);
    }
    
    return line;
  }

  /**
   * 修正レポート生成
   */
  private generateFixReport(): void {
    if (this.fixes.length === 0) {
      console.log('⚠️ 自動修正できる問題はありませんでした');
      return;
    }
    
    console.log(`\n✅ ${this.fixes.length}件の修正を完了しました:`);
    
    this.fixes.forEach(fix => {
      console.log(`\n📁 ${fix.file}:${fix.line}`);
      console.log(`   修正前: ${fix.oldRoute}`);
      console.log(`   修正後: ${fix.newRoute}`);
      console.log(`   説明: ${fix.explanation}`);
    });
    
    // 修正レポートを保存
    const reportPath = 'docs/api-route-fixes-report.md';
    this.saveFixReport(reportPath);
    console.log(`\n📄 修正レポート: ${reportPath}`);
  }

  /**
   * 修正レポートをMarkdownで保存
   */
  private saveFixReport(filePath: string): void {
    const report = `# API ルート修正レポート

修正日時: ${new Date().toISOString()}

## 📊 修正サマリー

- 修正件数: ${this.fixes.length}件

## 🔧 修正詳細

${this.fixes.map(fix => `
### ${fix.file}:${fix.line}

- **修正前**: \`${fix.oldRoute}\`
- **修正後**: \`${fix.newRoute}\`
- **説明**: ${fix.explanation}
`).join('\n')}

## 📋 修正後の対応

以下の作業を手動で行ってください：

1. **フロントエンド側の更新**
   - API呼び出しのURLを新しいパスに変更
   - クエリパラメータの追加

2. **ドキュメント更新**
   - API仕様書の更新
   - 統合ガイドの更新

3. **テスト更新**
   - APIテストのURL変更
   - 新しいクエリパラメータのテスト追加

4. **デプロイ前確認**
   - 既存のクライアントとの互換性確認
   - 段階的移行の検討
`;

    fs.writeFileSync(filePath, report);
  }
}

// メイン実行
async function main() {
  const fixer = new APIRouteFixer();
  await fixer.fixRoutes();
}

if (require.main === module) {
  main().catch(console.error);
}

export { APIRouteFixer };
