"use strict";
// 🎊 hotel-common七重統合システム - メインオーケストレーター
// 文献1-7完全統合: LLM落とし穴→トークン最適化→ガードレール→Cursor最適化→開発プロセス→RAG→プロンプト最適化
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
exports.INTEGRATION_LAYERS = exports.SEVEN_INTEGRATION_VERSION = exports.SevenIntegrationOrchestrator = void 0;
__exportStar(require("./orchestrator"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./config"), exports);
__exportStar(require("./seven-layer-integration"), exports);
// メイン統合クラス
var orchestrator_1 = require("./orchestrator");
Object.defineProperty(exports, "SevenIntegrationOrchestrator", { enumerable: true, get: function () { return orchestrator_1.SevenIntegrationOrchestrator; } });
// バージョン情報
exports.SEVEN_INTEGRATION_VERSION = '1.0.0';
exports.INTEGRATION_LAYERS = [
    'problem-solving', // 文献1: LLM落とし穴
    'token-optimization', // 文献2: トークン最適化  
    'guardrails', // 文献3: ガードレール
    'cursor-optimization', // 文献4: Cursor最適化
    'process-optimization', // 文献5: 開発プロセス
    'rag-implementation', // 文献6: RAG実装
    'prompt-perfection' // 文献7: プロンプト最適化
];
//# sourceMappingURL=index.js.map