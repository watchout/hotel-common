#!/usr/bin/env node
/**
 * hotel-common統合APIサーバー
 * - システム間接続管理
 * - ヘルスチェック
 * - 基本的なCRUD API
 */
declare class HotelIntegrationServer {
    private app;
    private server;
    private prisma;
    private port;
    private systemConnections;
    constructor();
    /**
     * ミドルウェア設定
     */
    private setupMiddleware;
    /**
     * ルート設定
     */
    private setupRoutes;
    /**
     * システム接続初期化
     */
    private initializeSystemConnections;
    /**
     * システム接続テスト
     */
    private testSystemConnection;
    /**
     * 定期的なシステム接続確認
     */
    private startHealthCheck;
    /**
     * サーバー起動
     */
    start(): Promise<void>;
    /**
     * サーバー停止
     */
    private shutdown;
}
export { HotelIntegrationServer };
