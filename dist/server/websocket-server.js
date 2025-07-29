import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from 'redis';
import { HotelLogger } from '../utils/logger';
export class HotelWebSocketServer {
    config;
    httpServer;
    io;
    redis;
    logger;
    isRunning = false;
    constructor(config) {
        this.config = config;
        this.logger = HotelLogger.getInstance();
        this.httpServer = createServer();
        this.io = new SocketIOServer(this.httpServer, {
            cors: config.cors
        });
        // Redis クライアント初期化
        this.redis = createClient({
            socket: {
                host: config.redis.host,
                port: config.redis.port
            },
            password: config.redis.password,
            database: config.redis.db
        });
        this.setupSocketHandlers();
    }
    async start() {
        try {
            // Redis 接続
            await this.redis.connect();
            this.logger.info('Redis接続成功');
            // Redis Pub/Sub セットアップ
            await this.setupRedisSubscription();
            // HTTPサーバー起動
            this.httpServer.listen(this.config.port, () => {
                this.logger.info(`WebSocketサーバー起動完了: http://localhost:${this.config.port}`);
                this.isRunning = true;
            });
            // Event Stream 監視開始
            await this.startEventStreamMonitoring();
        }
        catch (error) {
            this.logger.error('WebSocketサーバー起動エラー:', error);
            throw error;
        }
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            this.logger.debug('WebSocketクライアント接続', { socketId: socket.id });
            socket.on('join-tenant', (tenantId) => {
                socket.join(`tenant:${tenantId}`);
                this.logger.debug('テナントルーム参加', { socketId: socket.id, tenantId });
            });
            socket.on('join-organization', (organizationId) => {
                socket.join(`organization:${organizationId}`);
                this.logger.debug('組織ルーム参加', { socketId: socket.id, organizationId });
            });
            socket.on('hotel-event', async (event) => {
                await this.handleClientEvent(socket, event);
            });
            socket.on('disconnect', () => {
                this.logger.debug('WebSocketクライアント切断', { socketId: socket.id });
            });
        });
    }
    async setupRedisSubscription() {
        // 重複サブスクライバー作成
        const subscriber = this.redis.duplicate();
        await subscriber.connect();
        subscriber.subscribe('hotel-events', (message) => {
            try {
                const event = JSON.parse(message);
                this.broadcastEvent(event);
            }
            catch (error) {
                this.logger.error('Redis Pub/Subメッセージ処理エラー:', error);
            }
        });
        this.logger.info('Redis Pub/Sub購読開始');
    }
    async startEventStreamMonitoring() {
        // Event Stream 監視ループ
        const monitorStreams = async () => {
            try {
                // TODO: Redis Streams の XREAD を使った継続監視
                // この部分は簡素化のため省略
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (this.isRunning) {
                    setImmediate(monitorStreams);
                }
            }
            catch (error) {
                if (error.message !== 'Command timed out') {
                    this.logger.error('Event Stream監視エラー:', error);
                }
                if (this.isRunning) {
                    setTimeout(monitorStreams, 5000); // エラー時は5秒後にリトライ
                }
            }
        };
        monitorStreams();
    }
    broadcastEvent(event) {
        // テナント別ブロードキャスト
        if (event.tenant_id) {
            this.io.to(`tenant:${event.tenant_id}`).emit('hotel-event', event);
        }
        // 組織別ブロードキャスト（階層権限対応）
        if (event.metadata?.organization_id) {
            this.io.to(`organization:${event.metadata.organization_id}`).emit('hotel-event', event);
        }
        // 全体ブロードキャスト（重要イベント）
        if (event.priority === 'HIGH' || event.critical) {
            this.io.emit('hotel-event', event);
        }
        this.logger.debug('イベントブロードキャスト完了', {
            type: event.type,
            tenantId: event.tenant_id,
            organizationId: event.metadata?.organization_id
        });
    }
    async handleClientEvent(socket, event) {
        try {
            // クライアントからのイベントをRedis Streamに送信
            await this.redis.xAdd('hotel-events-stream', '*', {
                event: JSON.stringify(event),
                source: 'websocket',
                socketId: socket.id
            });
            this.logger.debug('クライアントイベント処理完了', { socketId: socket.id, eventType: event.type });
        }
        catch (error) {
            this.logger.error('クライアントイベント処理エラー:', error);
        }
    }
    async processStreamEvent(message) {
        try {
            const eventData = JSON.parse(message.event);
            this.broadcastEvent(eventData);
        }
        catch (error) {
            this.logger.error('Streamイベント処理エラー:', error);
        }
    }
    async stop() {
        try {
            this.isRunning = false;
            // WebSocket サーバー停止
            this.io.close();
            this.httpServer.close();
            // Redis 切断
            await this.redis.disconnect();
            this.logger.info('WebSocketサーバー停止完了');
        }
        catch (error) {
            this.logger.error('WebSocketサーバー停止エラー:', error);
        }
    }
    isActive() {
        return this.isRunning;
    }
    getConnectedClients() {
        return this.io.sockets.sockets.size;
    }
}
