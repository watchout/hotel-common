/**
 * キャンペーンAPI用の簡易サーバー
 * - テスト用の最小限の実装
 */
declare class SimpleCampaignServer {
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
     * サーバー起動
     */
    start(): Promise<void>;
    /**
     * サーバー停止
     */
    private shutdown;
}
export { SimpleCampaignServer };
