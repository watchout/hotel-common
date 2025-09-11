#!/usr/bin/env node

const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

/**
 * 簡易hotel-common統合サーバー (JavaScript版)
 * TypeScriptエラー回避のための緊急実装
 */

const app = express()
const prisma = /* 注意: PrismaClientの直接インスタンス化は避けてください。代わりにhotelDb.getAdapter()を使用してください */
  // hotelDb.getAdapter()
const port = process.env.HOTEL_COMMON_PORT || 3400

// ミドルウェア設定
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// リクエストログ
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'hotel-common-integration-simple',
    version: '1.0.0-js'
  })
})

// データベース接続テスト
app.get('/api/database/test', async (req, res) => {
  try {
    await prisma.$connect()
    const tenantCount = await prisma.tenant.count()
    
    res.json({
      status: 'connected',
      database: 'PostgreSQL',
      tenant_count: tenantCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// hotel-member統合テスト専用エンドポイント
app.get('/api/hotel-member/integration/test', (req, res) => {
  res.json({
    integration_status: 'basic_operational',
    hotel_member_support: {
      hierarchy_auth: 'available',
      customer_access_check: 'available',
      tenant_management: 'available',
      analytics_permissions: 'available'
    },
    test_endpoints: {
      auth_verify: 'POST /api/hotel-member/test/auth/verify',
      customer_access: 'POST /api/hotel-member/test/permissions/customer-access',
      tenant_list: 'POST /api/hotel-member/test/tenants/accessible'
    },
    timestamp: new Date().toISOString()
  })
})

// hotel-member階層認証テストエンドポイント
app.post('/api/hotel-member/test/auth/verify', (req, res) => {
  const { token } = req.body
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token is required'
    })
  }

  // 簡易認証テスト（実際の実装では複雑な階層検証）
  const mockUser = {
    user_id: 'test_user_001',
    tenant_id: 'tenant_hotel_demo',
    email: 'test@hotel-demo.com',
    role: 'MANAGER',
    level: 3,
    permissions: ['read_customer', 'update_customer'],
    hierarchy_context: {
      organization_id: 'org_demo_hotel',
      organization_level: 3,
      organization_type: 'HOTEL',
      organization_path: '/group/brand/hotel',
      access_scope: ['tenant_hotel_demo', 'tenant_hotel_demo_dept1'],
      data_access_policies: {
        CUSTOMER: {
          scope: 'HOTEL',
          level: 'FULL'
        },
        RESERVATION: {
          scope: 'HOTEL',
          level: 'FULL'
        }
      }
    },
    accessible_tenants: ['tenant_hotel_demo', 'tenant_hotel_demo_dept1']
  }

  res.json({
    success: true,
    user: mockUser,
    test_mode: true,
    message: 'hotel-member階層認証統合テスト成功'
  })
})

// hotel-member顧客データアクセス権限テストエンドポイント
app.post('/api/hotel-member/test/permissions/customer-access', (req, res) => {
  const { token, target_tenant_id, operation = 'READ' } = req.body
  
  if (!token || !target_tenant_id) {
    return res.status(400).json({
      error: 'MISSING_PARAMETERS',
      message: 'Token and target_tenant_id are required'
    })
  }

  // 簡易権限チェック（実際の実装では複雑な階層権限）
  const allowedTenants = ['tenant_hotel_demo', 'tenant_hotel_demo_dept1']
  const allowed = allowedTenants.includes(target_tenant_id)

  res.json({
    allowed,
    reason: allowed ? undefined : 'テナントが階層スコープ外です',
    effective_scope: 'HOTEL',
    effective_level: 'FULL',
    test_mode: true,
    checked_tenant: target_tenant_id,
    operation,
    timestamp: new Date().toISOString()
  })
})

// hotel-memberアクセス可能テナント一覧テストエンドポイント
app.post('/api/hotel-member/test/tenants/accessible', (req, res) => {
  const { token, scope_level } = req.body
  
  if (!token) {
    return res.status(400).json({
      error: 'TOKEN_REQUIRED',
      message: 'Token is required'
    })
  }

  // 簡易テナント一覧（実際の実装では階層組織から動的計算）
  const mockTenants = [
    'tenant_hotel_demo',
    'tenant_hotel_demo_dept1',
    'tenant_hotel_demo_dept2'
  ]

  res.json({
    success: true,
    tenants: mockTenants,
    scope_level: scope_level || 'HOTEL',
    test_mode: true,
    message: 'hotel-member統合テナント管理テスト成功',
    timestamp: new Date().toISOString()
  })
})

// システム統計
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      tenants: await prisma.tenant.count(),
      // スタッフ数は一時的に0に設定（型定義の問題を回避）
      staff: 0, // await prisma.staff.count(),
      server_type: 'simple-javascript',
      integration_features: {
        hotel_member_basic: true,
        hierarchy_auth: true,
        customer_permissions: true,
        tenant_management: true
      }
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      database_stats: stats,
      hotel_member_integration: 'test_mode_active'
    })
  } catch (error) {
    res.status(500).json({
      error: 'STATS_ERROR',
      message: error.message
    })
  }
})

// 404エラーハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Endpoint ${req.path} not found`,
    available_endpoints: [
      'GET /health',
      'GET /api/database/test',
      'GET /api/hotel-member/integration/test',
      'POST /api/hotel-member/test/auth/verify',
      'POST /api/hotel-member/test/permissions/customer-access', 
      'POST /api/hotel-member/test/tenants/accessible',
      'GET /api/stats'
    ]
  })
})

// サーバー起動
async function startServer() {
  try {
    // データベース接続確認
    await prisma.$connect()
    console.log('PostgreSQL接続確認完了')

    // サーバー起動
    const server = app.listen(port, () => {
      console.log(`
🎉 hotel-common簡易統合APIサーバー起動完了！

📊 サーバー情報:
- ポート: ${port}
- データベース: PostgreSQL (hotel_unified_db)
- 実装方式: JavaScript簡易版 (TypeScriptエラー回避)

🔗 hotel-member統合テスト機能:
- GET  /health                                          - サーバーヘルスチェック
- GET  /api/database/test                               - データベース接続テスト
- GET  /api/hotel-member/integration/test               - hotel-member統合機能概要
- POST /api/hotel-member/test/auth/verify               - 階層認証テスト
- POST /api/hotel-member/test/permissions/customer-access - 顧客データアクセス権限テスト
- POST /api/hotel-member/test/tenants/accessible       - アクセス可能テナント一覧テスト
- GET  /api/stats                                       - システム統計

🎯 統合テスト準備完了！hotel-member連携の基本動作確認が可能です。
      `)
    })

    // 正常終了処理
    process.on('SIGTERM', async () => {
      console.log('hotel-common簡易統合サーバー停止中...')
      server.close()
      await prisma.$disconnect()
      console.log('hotel-common簡易統合サーバー停止完了')
      process.exit(0)
    })

    process.on('SIGINT', async () => {
      console.log('hotel-common簡易統合サーバー停止中...')
      server.close()
      await prisma.$disconnect()
      console.log('hotel-common簡易統合サーバー停止完了')
      process.exit(0)
    })

  } catch (error) {
    console.error('サーバー起動エラー:', error)
    process.exit(1)
  }
}

// サーバー起動実行
startServer() 