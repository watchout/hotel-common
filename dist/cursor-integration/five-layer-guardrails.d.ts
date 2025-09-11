/**
 * 🛡️ 5層ガードレールシステム (文献3準拠)
 * エンタープライズレベルの安全性確保
 */
export interface GuardrailLayer {
    validate(input: any, context: any): Promise<GuardrailResult>;
    getName(): string;
    getLayer(): number;
}
export interface GuardrailResult {
    passed: boolean;
    violations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
}
/**
 * Layer 1: 入力検証ガードレール
 */
export declare class InputValidationGuardrail implements GuardrailLayer {
    getLayer(): number;
    getName(): string;
    validate(input: any, context: any): Promise<GuardrailResult>;
}
/**
 * Layer 2: 処理ガードレール
 */
export declare class ProcessingGuardrail implements GuardrailLayer {
    getLayer(): number;
    getName(): string;
    validate(input: any, context: any): Promise<GuardrailResult>;
}
/**
 * Layer 3: 業務ロジックガードレール
 */
export declare class BusinessLogicGuardrail implements GuardrailLayer {
    getLayer(): number;
    getName(): string;
    validate(input: any, context: any): Promise<GuardrailResult>;
}
/**
 * Layer 4: 出力検証ガードレール
 */
export declare class OutputValidationGuardrail implements GuardrailLayer {
    getLayer(): number;
    getName(): string;
    validate(input: any, context: any): Promise<GuardrailResult>;
}
/**
 * Layer 5: 監視・ログガードレール
 */
export declare class MonitoringGuardrail implements GuardrailLayer {
    getLayer(): number;
    getName(): string;
    validate(input: any, context: any): Promise<GuardrailResult>;
}
/**
 * 統合5層ガードレールシステム
 */
export declare class FiveLayerGuardrailSystem {
    private layers;
    constructor();
    validateAll(input: any, context?: any): Promise<{
        overallPassed: boolean;
        layerResults: Array<{
            layer: number;
            name: string;
            result: GuardrailResult;
        }>;
        criticalViolations: string[];
        overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    }>;
    getValidationReport(input: any, context?: any): Promise<string>;
}
