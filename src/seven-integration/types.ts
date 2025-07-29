// 🎊 hotel-common七重統合システム - 型定義
// 文献1-7完全統合型定義

export type AIAgentType = 'Sun' | 'Suno' | 'Luna' | 'Iza' | 'Nami'

export type IntegrationLayer = 
  | 'problem-solving'      // 文献1: LLM落とし穴
  | 'token-optimization'   // 文献2: トークン最適化
  | 'guardrails'          // 文献3: ガードレール
  | 'cursor-optimization' // 文献4: Cursor最適化
  | 'process-optimization' // 文献5: 開発プロセス
  | 'rag-implementation'  // 文献6: RAG実装
  | 'prompt-perfection'   // 文献7: プロンプト最適化

export type OptimizationLevel = 'basic' | 'advanced' | 'ultimate'

export interface SevenIntegrationConfig {
  // 基本設定
  projectName: string
  environment: 'development' | 'staging' | 'production'
  
  // AIエージェント設定
  enabledAgents: AIAgentType[]
  defaultAgent?: AIAgentType
  
  // 統合レベル設定
  integrationLayers: IntegrationLayer[]
  optimizationLevel: OptimizationLevel
  
  // LLM設定（文献1-7統合）
  llmConfig: {
    primaryModel: 'claude-3.5-sonnet' | 'gpt-4' | 'deepseek-v3'
    fallbackModel?: string
    maxTokens: number
    temperature: number
    topP?: number
  }
  
  // RAG設定（文献6）
  ragConfig: {
    enabled: boolean
    vectorDatabase: 'chroma' | 'faiss' | 'pinecone'
    embeddingModel: string
    chunkSize: number
    chunkOverlap: number
    maxRetrievals: number
    scoreThreshold: number
  }
  
  // プロンプト最適化設定（文献7）
  promptConfig: {
    framework: 'CO-STAR' | 'custom'
    enableCoT: boolean // Chain of Thought
    enableToT: boolean // Tree of Thought
    autoOptimization: boolean
    examplesDatabase: boolean
    delimitersEnabled: boolean
  }
  
  // ガードレール設定（文献3）
  guardrailsConfig: {
    enabled: boolean
    safetyLevel: 'basic' | 'standard' | 'strict'
    toxicityThreshold: number
    factCheckEnabled: boolean
    privacyProtection: boolean
    businessCompliance: boolean
  }
  
  // トークン最適化設定（文献2）
  tokenOptimizationConfig: {
    enabled: boolean
    languageSwitching: boolean
    contextCompression: boolean
    semanticChunking: boolean
    targetReduction: number // パーセンテージ
  }
  
  // Cursor最適化設定（文献4）
  cursorConfig: {
    enabled: boolean
    costOptimization: boolean
    mcpIntegration: boolean
    apiCaching: boolean
  }
  
  // 開発プロセス設定（文献5）
  processConfig: {
    threeLayerLoop: boolean
    stakeholderCoordination: boolean
    continuousEvaluation: boolean
    automated: boolean
  }
  
  // 監視・評価設定
  monitoringConfig: {
    enabled: boolean
    performanceTracking: boolean
    costTracking: boolean
    qualityMetrics: boolean
    realTimeAlerts: boolean
    dashboardEnabled: boolean
  }
}

export interface SevenIntegrationResult {
  // 実行結果
  success: boolean
  executionTime: number
  
  // 各層の結果
  layerResults: Record<IntegrationLayer, LayerResult>
  
  // 統合効果
  overallEffectiveness: EffectivenessMetrics
  
  // 推奨事項
  recommendations: string[]
  
  // エラー情報
  errors?: string[]
  warnings?: string[]
}

export interface LayerResult {
  layer: IntegrationLayer
  success: boolean
  executionTime: number
  metrics: Record<string, number | string | boolean>
  improvements: string[]
  nextSteps?: string[]
}

export interface EffectivenessMetrics {
  // 開発効率
  developmentEfficiency: {
    speedImprovement: number // 倍率
    errorReduction: number   // パーセンテージ
    successRate: number      // パーセンテージ
  }
  
  // コスト削減
  costReduction: {
    tokenSavings: number     // パーセンテージ
    timeReduction: number    // パーセンテージ
    operationalSavings: number // パーセンテージ
  }
  
  // 品質向上
  qualityImprovement: {
    accuracy: number         // パーセンテージ
    consistency: number      // パーセンテージ
    reliability: number      // パーセンテージ
    safety: number          // パーセンテージ
  }
  
  // ROI
  roi: {
    estimated: number        // パーセンテージ
    timeToBreakeven: number  // 月数
    longTermValue: number    // スコア
  }
}

// AIエージェント専用型
export interface AIAgentConfig {
  type: AIAgentType
  name: string
  description: string
  personality: {
    style: string
    tone: string
    approach: string
  }
  specialization: string[]
  enabled: boolean
}

// RAG専用型
export interface RAGQuery {
  query: string
  context?: Record<string, any>
  agentType?: AIAgentType
  systemType?: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'integration'
}

export interface RAGResponse {
  answer: string
  sources: RAGSource[]
  confidence: number
  processingTime: number
  tokenUsage: {
    input: number
    output: number
    cost: number
  }
  metadata?: Record<string, any>
}

export interface RAGSource {
  title: string
  content: string
  url?: string
  relevanceScore: number
  system: string
}

// プロンプト最適化専用型
export interface PromptOptimizationRequest {
  originalPrompt: string
  agentType: AIAgentType
  taskType: string
  optimizationLevel: OptimizationLevel
  targetFramework?: 'CO-STAR' | 'custom'
}

export interface OptimizedPromptResult {
  originalPrompt: string
  optimizedPrompt: string
  improvements: string[]
  estimatedEffectiveness: number
  framework: string
  processingTime: number
}

// ガードレール専用型
export interface GuardrailValidation {
  input: string
  context?: Record<string, any>
  agentType?: AIAgentType
}

export interface GuardrailResult {
  passed: boolean
  confidence: number
  reasons: string[]
  sanitizedInput?: string
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// 監視・評価専用型
export interface MonitoringData {
  timestamp: Date
  agent: AIAgentType
  layer: IntegrationLayer
  metrics: Record<string, number | string | boolean>
  performance: {
    responseTime: number
    throughput: number
    errorRate: number
    costPerOperation: number
  }
}

export interface EvaluationCriteria {
  performance: boolean
  cost: boolean
  quality: boolean
  safety: boolean
  compliance: boolean
}

// イベント型
export interface IntegrationEvent {
  id: string
  timestamp: Date
  type: 'start' | 'complete' | 'error' | 'warning'
  layer: IntegrationLayer
  agent?: AIAgentType
  message: string
  data?: Record<string, any>
}

// 統合ステータス
export interface IntegrationStatus {
  isRunning: boolean
  currentLayer?: IntegrationLayer
  currentAgent?: AIAgentType
  progress: number // 0-100
  startTime?: Date
  estimatedCompletion?: Date
  errors: string[]
  warnings: string[]
}

// エクスポート用統合型
export type SevenIntegrationType = {
  config: SevenIntegrationConfig
  result: SevenIntegrationResult
  status: IntegrationStatus
  events: IntegrationEvent[]
} 