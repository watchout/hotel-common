"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelWebSocketFactory = exports.HotelWebSocketClient = void 0;
const socket_io_client_1 = require("socket.io-client");
class HotelWebSocketClient {
    socket = null;
    config;
    eventHandlers = new Map();
    constructor(config) {
        this.config = {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            ...config
        };
        if (this.config.autoConnect) {
            this.connect();
        }
    }
    /**
     * WebSocket接続
     */
    connect() {
        const auth = {};
        if (this.config.authToken) {
            auth.token = this.config.authToken;
        }
        if (this.config.tenantId) {
            auth.tenantId = this.config.tenantId;
        }
        if (this.config.userId) {
            auth.userId = this.config.userId;
        }
        this.socket = (0, socket_io_client_1.io)(this.config.url, {
            auth,
            transports: ['websocket'],
            upgrade: false,
            reconnection: this.config.reconnection,
            reconnectionAttempts: this.config.reconnectionAttempts,
            reconnectionDelay: this.config.reconnectionDelay
        });
        this.setupEventHandlers();
    }
    /**
     * WebSocket切断
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
    /**
     * 接続状態確認
     */
    isConnected() {
        return this.socket?.connected || false;
    }
    /**
     * イベントハンドラー設定
     */
    setupEventHandlers() {
        if (!this.socket)
            return;
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.emit('socket:connect', { connected: true });
        });
        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            this.emit('socket:disconnect', { reason });
        });
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.emit('socket:error', { error: error.message });
        });
        this.socket.on('reconnect', (attemptNumber) => {
            console.log('WebSocket reconnected after', attemptNumber, 'attempts');
            this.emit('socket:reconnect', { attemptNumber });
        });
        // システムイベント受信
        this.socket.on('system:event', (event) => {
            this.emit('system:event', event);
        });
        // 汎用メッセージ受信
        this.socket.on('message', (message) => {
            this.emit('message', message);
        });
    }
    /**
     * イベントリスナー登録
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
    }
    /**
     * イベントリスナー削除
     */
    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    /**
     * イベント発火
     */
    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error('Error in event handler:', error);
                }
            });
        }
    }
    /**
     * メッセージ送信
     */
    send(event, data) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('WebSocket is not connected');
        }
        const message = {
            type: event,
            data,
            timestamp: new Date()
        };
        this.socket.emit(event, message);
    }
    /**
     * システムイベント送信
     */
    sendSystemEvent(event) {
        const systemEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ...event
        };
        this.send('system:event', systemEvent);
    }
    /**
     * 特定のチャンネルに参加
     */
    joinChannel(channel) {
        this.send('join:channel', { channel });
    }
    /**
     * 特定のチャンネルから退出
     */
    leaveChannel(channel) {
        this.send('leave:channel', { channel });
    }
    /**
     * ブロードキャストメッセージ送信
     */
    broadcast(channel, data) {
        this.send('broadcast', { channel, data });
    }
}
exports.HotelWebSocketClient = HotelWebSocketClient;
/**
 * システム別WebSocketクライアントファクトリー
 */
class HotelWebSocketFactory {
    /**
     * hotel-saas用クライアント作成
     */
    static createSaasClient(config) {
        return new HotelWebSocketClient({
            url: 'ws://localhost:3100',
            ...config
        });
    }
    /**
     * hotel-member用クライアント作成
     */
    static createMemberClient(config) {
        return new HotelWebSocketClient({
            url: 'ws://localhost:3200',
            ...config
        });
    }
    /**
     * hotel-pms用クライアント作成
     */
    static createPmsClient(config) {
        return new HotelWebSocketClient({
            url: 'ws://localhost:3300',
            ...config
        });
    }
    /**
     * hotel-common用クライアント作成（統合WebSocketサーバー）
     */
    static createCommonClient(config) {
        return new HotelWebSocketClient({
            url: 'ws://localhost:3400',
            ...config
        });
    }
}
exports.HotelWebSocketFactory = HotelWebSocketFactory;
//# sourceMappingURL=client.js.map