import { io } from 'socket.io-client'

import { verifyToken } from '../auth/jwt'

import type { WebSocketMessage, SystemEvent } from '../types/common'
import type { Socket } from 'socket.io-client';

export interface WebSocketConfig {
  url: string
  tenantId?: string
  userId?: string
  authToken?: string
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

export class HotelWebSocketClient {
  private socket: Socket | null = null
  private config: WebSocketConfig
  private eventHandlers: Map<string, Set<Function>> = new Map()

  constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config
    }

    if (this.config.autoConnect) {
      this.connect()
    }
  }

  /**
   * WebSocket接続
   */
  connect(): void {
    const auth: any = {}
    
    if (this.config.authToken) {
      auth.token = this.config.authToken
    }
    
    if (this.config.tenantId) {
      auth.tenantId = this.config.tenantId
    }
    
    if (this.config.userId) {
      auth.userId = this.config.userId
    }

    this.socket = io(this.config.url, {
      auth,
      transports: ['websocket'],
      upgrade: false,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay
    })

    this.setupEventHandlers()
  }

  /**
   * WebSocket切断
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * 接続状態確認
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * イベントハンドラー設定
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.emit('socket:connect', { connected: true })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.emit('socket:disconnect', { reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.emit('socket:error', { error: error.message })
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts')
      this.emit('socket:reconnect', { attemptNumber })
    })

    // システムイベント受信
    this.socket.on('system:event', (event: SystemEvent) => {
      this.emit('system:event', event)
    })

    // 汎用メッセージ受信
    this.socket.on('message', (message: WebSocketMessage) => {
      this.emit('message', message)
    })
  }

  /**
   * イベントリスナー登録
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  /**
   * イベントリスナー削除
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * イベント発火
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error: Error) {
          console.error('Error in event handler:', error)
        }
      })
    }
  }

  /**
   * メッセージ送信
   */
  send(event: string, data: any): void {
    if (!this.socket || !this.socket.connected) {
      throw new Error('WebSocket is not connected')
    }

    const message: WebSocketMessage = {
      type: event,
      data,
      timestamp: new Date()
    }

    this.socket.emit(event, message)
  }

  /**
   * システムイベント送信
   */
  sendSystemEvent(event: Omit<SystemEvent, 'id' | 'timestamp'>): void {
    const systemEvent: SystemEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event
    }

    this.send('system:event', systemEvent)
  }

  /**
   * 特定のチャンネルに参加
   */
  joinChannel(channel: string): void {
    this.send('join:channel', { channel })
  }

  /**
   * 特定のチャンネルから退出
   */
  leaveChannel(channel: string): void {
    this.send('leave:channel', { channel })
  }

  /**
   * ブロードキャストメッセージ送信
   */
  broadcast(channel: string, data: any): void {
    this.send('broadcast', { channel, data })
  }
}

/**
 * システム別WebSocketクライアントファクトリー
 */
export class HotelWebSocketFactory {
  /**
   * hotel-saas用クライアント作成
   */
  static createSaasClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient {
    return new HotelWebSocketClient({
      url: 'ws://localhost:3100',
      ...config
    })
  }

  /**
   * hotel-member用クライアント作成
   */
  static createMemberClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient {
    return new HotelWebSocketClient({
      url: 'ws://localhost:3200',
      ...config
    })
  }

  /**
   * hotel-pms用クライアント作成
   */
  static createPmsClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient {
    return new HotelWebSocketClient({
      url: 'ws://localhost:3300',
      ...config
    })
  }

  /**
   * hotel-common用クライアント作成（統合WebSocketサーバー）
   */
  static createCommonClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient {
    return new HotelWebSocketClient({
      url: 'ws://localhost:3400',
      ...config
    })
  }
} 