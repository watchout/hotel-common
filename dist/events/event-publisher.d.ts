import type { HotelEvent, EventPublisherConfig } from './types';
/**
 * 統一EventPublisher - Event-driven連携の発行側統一インターフェース
 *
 * 機能:
 * - 複数経路でのイベント配信（Redis Streams + WebSocket）
 * - 優先度別配信方式選択
 * - イベント検証・強化
 * - 監査ログ記録
 * - バッチイベントスケジューリング
 */
export declare class HotelEventPublisher {
    private config;
    private redisQueue;
    private webSocketClient;
    private logger;
    private batchScheduler;
    constructor(config: EventPublisherConfig);
    /**
     * 統一イベント発行メソッド
     *
     * @param event 発行するイベント
     * @returns 発行されたイベントID
     */
    publishEvent<T extends HotelEvent>(event: T): Promise<string>;
    /**
     * リアルタイムイベント発行
     */
    private publishRealtimeEvent;
    /**
     * バッチイベントスケジューリング
     */
    private scheduleBatchEvent;
    /**
     * WebSocketブロードキャスト
     */
    private broadcastWebSocketEvent;
    /**
     * 重要イベント追加配信
     */
    private publishCriticalEvent;
    /**
     * イベント検証・強化
     */
    private validateAndEnrichEvent;
    /**
     * デフォルト優先度決定
     */
    private getDefaultPriority;
    /**
     * バッチイベント実行
     */
    private executeBatchEvent;
    /**
     * 次回実行時刻計算
     */
    private calculateNextExecution;
    /**
     * PostgreSQL監査ログ記録
     */
    private storeEventAuditLog;
    /**
     * 発行エラーハンドリング
     */
    private handlePublishError;
    /**
     * システムエラーイベント発行
     */
    private publishSystemErrorEvent;
    /**
     * 接続開始
     */
    connect(): Promise<void>;
    /**
     * 接続終了
     */
    disconnect(): Promise<void>;
    /**
     * 健全性チェック
     */
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
}
export declare function createEventPublisher(config: EventPublisherConfig): HotelEventPublisher;
export declare function getEventPublisher(): HotelEventPublisher;
