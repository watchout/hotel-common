/**
 * 🎯 信頼スコア評価システム (文献1準拠)
 * ハルシネーション防止・自動検証
 */
export interface TrustScoreResult {
    score: number;
    confidence: 'high' | 'medium' | 'low' | 'critical';
    factChecks: FactCheckResult[];
    recommendations: string[];
    requiresManualReview: boolean;
}
export interface FactCheckResult {
    category: 'schema' | 'api' | 'typescript' | 'business_logic';
    item: string;
    verified: boolean;
    evidence: string;
    confidence: number;
}
/**
 * Knowledge Base検証（文献1要求事項）
 */
export declare class KnowledgeBaseValidator {
    private prismaSchema;
    private apiSpecs;
    private typescriptDefinitions;
    initialize(): Promise<void>;
    /**
     * Prismaスキーマとの照合検証
     */
    verifyAgainstPrismaSchema(content: string): Promise<FactCheckResult[]>;
    /**
     * TypeScript型安全性検証
     */
    verifyTypeScriptSafety(content: string): Promise<FactCheckResult[]>;
    /**
     * ビジネスロジック検証
     */
    verifyBusinessLogic(content: string): Promise<FactCheckResult[]>;
}
/**
 * 信頼スコア計算エンジン
 */
export declare class TrustScoreCalculator {
    private knowledgeBase;
    constructor();
    initialize(): Promise<void>;
    calculateTrustScore(content: string, context?: any): Promise<TrustScoreResult>;
    /**
     * 信頼性レポート生成
     */
    generateTrustReport(content: string, context?: any): Promise<string>;
}
