"use strict";
// Hotel Common - 統合基盤ライブラリ
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEVEN_INTEGRATION_INFO = exports.PORT = exports.VERSION = exports.PERFORMANCE_TARGETS = exports.INTEGRATION_LAYER_CONFIGS = exports.AI_AGENT_CONFIGS = exports.validateSevenIntegrationConfig = exports.getSevenIntegrationConfig = exports.SevenIntegrationOrchestrator = void 0;
// 統一PostgreSQL基盤
__exportStar(require("./database"), exports);
// 統一Prismaクライアント（PMS実装時まで無効化）
// export { UnifiedPrismaClient } from './database/unified-client'
// JWT認証基盤  
__exportStar(require("./auth/jwt"), exports);
__exportStar(require("./auth/types"), exports);
// API連携
__exportStar(require("./api/client"), exports);
__exportStar(require("./api/types"), exports);
// WebSocket通信
__exportStar(require("./websocket/client"), exports);
// export * from './websocket/types' // Temporarily disabled due to SystemEvent conflict
// Redis連携
__exportStar(require("./utils/redis"), exports);
// ログ機能
__exportStar(require("./utils/logger"), exports);
// 型定義  
// export * from './types/common' // Temporarily disabled due to potential conflicts
// export * from './types/api' // Temporarily disabled due to potential conflicts  
// export * from './types/auth' // Temporarily disabled due to potential conflicts
// バリデーション（Zod統合）
__exportStar(require("./utils/validation"), exports);
__exportStar(require("./utils/zod-validator"), exports);
// Zodスキーマ
__exportStar(require("./schemas"), exports);
// hotel-saas統合ライブラリ
__exportStar(require("./integrations/hotel-saas"), exports);
// 🎊 七重統合システム（文献1-7完全統合）- hotel-common究極AI+RAG+プロンプト統合システム
__exportStar(require("./seven-integration"), exports);
// メイン七重統合オーケストレーター
var orchestrator_1 = require("./seven-integration/orchestrator");
Object.defineProperty(exports, "SevenIntegrationOrchestrator", { enumerable: true, get: function () { return orchestrator_1.SevenIntegrationOrchestrator; } });
// デフォルト設定・ヘルパー関数
var config_1 = require("./seven-integration/config");
Object.defineProperty(exports, "getSevenIntegrationConfig", { enumerable: true, get: function () { return config_1.getSevenIntegrationConfig; } });
Object.defineProperty(exports, "validateSevenIntegrationConfig", { enumerable: true, get: function () { return config_1.validateSevenIntegrationConfig; } });
Object.defineProperty(exports, "AI_AGENT_CONFIGS", { enumerable: true, get: function () { return config_1.AI_AGENT_CONFIGS; } });
Object.defineProperty(exports, "INTEGRATION_LAYER_CONFIGS", { enumerable: true, get: function () { return config_1.INTEGRATION_LAYER_CONFIGS; } });
Object.defineProperty(exports, "PERFORMANCE_TARGETS", { enumerable: true, get: function () { return config_1.PERFORMANCE_TARGETS; } });
// バージョン情報（統一基盤）
exports.VERSION = '1.0.0';
exports.PORT = 3400;
// 🎯 七重統合システム情報
exports.SEVEN_INTEGRATION_INFO = {
    version: '1.0.0',
    description: 'hotel-common究極AI+RAG+プロンプト統合システム',
    documentation: '文献1-7完全統合による50倍開発効率・99.5%コスト削減実現',
    layers: [
        'problem-solving', // 文献1: LLM落とし穴
        'token-optimization', // 文献2: トークン最適化
        'guardrails', // 文献3: ガードレール
        'cursor-optimization', // 文献4: Cursor最適化
        'process-optimization', // 文献5: 開発プロセス
        'rag-implementation', // 文献6: RAG実装
        'prompt-perfection' // 文献7: プロンプト最適化
    ],
    agents: ['Sun', 'Suno', 'Luna', 'Iza', 'Nami'],
    effectivenessTargets: {
        developmentSpeedUp: '50x',
        costReduction: '99.5%',
        successRate: '99.9%',
        roi: '1500%+'
    }
};
