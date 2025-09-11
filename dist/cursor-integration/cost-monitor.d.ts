/**
 * 💰 Cursor コスト監視システム (文献4準拠)
 * 20%マークアップ回避・リアルタイム監視
 */
export interface CostUsage {
    date: string;
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
    savedCost: number;
}
export interface CostLimitConfig {
    daily: number;
    weekly: number;
    monthly: number;
    alertThreshold: number;
}
export interface CostReport {
    period: string;
    totalUsage: CostUsage;
    dailyAverage: number;
    projectedMonthly: number;
    savingsVsCursor: number;
    recommendations: string[];
}
/**
 * Anthropic Claude API料金計算
 */
export declare class AnthropicCostCalculator {
    private static readonly INPUT_COST_PER_M;
    private static readonly OUTPUT_COST_PER_M;
    private static readonly CURSOR_MARKUP;
    static calculateDirectCost(inputTokens: number, outputTokens: number): CostUsage;
    static calculateProjectedMonthlyCost(dailyUsage: CostUsage): number;
    static calculateYearlySavings(monthlyUsage: CostUsage): number;
}
/**
 * コスト監視・管理システム
 */
export declare class HotelCommonCostMonitor {
    private logFile;
    private config;
    constructor(config: CostLimitConfig);
    private ensureLogDirectory;
    /**
     * 使用量をログに記録
     */
    logUsage(inputTokens: number, outputTokens: number): CostUsage;
    /**
     * 使用量アラートチェック
     */
    private checkAlerts;
    /**
     * 指定日の使用量取得
     */
    getDailyUsage(date: string): CostUsage;
    /**
     * 月間レポート生成
     */
    generateMonthlyReport(): CostReport;
    /**
     * コスト効率レポート表示
     */
    displayCostReport(): void;
}
