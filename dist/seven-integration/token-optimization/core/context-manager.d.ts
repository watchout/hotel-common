export interface ContextMessage {
    content: string;
    type: 'constraint' | 'error' | 'implementation' | 'design';
    timestamp: number;
    importance: number;
    tokenCount: number;
    score?: number;
}
export interface ContextOptimizationResult {
    optimizedContext: string;
    removedMessages: number;
    tokensSaved: number;
    totalTokens: number;
}
export declare class HotelCommonContextManager {
    private maxTokens;
    private messages;
    private permanentConstraints;
    addMessage(content: string, type: ContextMessage['type']): void;
    getOptimizedContext(): ContextOptimizationResult;
    private calculateImportance;
    private optimizeIfNeeded;
    private performOptimization;
    private calculateTotalTokens;
    private estimateTokenCount;
    getStats(): {
        totalMessages: number;
        totalTokens: number;
        utilizationRate: string;
    };
    clear(): void;
}
