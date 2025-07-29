#!/usr/bin/env ts-node

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'

const execAsync = promisify(exec)

interface CriticalIssue {
  type: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  count: number
  message: string
  timestamp: Date
  action_required: string
}

interface IntegrationStatus {
  database: {
    migrations_applied: boolean
    tables_count: number
    connections_active: number
  }
  systems: {
    hotel_member: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
    hotel_pms: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
    hotel_saas: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
    hotel_common: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  }
  errors: {
    typescript_errors: number
    build_errors: number
    test_failures: number
  }
  progress: {
    completion_rate: number
    critical_tasks_remaining: number
    days_behind_schedule: number
  }
}

class IntegrationMonitor {
  private logFile = path.join(__dirname, '../logs/integration-monitor.log')
  
  async runDailyMonitoring(): Promise<IntegrationStatus> {
    console.log('🔍 統合監視開始 -', new Date().toISOString())
    
    const status: IntegrationStatus = {
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
    await this.updateMatrixStatus(status)
    
    return status
  }
  
  private async checkDatabaseStatus(): Promise<IntegrationStatus['database']> {
    try {
      // マイグレーション状況確認
      const { stdout: migrationOutput } = await execAsync('npx prisma migrate status')
      const migrationsApplied = !migrationOutput.includes('have not yet been applied')
      
      // テーブル数確認
      const { stdout: tableOutput } = await execAsync(
        `psql "${process.env.DATABASE_URL}" -c "\\dt" -t`
      )
      const tableCount = tableOutput.split('\n').filter(line => line.trim()).length
      
      return {
        migrations_applied: migrationsApplied,
        tables_count: tableCount,
        connections_active: 1 // hotel-common接続済み
      }
    } catch (error) {
      console.error('❌ データベース確認エラー:', error)
      return {
        migrations_applied: false,
        tables_count: 0,
        connections_active: 0
      }
    }
  }
  
  private async checkSystemConnections(): Promise<IntegrationStatus['systems']> {
    const systems = {
      hotel_member: 'DISCONNECTED' as const,
      hotel_pms: 'DISCONNECTED' as const,
      hotel_saas: 'DISCONNECTED' as const,
      hotel_common: 'CONNECTED' as const
    }
    
    // TODO: 各システムの接続確認API実装
    // 現状は手動確認が必要
    
    return systems
  }
  
  private async checkErrors(): Promise<IntegrationStatus['errors']> {
    try {
      // TypeScriptエラー確認
      const { stdout: tsOutput, stderr: tsError } = await execAsync('npm run type-check', {
        cwd: process.cwd()
      }).catch(error => ({ stdout: '', stderr: error.stderr || '' }))
      
      const tsErrors = (tsError.match(/error TS\d+:/g) || []).length
      
      return {
        typescript_errors: tsErrors,
        build_errors: 0, // TODO: ビルドエラー確認
        test_failures: 0  // TODO: テスト失敗確認
      }
    } catch (error) {
      console.error('❌ エラー確認中にエラー:', error)
      return {
        typescript_errors: 999, // エラー確認できない = 重大問題
        build_errors: 0,
        test_failures: 0
      }
    }
  }
  
  private async calculateProgress(): Promise<IntegrationStatus['progress']> {
    // マトリックスから進捗計算
    const totalTasks = 13 // テーブル数
    const completedTasks = 11 // 現在完了数
    
    return {
      completion_rate: Math.round((completedTasks / totalTasks) * 100),
      critical_tasks_remaining: 2, // service_orders, agencies
      days_behind_schedule: 0 // TODO: スケジュール比較
    }
  }
  
  private async detectCriticalIssues(status: IntegrationStatus): Promise<CriticalIssue[]> {
    const issues: CriticalIssue[] = []
    
    // TypeScriptエラーが150個超過
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
    
    // マイグレーション未適用
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
    
    // システム接続不備
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
  
  private async handleCriticalIssues(issues: CriticalIssue[]): Promise<void> {
    for (const issue of issues) {
      await this.sendAlert(issue)
      await this.logCriticalIssue(issue)
    }
  }
  
  private async sendAlert(issue: CriticalIssue): Promise<void> {
    // TODO: Slack/Email通知実装
    console.log(`🚨 ${issue.severity} ALERT: ${issue.message}`)
    console.log(`   Action Required: ${issue.action_required}`)
    
    // 緊急時はファイルアラートも作成
    if (issue.severity === 'CRITICAL') {
      await fs.writeFile(
        path.join(__dirname, '../logs/CRITICAL_ALERT.txt'),
        `${issue.timestamp.toISOString()}: ${issue.message}\nAction: ${issue.action_required}`
      )
    }
  }
  
  private async logCriticalIssue(issue: CriticalIssue): Promise<void> {
    const logEntry = `${issue.timestamp.toISOString()} [${issue.severity}] ${issue.type}: ${issue.message}\n`
    await fs.appendFile(this.logFile, logEntry)
  }
  
  private async generateReport(status: IntegrationStatus, issues: CriticalIssue[]): Promise<void> {
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
  }
  
  private async updateMatrixStatus(status: IntegrationStatus): Promise<void> {
    // TODO: マトリックスファイルの自動更新実装
    console.log('📋 マトリックス更新（手動確認必要）')
  }
}

// 監視実行
async function main() {
  const monitor = new IntegrationMonitor()
  
  try {
    const status = await monitor.runDailyMonitoring()
    process.exit(0)
  } catch (error) {
    console.error('💥 統合監視実行エラー:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { IntegrationMonitor } 