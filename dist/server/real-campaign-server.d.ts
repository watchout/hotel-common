#!/usr/bin/env node
import type { Router } from 'express';
/**
 * キャンペーンAPI実サーバー
 * - 実際のデータベースに接続
 * - キャンペーン管理API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * - クライアント向けAPI
 */
declare class RealCampaignServer {
    private app;
    private server;
    private port;
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
     * ルーターを追加
     * @param path パス
     * @param router ルーター
     */
    addRouter(path: string, router: Router): void;
    /**
     * サーバー起動
     */
    start(): Promise<void>;
    /**
     * サーバー停止
     */
    private shutdown;
}
export { RealCampaignServer };
