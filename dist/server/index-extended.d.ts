#!/usr/bin/env node
/**
 * hotel-common統合サーバー（拡張版）
 * - WebSocketサーバー（Event-driven連携）
 * - 統一API Gateway（将来拡張）
 * - 統合監視エンドポイント
 * - 拡張機能
 */
declare class HotelCommonServer {
    private webSocketServer;
    private integrationServer;
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
