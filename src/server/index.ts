#!/usr/bin/env node

import { HotelWebSocketServer } from './websocket-server'
import { HotelLogger } from '../utils/logger'
import { config } from 'dotenv'

// 環境変数読み込み
config()

/**
 * hotel-common統合サーバー
 * - WebSocketサーバー（Event-driven連携）
 * - 統一API Gateway（将来拡張）
 * - 統合監視エンドポイント
 */
class HotelCommonServer {
  private webSocketServer: HotelWebSocketServer
  private logger: HotelLogger

  constructor() {
    this.logger = HotelLogger.getInstance()
    
    // WebSocketサーバー設定
    this.webSocketServer = new HotelWebSocketServer({
      port: parseInt(process.env.WEBSOCKET_PORT || '3400'),
      cors: {
        origin: [
          "http://localhost:3100", // hotel-saas
          "http://localhost:3200", // hotel-member
          "http://localhost:3300"  // hotel-pms
        ],
        credentials: true
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0')
      }
    })
  }

  /**
   * サーバー起動
   */
  async start(): Promise<void> {
    try {
      this.logger.info('🌊 hotel-common統合サーバー起動開始...')

      // WebSocketサーバー起動
      await this.webSocketServer.start()

      // 正常起動ログ
      this.logger.info(`
🎉 hotel-common統合基盤稼働開始！

📡 WebSocketサーバー: ポート${process.env.WEBSOCKET_PORT || '3400'}
🗄️  PostgreSQL統一DB: hotel_unified_db
⚡ Event-driven連携: Redis Streams稼働中

接続可能システム:
- 🏪 hotel-saas (port:3100)
- 🎯 hotel-member (port:3200) 
- 💼 hotel-pms (port:3300)
      `)

      // graceful shutdown設定
      process.on('SIGINT', () => this.shutdown())
      process.on('SIGTERM', () => this.shutdown())

    } catch (error) {
      this.logger.error('サーバー起動エラー:', error as Error)
      process.exit(1)
    }
  }

  /**
   * サーバー停止
   */
  private async shutdown(): Promise<void> {
    this.logger.info('hotel-common統合サーバー停止中...')
    
    try {
      await this.webSocketServer.stop()
      this.logger.info('hotel-common統合サーバー停止完了')
      process.exit(0)
    } catch (error) {
      this.logger.error('サーバー停止エラー:', error as Error)
      process.exit(1)
    }
  }
}

// サーバー起動
if (require.main === module) {
  const server = new HotelCommonServer()
  server.start().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { HotelCommonServer } 