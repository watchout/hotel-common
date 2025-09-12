#!/usr/bin/env node
/**
 * API仕様検証ツール
 * OpenAPI仕様とルート実装の整合性をチェック
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class APISpecValidator {
  constructor() {
    this.specFile = 'docs/api-specs/hotel-common-unified-openapi.yaml';
    this.routesDir = 'src/routes';
    this.issues = [];
  }

  /**
   * 仕様検証実行
   */
  async validate() {
    console.log('📋 API仕様検証開始...');
    
    try {
      const spec = this.loadOpenAPISpec();
      const routes = await this.extractRoutes();
      
      this.validateSpecRouteConsistency(spec, routes);
      this.validateRouteDocumentation(routes);
      
      this.generateReport();
      
      if (this.issues.filter(i => i.severity === 'error').length > 0) {
        console.log('🚨 仕様検証でエラーが検出されました');
        process.exit(1);
      }
      
      console.log('✅ 仕様検証完了');
    } catch (error) {
      console.error('❌ 仕様検証中にエラーが発生:', error.message);
      process.exit(1);
    }
  }

  /**
   * OpenAPI仕様読み込み
   */
  loadOpenAPISpec() {
    try {
      const content = fs.readFileSync(this.specFile, 'utf8');
      return yaml.load(content);
    } catch (error) {
      throw new Error(`OpenAPI仕様ファイルの読み込みに失敗: ${error.message}`);
    }
  }

  /**
   * ルート情報抽出
   */
  async extractRoutes() {
    const routes = [];
    
    const extractFromFile = (filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        
        if (routeMatch) {
          routes.push({
            method: routeMatch[1].toUpperCase(),
            path: routeMatch[2],
            file: filePath,
            line: i + 1
          });
        }
      }
    };

    const searchRoutes = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          searchRoutes(fullPath);
        } else if (entry.name.endsWith('.routes.ts') || entry.name.endsWith('.routes.js')) {
          extractFromFile(fullPath);
        }
      }
    };

    searchRoutes(this.routesDir);
    return routes;
  }

  /**
   * 仕様とルートの整合性チェック
   */
  validateSpecRouteConsistency(spec, routes) {
    const specPaths = spec.paths || {};
    const specRoutes = [];

    // OpenAPI仕様からルート抽出
    for (const [path, methods] of Object.entries(specPaths)) {
      for (const method of Object.keys(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          specRoutes.push({
            method: method.toUpperCase(),
            path: path
          });
        }
      }
    }

    // 実装されているが仕様にないルート
    for (const route of routes) {
      const found = specRoutes.find(sr => 
        sr.method === route.method && this.pathsMatch(sr.path, route.path)
      );
      
      if (!found) {
        this.issues.push({
          type: 'missing_spec',
          severity: 'warning',
          message: `実装されているルートが仕様に記載されていません: ${route.method} ${route.path}`,
          file: route.file,
          line: route.line
        });
      }
    }

    // 仕様にあるが実装されていないルート
    for (const specRoute of specRoutes) {
      const found = routes.find(r => 
        r.method === specRoute.method && this.pathsMatch(specRoute.path, r.path)
      );
      
      if (!found) {
        this.issues.push({
          type: 'missing_implementation',
          severity: 'error',
          message: `仕様に記載されているルートが実装されていません: ${specRoute.method} ${specRoute.path}`,
          spec: this.specFile
        });
      }
    }
  }

  /**
   * パスマッチング（動的パラメータ考慮）
   */
  pathsMatch(specPath, routePath) {
    // OpenAPIの{param}をExpressの:paramに変換
    const normalizedSpecPath = specPath.replace(/\{([^}]+)\}/g, ':$1');
    return normalizedSpecPath === routePath;
  }

  /**
   * ルートドキュメント検証
   */
  validateRouteDocumentation(routes) {
    for (const route of routes) {
      // 管理者APIの認証チェック
      if (route.path.includes('/admin/')) {
        const content = fs.readFileSync(route.file, 'utf8');
        const lines = content.split('\n');
        const routeLine = lines[route.line - 1];
        
        if (!routeLine.includes('verifyAdminAuth') && !routeLine.includes('authMiddleware')) {
          this.issues.push({
            type: 'missing_auth',
            severity: 'error',
            message: `管理者APIに認証ミドルウェアが設定されていません: ${route.method} ${route.path}`,
            file: route.file,
            line: route.line
          });
        }
      }

      // 非推奨パターンのチェック
      if (route.path.includes('/create') || route.path.includes('/update') || route.path.includes('/delete')) {
        this.issues.push({
          type: 'non_restful',
          severity: 'warning',
          message: `非RESTfulなパス構造: ${route.method} ${route.path}`,
          file: route.file,
          line: route.line
        });
      }
    }
  }

  /**
   * レポート生成
   */
  generateReport() {
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');

    console.log('\n📊 API仕様検証結果');
    console.log('='.repeat(50));
    console.log(`🚨 エラー: ${errors.length}件`);
    console.log(`⚠️ 警告: ${warnings.length}件`);
    console.log('='.repeat(50));

    if (errors.length > 0) {
      console.log('\n🚨 エラー（修正必須）:');
      errors.forEach(issue => {
        console.log(`\n❌ ${issue.type}`);
        console.log(`   ${issue.message}`);
        if (issue.file) {
          console.log(`   ファイル: ${issue.file}:${issue.line}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ 警告（修正推奨）:');
      warnings.forEach(issue => {
        console.log(`\n⚠️ ${issue.type}`);
        console.log(`   ${issue.message}`);
        if (issue.file) {
          console.log(`   ファイル: ${issue.file}:${issue.line}`);
        }
      });
    }

    // レポートファイル保存
    const reportPath = 'docs/api-spec-validation-report.md';
    this.saveReport(reportPath);
    console.log(`\n📄 詳細レポート: ${reportPath}`);
  }

  /**
   * レポート保存
   */
  saveReport(filePath) {
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');

    const report = `# API仕様検証レポート

生成日時: ${new Date().toISOString()}

## 📊 サマリー

- 🚨 エラー: ${errors.length}件
- ⚠️ 警告: ${warnings.length}件

## 🚨 エラー（修正必須）

${errors.map(issue => `
### ${issue.type}

- **メッセージ**: ${issue.message}
${issue.file ? `- **ファイル**: ${issue.file}:${issue.line}` : ''}
${issue.spec ? `- **仕様**: ${issue.spec}` : ''}
`).join('\n')}

## ⚠️ 警告（修正推奨）

${warnings.map(issue => `
### ${issue.type}

- **メッセージ**: ${issue.message}
${issue.file ? `- **ファイル**: ${issue.file}:${issue.line}` : ''}
`).join('\n')}

## 🔧 修正ガイド

### 仕様に記載されていないルート
1. OpenAPI仕様ファイルにルートを追加
2. 適切なレスポンススキーマを定義
3. 認証要件を明記

### 実装されていないルート
1. ルートハンドラーを実装
2. 適切なミドルウェアを設定
3. テストケースを追加

### 認証ミドルウェア不足
1. 管理者APIに \`verifyAdminAuth\` を追加
2. 一般APIに \`authMiddleware\` を追加
3. 権限チェックを実装
`;

    fs.writeFileSync(filePath, report);
  }
}

// CLI実行
if (require.main === module) {
  const validator = new APISpecValidator();
  const command = process.argv[2];

  switch (command) {
    case 'validate':
      validator.validate();
      break;
    default:
      console.log('使用方法:');
      console.log('  node scripts/api-spec-validator.js validate');
      process.exit(1);
  }
}

module.exports = { APISpecValidator };