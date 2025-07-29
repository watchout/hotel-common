#!/usr/bin/env node
/**
 * hotel-common統合サーバー
 * - WebSocketサーバー（Event-driven連携）
 * - 統一API Gateway（将来拡張）
 * - 統合監視エンドポイント
 */
declare class HotelCommonServer {
    private webSocketServer;
    private logger;
    constructor();
    /**
     * サーバー起動
     */
    start(): Promise<void>;
    /**
     * サーバー停止
     */
    private shutdown;
}
export { HotelCommonServer };
