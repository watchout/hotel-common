import path from 'path'

import cors from 'cors'
import express from 'express'

import adminRouter from './admin-api'
import { HotelLogger } from '../utils/logger'

const app = express()
const logger = HotelLogger.getInstance()
const PORT = process.env.ADMIN_PORT || 3500

// ミドルウェア設定
app.use(cors({
  origin: ['http://localhost:3500', 'http://127.0.0.1:3500'],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静的ファイル配信（管理画面UI）
// @ts-ignore - ESモジュールの機能を使用
const currentDir = path.dirname(new URL(import.meta.url).pathname)
app.use('/admin', express.static(path.join(currentDir, '.')))

// 管理画面UI（ルート）
app.get('/', (req, res) => {
  res.sendFile(path.join(currentDir, 'admin-dashboard.html'))
})

app.get('/admin', (req, res) => {
  res.sendFile(path.join(currentDir, 'admin-dashboard.html'))
})

// テナントサービス管理画面
app.get('/admin/tenant-service-management', (req, res) => {
  res.sendFile(path.join(currentDir, 'tenant-service-management.html'))
})

// Admin API
app.use('/api/admin', adminRouter)

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Hotel Admin Management',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found',
    path: req.originalUrl
  })
})

// エラーハンドラー
app.use((error: any, req: any, res: any, _next: any) => {
  logger.error('Admin Server Error:', error)
  
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// サーバー起動
app.listen(PORT, () => {
  logger.info(`🏨 Hotel Admin Management Server running on http://localhost:${PORT}`)
  logger.info(`📊 Admin Dashboard: http://localhost:${PORT}/admin`)
  logger.info(`🔗 API Endpoint: http://localhost:${PORT}/api/admin`)
})

export default app 