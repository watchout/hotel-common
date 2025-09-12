#!/usr/bin/env node
/**
 * API 監視・ヘルスチェックツール
 * リアルタイムでAPIの品質と動作状況を監視
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class APIMonitor {
  constructor() {
    this.monitoringActive = false;
    this.checkInterval = 30000; // 30秒間隔
    this.logFile = 'logs/api-monitor.log';
    this.metricsFile = 'logs/api-metrics.json';
  }

  /**
   * 監視開始
   */
  async startMonitoring() {
    console.log('🔍 API 監視開始...');
    this.monitoringActive = true;

    // ログディレクトリ作成
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }

    while (this.monitoringActive) {
      try {
        await this.performHealthCheck();
        await this.sleep(this.checkInterval);
      } catch (error) {
        this.log('ERROR', `監視中にエラーが発生: ${error.message}`);
        await this.sleep(5000); // エラー時は短い間隔で再試行
      }
    }
  }

  /**
   * ヘルスチェック実行
   */
  async performHealthCheck() {
    const timestamp = new Date().toISOString();
    const metrics = {
      timestamp,
      routeQuality: await this.checkRouteQuality(),
      serverHealth: await this.checkServerHealth(),
      apiEndpoints: await this.checkAPIEndpoints()
    };

    // メトリクス保存
    this.saveMetrics(metrics);

    // 問題があれば警告
    if (metrics.routeQuality.errors > 0) {
      this.log('WARN', `API品質問題: ${metrics.routeQuality.errors}件のエラー`);
    }

    if (!metrics.serverHealth.isRunning) {
      this.log('ERROR', 'サーバーが停止しています');
    }

    console.log(`✅ ヘルスチェック完了 [${timestamp}]`);
    console.log(`   - ルート品質: ${metrics.routeQuality.errors}エラー, ${metrics.routeQuality.warnings}警告`);
    console.log(`   - サーバー: ${metrics.serverHealth.isRunning ? '稼働中' : '停止'}`);
    console.log(`   - エンドポイント: ${metrics.apiEndpoints.available}/${metrics.apiEndpoints.total}が利用可能`);
  }

  /**
   * ルート品質チェック
   */
  async checkRouteQuality() {
    try {
      const result = execSync('npx ts-node scripts/check-api-routes.ts', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      return {
        status: 'ok',
        errors: 0,
        warnings: 0,
        info: 0
      };
    } catch (error) {
      // エラー出力から数値を抽出
      const output = error.stdout || error.message;
      const errorMatch = output.match(/🚨 エラー: (\d+)件/);
      const warningMatch = output.match(/⚠️\s+警告: (\d+)件/);
      const infoMatch = output.match(/ℹ️\s+情報: (\d+)件/);

      return {
        status: 'issues_found',
        errors: errorMatch ? parseInt(errorMatch[1]) : 0,
        warnings: warningMatch ? parseInt(warningMatch[1]) : 0,
        info: infoMatch ? parseInt(infoMatch[1]) : 0
      };
    }
  }

  /**
   * サーバーヘルスチェック
   */
  async checkServerHealth() {
    try {
      // プロセス確認
      const processes = execSync('ps aux | grep -E "(node.*hotel-common|ts-node.*integration-server)" | grep -v grep', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const isRunning = processes.trim().length > 0;
      
      // ポート確認
      let portInUse = false;
      try {
        execSync('lsof -i :3400', { stdio: 'pipe' });
        portInUse = true;
      } catch (e) {
        // ポートが使用されていない
      }

      return {
        isRunning,
        portInUse,
        processes: processes.split('\n').filter(p => p.trim().length > 0).length
      };
    } catch (error) {
      return {
        isRunning: false,
        portInUse: false,
        processes: 0,
        error: error.message
      };
    }
  }

  /**
   * APIエンドポイントチェック
   */
  async checkAPIEndpoints() {
    const endpoints = [
      '/api/v1/auth/login',
      '/api/v1/admin/room-memos',
      '/api/v1/admin/page-history',
      '/api/v1/health'
    ];

    let available = 0;
    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await this.testEndpoint(endpoint);
        if (response.success) {
          available++;
        }
        results.push({
          endpoint,
          status: response.status,
          success: response.success
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 'error',
          success: false,
          error: error.message
        });
      }
    }

    return {
      total: endpoints.length,
      available,
      results
    };
  }

  /**
   * エンドポイントテスト
   */
  async testEndpoint(endpoint) {
    try {
      const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3400${endpoint}`, {
        encoding: 'utf8',
        timeout: 5000
      });

      const statusCode = parseInt(result.trim());
      return {
        status: statusCode,
        success: statusCode < 500 // 5xxエラー以外は成功とみなす
      };
    } catch (error) {
      return {
        status: 'timeout',
        success: false
      };
    }
  }

  /**
   * メトリクス保存
   */
  saveMetrics(metrics) {
    let existingMetrics = [];
    
    if (fs.existsSync(this.metricsFile)) {
      try {
        const content = fs.readFileSync(this.metricsFile, 'utf8');
        existingMetrics = JSON.parse(content);
      } catch (error) {
        // ファイルが壊れている場合は新規作成
        existingMetrics = [];
      }
    }

    existingMetrics.push(metrics);

    // 過去24時間分のみ保持
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    existingMetrics = existingMetrics.filter(m => new Date(m.timestamp) > oneDayAgo);

    fs.writeFileSync(this.metricsFile, JSON.stringify(existingMetrics, null, 2));
  }

  /**
   * ログ出力
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level}: ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('ログファイル書き込みエラー:', error.message);
    }
  }

  /**
   * 監視停止
   */
  stopMonitoring() {
    this.monitoringActive = false;
    console.log('🛑 API 監視停止');
  }

  /**
   * スリープ
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 単発実行
   */
  async runOnce() {
    console.log('🔍 API ヘルスチェック実行...');
    await this.performHealthCheck();
    console.log('✅ ヘルスチェック完了');
  }
}

// CLI実行
if (require.main === module) {
  const monitor = new APIMonitor();
  const command = process.argv[2];

  switch (command) {
    case 'run':
      monitor.runOnce();
      break;
    case 'continuous':
      monitor.startMonitoring();
      // Ctrl+Cで停止
      process.on('SIGINT', () => {
        monitor.stopMonitoring();
        process.exit(0);
      });
      break;
    default:
      console.log('使用方法:');
      console.log('  node scripts/api-monitor.js run        # 単発実行');
      console.log('  node scripts/api-monitor.js continuous # 継続監視');
      process.exit(1);
  }
}

module.exports = { APIMonitor };
