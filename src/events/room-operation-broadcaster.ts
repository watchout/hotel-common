import { HotelWebSocketClient } from '../websocket/client'

type RoomOperationPayload = {
  tenant_id: string
  room_id: string
  room_number?: string
  action: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
  correlation_id?: string
}

// 単純なプロセス内 sequence 管理（将来はRedis/DBへ移行）
const roomSequence = new Map<string, number>()

// クライアントはhotel-commonのWSに接続（デフォルト: http://localhost:3401）
const WS_PORT = process.env.WEBSOCKET_PORT || '3401'
const WS_URL = process.env.WEBSOCKET_URL || `http://localhost:${WS_PORT}`

let client: HotelWebSocketClient | null = null

function getClient(): HotelWebSocketClient | null {
  try {
    if (!client) {
      client = new HotelWebSocketClient({ url: WS_URL, autoConnect: true })
    }
    return client
  } catch {
    return null
  }
}

export async function broadcastRoomOperation(event: RoomOperationPayload): Promise<void> {
  try {
    const ws = getClient()
    if (!ws || !ws.isConnected()) return

    const key = `${event.tenant_id}:${event.room_id}`
    const nextSeq = (roomSequence.get(key) || 0) + 1
    roomSequence.set(key, nextSeq)

    const payload = {
      type: 'room.operation',
      tenant_id: event.tenant_id,
      room_id: event.room_id,
      room_number: event.room_number,
      action: event.action,
      details: event.details || {},
      correlation_id: event.correlation_id || `corr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sequence: nextSeq,
      timestamp: new Date().toISOString()
    }

    // サーバは 'system:event' を受けて全体に転送する
    ws.send('system:event', payload)
  } catch {
    // 失敗は致命的でないため黙殺（ログはWS側に任せる）
  }
}

