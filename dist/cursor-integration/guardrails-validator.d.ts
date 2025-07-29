export interface GuardrailResult {
    passed: boolean;
    category: 'typescript' | 'security' | 'performance' | 'project-rules';
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestions: string[];
    autofix?: string;
}
export interface ValidationReport {
    overall: boolean;
    score: number;
    results: GuardrailResult[];
    tokensOptimized: number;
    processingTime: number;
}
/**
 * 実際のガードレール検証システム
 * 「チェックせよ」ではなく実際の品質検証を実行
 */
export declare class RealGuardrailsValidator {
    private typescriptConfig;
    private securityRules;
    private performanceThresholds;
    constructor();
    /**
     * 包括的品質検証実行
     */
    validate(content: string, context: any, ragResults?: any): Promise<ValidationReport>;
    /**
     * TypeScript型安全性検証
     * 実際のコンパイラAPIを使用した検証
     */
    validateTypeScript(content: string, ragResults?: any): Promise<GuardrailResult[]>;
    /**
     * セキュリティ検証
     * 実際のセキュリティルールによる検証
     */
    validateSecurity(content: string, context: any): Promise<GuardrailResult[]>;
    /**
     * パフォーマンス検証
     * 実際のパフォーマンス指標による検証
     */
    validatePerformance(ragResults?: any): Promise<GuardrailResult[]>;
    /**
     * プロジェクト固有ルール検証
     */
    validateProjectRules(project: string, ragResults?: any): Promise<GuardrailResult[]>;
    private checkTypeSafety;
    private checkHotelCommonPatterns;
    private checkSQLInjection;
    private checkXSS;
    private checkAuthentication;
    private checkDataLeakage;
    private checkGDPRCompliance;
    private checkJWTSecurity;
    private checkDatabasePerformance;
    private checkMemoryUsage;
    private checkAPIPerformance;
    private checkFrontendPerformance;
    private validateSaaSRules;
    private validateMemberRules;
    private validatePMSRules;
    private validateCommonRules;
    private initializeTypescriptConfig;
    private initializeSecurityRules;
    private initializePerformanceThresholds;
    private mapTypescriptSeverity;
    private getTypescriptSuggestions;
    private getTypescriptAutofix;
    private findAnyUsage;
    private findNonNullAssertions;
    private calculateQualityScore;
    private calculateTokenOptimization;
}
export default RealGuardrailsValidator;
