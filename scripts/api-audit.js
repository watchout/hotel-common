#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const http = require('http');

// JWT トークン（事前に取得済み）
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDBiNjE1MmUtZDJiMS00NzgzLWEwZDMtZTA5ZDA2NDMzNzc4IiwidGVuYW50X2lkIjoiZGVmYXVsdCIsImVtYWlsIjoiYWRtaW5Ab21vdGVuYXN1YWkuY29tIiwicm9sZSI6ImFkbWluIiwibGV2ZWwiOjMsInBlcm1pc3Npb25zIjpbInRlbmFudDpyZWFkIiwidGVuYW50OndyaXRlIl0sImlhdCI6MTc1NzU3ODI0NywiZXhwIjoxNzU3NjA3MDQ3LCJqdGkiOiJqd3QtMTc1NzU3ODI0Nzc5MiIsImFjY2Vzc2libGVfdGVuYW50cyI6WyJkZWZhdWx0Il0sImhpZXJhcmNoeV9jb250ZXh0Ijp7Im9yZ2FuaXphdGlvbl9pZCI6ImRlZmF1bHQiLCJvcmdhbml6YXRpb25fbGV2ZWwiOjMsIm9yZ2FuaXphdGlvbl90eXBlIjoiSE9URUwiLCJvcmdhbml6YXRpb25fcGF0aCI6Ii9kZWZhdWx0IiwiYWNjZXNzX3Njb3BlIjpbInRlbmFudCJdLCJkYXRhX2FjY2Vzc19wb2xpY2llcyI6e319LCJ0eXBlIjoiYWNjZXNzIn0.iN2-D-mZE5Vmd_TfwR1dW7ix4jzcyDCv47T0N5t-gjo";

// 宣言されているAPIエンドポイント一覧
const DECLARED_APIS = [
  'GET /api/systems/status',
  'POST /api/systems/:systemName/test',
  'GET /api/database/test',
  'GET /api/tenants',
  'POST /api/auth/validate',
  'GET /api/stats',
  'POST /api/v1/auth/login',
  'GET /api/v1/auth/validate-token',
  'POST /api/v1/auth/refresh',
  'GET /api/v1/tenants/:id',
  'GET /api/v1/staff/:id',
  'GET /api/v1/admin/summary',
  'GET /api/v1/admin/dashboard/stats',
  'GET /api/v1/admin/devices/count',
  'GET /api/v1/admin/orders/monthly-count',
  'GET /api/v1/admin/rankings',
  'GET /api/v1/orders/history',
  'POST /api/v1/orders',
  'GET /api/v1/orders/active',
  'GET /api/v1/orders/:id',
  'PUT /api/v1/orders/:id/status',
  'GET /api/v1/order/menu',
  'GET /api/v1/menus/top',
  'POST /api/v1/order/place',
  'POST /api/v1/devices/check-status',
  'GET /api/v1/devices/client-ip',
  'GET /api/v1/devices/count',
  'GET /api/hotel-member/integration/health',
  'POST /api/hotel-member/hierarchy/auth/verify',
  'POST /api/hotel-member/hierarchy/permissions/check-customer-access',
  'POST /api/hotel-member/hierarchy/tenants/accessible',
  'POST /api/hotel-member/hierarchy/permissions/check-membership-restrictions',
  'POST /api/hotel-member/hierarchy/permissions/check-analytics-access',
  'POST /api/hotel-member/hierarchy/user/permissions-detail',
  'POST /api/hotel-member/hierarchy/permissions/batch-check',
  'GET /api/hotel-member/hierarchy/health',
  'GET /api/v1/campaigns/health',
  'GET /api/v1/campaigns/active',
  'GET /api/v1/campaigns/check',
  'GET /api/v1/campaigns/by-category/:code',
  'GET /api/v1/welcome-screen/config',
  'GET /api/v1/welcome-screen/should-show',
  'POST /api/v1/welcome-screen/mark-completed',
  'GET /api/v1/admin/campaigns',
  'POST /api/v1/admin/campaigns',
  'GET /api/v1/admin/campaigns/:id',
  'PUT /api/v1/admin/campaigns/:id',
  'DELETE /api/v1/admin/campaigns/:id',
  'GET /api/v1/admin/campaigns/:id/analytics',
  'GET /api/v1/admin/campaigns/analytics/summary',
  'POST /api/v1/reservations',
  'GET /api/v1/reservations',
  'GET /api/v1/reservations/:id',
  'PUT /api/v1/reservations/:id',
  'DELETE /api/v1/reservations/:id',
  'POST /api/v1/reservations/:id/checkin',
  'POST /api/v1/reservations/:id/checkout',
  'GET /api/v1/reservations/stats',
  'POST /api/v1/rooms',
  'GET /api/v1/rooms',
  'GET /api/v1/rooms/:id',
  'PUT /api/v1/rooms/:id',
  'DELETE /api/v1/rooms/:id',
  'PATCH /api/v1/rooms/:id/status',
  'GET /api/v1/rooms/by-number/:roomNumber',
  'GET /api/v1/rooms/by-floor/:floorNumber',
  'POST /api/v1/rooms/search-available',
  'GET /api/v1/rooms/stats',
  'POST /api/v1/room-grades',
  'GET /api/v1/room-grades',
  'GET /api/v1/room-grades/:id',
  'PUT /api/v1/room-grades/:id',
  'DELETE /api/v1/room-grades/:id',
  'PATCH /api/v1/room-grades/:id/pricing',
  'GET /api/v1/room-grades/by-code/:code',
  'GET /api/v1/room-grades/active',
  'GET /api/v1/room-grades/stats'
];

// APIテスト関数
async function testAPI(method, path) {
  return new Promise((resolve) => {
    // パラメータを実際の値に置換
    const testPath = path
      .replace(':systemName', 'test-system')
      .replace(':id', 'test-id')
      .replace(':roomNumber', '101')
      .replace(':floorNumber', '1')
      .replace(':code', 'test-code')
      .replace(':sessionId', 'test-session')
      .replace(':linkCode', 'test-link');

    const options = {
      hostname: 'localhost',
      port: 3400,
      path: testPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            method,
            path,
            status: res.statusCode,
            response: response,
            implemented: res.statusCode !== 404
          });
        } catch (e) {
          resolve({
            method,
            path,
            status: res.statusCode,
            response: data,
            implemented: res.statusCode !== 404
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        method,
        path,
        status: 'ERROR',
        response: e.message,
        implemented: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        method,
        path,
        status: 'TIMEOUT',
        response: 'Request timeout',
        implemented: false
      });
    });

    // POSTリクエストの場合はテストデータを送信
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      req.write(JSON.stringify({ test: 'data' }));
    }

    req.end();
  });
}

// メイン処理
async function auditAllAPIs() {
  console.log('🔍 API実装状況完全監査開始...\n');
  
  const results = [];
  let implemented = 0;
  let notImplemented = 0;
  let errors = 0;

  for (const api of DECLARED_APIS) {
    const [method, path] = api.split(' ');
    console.log(`テスト中: ${method} ${path}`);
    
    const result = await testAPI(method, path);
    results.push(result);
    
    if (result.status === 404) {
      notImplemented++;
      console.log(`  ❌ 未実装 (404)`);
    } else if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      errors++;
      console.log(`  ⚠️  エラー (${result.status})`);
    } else {
      implemented++;
      console.log(`  ✅ 実装済み (${result.status})`);
    }
    
    // レート制限を避けるため少し待機
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 結果サマリー
  console.log('\n📊 監査結果サマリー');
  console.log('='.repeat(50));
  console.log(`総API数: ${DECLARED_APIS.length}`);
  console.log(`実装済み: ${implemented} (${Math.round(implemented/DECLARED_APIS.length*100)}%)`);
  console.log(`未実装: ${notImplemented} (${Math.round(notImplemented/DECLARED_APIS.length*100)}%)`);
  console.log(`エラー: ${errors} (${Math.round(errors/DECLARED_APIS.length*100)}%)`);

  // 詳細結果をファイルに保存
  const detailedResults = {
    summary: {
      total: DECLARED_APIS.length,
      implemented,
      notImplemented,
      errors,
      implementationRate: Math.round(implemented/DECLARED_APIS.length*100)
    },
    results: results
  };

  fs.writeFileSync('/tmp/api-audit-results.json', JSON.stringify(detailedResults, null, 2));
  console.log('\n📄 詳細結果を /tmp/api-audit-results.json に保存しました');

  // 未実装APIリスト
  const unimplementedAPIs = results.filter(r => r.status === 404);
  if (unimplementedAPIs.length > 0) {
    console.log('\n❌ 未実装APIリスト:');
    unimplementedAPIs.forEach(api => {
      console.log(`  ${api.method} ${api.path}`);
    });
  }
}

// 実行
auditAllAPIs().catch(console.error);
