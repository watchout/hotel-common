export interface WebSocketServerConfig {
    port: number;
    cors?: {
        origin: string[];
        credentials: boolean;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
    };
}
export declare class HotelWebSocketServer {
    private config;
    private httpServer;
    private io;
    private redis;
    private logger;
    private isRunning;
    constructor(config: WebSocketServerConfig);
    start(): Promise<void>;
    private setupSocketHandlers;
    private setupRedisSubscription;
    private startEventStreamMonitoring;
    private broadcastEvent;
    private handleClientEvent;
    private processStreamEvent;
    stop(): Promise<void>;
    isActive(): boolean;
    getConnectedClients(): number;
}
