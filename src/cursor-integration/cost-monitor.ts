/**
 * 💰 Cursor コスト監視システム (文献4準拠)
 * 20%マークアップ回避・リアルタイム監視
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CostUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  savedCost: number; // 20%マークアップ回避による削減額
}

export interface CostLimitConfig {
  daily: number;
  weekly: number;
  monthly: number;
  alertThreshold: number; // %
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
export class AnthropicCostCalculator {
  // Claude Sonnet 4 料金（2024年12月現在）
  private static readonly INPUT_COST_PER_M = 3.0;  // $3/1M tokens
  private static readonly OUTPUT_COST_PER_M = 15.0; // $15/1M tokens
  
  // Cursor 20%マークアップ
  private static readonly CURSOR_MARKUP = 0.20;

  static calculateDirectCost(inputTokens: number, outputTokens: number): CostUsage {
    const inputCost = (inputTokens / 1000000) * this.INPUT_COST_PER_M;
    const outputCost = (outputTokens / 1000000) * this.OUTPUT_COST_PER_M;
    const totalCost = inputCost + outputCost;
    
    // Cursor経由だった場合のコスト
    const cursorCost = totalCost * (1 + this.CURSOR_MARKUP);
    const savedCost = cursorCost - totalCost;

    return {
      date: new Date().toISOString().split('T')[0],
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
      totalCost,
      savedCost
    };
  }

  static calculateProjectedMonthlyCost(dailyUsage: CostUsage): number {
    return dailyUsage.totalCost * 30;
  }

  static calculateYearlySavings(monthlyUsage: CostUsage): number {
    return monthlyUsage.savedCost * 12;
  }
}

/**
 * コスト監視・管理システム
 */
export class HotelCommonCostMonitor {
  private logFile: string;
  private config: CostLimitConfig;

  constructor(config: CostLimitConfig) {
    this.config = config;
    this.logFile = path.join(process.cwd(), 'logs', 'cost-usage.json');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * 使用量をログに記録
   */
  logUsage(inputTokens: number, outputTokens: number): CostUsage {
    const usage = AnthropicCostCalculator.calculateDirectCost(inputTokens, outputTokens);
    
    // 既存ログを読み込み
    let logs: CostUsage[] = [];
    if (fs.existsSync(this.logFile)) {
      try {
        const data = fs.readFileSync(this.logFile, 'utf-8');
        logs = JSON.parse(data);
      } catch (error: Error) {
        console.warn('Failed to read cost log:', error);
      }
    }

    // 新しい使用量を追加
    logs.push(usage);

    // 30日分のみ保持
    if (logs.length > 30) {
      logs = logs.slice(-30);
    }

    // ファイルに保存
    fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));

    // アラートチェック
    this.checkAlerts(usage);

    return usage;
  }

  /**
   * 使用量アラートチェック
   */
  private checkAlerts(usage: CostUsage): void {
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = this.getDailyUsage(today);
    
    const dailyUsagePercent = (todayUsage.totalCost / this.config.daily) * 100;
    
    if (dailyUsagePercent >= this.config.alertThreshold) {
      console.warn(`🚨 Cost Alert: Daily usage at ${dailyUsagePercent.toFixed(1)}% of limit`);
      console.warn(`Today's cost: $${todayUsage.totalCost.toFixed(4)}, Limit: $${this.config.daily}`);
    }
  }

  /**
   * 指定日の使用量取得
   */
  getDailyUsage(date: string): CostUsage {
    if (!fs.existsSync(this.logFile)) {
      return {
        date,
        inputTokens: 0,
        outputTokens: 0,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        savedCost: 0
      };
    }

    try {
      const logs: CostUsage[] = JSON.parse(fs.readFileSync(this.logFile, 'utf-8'));
      const dayLogs = logs.filter(log => log.date === date);
      
      return dayLogs.reduce((total, log) => ({
        date,
        inputTokens: total.inputTokens + log.inputTokens,
        outputTokens: total.outputTokens + log.outputTokens,
        inputCost: total.inputCost + log.inputCost,
        outputCost: total.outputCost + log.outputCost,
        totalCost: total.totalCost + log.totalCost,
        savedCost: total.savedCost + log.savedCost
      }), {
        date,
        inputTokens: 0,
        outputTokens: 0,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        savedCost: 0
      });
    } catch (error: Error) {
      console.error('Failed to read daily usage:', error);
      return {
        date,
        inputTokens: 0,
        outputTokens: 0,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        savedCost: 0
      };
    }
  }

  /**
   * 月間レポート生成
   */
  generateMonthlyReport(): CostReport {
    if (!fs.existsSync(this.logFile)) {
      throw new Error('No cost data available');
    }

    const logs: CostUsage[] = JSON.parse(fs.readFileSync(this.logFile, 'utf-8'));
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 今月のデータをフィルタ
    const monthlyLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    // 集計
    const totalUsage = monthlyLogs.reduce((total, log) => ({
      date: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`,
      inputTokens: total.inputTokens + log.inputTokens,
      outputTokens: total.outputTokens + log.outputTokens,
      inputCost: total.inputCost + log.inputCost,
      outputCost: total.outputCost + log.outputCost,
      totalCost: total.totalCost + log.totalCost,
      savedCost: total.savedCost + log.savedCost
    }), {
      date: '',
      inputTokens: 0,
      outputTokens: 0,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      savedCost: 0
    });

    const dailyAverage = monthlyLogs.length > 0 ? totalUsage.totalCost / monthlyLogs.length : 0;
    const projectedMonthly = dailyAverage * 30;
    const savingsVsCursor = totalUsage.savedCost;

    // 推奨事項
    const recommendations: string[] = [];
    
    if (projectedMonthly > this.config.monthly) {
      recommendations.push(`月間予算超過の可能性：$${projectedMonthly.toFixed(2)} > $${this.config.monthly}`);
      recommendations.push('トークン最適化システム（文献2）の活用を推奨');
    }
    
    if (savingsVsCursor > 10) {
      recommendations.push(`Cursor 20%マークアップ回避により$${savingsVsCursor.toFixed(2)}を削減`);
    }
    
    if (totalUsage.inputTokens > totalUsage.outputTokens * 2) {
      recommendations.push('RAGシステム（文献6）による入力トークン削減を推奨');
    }

    return {
      period: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`,
      totalUsage,
      dailyAverage,
      projectedMonthly,
      savingsVsCursor,
      recommendations
    };
  }

  /**
   * コスト効率レポート表示
   */
  displayCostReport(): void {
    try {
      const report = this.generateMonthlyReport();
      
      console.log('\n💰 Hotel Common コスト効率レポート');
      console.log('=======================================');
      console.log(`📅 期間: ${report.period}`);
      console.log(`💵 今月の使用量: $${report.totalUsage.totalCost.toFixed(4)}`);
      console.log(`📊 1日平均: $${report.dailyAverage.toFixed(4)}`);
      console.log(`📈 月間予測: $${report.projectedMonthly.toFixed(2)}`);
      console.log(`💾 Cursor回避削減額: $${report.savingsVsCursor.toFixed(4)}`);
      console.log(`🎯 入力トークン: ${report.totalUsage.inputTokens.toLocaleString()}`);
      console.log(`📤 出力トークン: ${report.totalUsage.outputTokens.toLocaleString()}`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 推奨事項:');
        report.recommendations.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }
      
      console.log('=======================================\n');
    } catch (error: Error) {
      console.error('Failed to generate cost report:', error);
    }
  }
}

// テスト実行部分
async function testCostMonitor() {
  console.log('💰 Cursor コスト監視システムテスト開始');

  const config: CostLimitConfig = {
    daily: 5.0,    // $5/day
    weekly: 30.0,  // $30/week
    monthly: 120.0, // $120/month
    alertThreshold: 80 // 80%
  };

  const monitor = new HotelCommonCostMonitor(config);

  // サンプルの使用量をログ
  console.log('\n📊 サンプル使用量ログ開始:');
  
  // TypeScriptエラー分析（小規模）
  const usage1 = monitor.logUsage(1500, 800);
  console.log(`TypeScriptエラー分析: $${usage1.totalCost.toFixed(4)} (削減: $${usage1.savedCost.toFixed(4)})`);

  // API実装（中規模）
  const usage2 = monitor.logUsage(5000, 3000);
  console.log(`API実装: $${usage2.totalCost.toFixed(4)} (削減: $${usage2.savedCost.toFixed(4)})`);

  // アーキテクチャ設計（大規模）
  const usage3 = monitor.logUsage(8000, 5000);
  console.log(`アーキテクチャ設計: $${usage3.totalCost.toFixed(4)} (削減: $${usage3.savedCost.toFixed(4)})`);

  // 今日の使用量確認
  const today = new Date().toISOString().split('T')[0];
  const dailyUsage = monitor.getDailyUsage(today);
  console.log(`\n📅 今日の合計使用量: $${dailyUsage.totalCost.toFixed(4)}`);
  console.log(`💾 今日の削減額: $${dailyUsage.savedCost.toFixed(4)}`);

  // 月間レポート表示
  monitor.displayCostReport();

  console.log('🏆 Cursor コスト監視システムテスト完了');
}

// 実行
testCostMonitor().catch(console.error);