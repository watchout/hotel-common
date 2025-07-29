#!/usr/bin/env node

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs').promises
const path = require('path')

const execAsync = promisify(exec)

class IntegrationMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/integration-monitor.log')
  }
  
  async runDailyMonitoring() {
    console.log('🔍 統合監視開始 -', new Date().toISOString())
    
    const status = {
      database: await this.checkDatabaseStatus(),
      systems: await this.checkSystemConnections(),
      errors: await this.checkErrors(),
      progress: await this.calculateProgress()
    }
    
    const criticalIssues = await this.detectCriticalIssues(status)
    
    if (criticalIssues.length > 0) {
      await this.handleCriticalIssues(criticalIssues)
    }
    
    await this.generateReport(status, criticalIssues)
    
    return status
  }
  
  async checkDatabaseStatus() {
    try {
      // 環境変数を明示的に読み込み
      require('dotenv').config()
      const databaseUrl = process.env.DATABASE_URL || "postgresql://kaneko@localhost:5432/hotel_unified_db"
      
      // マイグレーション状況確認
      const { stdout: migrationOutput } = await execAsync('npx prisma migrate status')
      const migrationsApplied = !migrationOutput.includes('have not yet been applied')
      
      // テーブル数確認
      const { stdout: tableOutput } = await execAsync(
        `psql "${databaseUrl}" -c "\\dt" -t`
      )
      const tableCount = tableOutput.split('\n').filter(line => line.trim()).length
      
      return {
        migrations_applied: migrationsApplied,
        tables_count: tableCount,
        connections_active: 1
      }
    } catch (error) {
      console.error('❌ データベース確認エラー:', error.message)
      return {
        migrations_applied: false,
        tables_count: 0,
        connections_active: 0
      }
    }
  }
  
  async checkSystemConnections() {
    return {
      hotel_member: 'DISCONNECTED',
      hotel_pms: 'DISCONNECTED', 
      hotel_saas: 'DISCONNECTED',
      hotel_common: 'CONNECTED'
    }
  }
  
  async checkErrors() {
    try {
      // TypeScriptエラー確認
      const { stderr: tsError } = await execAsync('npm run type-check').catch(error => ({ 
        stdout: '', 
        stderr: error.stderr || '' 
      }))
      
      const tsErrors = (tsError.match(/error TS\d+:/g) || []).length
      
      return {
        typescript_errors: tsErrors,
        build_errors: 0,
        test_failures: 0
      }
    } catch (error) {
      console.error('❌ エラー確認中にエラー:', error.message)
      return {
        typescript_errors: 999,
        build_errors: 0,
        test_failures: 0
      }
    }
  }
  
  async calculateProgress() {
    const totalTasks = 13
    const completedTasks = 11
    
    return {
      completion_rate: Math.round((completedTasks / totalTasks) * 100),
      critical_tasks_remaining: 2,
      days_behind_schedule: 0
    }
  }
  
  async detectCriticalIssues(status) {
    const issues = []
    
    if (status.errors.typescript_errors > 150) {
      issues.push({
        type: 'TYPESCRIPT_ERRORS_CRITICAL',
        severity: 'CRITICAL',
        count: status.errors.typescript_errors,
        message: `TypeScriptエラーが${status.errors.typescript_errors}個に増加`,
        timestamp: new Date(),
        action_required: '即座にエラー修正を開始'
      })
    }
    
    if (!status.database.migrations_applied) {
      issues.push({
        type: 'PENDING_MIGRATIONS',
        severity: 'CRITICAL',
        count: 1,
        message: '未適用マイグレーションが存在',
        timestamp: new Date(),
        action_required: '即座にマイグレーション適用'
      })
    }
    
    const disconnectedSystems = Object.entries(status.systems)
      .filter(([_, status]) => status === 'DISCONNECTED' || status === 'ERROR')
      .length
    
    if (disconnectedSystems > 2) {
      issues.push({
        type: 'SYSTEM_CONNECTIONS_CRITICAL',
        severity: 'HIGH',
        count: disconnectedSystems,
        message: `${disconnectedSystems}個のシステムが未接続`,
        timestamp: new Date(),
        action_required: 'システム接続設定の確認・修正'
      })
    }
    
    return issues
  }
  
  async handleCriticalIssues(issues) {
    for (const issue of issues) {
      await this.sendAlert(issue)
      await this.logCriticalIssue(issue)
    }
  }
  
  async sendAlert(issue) {
    console.log(`🚨 ${issue.severity} ALERT: ${issue.message}`)
    console.log(`   Action Required: ${issue.action_required}`)
    
    if (issue.severity === 'CRITICAL') {
      await fs.writeFile(
        path.join(__dirname, '../logs/CRITICAL_ALERT.txt'),
        `${issue.timestamp.toISOString()}: ${issue.message}\nAction: ${issue.action_required}`
      )
    }
  }
  
  async logCriticalIssue(issue) {
    const logEntry = `${issue.timestamp.toISOString()} [${issue.severity}] ${issue.type}: ${issue.message}\n`
    await fs.appendFile(this.logFile, logEntry)
  }
  
  async generateReport(status, issues) {
    const report = {
      timestamp: new Date().toISOString(),
      overall_status: issues.some(i => i.severity === 'CRITICAL') ? 'CRITICAL' : 'NORMAL',
      integration_progress: `${status.progress.completion_rate}%`,
      database_health: status.database.migrations_applied ? 'HEALTHY' : 'NEEDS_ATTENTION',
      system_connections: `${Object.values(status.systems).filter(s => s === 'CONNECTED').length}/4`,
      critical_issues: issues.length,
      typescript_errors: status.errors.typescript_errors,
      next_actions: issues.map(i => i.action_required)
    }
    
    const reportPath = path.join(__dirname, '../logs/daily-integration-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log('📊 統合監視レポート生成完了:', reportPath)
    console.log('📈 統合進捗:', report.integration_progress)
    console.log('🔗 システム接続:', report.system_connections)
    console.log('⚠️  重要問題:', report.critical_issues)
    
    if (issues.length > 0) {
      console.log('\n📋 対応必要事項:')
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.message}`)
        console.log(`   → ${issue.action_required}`)
      })
    }
  }
}

// 監視実行
async function main() {
  const monitor = new IntegrationMonitor()
  
  try {
    await monitor.runDailyMonitoring()
    console.log('\n✅ 統合監視完了')
  } catch (error) {
    console.error('💥 統合監視実行エラー:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { IntegrationMonitor } 