export type SystemId = 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'hotel-common';
export type GovernanceLevel = 0 | 1 | 2 | 3;
export type MonitoringMode = 'warning-only' | 'selective-block' | 'full-enforcement';
export interface SystemGovernanceConfig {
    systemId: SystemId;
    level: GovernanceLevel;
    monitoring: boolean;
    mode?: MonitoringMode;
    checkpoints: string[];
    exemptions?: string[];
    notes?: string;
    effectiveDate: Date;
    nextReviewDate?: Date;
}
export interface GovernanceRule {
    id: string;
    name: string;
    description: string;
    level: GovernanceLevel;
    category: 'api-format' | 'error-handling' | 'authentication' | 'database' | 'source-tracking' | 'security';
    severity: 'info' | 'warning' | 'error' | 'critical';
    enforcement: 'log' | 'warn' | 'block';
    autoFix?: boolean;
}
export declare const CURRENT_GOVERNANCE_CONFIG: Record<SystemId, SystemGovernanceConfig>;
export declare const GOVERNANCE_RULES: GovernanceRule[];
export declare class GovernanceManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): GovernanceManager;
    updateGovernanceLevel(systemId: SystemId, newLevel: GovernanceLevel, effectiveDate?: Date, reason?: string): void;
    getApplicableRules(systemId: SystemId): GovernanceRule[];
    private updateCheckpoints;
    checkCompliance(systemId: SystemId, target: 'api' | 'database' | 'authentication' | 'general', data: any): Promise<GovernanceCheckResult>;
    private checkRule;
    private checkApiFormat;
    private checkErrorHandling;
    private checkAuthentication;
    private checkDatabase;
    private checkSourceTracking;
    private checkSecurity;
    generateMigrationPlan(systemId: SystemId, targetLevel: GovernanceLevel): MigrationPlan;
    private generateMigrationPhases;
    private estimateMigrationDuration;
    private identifyMigrationRisks;
    private identifyDependencies;
    private generateRollbackPlan;
    getCurrentConfig(systemId?: SystemId): SystemGovernanceConfig | Record<SystemId, SystemGovernanceConfig>;
}
export interface GovernanceViolation {
    ruleId: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    category: string;
    suggestion?: string;
    autoFixable: boolean;
}
export interface GovernanceCheckResult {
    systemId: SystemId;
    level: GovernanceLevel;
    compliant: boolean;
    violations: GovernanceViolation[];
    warnings: GovernanceViolation[];
    blocking?: boolean;
    notes?: string;
}
export interface MigrationPhase {
    level: GovernanceLevel;
    duration: number;
    rules: GovernanceRule[];
    dependencies: string[];
}
export interface MigrationRisk {
    type: 'breaking-change' | 'data-loss' | 'downtime' | 'integration-failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation: string;
}
export interface RollbackPlan {
    systemId: SystemId;
    steps: string[];
    maxRollbackTime: string;
    dataPreservation: boolean;
}
export interface MigrationPlan {
    systemId: SystemId;
    currentLevel: GovernanceLevel;
    targetLevel: GovernanceLevel;
    phases: MigrationPhase[];
    estimatedDuration: number;
    risks: MigrationRisk[];
    rollbackPlan: RollbackPlan;
}
export declare const governanceManager: GovernanceManager;
