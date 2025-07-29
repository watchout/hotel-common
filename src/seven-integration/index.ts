// 🎊 hotel-common七重統合システム - メインオーケストレーター
// 文献1-7完全統合: LLM落とし穴→トークン最適化→ガードレール→Cursor最適化→開発プロセス→RAG→プロンプト最適化

export * from './orchestrator'
export * from './types'
export * from './config'
export * from './seven-layer-integration'

// メイン統合クラス
export { SevenIntegrationOrchestrator } from './orchestrator'

// 設定・型定義
export type {
  SevenIntegrationConfig,
  SevenIntegrationResult,
  AIAgentType,
  IntegrationLayer,
  OptimizationLevel
} from './types'

// バージョン情報
export const SEVEN_INTEGRATION_VERSION = '1.0.0'
export const INTEGRATION_LAYERS = [
  'problem-solving',    // 文献1: LLM落とし穴
  'token-optimization', // 文献2: トークン最適化  
  'guardrails',        // 文献3: ガードレール
  'cursor-optimization', // 文献4: Cursor最適化
  'process-optimization', // 文献5: 開発プロセス
  'rag-implementation',  // 文献6: RAG実装
  'prompt-perfection'    // 文献7: プロンプト最適化
] as const 