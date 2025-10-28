#!/usr/bin/env node

// 🚨 最終緊急対応：超簡素hotel-commonサーバー
// ルーティングエラー回避、Sunoブロック解除最優先

import { createServer } from 'http'

import express from 'express'

// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
// eslint-disable-next-line no-duplicate-imports
import type { Request, Response, NextFunction } from 'express';


const app = express()
const server = createServer(app)

app.use(express.json())

// CORS対応
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

// ヘルスチェック
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: '🏨 Hotel Common Emergency Server is running',
    timestamp: new Date().toISOString(),
    process: process.pid
  })
})

// Suno緊急サポート用: hotel-member/hierarchy/auth/verify
app.post('/api/hotel-member/hierarchy/auth/verify', (req: Request, res: Response) => {
  const { token } = req.body
  
  // 緊急時はダミー検証結果を返す
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'TOKEN_REQUIRED',
      message: '緊急モード: トークンが必要です'
    })
  }

  // ダミー階層コンテキストを返す
  res.json({
    success: true,
    valid: true,
    hierarchy_context: {
      organization_id: 'emergency_org_001',
      organization_level: 3,
      organization_type: 'TENANT',
      permissions: ['READ', 'WRITE'],
      accessible_tenant_ids: ['tenant_001'],
      data_scope: 'TENANT_ISOLATED'
    },
    user_context: {
      user_id: 'emergency_user_001',
      email: 'emergency@hotel-common.com',
      role: 'ADMIN',
      tenant_id: 'tenant_001'
    },
    emergency_mode: true,
    message: '🚨 緊急検証モード: ダミーコンテキスト返却'
  })
})

// Suno緊急サポート用: 顧客データアクセスチェック
app.post('/api/hotel-member/hierarchy/permissions/check-customer-access', (req: Request, res: Response) => {
  const { token, target_customer_id, action } = req.body
  
  // 緊急時は常に許可
  res.json({
    success: true,
    allowed: true,
    scope: 'EMERGENCY_FULL_ACCESS',
    message: '🚨 緊急モード: 全アクセス許可',
    emergency_mode: true
  })
})

// アクセス可能テナント一覧
app.post('/api/hotel-member/hierarchy/tenants/accessible', (req: Request, res: Response) => {
  res.json({
    success: true,
    tenant_ids: ['tenant_001', 'tenant_002', 'tenant_003'],
    message: '🚨 緊急モード: ダミーテナントリスト',
    emergency_mode: true
  })
})

// 会員データ制限チェック
app.post('/api/hotel-member/hierarchy/permissions/check-membership-restrictions', (req: Request, res: Response) => {
  const { token, action, target_data } = req.body
  
  res.json({
    success: true,
    allowed: true,
    restrictions: [],
    message: '🚨 緊急モード: 制限なし',
    emergency_mode: true
  })
})

// アナリティクスアクセスチェック
app.post('/api/hotel-member/hierarchy/permissions/check-analytics-access', (req: Request, res: Response) => {
  const { token, analytics_type, target_scope } = req.body
  
  res.json({
    success: true,
    allowed: true,
    scope: 'FULL_ANALYTICS',
    message: '🚨 緊急モード: フルアナリティクス許可',
    emergency_mode: true
  })
})

// ヘルスチェック（階層管理）
app.get('/api/hotel-member/hierarchy/health', (req: Request, res: Response) => {
  res.json({
    status: 'emergency_healthy',
    service: 'hotel-member-hierarchy',
    mode: 'EMERGENCY',
    message: '🚨 緊急階層管理サービス稼働中',
    timestamp: new Date().toISOString()
  })
})

// 404ハンドラー
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `🚨 緊急サーバー: ${req.method} ${req.originalUrl} は対応していません`,
    available_endpoints: [
      'GET /health',
      'POST /api/hotel-member/hierarchy/auth/verify',
      'POST /api/hotel-member/hierarchy/permissions/check-customer-access',
      'POST /api/hotel-member/hierarchy/tenants/accessible',
      'POST /api/hotel-member/hierarchy/permissions/check-membership-restrictions',
      'POST /api/hotel-member/hierarchy/permissions/check-analytics-access',
      'GET /api/hotel-member/hierarchy/health'
    ],
    emergency_mode: true
  })
})

const PORT = process.env.HOTEL_COMMON_PORT || 3400

server.listen(PORT, () => {
  console.log('\n🚨🏨 Hotel Common Emergency Server Started 🏨🚨')
  console.log(`📍 Port: ${PORT}`)
  console.log(`🌐 Health: http://localhost:${PORT}/health`)
  console.log(`🔧 Suno Support: http://localhost:${PORT}/api/hotel-member/hierarchy/`)
  console.log('⚡ 緊急モード稼働中 - ダミーレスポンス返却\n')
})

// 緊急シャットダウン
process.on('SIGTERM', () => {
  console.log('\n🚨 Emergency Server SIGTERM received')
  server.close(() => {
    console.log('🚨 Emergency Server stopped')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\n🚨 Emergency Server SIGINT received')
  server.close(() => {
    console.log('🚨 Emergency Server stopped')
    process.exit(0)
  })
}) 