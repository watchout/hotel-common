#!/usr/bin/env node
/**
 * 🛡️ 常時監視ガードレールシステム
 * hotel-saas, hotel-pms, hotel-member, hotel-common を24時間監視
 */

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ContinuousGuardrailsMonitor {
  constructor() {
    this.isRunning = false;
    this.watchers = [];
    this.violations = [];
    this.lastCheck = new Date();
    
    // 監視対象プロジェクト
    this.projects = {
      'hotel-saas': '../hotel-saas',
      'hotel-member': '../hotel-member', 
      'hotel-pms': '../hotel-pms',
      'hotel-common': '.'
    };
    
    // 監視対象ファイルパターン
    this.watchPatterns = [
      '**/*.ts',
      '**/*.tsx', 
      '**/*.js',
      '**/*.jsx',
      '**/*.vue'
    ];
    
    // 除外パターン
    this.ignorePatterns = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/temp_validation.rail'
    ];
  }

  /**
   * 🚀 監視システム開始
   */
  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️  監視システムは既に実行中です');
      return;
    }

    console.log('🛡️ 常時ガードレール監視システム開始');
    console.log('📅', new Date().toLocaleString());
    console.log('');
    
    this.isRunning = true;
    
    // 各プロジェクトの監視開始
    for (const [projectName, projectPath] of Object.entries(this.projects)) {
      await this.startProjectMonitoring(projectName, projectPath);
    }
    
    // 定期レポート
    this.startPeriodicReporting();
    
    // 終了ハンドラー
    process.on('SIGINT', () => this.stopMonitoring());
    process.on('SIGTERM', () => this.stopMonitoring());
    
    console.log('✅ 全プロジェクト監視開始完了');
    console.log('🔧 停止方法: Ctrl+C');
    console.log('');
  }

  /**
   * 📁 個別プロジェクト監視開始
   */
  async startProjectMonitoring(projectName, projectPath) {
    const fullPath = path.resolve(projectPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  ${projectName}: パス未発見 - ${fullPath}`);
      return;
    }
    
    console.log(`🔍 ${projectName} 監視開始: ${fullPath}`);
    
    const watcher = chokidar.watch(this.watchPatterns, {
      cwd: fullPath,
      ignored: this.ignorePatterns,
      persistent: true,
      ignoreInitial: true
    });
    
    watcher.on('change', (filePath) => {
      this.onFileChanged(projectName, fullPath, filePath);
    });
    
    watcher.on('add', (filePath) => {
      this.onFileChanged(projectName, fullPath, filePath);
    });
    
    this.watchers.push({ projectName, watcher });
  }

  /**
   * 📝 ファイル変更検出時の処理
   */
  async onFileChanged(projectName, projectPath, relativePath) {
    const fullFilePath = path.join(projectPath, relativePath);
    const timestamp = new Date().toLocaleString();
    
    console.log(`🔄 [${timestamp}] ${projectName}/${relativePath} - 変更検出`);
    
    try {
      // ガードレール検証実行
      const result = await this.validateFile(projectName, fullFilePath);
      
      if (result.violations.length > 0) {
        console.log(`❌ [${projectName}] ${relativePath} - ${result.violations.length}件の問題発見`);
        result.violations.forEach(violation => {
          console.log(`   ${violation}`);
        });
        
        // 違反情報を記録
        this.violations.push({
          timestamp: new Date(),
          project: projectName,
          file: relativePath,
          violations: result.violations
        });
      } else {
        console.log(`✅ [${projectName}] ${relativePath} - ガードレール適合`);
      }
      
    } catch (error) {
      console.log(`💥 [${projectName}] ${relativePath} - 検証エラー: ${error.message}`);
    }
    
    console.log('');
  }

  /**
   * 🛡️ ファイル検証実行
   */
  async validateFile(projectName, filePath) {
    const violations = [];
    
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      
      // プロジェクト特化チェック
      const projectViolations = this.getProjectSpecificViolations(projectName, code);
      violations.push(...projectViolations);
      
      // 共通品質チェック
      const qualityViolations = this.getQualityViolations(code);
      violations.push(...qualityViolations);
      
      // セキュリティチェック
      const securityViolations = this.getSecurityViolations(code);
      violations.push(...securityViolations);
      
    } catch (error) {
      violations.push(`ファイル読み込みエラー: ${error.message}`);
    }
    
    return { violations };
  }

  /**
   * 🎯 プロジェクト特化違反チェック
   */
  getProjectSpecificViolations(projectName, code) {
    const violations = [];
    
    switch (projectName) {
      case 'hotel-member':
        if (!code.includes('tenant_id') && code.includes('prisma')) {
          violations.push('❌ Multi-tenant: tenant_id必須');
        }
        break;
        
      case 'hotel-saas':
        if (code.includes('hotelDb.') && !code.includes('service.ordered')) {
          violations.push('❌ Event: service.orderedイベント発行必須');
        }
        break;
        
      case 'hotel-pms':
        if (code.includes('reservation') && !code.includes('origin')) {
          violations.push('❌ Origin: 予約にorigin属性必須');
        }
        break;
    }
    
    return violations;
  }

  /**
   * ⚡ 品質違反チェック
   */
  getQualityViolations(code) {
    const violations = [];
    
    if (code.includes('as any')) {
      violations.push('❌ Type Safety: "as any"禁止');
    }
    
    if (!code.includes('try') && code.includes('await')) {
      violations.push('❌ Error Handling: awaitにtry-catch必須');
    }
    
    if (code.includes('console.log') && !code.includes('logger')) {
      violations.push('⚠️  Logging: console.log → logger使用推奨');
    }
    
    return violations;
  }

  /**
   * 🔒 セキュリティ違反チェック
   */
  getSecurityViolations(code) {
    const violations = [];
    
    if (code.includes('eval(') || code.includes('Function(')) {
      violations.push('🚨 Security: eval/Function使用禁止');
    }
    
    if (code.includes('innerHTML') && !code.includes('sanitize')) {
      violations.push('🚨 Security: innerHTML使用時はサニタイズ必須');
    }
    
    if (code.includes('.env') && code.includes('console')) {
      violations.push('🚨 Security: 環境変数の漏洩リスク');
    }
    
    return violations;
  }

  /**
   * 📊 定期レポート
   */
  startPeriodicReporting() {
    setInterval(() => {
      const now = new Date();
      const uptime = Math.floor((now - this.lastCheck) / 1000);
      
      console.log(`📊 [${now.toLocaleString()}] 監視レポート`);
      console.log(`⏱️  監視時間: ${uptime}秒`);
      console.log(`🛡️ 監視プロジェクト: ${Object.keys(this.projects).length}件`);
      console.log(`❌ 累計違反: ${this.violations.length}件`);
      
      // 最近の違反表示
      const recentViolations = this.violations.slice(-3);
      if (recentViolations.length > 0) {
        console.log('🔥 最近の違反:');
        recentViolations.forEach(v => {
          console.log(`   ${v.project}/${v.file}: ${v.violations.length}件`);
        });
      }
      
      console.log('');
    }, 300000); // 5分間隔
  }

  /**
   * 🛑 監視停止
   */
  stopMonitoring() {
    console.log('');
    console.log('🛑 ガードレール監視システム停止中...');
    
    this.watchers.forEach(({ projectName, watcher }) => {
      watcher.close();
      console.log(`✅ ${projectName} 監視停止`);
    });
    
    console.log(`📊 最終レポート:`);
    console.log(`   監視時間: ${Math.floor((new Date() - this.lastCheck) / 1000)}秒`);
    console.log(`   累計違反: ${this.violations.length}件`);
    
    process.exit(0);
  }
}

// メイン実行
if (require.main === module) {
  const monitor = new ContinuousGuardrailsMonitor();
  monitor.startMonitoring().catch(error => {
    console.error('💥 監視システムエラー:', error);
    process.exit(1);
  });
}

module.exports = ContinuousGuardrailsMonitor; 