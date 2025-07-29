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

export class HotelCommonContextManager {
    private maxTokens: number = 4000;
    private messages: ContextMessage[] = [];
    private permanentConstraints: string[] = [
        "Database: hotel_unified_db (NOT hotel_common_dev)",
        "Models: customers (NOT customer), Staff (NOT User)",
        "Security: All queries MUST include tenantId",
        "TypeScript: NO 'as any', proper error handling required"
    ];

    addMessage(content: string, type: ContextMessage['type']): void {
        const importance = this.calculateImportance(content, type);
        const tokenCount = this.estimateTokenCount(content);

        const message: ContextMessage = {
            content,
            type,
            timestamp: Date.now(),
            importance,
            tokenCount
        };

        this.messages.push(message);
        this.optimizeIfNeeded();
    }

    getOptimizedContext(): ContextOptimizationResult {
        const permanentConstraintsText = this.permanentConstraints.join('\n');
        const messageContent = this.messages
            .map(msg => `[${msg.type.toUpperCase()}] ${msg.content}`)
            .join('\n\n');

        const optimizedContext = `HOTEL-COMMON CONSTRAINTS (NEVER FORGET):
${permanentConstraintsText}

CURRENT SESSION CONTEXT:
${messageContent}`;

        return {
            optimizedContext,
            removedMessages: 0,
            tokensSaved: 0,
            totalTokens: this.calculateTotalTokens()
        };
    }

    private calculateImportance(content: string, type: string): number {
        const typeWeights: Record<string, number> = {
            'constraint': 1.0,
            'error': 0.9,
            'implementation': 0.7,
            'design': 0.5
        };

        return typeWeights[type] || 0.5;
    }

    private optimizeIfNeeded(): void {
        const totalTokens = this.calculateTotalTokens();

        if (totalTokens > this.maxTokens) {
            this.performOptimization();
        }
    }

    private performOptimization(): void {
        // 重要度×新しさでスコア計算
        this.messages.forEach(msg => {
            const ageInHours = (Date.now() - msg.timestamp) / (1000 * 3600);
            msg.score = msg.importance / (1 + ageInHours);
        });

        // 直近3メッセージは保護
        const recent = this.messages.slice(-3);
        const older = this.messages.slice(0, -3).sort((a, b) => (a.score || 0) - (b.score || 0));

        // 低スコアから削除
        while (this.calculateTotalTokens() > this.maxTokens * 0.8 && older.length > 0) {
            older.shift();
        }

        this.messages = [...older, ...recent];
    }

    private calculateTotalTokens(): number {
        const constraintsTokens = this.estimateTokenCount(this.permanentConstraints.join('\n'));
        const messagesTokens = this.messages.reduce((sum, msg) => sum + msg.tokenCount, 0);
        return constraintsTokens + messagesTokens;
    }

    private estimateTokenCount(text: string): number {
        // 簡易トークン推定（1トークン = 約4文字）
        return Math.ceil(text.length / 4);
    }

    getStats(): {
        totalMessages: number;
        totalTokens: number;
        utilizationRate: string;
    } {
        return {
            totalMessages: this.messages.length,
            totalTokens: this.calculateTotalTokens(),
            utilizationRate: `${Math.round((this.calculateTotalTokens() / this.maxTokens) * 100)}%`
        };
    }

    clear(): void {
        this.messages = [];
    }
} 