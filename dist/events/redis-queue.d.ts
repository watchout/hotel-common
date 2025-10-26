import type { HotelEvent } from './types';
export interface RedisQueueConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    maxRetries: number;
    retryDelay: number;
}
/**
 * Redis Streams基盤 - Event-driven連携の核心コンポーネント
 *
 * 機能:
 * - イベントストリーム発行・消費
 * - コンシューマーグループ管理
 * - 配信保証・リトライ機能
 * - オフライン対応・差分同期
 */
export declare class RedisEventQueue {
    private config;
    private redis;
    private logger;
    private isConnected;
    private consumerGroups;
    constructor(config: RedisQueueConfig);
    /**
     * Redis接続・イベントハンドラ設定
     */
    private setupRedisEventHandlers;
    /**
     * Redis接続開始
     */
    connect(): Promise<void>;
    /**
     * Redis接続終了
     */
    disconnect(): Promise<void>;
    /**
     * イベントストリーム発行
     *
     * @param streamName ストリーム名（例: "hotel-events"）
     * @param event 発行するイベント
     * @returns イベントID
     */
    publishToStream(streamName: string, event: HotelEvent): Promise<string>;
    /**
     * コンシューマーグループでのストリーム消費
     *
     * @param streamName ストリーム名
     * @param consumerGroup コンシューマーグループ名
     * @param consumerId コンシューマーID
     * @param callback イベント処理コールバック
     */
    consumeFromStream(streamName: string, consumerGroup: string, consumerId: string, callback: (event: HotelEvent, messageId: string) => Promise<void>): Promise<void>;
    /**
     * コンシューマーグループ存在確認・作成
     */
    private ensureConsumerGroup;
    /**
     * 未処理メッセージの再処理
     */
    private processPendingMessages;
    /**
     * 個別メッセージ処理
     */
    private processMessage;
    /**
     * メッセージ処理エラー・リトライ処理
     */
    private handleMessageError;
    /**
     * イベントメタデータの強化
     */
    private enrichEventMetadata;
    /**
     * イベント配信ログ記録
     */
    private logEventDelivery;
    /**
     * ストリーム統計取得
     */
    getStreamStats(streamName: string): Promise<any>;
    /**
     * 健全性チェック
     */
    healthCheck(): Promise<{
        status: string;
        details: any;
    }>;
}
