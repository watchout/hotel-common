import { PrismaClient } from '@prisma/client'
import express from 'express'

/**
 * /api/health エンドポイント用のルーター
 * - データベース接続テスト
 * - システム稼働状況
 * - 必要なCORSヘッダー設定
 */
export const apiHealthRouter = express.Router()

// Prismaクライアント初期化
const prisma = new PrismaClient()

// /api/health エンドポイント
apiHealthRouter.get('/api/health', async (req, res) => {
  try {
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1 as connection_test`
    
    // レスポンスヘッダー設定（CORS）
    res.header('Access-Control-Allow-Origin', 
      req.headers.origin === 'http://localhost:3100' || 
      req.headers.origin === 'http://localhost:3200' || 
      req.headers.origin === 'http://localhost:3300' ? 
      req.headers.origin : 'http://localhost:3100')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Credentials', 'true')
    
    // 正常レスポンス
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'hotel-common-api',
      version: '1.0.0',
      database: {
        status: 'connected',
        database: 'hotel_unified_db',
        schema: 'unified',
        client: 'hotel-common/unified-client',
        healthy: true
      },
      services: {
        unified_database: true,
        hotel_common: true,
        hierarchical_auth: true
      }
    })
  } catch (error: Error) {
    console.error('Health check error:', error)
    
    // エラーレスポンス
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database connection failed',
      database: {
        status: 'disconnected',
        database: 'hotel_unified_db',
        healthy: false
      }
    })
  }
})

// OPTIONSリクエスト対応（CORS プリフライトリクエスト）
apiHealthRouter.options('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', 
    req.headers.origin === 'http://localhost:3100' || 
    req.headers.origin === 'http://localhost:3200' || 
    req.headers.origin === 'http://localhost:3300' ? 
    req.headers.origin : 'http://localhost:3100')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.status(204).end()
})

export default apiHealthRouter
