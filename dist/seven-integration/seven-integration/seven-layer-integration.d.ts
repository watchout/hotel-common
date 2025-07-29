import { IntegrationLayer, LayerResult, SevenIntegrationConfig } from './types';
export declare abstract class BaseIntegrationLayer {
    protected config: SevenIntegrationConfig;
    protected layerName: IntegrationLayer;
    constructor(config: SevenIntegrationConfig, layerName: IntegrationLayer);
    abstract execute(input: any, context?: any): Promise<LayerResult>;
    protected createLayerResult(success: boolean, executionTime: number, metrics: Record<string, any>, improvements?: string[], nextSteps?: string[]): LayerResult;
}
export declare class ProblemSolvingLayer extends BaseIntegrationLayer {
    constructor(config: SevenIntegrationConfig);
    execute(input: any, context?: any): Promise<LayerResult>;
    private implementHallucinationPrevention;
    private implementMemoryManagement;
    private implementCostOptimization;
    private implementQualityAssurance;
}
export declare class TokenOptimizationLayer extends BaseIntegrationLayer {
    constructor(config: SevenIntegrationConfig);
    execute(input: any, context?: any): Promise<LayerResult>;
    private implementLanguageSwitching;
    private implementContextOptimization;
    private implementSemanticChunking;
    private implementTokenCompression;
}
export declare class GuardrailsLayer extends BaseIntegrationLayer {
    constructor(config: SevenIntegrationConfig);
    execute(input: any, context?: any): Promise<LayerResult>;
    private implementInputValidation;
    private implementEfficiencyValidation;
    private implementBusinessCompliance;
    private implementOutputQuality;
    private implementMonitoring;
}
export declare class CursorOptimizationLayer extends BaseIntegrationLayer {
    constructor(config: SevenIntegrationConfig);
    execute(input: any, context?: any): Promise<LayerResult>;
    private implementCostOptimization;
    private implementMCPIntegration;
    private implementAPIOptimization;
    private implementDevelopmentEfficiency;
}
export declare class ProcessOptimizationLayer extends BaseIntegrationLayer {
    constructor(config: SevenIntegrationConfig);
    execute(input: any, context?: any): Promise<LayerResult>;
    private implementThreeLayerLoop;
    private implementStakeholderCoordination;
    private implementContinuousImprovement;
    private implementAutomationSystem;
}
export declare class RAGImplementationLayer extends BaseIntegrationLayer {
    constructor(config: SevenIntegrationConfig);
    execute(input: any, context?: any): Promise<LayerResult>;
    private implementBestPractices;
    private implementKnowledgeBase;
    private implementTechStackIntegration;
    private implementCostEfficiency;
}
export declare class PromptPerfectionLayer extends BaseIntegrationLayer {
    constructor(config: SevenIntegrationConfig);
    execute(input: any, context?: any): Promise<LayerResult>;
    private implementCOSTAR;
    private implementThoughtGuidance;
    private implementAutoOptimization;
    private measureEffectiveness;
}
export declare class SevenLayerIntegrationFactory {
    static createLayer(layerType: IntegrationLayer, config: SevenIntegrationConfig): BaseIntegrationLayer;
    static createAllLayers(config: SevenIntegrationConfig): BaseIntegrationLayer[];
}
//# sourceMappingURL=seven-layer-integration.d.ts.map