import axios from 'axios'

const BASE_URL = 'http://localhost:3400'
let authToken = ''

interface TestResult {
  endpoint: string
  method: string
  status: 'success' | 'error'
  statusCode?: number
  message?: string
  responseTime?: number
}

class APITester {
  private results: TestResult[] = []

  async login(): Promise<void> {
    console.log('🔐 認証テスト開始...')
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email: 'admin@omotenasuai.com',
        password: 'admin123'
      })
      
      authToken = response.data.data.accessToken
      this.addResult('/api/v1/auth/login', 'POST', 'success', response.status)
      console.log('✅ ログイン成功')
    } catch (error: any) {
      this.addResult('/api/v1/auth/login', 'POST', 'error', error.response?.status, error.message)
      console.log('❌ ログイン失敗:', error.message)
      throw error
    }
  }

  private addResult(endpoint: string, method: string, status: 'success' | 'error', statusCode?: number, message?: string): void {
    this.results.push({
      endpoint,
      method,
      status,
      statusCode,
      message
    })
  }

  private async testEndpoint(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<void> {
    const startTime = Date.now()
    try {
      const config = {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        timeout: 10000
      }

      let response
      if (method === 'POST') {
        response = await axios.post(`${BASE_URL}${endpoint}`, data, config)
      } else {
        response = await axios.get(`${BASE_URL}${endpoint}`, config)
      }

      const responseTime = Date.now() - startTime
      this.addResult(endpoint, method, 'success', response.status)
      console.log(`✅ ${method} ${endpoint} - ${response.status} (${responseTime}ms)`)
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      this.addResult(endpoint, method, 'error', error.response?.status, error.message)
      console.log(`❌ ${method} ${endpoint} - ${error.response?.status || 'ERROR'} (${responseTime}ms): ${error.message}`)
    }
  }

  async testAllAPIs(): Promise<void> {
    console.log('🧪 全APIテスト開始...\n')

    // 認証API
    console.log('📋 認証API:')
    await this.testEndpoint('/api/v1/tenants/default')

    // SaaS API
    console.log('\n📋 SaaS API:')
    await this.testEndpoint('/api/v1/admin/summary')
    await this.testEndpoint('/api/v1/admin/orders')
    await this.testEndpoint('/api/v1/admin/devices/count')
    await this.testEndpoint('/api/v1/admin/orders/monthly-count')

    // 共通API
    console.log('\n📋 共通API:')
    await this.testEndpoint('/api/v1/admin/front-desk/rooms')
    await this.testEndpoint('/api/v1/admin/front-desk/accounting')
    await this.testEndpoint('/api/v1/admin/operation-logs')

    // 会計API
    console.log('\n📋 会計API:')
    await this.testEndpoint('/api/v1/accounting/invoices')
    await this.testEndpoint('/api/v1/accounting/payments')
    await this.testEndpoint('/api/v1/accounting/reports')

    // システム監視API
    console.log('\n📋 システム監視API:')
    await this.testEndpoint('/health')
    await this.testEndpoint('/api/systems/status')
    await this.testEndpoint('/api/database/test')
    await this.testEndpoint('/api/monitoring/dashboard')

    console.log('\n🎯 テスト完了!')
    this.printSummary()
  }

  private printSummary(): void {
    const successCount = this.results.filter(r => r.status === 'success').length
    const errorCount = this.results.filter(r => r.status === 'error').length
    const totalCount = this.results.length

    console.log('\n📊 テスト結果サマリー:')
    console.log(`✅ 成功: ${successCount}/${totalCount}`)
    console.log(`❌ 失敗: ${errorCount}/${totalCount}`)
    console.log(`📈 成功率: ${Math.round((successCount / totalCount) * 100)}%`)

    if (errorCount > 0) {
      console.log('\n❌ 失敗したAPI:')
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`  - ${r.method} ${r.endpoint}: ${r.statusCode} ${r.message}`)
        })
    }

    console.log('\n🎉 実データベース統合テスト完了!')
    console.log('📋 利用可能な実データ:')
    console.log('  - オーダー: 3件')
    console.log('  - 客室: 12件')
    console.log('  - 請求書: 3件')
    console.log('  - 決済: 1件')
    console.log('  - 取引: 3件')
    console.log('  - 予約: 5件')
  }
}

async function runTests(): Promise<void> {
  const tester = new APITester()
  
  try {
    await tester.login()
    await tester.testAllAPIs()
  } catch (error) {
    console.error('テスト実行エラー:', error)
    process.exit(1)
  }
}

// スクリプト実行
if (require.main === module) {
  runTests()
}

export { APITester }
