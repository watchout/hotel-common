/**
 * 通知システム簡易テスト
 * 
 * 通知プロバイダーの基本機能をテストします。
 * 外部依存を最小限にして実行できる簡易テストです。
 */

/**
 * モックメールプロバイダー
 */
class MockEmailProvider {
  constructor() {
    console.log('📧 モックメールプロバイダー初期化')
  }
  
  async sendEmail(data) {
    const messageId = `email-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    
    console.log('📧 メール送信:')
    console.log(`- 宛先: ${data.to.join(', ')}`)
    console.log(`- 件名: ${data.subject}`)
    console.log(`- 本文: ${data.body.substring(0, 50)}...`)
    
    return {
      success: true,
      messageId,
      provider: 'mock-email'
    }
  }
}

/**
 * モックSMSプロバイダー
 */
class MockSMSProvider {
  constructor() {
    console.log('📱 モックSMSプロバイダー初期化')
  }
  
  async sendSMS(data) {
    const messageId = `sms-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    
    console.log('📱 SMS送信:')
    console.log(`- 宛先: ${data.to.join(', ')}`)
    console.log(`- 本文: ${data.body}`)
    
    return {
      success: true,
      messageId,
      provider: 'mock-sms'
    }
  }
}

/**
 * モックプッシュ通知プロバイダー
 */
class MockPushProvider {
  constructor() {
    console.log('🔔 モックプッシュ通知プロバイダー初期化')
  }
  
  async sendPush(data) {
    const messageId = `push-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    
    console.log('🔔 プッシュ通知送信:')
    console.log(`- 宛先: ${data.to.join(', ')}`)
    console.log(`- タイトル: ${data.title}`)
    console.log(`- 本文: ${data.body}`)
    console.log(`- データ: ${JSON.stringify(data.data || {})}`)
    
    return {
      success: true,
      messageId,
      provider: 'mock-push',
      successCount: data.to.length
    }
  }
}

/**
 * モックWebhookプロバイダー
 */
class MockWebhookProvider {
  constructor(config) {
    console.log('🌐 モックWebhookプロバイダー初期化')
    this.endpoints = config.endpoints || []
  }
  
  async sendWebhooks(data) {
    console.log('🌐 Webhook送信:')
    console.log(`- エンドポイント数: ${this.endpoints.length}`)
    console.log(`- イベント: ${data.event}`)
    console.log(`- ペイロード: ${JSON.stringify(data.payload)}`)
    
    return this.endpoints.map(endpoint => ({
      success: true,
      endpoint,
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 100) + 50
    }))
  }
}

/**
 * 簡易通知サービス
 */
class SimpleNotificationService {
  constructor() {
    this.emailProvider = new MockEmailProvider()
    this.smsProvider = new MockSMSProvider()
    this.pushProvider = new MockPushProvider()
    this.webhookProvider = new MockWebhookProvider({
      endpoints: ['http://localhost:3400/webhook']
    })
    
    console.log('🚀 簡易通知サービス初期化完了')
  }
  
  /**
   * テンプレート変数置換
   */
  replaceTemplateVariables(template, variables) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim()
      return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match
    })
  }
  
  /**
   * メール送信
   */
  async sendEmail(to, templateId, variables) {
    // テンプレート（実際にはDBやファイルから取得）
    const templates = {
      reservation_confirmation: {
        subject: '予約確認: {{reservation_id}}',
        body: `
          {{name}}様
          
          ご予約いただきありがとうございます。
          予約ID: {{reservation_id}}
          チェックイン日: {{check_in_date}}
          
          ご不明な点がございましたらお問い合わせください。
          
          ホテルコモン
        `
      },
      password_reset: {
        subject: 'パスワードリセット',
        body: `
          {{name}}様
          
          パスワードリセットのリクエストを受け付けました。
          以下のリンクからパスワードをリセットしてください。
          
          {{reset_link}}
          
          このリクエストに心当たりがない場合は、このメールを無視してください。
          
          ホテルコモン
        `
      }
    }
    
    const template = templates[templateId]
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }
    
    // テンプレート変数置換
    const subject = this.replaceTemplateVariables(template.subject, variables)
    const body = this.replaceTemplateVariables(template.body, variables)
    
    // メール送信
    return await this.emailProvider.sendEmail({
      to: Array.isArray(to) ? to : [to],
      subject,
      body,
      html: true
    })
  }
  
  /**
   * SMS送信
   */
  async sendSMS(to, templateId, variables) {
    // テンプレート（実際にはDBやファイルから取得）
    const templates = {
      check_in_reminder: '{{name}}様、明日はチェックイン日です。予約ID: {{reservation_id}}。お待ちしております。',
      verification_code: '認証コード: {{code}}（有効期限: 10分）'
    }
    
    const template = templates[templateId]
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }
    
    // テンプレート変数置換
    const body = this.replaceTemplateVariables(template, variables)
    
    // SMS送信
    return await this.smsProvider.sendSMS({
      to: Array.isArray(to) ? to : [to],
      body
    })
  }
  
  /**
   * プッシュ通知送信
   */
  async sendPushNotification(to, templateId, variables) {
    // テンプレート（実際にはDBやファイルから取得）
    const templates = {
      reservation_reminder: {
        title: '予約リマインダー',
        body: '{{name}}様、明日はチェックイン日です。予約ID: {{reservation_id}}',
        data: {
          action: 'view_reservation',
          reservation_id: '{{reservation_id}}'
        }
      },
      new_message: {
        title: '新着メッセージ',
        body: '{{sender}}から新しいメッセージがあります',
        data: {
          action: 'view_message',
          message_id: '{{message_id}}'
        }
      }
    }
    
    const template = templates[templateId]
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }
    
    // テンプレート変数置換
    const title = this.replaceTemplateVariables(template.title, variables)
    const body = this.replaceTemplateVariables(template.body, variables)
    
    // データオブジェクトの各値も変数置換
    const data = {}
    for (const [key, value] of Object.entries(template.data)) {
      data[key] = typeof value === 'string' 
        ? this.replaceTemplateVariables(value, variables)
        : value
    }
    
    // プッシュ通知送信
    return await this.pushProvider.sendPush({
      to: Array.isArray(to) ? to : [to],
      title,
      body,
      data
    })
  }
  
  /**
   * Webhook送信
   */
  async sendWebhook(eventName, payload) {
    return await this.webhookProvider.sendWebhooks({
      event: eventName,
      payload,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'hotel-common'
      }
    })
  }
}

/**
 * テスト実行
 */
async function runTests() {
  console.log('🧪 通知システム簡易テスト開始\n')
  
  const notificationService = new SimpleNotificationService()
  
  // テスト用データ
  const testData = {
    email: 'test@example.com',
    phone: '+81901234567',
    deviceToken: 'device_token_123',
    variables: {
      name: '山田太郎',
      reservation_id: 'R12345',
      check_in_date: '2025-02-01',
      reset_link: 'https://hotel-common.jp/reset?token=abc123',
      code: '123456',
      sender: 'フロント',
      message_id: 'M67890'
    }
  }
  
  console.log('\n----- メール通知テスト -----')
  await notificationService.sendEmail(
    testData.email,
    'reservation_confirmation',
    testData.variables
  )
  
  console.log('\n----- SMS通知テスト -----')
  await notificationService.sendSMS(
    testData.phone,
    'check_in_reminder',
    testData.variables
  )
  
  console.log('\n----- プッシュ通知テスト -----')
  await notificationService.sendPushNotification(
    testData.deviceToken,
    'reservation_reminder',
    testData.variables
  )
  
  console.log('\n----- Webhook通知テスト -----')
  await notificationService.sendWebhook(
    'reservation.created',
    {
      id: testData.variables.reservation_id,
      customer_name: testData.variables.name,
      check_in_date: testData.variables.check_in_date
    }
  )
  
  console.log('\n✅ 全テスト完了')
}

// コマンドラインから直接実行された場合
if (require.main === module) {
  runTests().catch(error => {
    console.error('テスト実行エラー:', error)
  })
}

module.exports = { SimpleNotificationService, runTests }
