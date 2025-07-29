import { SystemEvent } from '../types/common';
export interface WebSocketConfig {
    url: string;
    tenantId?: string;
    userId?: string;
    authToken?: string;
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
}
export declare class HotelWebSocketClient {
    private socket;
    private config;
    private eventHandlers;
    constructor(config: WebSocketConfig);
    /**
     * WebSocket接続
     */
    connect(): void;
    /**
     * WebSocket切断
     */
    disconnect(): void;
    /**
     * 接続状態確認
     */
    isConnected(): boolean;
    /**
     * イベントハンドラー設定
     */
    private setupEventHandlers;
    /**
     * イベントリスナー登録
     */
    on(event: string, handler: Function): void;
    /**
     * イベントリスナー削除
     */
    off(event: string, handler: Function): void;
    /**
     * イベント発火
     */
    private emit;
    /**
     * メッセージ送信
     */
    send(event: string, data: any): void;
    /**
     * システムイベント送信
     */
    sendSystemEvent(event: Omit<SystemEvent, 'id' | 'timestamp'>): void;
    /**
     * 特定のチャンネルに参加
     */
    joinChannel(channel: string): void;
    /**
     * 特定のチャンネルから退出
     */
    leaveChannel(channel: string): void;
    /**
     * ブロードキャストメッセージ送信
     */
    broadcast(channel: string, data: any): void;
}
/**
 * システム別WebSocketクライアントファクトリー
 */
export declare class HotelWebSocketFactory {
    /**
     * hotel-saas用クライアント作成
     */
    static createSaasClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient;
    /**
     * hotel-member用クライアント作成
     */
    static createMemberClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient;
    /**
     * hotel-pms用クライアント作成
     */
    static createPmsClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient;
    /**
     * hotel-common用クライアント作成（統合WebSocketサーバー）
     */
    static createCommonClient(config?: Partial<WebSocketConfig>): HotelWebSocketClient;
}
//# sourceMappingURL=client.d.ts.map