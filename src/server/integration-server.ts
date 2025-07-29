#!/usr/bin/env node

import express from 'express'
import { config } from 'dotenv'
import { PrismaClient } from '../generated/prisma'
import cors from 'cors'
import { initializeHotelMemberHierarchy } from '../integrations/hotel-member'
import hotelMemberApiRouter from '../integrations/hotel-member/api-endpoints'

// 環境変数読み込み
config()

interface SystemConnectionStatus {
  system: string
  url: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  lastCheck: Date
  responseTime?: number
  version?: string
}

/**
 * hotel-common統合APIサーバー
 * - システム間接続管理
 * - ヘルスチェック
 * - 基本的なCRUD API
 */
class HotelIntegrationServer {
  private app: express.Application
  private server: any
  private prisma: PrismaClient
  private port: number
  private systemConnections: Map<string, SystemConnectionStatus> = new Map()

  constructor() {
    this.app = express()
    this.prisma = new PrismaClient()
    this.port = parseInt(process.env.HOTEL_COMMON_PORT || '3400')
    
    this.setupMiddleware()
    this.setupRoutes()
    this.initializeSystemConnections()
  }

  /**
   * ミドルウェア設定
   */
  private setupMiddleware(): void {
    // CORS設定
    this.app.use(cors({
      origin: [
        'http://localhost:3100', // hotel-saas
        'http://localhost:3200', // hotel-member frontend
        'http://localhost:8080', // hotel-member backend  
        'http://localhost:3300', // hotel-pms
        'http://localhost:3301'  // hotel-pms electron
      ],
      credentials: true
    }))

    // JSON解析
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // リクエストログ
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
      next()
    })
  }

  /**
   * ルート設定
   */
  private setupRoutes(): void {
    // ヘルスチェック
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'hotel-common-integration',
        version: '1.0.0',
        database: 'connected',
        systems: Object.fromEntries(this.systemConnections)
      })
    })

    // システム接続状況
    this.app.get('/api/systems/status', (req, res) => {
      const systemStatus = Array.from(this.systemConnections.values())
      res.json({
        timestamp: new Date().toISOString(),
        total_systems: systemStatus.length,
        connected: systemStatus.filter(s => s.status === 'CONNECTED').length,
        systems: systemStatus
      })
    })

    // システム接続テスト
    this.app.post('/api/systems/:systemName/test', async (req, res) => {
      const { systemName } = req.params
      try {
        const result = await this.testSystemConnection(systemName)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          error: 'CONNECTION_TEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    })

    // データベース接続テスト
    this.app.get('/api/database/test', async (req, res) => {
      try {
        await this.prisma.$queryRaw`SELECT 1 as test`
        res.json({
          status: 'connected',
          timestamp: new Date().toISOString(),
          database: 'PostgreSQL'
        })
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error instanceof Error ? error.message : 'Database connection failed'
        })
      }
    })

    // テナント一覧
    this.app.get('/api/tenants', async (req, res) => {
      try {
        const tenants = await this.prisma.tenant.findMany({
          where: { status: 'active' },
          select: {
            id: true,
            name: true,
            contactEmail: true,
            planType: true,
            createdAt: true
          }
        })
        res.json({
          success: true,
          count: tenants.length,
          tenants
        })
      } catch (error) {
        res.status(500).json({
          error: 'DATABASE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch tenants'
        })
      }
    })

    // 統合認証エンドポイント（基本版）
    this.app.post('/api/auth/validate', (req, res) => {
      const { token, system } = req.body
      
      if (!token) {
        return res.status(400).json({
          error: 'TOKEN_REQUIRED',
          message: 'Authentication token is required'
        })
      }

      // TODO: JWT検証実装
      res.json({
        valid: true,
        system,
        user: {
          id: 'temp_user',
          tenant_id: 'default',
          role: 'USER'
        },
        timestamp: new Date().toISOString()
      })
    })

    // システム統計（基本版）
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = {
          tenants: await this.prisma.tenant.count(),
          staff: await this.prisma.staff.count()
        }
        
        res.json({
          timestamp: new Date().toISOString(),
          database_stats: stats,
          system_connections: this.systemConnections.size
        })
      } catch (error) {
        res.status(500).json({
          error: 'STATS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch statistics'
        })
      }
    })

    // hotel-member統合APIエンドポイント
    this.app.use('/api/hotel-member', hotelMemberApiRouter)

    // hotel-member階層権限管理専用ヘルスチェック
    this.app.get('/api/hotel-member/integration/health', async (req, res) => {
      try {
        const { HotelMemberHierarchyAdapter } = await import('../integrations/hotel-member/hierarchy-adapter')
        const health = await HotelMemberHierarchyAdapter.healthCheckForPython()
        
        res.json({
          integration_status: 'active',
          hotel_member_hierarchy: health,
          endpoints_available: 8,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        res.status(500).json({
          integration_status: 'error',
          error: error instanceof Error ? error.message : 'Integration health check failed',
          timestamp: new Date().toISOString()
        })
      }
    })

    // 404エラーハンドラー
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: `Endpoint ${req.originalUrl} not found`,
        available_endpoints: [
          'GET /health',
          'GET /api/systems/status',
          'POST /api/systems/:systemName/test',
          'GET /api/database/test',
          'GET /api/tenants',
          'POST /api/auth/validate',
          'GET /api/stats',
          'GET /api/hotel-member/integration/health',
          'POST /api/hotel-member/hierarchy/auth/verify',
          'POST /api/hotel-member/hierarchy/permissions/check-customer-access',
          'POST /api/hotel-member/hierarchy/tenants/accessible',
          'POST /api/hotel-member/hierarchy/permissions/check-membership-restrictions',
          'POST /api/hotel-member/hierarchy/permissions/check-analytics-access',
          'POST /api/hotel-member/hierarchy/user/permissions-detail',
          'POST /api/hotel-member/hierarchy/permissions/batch-check',
          'GET /api/hotel-member/hierarchy/health'
        ]
      })
    })

    // エラーハンドラー
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server error:', error)
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * システム接続初期化
   */
  private initializeSystemConnections(): void {
    const systems = [
      { name: 'hotel-saas', url: 'http://localhost:3100' },
      { name: 'hotel-member-frontend', url: 'http://localhost:3200' },
      { name: 'hotel-member-backend', url: 'http://localhost:8080' },
      { name: 'hotel-pms', url: 'http://localhost:3300' }
    ]

    systems.forEach(system => {
      this.systemConnections.set(system.name, {
        system: system.name,
        url: system.url,
        status: 'DISCONNECTED',
        lastCheck: new Date()
      })
    })
  }

  /**
   * システム接続テスト
   */
  private async testSystemConnection(systemName: string): Promise<SystemConnectionStatus> {
    const connection = this.systemConnections.get(systemName)
    if (!connection) {
      throw new Error(`System ${systemName} not found`)
    }

    const startTime = Date.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${connection.url}/health`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime
      const isHealthy = response.ok

      const updatedConnection: SystemConnectionStatus = {
        ...connection,
        status: isHealthy ? 'CONNECTED' : 'ERROR',
        lastCheck: new Date(),
        responseTime
      }

      if (isHealthy) {
        try {
          const data = await response.json()
          updatedConnection.version = data.version
        } catch (e) {
          // JSONパースエラーは無視
        }
      }

      this.systemConnections.set(systemName, updatedConnection)
      return updatedConnection

    } catch (error) {
      const updatedConnection: SystemConnectionStatus = {
        ...connection,
        status: 'ERROR',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime
      }
      
      this.systemConnections.set(systemName, updatedConnection)
      return updatedConnection
    }
  }

  /**
   * 定期的なシステム接続確認
   */
  private startHealthCheck(): void {
    setInterval(async () => {
      for (const systemName of this.systemConnections.keys()) {
        try {
          await this.testSystemConnection(systemName)
        } catch (error) {
          console.error(`Health check failed for ${systemName}:`, error)
        }
      }
    }, 30000) // 30秒間隔
  }

  /**
   * サーバー起動
   */
  async start(): Promise<void> {
    try {
      // データベース接続確認
      await this.prisma.$connect()
      console.log('PostgreSQL接続確認完了')

      // hotel-member階層権限管理統合初期化
      try {
        await initializeHotelMemberHierarchy()
        console.log('hotel-member統合初期化完了')
      } catch (error) {
        console.warn('hotel-member統合初期化警告:', error instanceof Error ? error.message : 'Unknown error')
      }

      // サーバー起動
      this.server = this.app.listen(this.port, () => {
        console.log(`
🎉 hotel-common統合APIサーバー起動完了！

📊 サーバー情報:
- ポート: ${this.port}
- データベース: PostgreSQL (hotel_unified_db)
- 監視対象システム: ${this.systemConnections.size}個

🔗 利用可能エンドポイント:
- GET  /health                    - サーバーヘルスチェック
- GET  /api/systems/status        - システム接続状況
- POST /api/systems/:name/test    - システム接続テスト
- GET  /api/database/test         - データベース接続テスト
- GET  /api/tenants              - テナント一覧
- POST /api/auth/validate        - 認証検証
- GET  /api/stats                - システム統計

🎯 接続対象システム:
- 🏪 hotel-saas (http://localhost:3100)
- 🎯 hotel-member-frontend (http://localhost:3200)
- 🎯 hotel-member-backend (http://localhost:8080)
- 💼 hotel-pms (http://localhost:3300)
        `)
      })

      // ヘルスチェック開始
      this.startHealthCheck()

      // graceful shutdown設定
      process.on('SIGINT', () => this.shutdown())
      process.on('SIGTERM', () => this.shutdown())

    } catch (error) {
      console.error('サーバー起動エラー:', error)
      throw error
    }
  }

  /**
   * サーバー停止
   */
  private async shutdown(): Promise<void> {
    console.log('hotel-common統合APIサーバー停止中...')
    
    try {
      if (this.server) {
        this.server.close()
      }
      await this.prisma.$disconnect()
      console.log('hotel-common統合APIサーバー停止完了')
      process.exit(0)
    } catch (error) {
      console.error('サーバー停止エラー:', error)
      process.exit(1)
    }
  }
}

// サーバー起動
if (require.main === module) {
  const server = new HotelIntegrationServer()
  server.start().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { HotelIntegrationServer } 