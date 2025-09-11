"use strict";
/**
 * WebSocketサーバークラス
 *
 * システム間リアルタイム連携のためのWebSocketサーバー
 * - Redis Pub/Sub連携
 * - イベント駆動型アーキテクチャサポート
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelWebSocketServer = void 0;
const socket_io_1 = require("socket.io");
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const http_1 = require("http");
class HotelWebSocketServer {
    io = null;
    redisClient = null;
    options;
    logger;
    httpServer = null;
    constructor(options) {
        this.options = options;
        this.logger = logger_1.HotelLogger.getInstance();
    }
    /**
     * サーバー起動
     */
    async start() {
        try {
            // HTTPサーバー作成
            this.httpServer = (0, http_1.createServer)();
            // Socket.IOサーバー作成
            this.io = new socket_io_1.Server(this.httpServer, {
                cors: this.options.cors,
                path: this.options.path,
                serveClient: this.options.serveClient
            });
            // HTTPサーバー起動
            this.httpServer.listen(this.options.port, () => {
                this.logger.info(`WebSocketサーバー起動完了 (port: ${this.options.port})`);
            });
            // Redis接続（オプション）
            if (this.options.redis) {
                await this.connectRedis();
            }
            // イベントハンドラ設定
            this.setupEventHandlers();
        }
        catch (error) {
            this.logger.error('WebSocketサーバー起動エラー:', error);
            throw error;
        }
    }
    /**
     * サーバー停止
     */
    async stop() {
        try {
            if (this.redisClient) {
                await this.redisClient.quit();
                this.redisClient = null;
            }
            if (this.io) {
                this.io.close();
                this.io = null;
            }
            if (this.httpServer) {
                await new Promise((resolve) => {
                    this.httpServer.close(() => resolve());
                });
                this.httpServer = null;
            }
            this.logger.info('WebSocketサーバー停止完了');
        }
        catch (error) {
            this.logger.error('WebSocketサーバー停止エラー:', error);
            throw error;
        }
    }
    /**
     * Redis接続
     */
    async connectRedis() {
        try {
            if (!this.options.redis)
                return;
            const { host, port, password, db } = this.options.redis;
            this.redisClient = (0, redis_1.createClient)({
                url: `redis://${host}:${port}`,
                password: password,
                database: db || 0
            });
            // エラーハンドリング
            this.redisClient.on('error', (err) => {
                this.logger.error('Redis接続エラー:', err);
            });
            await this.redisClient.connect();
            this.logger.info(`Redis接続完了 (${host}:${port})`);
        }
        catch (error) {
            this.logger.error('Redis接続エラー:', error);
            throw error;
        }
    }
    /**
     * イベントハンドラ設定
     */
    setupEventHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            const clientInfo = {
                id: socket.id,
                address: socket.handshake.address,
                userAgent: socket.handshake.headers['user-agent'] || 'unknown',
                system: socket.handshake.query.system || 'unknown'
            };
            this.logger.info(`WebSocket接続: ${JSON.stringify(clientInfo)}`);
            // 接続イベント
            socket.on('disconnect', () => {
                this.logger.info(`WebSocket切断: ${socket.id}`);
            });
            // システム間連携イベント
            socket.on('system:event', (data) => {
                this.logger.debug(`システムイベント受信: ${JSON.stringify(data)}`);
                // 他のクライアントに転送
                socket.broadcast.emit('system:event', data);
            });
            // テナント固有イベント
            socket.on('tenant:event', (data) => {
                if (data.tenantId) {
                    this.logger.debug(`テナントイベント受信: ${JSON.stringify(data)}`);
                    // 同じテナントIDのクライアントにのみ転送
                    socket.to(`tenant:${data.tenantId}`).emit('tenant:event', data);
                }
            });
            // テナントルーム参加
            socket.on('join:tenant', (tenantId) => {
                if (tenantId) {
                    socket.join(`tenant:${tenantId}`);
                    this.logger.debug(`テナントルーム参加: ${socket.id} -> tenant:${tenantId}`);
                }
            });
        });
    }
    /**
     * イベント送信
     */
    broadcastEvent(eventName, data) {
        if (this.io) {
            this.io.emit(eventName, data);
        }
    }
    /**
     * テナント固有イベント送信
     */
    broadcastTenantEvent(tenantId, eventName, data) {
        if (this.io) {
            this.io.to(`tenant:${tenantId}`).emit(eventName, data);
        }
    }
    /**
     * サーバー状態取得
     */
    getStatus() {
        return {
            active: this.io !== null,
            connections: this.io ? this.io.engine.clientsCount : 0
        };
    }
}
exports.HotelWebSocketServer = HotelWebSocketServer;
