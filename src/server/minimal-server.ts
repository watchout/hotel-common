#!/usr/bin/env node

// 🚨緊急対応：最小版hotel-commonサーバー
// 依存関係なし、Sunoの階層権限統合ブロック解除専用

import { createServer } from 'http'

import express from 'express'

const app = express()
const server = createServer(app)

app.use(express.json())

// CORS対応
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'hotel-common',
    mode: 'minimal-emergency'
  })
})

// キャンペーンAPI
app.get('/api/campaigns/active', (req, res) => {
  res.json({
    success: true,
    campaigns: [
      {
        id: 'camp_001',
        name: '夏季特別キャンペーン',
        code: 'SUMMER2025',
        description: '夏の特別割引キャンペーン',
        startDate: '2025-07-01',
        endDate: '2025-08-31',
        isActive: true,
        discountRate: 15,
        targetCustomers: ['ALL']
      },
      {
        id: 'camp_002',
        name: '新規会員登録キャンペーン',
        code: 'NEWMEMBER',
        description: '新規会員登録特典',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isActive: true,
        discountRate: 10,
        targetCustomers: ['NEW']
      }
    ]
  })
})

// Suno向け階層権限管理API（フォールバック実装）

// JWT検証エンドポイント
app.post('/api/hotel-member/hierarchy/auth/verify', async (req, res) => {
  try {
    const { token } = req.body

    console.log('JWT検証要求:', { token: token ? '***' : 'なし' })

    if (!token) {
      return res.status(400).json({
        error: 'TOKEN_REQUIRED',
        message: 'Token is required'
      })
    }

    // 🔄 フォールバック応答（Sunoの開発継続のため）
    const fallbackUser = {
      user_id: 'emergency_user_' + Date.now(),
      tenant_id: 'default',
      email: 'emergency@hotel.com',
      role: 'STAFF',
      level: 3,
      permissions: ['read', 'write'],
      hierarchy_context: {
        organization_id: 'org_default',
        organization_level: 3,
        organization_type: 'HOTEL',
        organization_path: 'group/brand/hotel',
        data_access_policies: {
          CUSTOMER: { sharing_scope: 'HOTEL', access_level: 'FULL' }
        }
      },
      accessible_tenants: ['default', 'hotel-001']
    }

    res.json({
      success: true,
      user: fallbackUser
    })

    console.log('JWT検証完了（フォールバック）')

  } catch (error: unknown) {
    console.error('JWT検証エラー:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

// 顧客データアクセス権限チェック
app.post('/api/hotel-member/hierarchy/permissions/check-customer-access', async (req, res) => {
  try {
    const { token, target_tenant_id, operation = 'READ' } = req.body

    console.log('顧客データアクセス権限チェック:', {
      tenant: target_tenant_id,
      operation,
      token: token ? '***' : 'なし'
    })

    if (!token || !target_tenant_id) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Token and target_tenant_id are required'
      })
    }

    // 🔄 フォールバック：基本的に許可（開発継続のため）
    res.json({
      allowed: true,
      reason: 'Emergency fallback mode - basic permission granted',
      effective_scope: 'HOTEL',
      effective_level: 'FULL'
    })

    console.log('顧客データアクセス許可（フォールバック）')

  } catch (error: unknown) {
    console.error('権限チェックエラー:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Permission check failed'
    })
  }
})

// アクセス可能テナント一覧
app.post('/api/hotel-member/hierarchy/tenants/accessible', async (req, res) => {
  try {
    const { token, scope_level } = req.body

    console.log('アクセス可能テナント取得:', {
      scope: scope_level,
      token: token ? '***' : 'なし'
    })

    if (!token) {
      return res.status(400).json({
        error: 'TOKEN_REQUIRED',
        message: 'Token is required'
      })
    }

    // 🔄 フォールバック：基本テナントリスト
    const tenants = ['default', 'hotel-001', 'hotel-002', 'hotel-003']

    res.json({
      success: true,
      tenants
    })

    console.log('テナント一覧返却（フォールバック）:', tenants)

  } catch (error: unknown) {
    console.error('テナント取得エラー:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to get accessible tenants'
    })
  }
})

// 会員データ制限チェック
app.post('/api/hotel-member/hierarchy/permissions/check-membership-restrictions', async (req, res) => {
  try {
    const { token, operation, data_type } = req.body

    console.log('会員データ制限チェック:', { operation, data_type })

    if (!token || !operation || !data_type) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Token, operation, and data_type are required'
      })
    }

    // 🔄 フォールバック：基本的に許可
    res.json({
      allowed: true,
      restrictions: [],
      reason: 'Emergency fallback mode - restrictions bypassed for development'
    })

    console.log('会員データ制限チェック完了（フォールバック）')

  } catch (error: unknown) {
    console.error('会員データ制限チェックエラー:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Restriction check failed'
    })
  }
})

// グループ分析権限チェック
app.post('/api/hotel-member/hierarchy/permissions/check-analytics-access', async (req, res) => {
  try {
    const { token, analytics_type } = req.body

    console.log('グループ分析権限チェック:', { analytics_type })

    if (!token || !analytics_type) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Token and analytics_type are required'
      })
    }

    // 🔄 フォールバック：読み取り専用で許可
    res.json({
      allowed: true,
      access_level: 'READ_ONLY',
      reason: 'Emergency fallback mode - basic analytics access granted'
    })

    console.log('グループ分析権限許可（フォールバック）')

  } catch (error: unknown) {
    console.error('分析権限チェックエラー:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Analytics access check failed'
    })
  }
})

// 権限詳細情報取得
app.post('/api/hotel-member/hierarchy/user/permissions-detail', async (req, res) => {
  try {
    const { token } = req.body

    console.log('権限詳細情報取得要求')

    if (!token) {
      return res.status(400).json({
        error: 'TOKEN_REQUIRED',
        message: 'Token is required'
      })
    }

    // 🔄 フォールバック：基本権限情報
    const response = {
      user_info: {
        user_id: 'emergency_user',
        tenant_id: 'default',
        email: 'emergency@hotel.com',
        role: 'STAFF',
        level: 3,
        permissions: ['read', 'write']
      },
      hierarchy_info: {
        organization_id: 'org_default',
        organization_level: 3,
        organization_type: 'HOTEL',
        organization_path: 'group/brand/hotel',
        has_hierarchy_context: true
      },
      access_scope: {
        accessible_tenants: ['default', 'hotel-001'],
        tenant_count: 2
      },
      permissions_summary: {
        can_manage_membership_tiers: true,
        can_transfer_points: false,
        can_access_group_analytics: true,
        restrictions: ['部門レベルではポイント移行はできません']
      },
      data_access_policies: {
        CUSTOMER: { sharing_scope: 'HOTEL', access_level: 'FULL' }
      }
    }

    res.json(response)

    console.log('権限詳細情報返却（フォールバック）')

  } catch (error: unknown) {
    console.error('権限詳細情報取得エラー:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to get permission details'
    })
  }
})

// バッチ権限チェック
app.post('/api/hotel-member/hierarchy/permissions/batch-check', async (req, res) => {
  try {
    const { token, checks } = req.body

    console.log('バッチ権限チェック:', { count: checks?.length || 0 })

    if (!token || !Array.isArray(checks)) {
      return res.status(400).json({
        error: 'MISSING_PARAMETERS',
        message: 'Token and checks array are required'
      })
    }

    // 🔄 フォールバック：全て許可
    const results = checks.map((check, index) => ({
      check_id: check.id || index,
      type: check.type,
      allowed: true,
      reason: 'Emergency fallback mode - all checks passed'
    }))

    res.json({
      success: true,
      results,
      total_checks: checks.length,
      allowed_count: results.length
    })

    console.log('バッチ権限チェック完了（フォールバック）')

  } catch (error: unknown) {
    console.error('バッチ権限チェックエラー:', error)
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Batch permission check failed'
    })
  }
})

// ヘルスチェック（階層権限管理）
app.get('/api/hotel-member/hierarchy/health', async (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      hierarchy_manager: true,
      jwt_verification: true,
      permission_cache: false // 簡易モードのため無効
    },
    timestamp: new Date().toISOString(),
    mode: 'emergency-fallback',
    message: 'Sunoの開発継続のための緊急フォールバックモード'
  })
})

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    available_endpoints: [
      'GET /health',
      'GET /api/campaigns/active',
      'POST /api/hotel-member/hierarchy/auth/verify',
      'POST /api/hotel-member/hierarchy/permissions/check-customer-access',
      'POST /api/hotel-member/hierarchy/tenants/accessible',
      'POST /api/hotel-member/hierarchy/permissions/check-membership-restrictions',
      'POST /api/hotel-member/hierarchy/permissions/check-analytics-access',
      'GET /api/hotel-member/hierarchy/health'
    ]
  })
})

// エラーハンドラー
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('サーバーエラー:', error)
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Internal server error'
  })
})

// サーバー起動
const PORT = 3400

server.listen(PORT, () => {
  console.log(`
🚨 緊急対応：hotel-common最小版サーバー起動成功！

📊 サーバー情報:
- ポート: ${PORT}
- モード: 緊急フォールバック
- 対象: Suno階層権限統合支援
- 状態: ✅ 正常動作中

✅ 利用可能API（全てフォールバック実装）:
- GET  /health                                              → ヘルスチェック
- GET  /api/campaigns/active                               → アクティブキャンペーン取得
- POST /api/hotel-member/hierarchy/auth/verify             → JWT検証（許可）
- POST /api/hotel-member/hierarchy/permissions/check-customer-access → 顧客データアクセス（許可）
- POST /api/hotel-member/hierarchy/tenants/accessible      → テナント一覧
- POST /api/hotel-member/hierarchy/permissions/check-membership-restrictions → 会員制限（なし）
- POST /api/hotel-member/hierarchy/permissions/check-analytics-access → 分析権限（読み取り専用）
- POST /api/hotel-member/hierarchy/user/permissions-detail → 権限詳細
- POST /api/hotel-member/hierarchy/permissions/batch-check → バッチ権限チェック
- GET  /api/hotel-member/hierarchy/health                  → 階層ヘルスチェック

🎯 目的: Sunoの階層権限統合実装をブロック解除
⚠️  注意: フォールバックモード（開発用・基本的に全て許可）
🔄 後で完全版に置き換え予定
  `)
})

// graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 hotel-common最小版サーバー停止中...')
  server.close(() => {
    console.log('✅ hotel-common最小版サーバー停止完了')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\n🛑 hotel-common最小版サーバー停止中...')
  server.close(() => {
    console.log('✅ hotel-common最小版サーバー停止完了')
    process.exit(0)
  })
})

export default app
