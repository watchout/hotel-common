#!/usr/bin/env ts-node
/**
 * ルーティング順序検証スクリプト（CI用）
 * 
 * 目的: 
 * - Cookie認証保護ルート (/api/v1/logs, /api/v1/admin/*) が最上段に配置されていることを確認
 * - 無印ルーター (/?, /api など) が後方に配置されていることを確認
 * - 順序が崩れた変更でCIをFailさせる
 * 
 * 期待順序:
 * 1. /api/v1/logs (Cookie認証)
 * 2. /api/v1/admin/front-desk (Cookie認証)
 * 3. /api/v1/admin (Cookie認証)
 * 4. その他の明示的パス (/api/v1/auth, /api/v1/pages など)
 * 5. 無印ルーター (/?, /api など) - 最後尾
 */

import fs from 'fs';
import path from 'path';

interface RouteDefinition {
  line: number;
  path: string;
  hasCookieAuth: boolean;
  isWildcard: boolean;
}

const INTEGRATION_SERVER_PATH = path.join(__dirname, '../src/server/integration-server.ts');

// 優先度の高いCookie認証保護ルート（最上段に必要）
const PRIORITY_ROUTES = [
  '/api/v1/logs',
  '/api/v1/admin/front-desk',
  '/api/v1/admin'
];

// 無印ルーター（最後尾に必要）
const WILDCARD_PATTERNS = [
  '/\\?',
  '/api(?=/|$)',
  '(?:/|$)',
  '^/$'
];

/**
 * ルート定義を抽出
 */
function extractRoutes(content: string): RouteDefinition[] {
  const lines = content.split('\n');
  const routes: RouteDefinition[] = [];
  
  lines.forEach((line, index) => {
    const appUseMatch = line.match(/this\.app\.use\(['"]([^'"]+)['"]/);
    if (appUseMatch) {
      const routePath = appUseMatch[1];
      const hasCookieAuth = line.includes('sessionAuthMiddleware');
      const isWildcard = WILDCARD_PATTERNS.some(pattern => 
        routePath.includes(pattern) || routePath === '' || routePath === '/'
      );
      
      routes.push({
        line: index + 1,
        path: routePath,
        hasCookieAuth,
        isWildcard
      });
    }
  });
  
  return routes;
}

/**
 * ルート順序を検証
 */
function validateRouteOrder(routes: RouteDefinition[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 優先ルートのインデックスを取得
  const priorityIndices = PRIORITY_ROUTES.map(priorityPath => {
    const index = routes.findIndex(r => r.path === priorityPath);
    return { path: priorityPath, index };
  });
  
  // 無印ルーターのインデックスを取得
  const wildcardIndices = routes
    .map((r, i) => ({ route: r, index: i }))
    .filter(({ route }) => route.isWildcard)
    .map(({ index }) => index);
  
  // 検証1: 優先ルートが存在するか
  priorityIndices.forEach(({ path, index }) => {
    if (index === -1) {
      errors.push(`❌ 優先ルート "${path}" が見つかりません`);
    }
  });
  
  // 検証2: 優先ルートがCookie認証を持つか
  priorityIndices.forEach(({ path, index }) => {
    if (index !== -1 && !routes[index].hasCookieAuth) {
      errors.push(`❌ 優先ルート "${path}" (line ${routes[index].line}) にsessionAuthMiddlewareが適用されていません`);
    }
  });
  
  // 検証3: 優先ルートが無印ルーターより前にあるか
  const maxPriorityIndex = Math.max(...priorityIndices.filter(p => p.index !== -1).map(p => p.index));
  const minWildcardIndex = wildcardIndices.length > 0 ? Math.min(...wildcardIndices) : Infinity;
  
  if (maxPriorityIndex > minWildcardIndex) {
    errors.push(`❌ ルーティング順序違反: 優先ルートが無印ルーターより後に配置されています`);
    errors.push(`   優先ルート最後: line ${routes[maxPriorityIndex].line} (${routes[maxPriorityIndex].path})`);
    errors.push(`   無印ルート最初: line ${routes[minWildcardIndex].line} (${routes[minWildcardIndex].path})`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * レポート出力
 */
function generateReport(routes: RouteDefinition[], validation: { valid: boolean; errors: string[] }) {
  console.log('\n🔍 ルーティング順序検証');
  console.log('==================================================\n');
  
  console.log('📋 検出されたルート順序:\n');
  routes.forEach(route => {
    const marker = route.isWildcard ? '🌐' : route.hasCookieAuth ? '🍪' : '🔓';
    console.log(`${marker} line ${route.line.toString().padStart(3)}: ${route.path}`);
  });
  
  console.log('\n==================================================\n');
  
  if (validation.valid) {
    console.log('✅ ルーティング順序: OK\n');
    console.log('   - Cookie認証保護ルートが最上段に配置');
    console.log('   - 無印ルーターが後方に配置');
  } else {
    console.log('❌ ルーティング順序: NG\n');
    validation.errors.forEach(error => console.log(error));
    console.log('\n📖 期待される順序:');
    console.log('   1. /api/v1/logs (sessionAuthMiddleware)');
    console.log('   2. /api/v1/admin/front-desk (sessionAuthMiddleware)');
    console.log('   3. /api/v1/admin (sessionAuthMiddleware)');
    console.log('   4. その他の明示的パス');
    console.log('   5. 無印ルーター (/?, /api など) - 最後尾\n');
  }
  
  console.log('==================================================\n');
}

/**
 * メイン処理
 */
function main() {
  if (!fs.existsSync(INTEGRATION_SERVER_PATH)) {
    console.error(`❌ ファイルが見つかりません: ${INTEGRATION_SERVER_PATH}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(INTEGRATION_SERVER_PATH, 'utf-8');
  const routes = extractRoutes(content);
  
  if (routes.length === 0) {
    console.error('❌ ルート定義が見つかりません');
    process.exit(1);
  }
  
  const validation = validateRouteOrder(routes);
  generateReport(routes, validation);
  
  if (!validation.valid) {
    process.exit(1);
  }
}

main();

