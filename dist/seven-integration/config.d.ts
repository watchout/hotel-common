import { SevenIntegrationConfig, AIAgentType, IntegrationLayer, OptimizationLevel } from './types';
export declare const DEFAULT_SEVEN_INTEGRATION_CONFIG: SevenIntegrationConfig;
export declare const ENVIRONMENT_CONFIGS: {
    development: {
        llmConfig: {
            maxTokens: number;
            temperature: number;
            primaryModel: "claude-3.5-sonnet" | "gpt-4" | "deepseek-v3";
            fallbackModel?: string;
            topP?: number;
        };
        guardrailsConfig: {
            safetyLevel: "standard";
            enabled: boolean;
            toxicityThreshold: number;
            factCheckEnabled: boolean;
            privacyProtection: boolean;
            businessCompliance: boolean;
        };
        monitoringConfig: {
            realTimeAlerts: boolean;
            enabled: boolean;
            performanceTracking: boolean;
            costTracking: boolean;
            qualityMetrics: boolean;
            dashboardEnabled: boolean;
        };
        projectName: string;
        environment: "development" | "staging" | "production";
        enabledAgents: AIAgentType[];
        defaultAgent?: AIAgentType;
        integrationLayers: IntegrationLayer[];
        optimizationLevel: OptimizationLevel;
        ragConfig: {
            enabled: boolean;
            vectorDatabase: "chroma" | "faiss" | "pinecone";
            embeddingModel: string;
            chunkSize: number;
            chunkOverlap: number;
            maxRetrievals: number;
            scoreThreshold: number;
        };
        promptConfig: {
            framework: "CO-STAR" | "custom";
            enableCoT: boolean;
            enableToT: boolean;
            autoOptimization: boolean;
            examplesDatabase: boolean;
            delimitersEnabled: boolean;
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
    };
    staging: {
        optimizationLevel: OptimizationLevel;
        projectName: string;
        environment: "development" | "staging" | "production";
        enabledAgents: AIAgentType[];
        defaultAgent?: AIAgentType;
        integrationLayers: IntegrationLayer[];
        llmConfig: {
            primaryModel: "claude-3.5-sonnet" | "gpt-4" | "deepseek-v3";
            fallbackModel?: string;
            maxTokens: number;
            temperature: number;
            topP?: number;
        };
        ragConfig: {
            enabled: boolean;
            vectorDatabase: "chroma" | "faiss" | "pinecone";
            embeddingModel: string;
            chunkSize: number;
            chunkOverlap: number;
            maxRetrievals: number;
            scoreThreshold: number;
        };
        promptConfig: {
            framework: "CO-STAR" | "custom";
            enableCoT: boolean;
            enableToT: boolean;
            autoOptimization: boolean;
            examplesDatabase: boolean;
            delimitersEnabled: boolean;
        };
        guardrailsConfig: {
            enabled: boolean;
            safetyLevel: "basic" | "standard" | "strict";
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
    };
    production: {
        llmConfig: {
            temperature: number;
            primaryModel: "claude-3.5-sonnet" | "gpt-4" | "deepseek-v3";
            fallbackModel?: string;
            maxTokens: number;
            topP?: number;
        };
        guardrailsConfig: {
            safetyLevel: "strict";
            toxicityThreshold: number;
            enabled: boolean;
            factCheckEnabled: boolean;
            privacyProtection: boolean;
            businessCompliance: boolean;
        };
        projectName: string;
        environment: "development" | "staging" | "production";
        enabledAgents: AIAgentType[];
        defaultAgent?: AIAgentType;
        integrationLayers: IntegrationLayer[];
        optimizationLevel: OptimizationLevel;
        ragConfig: {
            enabled: boolean;
            vectorDatabase: "chroma" | "faiss" | "pinecone";
            embeddingModel: string;
            chunkSize: number;
            chunkOverlap: number;
            maxRetrievals: number;
            scoreThreshold: number;
        };
        promptConfig: {
            framework: "CO-STAR" | "custom";
            enableCoT: boolean;
            enableToT: boolean;
            autoOptimization: boolean;
            examplesDatabase: boolean;
            delimitersEnabled: boolean;
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
    };
};
export declare const AI_AGENT_CONFIGS: Record<AIAgentType, any>;
export declare const INTEGRATION_LAYER_CONFIGS: Record<IntegrationLayer, any>;
export declare const PERFORMANCE_TARGETS: {
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
};
export declare function getSevenIntegrationConfig(environment?: 'development' | 'staging' | 'production', customConfig?: Partial<SevenIntegrationConfig>): SevenIntegrationConfig;
export declare function validateSevenIntegrationConfig(config: SevenIntegrationConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
export * from './types';
