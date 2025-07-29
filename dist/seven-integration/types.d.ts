export type AIAgentType = 'Sun' | 'Suno' | 'Luna' | 'Iza' | 'Nami';
export type IntegrationLayer = 'problem-solving' | 'token-optimization' | 'guardrails' | 'cursor-optimization' | 'process-optimization' | 'rag-implementation' | 'prompt-perfection';
export type OptimizationLevel = 'basic' | 'advanced' | 'ultimate';
export interface SevenIntegrationConfig {
    projectName: string;
    environment: 'development' | 'staging' | 'production';
    enabledAgents: AIAgentType[];
    defaultAgent?: AIAgentType;
    integrationLayers: IntegrationLayer[];
    optimizationLevel: OptimizationLevel;
    llmConfig: {
        primaryModel: 'claude-3.5-sonnet' | 'gpt-4' | 'deepseek-v3';
        fallbackModel?: string;
        maxTokens: number;
        temperature: number;
        topP?: number;
    };
    ragConfig: {
        enabled: boolean;
        vectorDatabase: 'chroma' | 'faiss' | 'pinecone';
        embeddingModel: string;
        chunkSize: number;
        chunkOverlap: number;
        maxRetrievals: number;
        scoreThreshold: number;
    };
    promptConfig: {
        framework: 'CO-STAR' | 'custom';
        enableCoT: boolean;
        enableToT: boolean;
        autoOptimization: boolean;
        examplesDatabase: boolean;
        delimitersEnabled: boolean;
    };
    guardrailsConfig: {
        enabled: boolean;
        safetyLevel: 'basic' | 'standard' | 'strict';
        toxicityThreshold: number;
        factCheckEnabled: boolean;
        privacyProtection: boolean;
        businessCompliance: boolean;
    };
    tokenOptimizationConfig: {
        enabled: boolean;
        languageSwitching: boolean;
        contextCompression: boolean;
        semanticChunking: boolean;
        targetReduction: number;
    };
    cursorConfig: {
        enabled: boolean;
        costOptimization: boolean;
        mcpIntegration: boolean;
        apiCaching: boolean;
    };
    processConfig: {
        threeLayerLoop: boolean;
        stakeholderCoordination: boolean;
        continuousEvaluation: boolean;
        automated: boolean;
    };
    monitoringConfig: {
        enabled: boolean;
        performanceTracking: boolean;
        costTracking: boolean;
        qualityMetrics: boolean;
        realTimeAlerts: boolean;
        dashboardEnabled: boolean;
    };
}
export interface SevenIntegrationResult {
    success: boolean;
    executionTime: number;
    layerResults: Record<IntegrationLayer, LayerResult>;
    overallEffectiveness: EffectivenessMetrics;
    recommendations: string[];
    errors?: string[];
    warnings?: string[];
}
export interface LayerResult {
    layer: IntegrationLayer;
    success: boolean;
    executionTime: number;
    metrics: Record<string, number | string | boolean>;
    improvements: string[];
    nextSteps?: string[];
}
export interface EffectivenessMetrics {
    developmentEfficiency: {
        speedImprovement: number;
        errorReduction: number;
        successRate: number;
    };
    costReduction: {
        tokenSavings: number;
        timeReduction: number;
        operationalSavings: number;
    };
    qualityImprovement: {
        accuracy: number;
        consistency: number;
        reliability: number;
        safety: number;
    };
    roi: {
        estimated: number;
        timeToBreakeven: number;
        longTermValue: number;
    };
}
export interface AIAgentConfig {
    type: AIAgentType;
    name: string;
    description: string;
    personality: {
        style: string;
        tone: string;
        approach: string;
    };
    specialization: string[];
    enabled: boolean;
}
export interface RAGQuery {
    query: string;
    context?: Record<string, any>;
    agentType?: AIAgentType;
    systemType?: 'hotel-saas' | 'hotel-member' | 'hotel-pms' | 'integration';
}
export interface RAGResponse {
    answer: string;
    sources: RAGSource[];
    confidence: number;
    processingTime: number;
    tokenUsage: {
        input: number;
        output: number;
        cost: number;
    };
    metadata?: Record<string, any>;
}
export interface RAGSource {
    title: string;
    content: string;
    url?: string;
    relevanceScore: number;
    system: string;
}
export interface PromptOptimizationRequest {
    originalPrompt: string;
    agentType: AIAgentType;
    taskType: string;
    optimizationLevel: OptimizationLevel;
    targetFramework?: 'CO-STAR' | 'custom';
}
export interface OptimizedPromptResult {
    originalPrompt: string;
    optimizedPrompt: string;
    improvements: string[];
    estimatedEffectiveness: number;
    framework: string;
    processingTime: number;
}
export interface GuardrailValidation {
    input: string;
    context?: Record<string, any>;
    agentType?: AIAgentType;
}
export interface GuardrailResult {
    passed: boolean;
    confidence: number;
    reasons: string[];
    sanitizedInput?: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
export interface MonitoringData {
    timestamp: Date;
    agent: AIAgentType;
    layer: IntegrationLayer;
    metrics: Record<string, number | string | boolean>;
    performance: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        costPerOperation: number;
    };
}
export interface EvaluationCriteria {
    performance: boolean;
    cost: boolean;
    quality: boolean;
    safety: boolean;
    compliance: boolean;
}
export interface IntegrationEvent {
    id: string;
    timestamp: Date;
    type: 'start' | 'complete' | 'error' | 'warning';
    layer: IntegrationLayer;
    agent?: AIAgentType;
    message: string;
    data?: Record<string, any>;
}
export interface IntegrationStatus {
    isRunning: boolean;
    currentLayer?: IntegrationLayer;
    currentAgent?: AIAgentType;
    progress: number;
    startTime?: Date;
    estimatedCompletion?: Date;
    errors: string[];
    warnings: string[];
}
export type SevenIntegrationType = {
    config: SevenIntegrationConfig;
    result: SevenIntegrationResult;
    status: IntegrationStatus;
    events: IntegrationEvent[];
};
