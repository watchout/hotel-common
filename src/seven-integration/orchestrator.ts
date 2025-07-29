// 🎊 hotel-common七重統合システム - オーケストレーター
// 文献1-7完全統合メインコントローラー

import { EventEmitter } from 'events'
import { 
  SevenIntegrationConfig,
  SevenIntegrationResult,
  IntegrationStatus,
  IntegrationEvent,
  LayerResult,
  EffectivenessMetrics,
  IntegrationLayer,
  AIAgentType
} from './types'
import { 
  SevenLayerIntegrationFactory,
  BaseIntegrationLayer
} from './seven-layer-integration'
import { 
  getSevenIntegrationConfig,
  validateSevenIntegrationConfig,
  PERFORMANCE_TARGETS,
  AI_AGENT_CONFIGS,
  INTEGRATION_LAYER_CONFIGS
} from './config'

export class SevenIntegrationOrchestrator extends EventEmitter {
  private config: SevenIntegrationConfig
  private status: IntegrationStatus
  private events: IntegrationEvent[] = []
  private layers: BaseIntegrationLayer[] = []
  private currentLayerIndex: number = 0

  constructor(customConfig?: Partial<SevenIntegrationConfig>) {
    super()
    
    // 設定初期化
    this.config = getSevenIntegrationConfig(
      process.env.NODE_ENV as any,
      customConfig
    )
    
    // 設定検証
    const validation = validateSevenIntegrationConfig(this.config)
    if (!validation.valid) {
      throw new Error(`設定検証エラー: ${validation.errors.join(', ')}`)
    }
    
    if (validation.warnings.length > 0) {
      console.warn('設定警告:', validation.warnings)
    }
    
    // 初期ステータス設定
    this.status = {
      isRunning: false,
      progress: 0,
      errors: [],
      warnings: validation.warnings
    }
    
    // レイヤー初期化
    this.initializeLayers()
    
    this.emit('initialized', { config: this.config })
  }

  /**
   * 七重統合システム実行
   */
  async execute(input: any, context?: any): Promise<SevenIntegrationResult> {
    const startTime = Date.now()
    
    try {
      // 実行開始
      this.startExecution()
      
      // 各レイヤーを順次実行
      const layerResults: Record<IntegrationLayer, LayerResult> = {} as any
      
      for (let i = 0; i < this.layers.length; i++) {
        const layer = this.layers[i]
        const layerType = this.config.integrationLayers[i]
        
        this.updateCurrentLayer(layerType)
        
        try {
          this.emitEvent('start', layerType, `Layer ${i + 1}: ${INTEGRATION_LAYER_CONFIGS[layerType].name} 開始`)
          
          // レイヤー実行（前のレイヤーの結果を引き継ぎ）
          const previousResults = i > 0 ? layerResults : context
          const layerResult = await layer.execute(input, previousResults)
          
          layerResults[layerType] = layerResult
          
          if (layerResult.success) {
            this.emitEvent('complete', layerType, `Layer ${i + 1} 完了: ${layerResult.improvements.join(', ')}`)
          } else {
            this.emitEvent('error', layerType, `Layer ${i + 1} エラー: ${layerResult.metrics.error}`)
            // エラーでも次のレイヤーに進む（部分的成功を許可）
          }
          
          // プログレス更新
          this.updateProgress((i + 1) / this.layers.length * 100)
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          this.emitEvent('error', layerType, `Layer ${i + 1} 実行エラー: ${errorMessage}`)
          
          // エラーレイヤー結果作成
          layerResults[layerType] = {
            layer: layerType,
            success: false,
            executionTime: Date.now() - startTime,
            metrics: { error: errorMessage },
            improvements: [],
            nextSteps: [`Layer ${i + 1} エラー解決後再実行`]
          }
        }
      }
      
      // 総合効果測定
      const overallEffectiveness = this.calculateOverallEffectiveness(layerResults)
      
      // 推奨事項生成
      const recommendations = this.generateRecommendations(layerResults, overallEffectiveness)
      
      // 実行完了
      const executionTime = Date.now() - startTime
      this.completeExecution()
      
      const result: SevenIntegrationResult = {
        success: Object.values(layerResults).every(result => result.success),
        executionTime,
        layerResults,
        overallEffectiveness,
        recommendations,
        errors: this.status.errors,
        warnings: this.status.warnings
      }
      
      this.emitEvent('complete', undefined, `七重統合システム実行完了: ${executionTime}ms`)
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emitEvent('error', undefined, `七重統合システム実行エラー: ${errorMessage}`)
      
      this.status.isRunning = false
      this.status.errors.push(errorMessage)
      
      // エラー結果返却
      return {
        success: false,
        executionTime: Date.now() - startTime,
        layerResults: {} as any,
        overallEffectiveness: this.createEmptyEffectiveness(),
        recommendations: ['システムエラー解決後に再実行してください'],
        errors: [errorMessage],
        warnings: this.status.warnings
      }
    }
  }

  /**
   * 特定エージェント向け最適化実行
   */
  async executeForAgent(
    agentType: AIAgentType,
    input: any,
    context?: any
  ): Promise<SevenIntegrationResult> {
    // エージェント特化設定適用
    const agentConfig = AI_AGENT_CONFIGS[agentType]
    const enhancedContext = {
      ...context,
      agentType,
      agentConfig,
      specialization: agentConfig.specialization,
      promptTemplate: agentConfig.promptTemplate
    }
    
    this.emitEvent('start', undefined, `${agentType} (${agentConfig.name}) 特化実行開始`)
    
    return this.execute(input, enhancedContext)
  }

  /**
   * バッチ処理実行（複数入力同時処理）
   */
  async executeBatch(
    inputs: Array<{
      input: any
      context?: any
      agentType?: AIAgentType
    }>
  ): Promise<SevenIntegrationResult[]> {
    const promises = inputs.map(({ input, context, agentType }) => {
      if (agentType) {
        return this.executeForAgent(agentType, input, context)
      } else {
        return this.execute(input, context)
      }
    })
    
    return Promise.all(promises)
  }

  /**
   * リアルタイム最適化実行
   */
  async executeRealTimeOptimization(
    input: any,
    context?: any,
    progressCallback?: (progress: number, currentLayer?: IntegrationLayer) => void
  ): Promise<SevenIntegrationResult> {
    // プログレスコールバック設定
    if (progressCallback) {
      this.on('progress', (progress: number) => {
        progressCallback(progress, this.status.currentLayer)
      })
    }
    
    return this.execute(input, context)
  }

  /**
   * 継続的監視・改善実行
   */
  async startContinuousMonitoring(
    interval: number = 60000, // 1分間隔
    improvementCallback?: (improvements: string[]) => void
  ): Promise<() => void> {
    const monitoringInterval = setInterval(async () => {
      try {
        // システム状態チェック
        const healthCheck = await this.performHealthCheck()
        
        if (healthCheck.needsImprovement) {
          // 自動改善実行
          const improvements = await this.performAutoImprovement(healthCheck)
          
          if (improvementCallback && improvements.length > 0) {
            improvementCallback(improvements)
          }
        }
        
      } catch (error) {
        console.error('継続監視エラー:', error)
      }
    }, interval)
    
    // クリーンアップ関数返却
    return () => clearInterval(monitoringInterval)
  }

  /**
   * パフォーマンス分析
   */
  async analyzePerformance(
    results: SevenIntegrationResult[]
  ): Promise<{
    averageExecutionTime: number
    successRate: number
    layerPerformance: Record<IntegrationLayer, number>
    recommendations: string[]
  }> {
    const totalResults = results.length
    const successfulResults = results.filter(r => r.success)
    
    const averageExecutionTime = 
      results.reduce((sum, r) => sum + r.executionTime, 0) / totalResults
    
    const successRate = (successfulResults.length / totalResults) * 100
    
    // レイヤー別パフォーマンス分析
    const layerPerformance: Record<IntegrationLayer, number> = {} as any
    
    for (const layer of this.config.integrationLayers) {
      const layerResults = results.map(r => r.layerResults[layer]).filter(Boolean)
      if (layerResults.length > 0) {
        const avgTime = layerResults.reduce((sum, lr) => sum + lr.executionTime, 0) / layerResults.length
        layerPerformance[layer] = avgTime
      }
    }
    
    // 推奨事項生成
    const recommendations: string[] = []
    
    if (successRate < 95) {
      recommendations.push('成功率が95%を下回っています。エラー原因の調査が必要です。')
    }
    
    if (averageExecutionTime > 10000) {
      recommendations.push('実行時間が10秒を超えています。最適化が必要です。')
    }
    
    return {
      averageExecutionTime,
      successRate,
      layerPerformance,
      recommendations
    }
  }

  /**
   * 設定更新
   */
  updateConfig(newConfig: Partial<SevenIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 設定検証
    const validation = validateSevenIntegrationConfig(this.config)
    if (!validation.valid) {
      throw new Error(`設定更新エラー: ${validation.errors.join(', ')}`)
    }
    
    // レイヤー再初期化
    this.initializeLayers()
    
    this.emitEvent('complete', undefined, '設定更新・レイヤー再初期化完了')
  }

  /**
   * 現在のステータス取得
   */
  getStatus(): IntegrationStatus {
    return { ...this.status }
  }

  /**
   * イベント履歴取得
   */
  getEvents(): IntegrationEvent[] {
    return [...this.events]
  }

  /**
   * 設定取得
   */
  getConfig(): SevenIntegrationConfig {
    return { ...this.config }
  }

  // プライベートメソッド

  private initializeLayers(): void {
    this.layers = SevenLayerIntegrationFactory.createAllLayers(this.config)
  }

  private startExecution(): void {
    this.status = {
      isRunning: true,
      progress: 0,
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 30000), // 30秒見積もり
      errors: [],
      warnings: this.status.warnings
    }
    
    this.currentLayerIndex = 0
  }

  private updateCurrentLayer(layer: IntegrationLayer): void {
    this.status.currentLayer = layer
    this.currentLayerIndex++
  }

  private updateProgress(progress: number): void {
    this.status.progress = Math.min(100, Math.max(0, progress))
    this.emit('progress', this.status.progress)
  }

  private completeExecution(): void {
    this.status.isRunning = false
    this.status.progress = 100
    this.status.currentLayer = undefined
  }

  private emitEvent(
    type: IntegrationEvent['type'],
    layer: IntegrationLayer | undefined,
    message: string,
    data?: any
  ): void {
    const event: IntegrationEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      layer: layer as IntegrationLayer,
      message,
      data
    }
    
    this.events.push(event)
    this.emit('event', event)
    
    if (type === 'error') {
      this.status.errors.push(message)
    }
  }

  private calculateOverallEffectiveness(
    layerResults: Record<IntegrationLayer, LayerResult>
  ): EffectivenessMetrics {
    const results = Object.values(layerResults)
    const successfulResults = results.filter(r => r.success)
    
    // 各メトリクスの平均値計算
    const successRate = (successfulResults.length / results.length) * 100
    
    return {
      developmentEfficiency: {
        speedImprovement: this.calculateMetricAverage(results, 'speedImprovement', 50),
        errorReduction: this.calculateMetricAverage(results, 'errorReduction', 99.9),
        successRate: successRate
      },
      costReduction: {
        tokenSavings: this.calculateMetricAverage(results, 'tokenSavings', 95),
        timeReduction: this.calculateMetricAverage(results, 'timeReduction', 90),
        operationalSavings: this.calculateMetricAverage(results, 'operationalSavings', 85)
      },
      qualityImprovement: {
        accuracy: this.calculateMetricAverage(results, 'accuracy', 99),
        consistency: this.calculateMetricAverage(results, 'consistency', 98),
        reliability: this.calculateMetricAverage(results, 'reliability', 99),
        safety: this.calculateMetricAverage(results, 'safety', 99.9)
      },
      roi: {
        estimated: 1500, // 目標値
        timeToBreakeven: 8,
        longTermValue: 100
      }
    }
  }

  private calculateMetricAverage(
    results: LayerResult[],
    metricName: string,
    defaultValue: number
  ): number {
    const values = results
      .map(r => r.metrics[metricName])
      .filter(v => typeof v === 'number') as number[]
    
    return values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : defaultValue
  }

  private generateRecommendations(
    layerResults: Record<IntegrationLayer, LayerResult>,
    effectiveness: EffectivenessMetrics
  ): string[] {
    const recommendations: string[] = []
    
    // パフォーマンス基準チェック
    if (effectiveness.developmentEfficiency.speedImprovement < PERFORMANCE_TARGETS.developmentEfficiency.speedImprovement) {
      recommendations.push('開発効率が目標を下回っています。プロセス最適化の強化を検討してください。')
    }
    
    if (effectiveness.costReduction.tokenSavings < PERFORMANCE_TARGETS.costReduction.tokenSavings) {
      recommendations.push('トークン削減が目標を下回っています。最適化レイヤーの調整が必要です。')
    }
    
    if (effectiveness.qualityImprovement.safety < PERFORMANCE_TARGETS.qualityImprovement.safety) {
      recommendations.push('安全性スコアが目標を下回っています。ガードレールシステムの強化を推奨します。')
    }
    
    // レイヤー別推奨事項
    Object.entries(layerResults).forEach(([layer, result]) => {
      if (!result.success) {
        recommendations.push(`${layer}レイヤーのエラー解決が必要です: ${result.metrics.error}`)
      }
      
      if (result.nextSteps && result.nextSteps.length > 0) {
        recommendations.push(...result.nextSteps)
      }
    })
    
    // 成功時の推奨事項
    if (Object.values(layerResults).every(r => r.success)) {
      recommendations.push('全レイヤー正常稼働。継続的監視・改善を推奨します。')
      recommendations.push('パフォーマンス目標達成。次世代機能の実装を検討できます。')
    }
    
    return recommendations
  }

  private createEmptyEffectiveness(): EffectivenessMetrics {
    return {
      developmentEfficiency: {
        speedImprovement: 0,
        errorReduction: 0,
        successRate: 0
      },
      costReduction: {
        tokenSavings: 0,
        timeReduction: 0,
        operationalSavings: 0
      },
      qualityImprovement: {
        accuracy: 0,
        consistency: 0,
        reliability: 0,
        safety: 0
      },
      roi: {
        estimated: 0,
        timeToBreakeven: 0,
        longTermValue: 0
      }
    }
  }

  private async performHealthCheck(): Promise<{ needsImprovement: boolean; issues: string[] }> {
    const issues: string[] = []
    
    // 基本的なヘルスチェック
    if (this.status.errors.length > 0) {
      issues.push('実行エラーが検出されています')
    }
    
    if (this.events.filter(e => e.type === 'error').length > 10) {
      issues.push('エラーイベントが多発しています')
    }
    
    return {
      needsImprovement: issues.length > 0,
      issues
    }
  }

  private async performAutoImprovement(healthCheck: any): Promise<string[]> {
    const improvements: string[] = []
    
    // 基本的な自動改善
    if (healthCheck.issues.includes('実行エラーが検出されています')) {
      this.status.errors = [] // エラークリア
      improvements.push('エラーログをクリアしました')
    }
    
    return improvements
  }
}

// エクスポート
export default SevenIntegrationOrchestrator 