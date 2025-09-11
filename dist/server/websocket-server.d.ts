/**
 * WebSocketサーバークラス
 *
 * システム間リアルタイム連携のためのWebSocketサーバー
 * - Redis Pub/Sub連携
 * - イベント駆動型アーキテクチャサポート
 */
interface WebSocketServerOptions {
    port: number;
    path?: string;
    serveClient?: boolean;
    adapter?: any;
    parser?: any;
    cors?: {
        origin?: string | string[];
        methods?: string[];
        allowedHeaders?: string[];
        exposedHeaders?: string[];
        credentials?: boolean;
    };
    redis?: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
}
export declare class HotelWebSocketServer {
    private io;
    private redisClient;
    private options;
    private logger;
    private httpServer;
    constructor(options: WebSocketServerOptions);
    /**
     * サーバー起動
     */
    start(): Promise<void>;
    /**
     * サーバー停止
     */
    stop(): Promise<void>;
    /**
     * Redis接続
     */
    private connectRedis;
    /**
     * イベントハンドラ設定
     */
    private setupEventHandlers;
    /**
     * イベント送信
     */
    broadcastEvent(eventName: string, data: any): void;
    /**
     * テナント固有イベント送信
     */
    broadcastTenantEvent(tenantId: string, eventName: string, data: any): void;
    /**
     * サーバー状態取得
     */
    getStatus(): {
        active: boolean;
        connections: number;
    };
}
export {};
