#!/usr/bin/env node
import express from 'express';
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
     * システム接続テスト（改善版）
     */
    private testSystemConnection;
    /**
     * 定期的なヘルスチェック（改善版）
     */
    private startHealthCheck;
    /**
     * ヘルスチェック実行
     */
    private performHealthCheck;
    /**
     * サーバー起動
     */
    start(): Promise<void>;
    /**
     * サーバー停止
     */
    private shutdown;
    /**
     * ルーターを追加するためのメソッド
     * @param path パス
     * @param router ルーター
     */
    addRouter(path: string, router: express.Router): void;
}
export { HotelIntegrationServer };
