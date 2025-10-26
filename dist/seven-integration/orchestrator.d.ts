import { EventEmitter } from 'events';
import type { SevenIntegrationConfig, SevenIntegrationResult, IntegrationStatus, IntegrationEvent, IntegrationLayer, AIAgentType } from './types';
export declare class SevenIntegrationOrchestrator extends EventEmitter {
    private config;
    private status;
    private events;
    private layers;
    private currentLayerIndex;
    constructor(customConfig?: Partial<SevenIntegrationConfig>);
    /**
     * 七重統合システム実行
     */
    execute(input: any, context?: any): Promise<SevenIntegrationResult>;
    /**
     * 特定エージェント向け最適化実行
     */
    executeForAgent(agentType: AIAgentType, input: any, context?: any): Promise<SevenIntegrationResult>;
    /**
     * バッチ処理実行（複数入力同時処理）
     */
    executeBatch(inputs: Array<{
        input: any;
        context?: any;
        agentType?: AIAgentType;
    }>): Promise<SevenIntegrationResult[]>;
    /**
     * リアルタイム最適化実行
     */
    executeRealTimeOptimization(input: any, context?: any, progressCallback?: (progress: number, currentLayer?: IntegrationLayer) => void): Promise<SevenIntegrationResult>;
    /**
     * 継続的監視・改善実行
     */
    startContinuousMonitoring(interval?: number, // 1分間隔
    improvementCallback?: (improvements: string[]) => void): Promise<() => void>;
    /**
     * パフォーマンス分析
     */
    analyzePerformance(results: SevenIntegrationResult[]): Promise<{
        averageExecutionTime: number;
        successRate: number;
        layerPerformance: Record<IntegrationLayer, number>;
        recommendations: string[];
    }>;
    /**
     * 設定更新
     */
    updateConfig(newConfig: Partial<SevenIntegrationConfig>): void;
    /**
     * 現在のステータス取得
     */
    getStatus(): IntegrationStatus;
    /**
     * イベント履歴取得
     */
    getEvents(): IntegrationEvent[];
    /**
     * 設定取得
     */
    getConfig(): SevenIntegrationConfig;
    private initializeLayers;
    private startExecution;
    private updateCurrentLayer;
    private updateProgress;
    private completeExecution;
    private emitEvent;
    private calculateOverallEffectiveness;
    private calculateMetricAverage;
    private generateRecommendations;
    private createEmptyEffectiveness;
    private performHealthCheck;
    private performAutoImprovement;
}
export default SevenIntegrationOrchestrator;
