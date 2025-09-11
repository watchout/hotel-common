/**
 * 通知システムテスト
 * 
 * 各種通知プロバイダーのテストを行います。
 * 実際のAPIキーがない環境でもモックプロバイダーでテスト可能です。
 */

// 通知サービスとプロバイダー
const { getNotificationService } = require('../notifications/notification-service')
const { 
  createEmailProvider, 
  createSMSProvider,
  createPushProvider,
  createWebhookProvider,
  MockSMSProvider,
  MockPushProvider
} = require('../notifications/providers')

/**
 * メール通知テスト
 */
async function testEmailNotification() {
  console.log('📧 メール通知テスト開始')
  
  try {
    // SMTPプロバイダーを使用したテスト設定
    const mockEmailConfig = {
      provider: 'smtp',
      from: 'test@hotel-common.jp',
      host: 'localhost',
      port: 1025 // Mailhogなどのモックサーバー用ポート
    }
    
    // 通知サービス設定
    const notificationService = getNotificationService()
    notificationService.configure({
      email: mockEmailConfig
    })
    
    // テストメール送信
    console.log('- テストメール送信中...')
    const result = await notificationService.sendEmail(
      ['recipient@example.com'],
      'test_email_template',
      {
        name: 'テストユーザー',
        reservation_id: 'R12345',
        check_in_date: '2025-02-01'
      }
    )
    
    console.log(`- 送信結果: ${result ? '成功' : '失敗'}`)
    console.log('✅ メール通知テスト完了')
    
  } catch (error) {
    console.error('❌ メール通知テストエラー:', error)
  }
}

/**
 * SMS通知テスト
 */
async function testSMSNotification() {
  console.log('\n📱 SMS通知テスト開始')
  
  try {
    // モックSMSプロバイダー作成
    const mockSMSProvider = new MockSMSProvider({ provider: 'mock' })
    
    // テストSMS送信
    console.log('- テストSMS送信中...')
    const result = await mockSMSProvider.sendSMS({
      to: ['+81901234567'],
      body: 'これはテストSMSです。予約ID: R12345 のチェックイン日は2025-02-01です。'
    })
    
    console.log(`- 送信結果: ${result.success ? '成功' : '失敗'}`)
    console.log(`- メッセージID: ${result.messageId}`)
    console.log('✅ SMS通知テスト完了')
    
  } catch (error) {
    console.error('❌ SMS通知テストエラー:', error)
  }
}

/**
 * プッシュ通知テスト
 */
async function testPushNotification() {
  console.log('\n🔔 プッシュ通知テスト開始')
  
  try {
    // モックプッシュ通知プロバイダー作成
    const mockPushProvider = new MockPushProvider({ provider: 'mock' })
    
    // テストプッシュ通知送信
    console.log('- テストプッシュ通知送信中...')
    const result = await mockPushProvider.sendPush({
      to: ['device_token_1', 'device_token_2'],
      title: '予約確認',
      body: '予約ID: R12345 のチェックイン日は2025-02-01です。',
      data: {
        reservation_id: 'R12345',
        action: 'view_reservation'
      }
    })
    
    console.log(`- 送信結果: ${result.success ? '成功' : '失敗'}`)
    console.log(`- 成功数: ${result.successCount}`)
    console.log('✅ プッシュ通知テスト完了')
    
  } catch (error) {
    console.error('❌ プッシュ通知テストエラー:', error)
  }
}

/**
 * Webhook通知テスト
 */
async function testWebhookNotification() {
  console.log('\n🌐 Webhook通知テスト開始')
  
  try {
    // Webhookプロバイダー作成
    const webhookProvider = createWebhookProvider({
      endpoints: ['http://localhost:3400/webhook'],
      headers: {
        'X-API-Key': 'test_api_key'
      }
    })
    
    // モックサーバーがないためコンソール出力のみ
    console.log('- Webhook設定:')
    console.log('  - エンドポイント: http://localhost:3400/webhook')
    console.log('  - イベント: reservation.created')
    console.log('  - ペイロード: { id: "R12345", ... }')
    
    console.log('- 実際のサーバーがないため送信はスキップ')
    console.log('✅ Webhook通知テスト完了')
    
  } catch (error) {
    console.error('❌ Webhook通知テストエラー:', error)
  }
}

/**
 * 通知テンプレートテスト
 */
function testNotificationTemplates() {
  console.log('\n📝 通知テンプレートテスト開始')
  
  // テンプレート例
  const templates = {
    email: {
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
      }
    },
    sms: {
      check_in_reminder: '{{name}}様、明日はチェックイン日です。予約ID: {{reservation_id}}。お待ちしております。'
    }
  }
  
  // テンプレート変数置換テスト
  const variables = {
    name: '山田太郎',
    reservation_id: 'R12345',
    check_in_date: '2025-02-01'
  }
  
  console.log('- テンプレート変数置換テスト:')
  
  // 簡易置換関数
  function replaceVariables(template, vars) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return vars[key.trim()] || match
    })
  }
  
  // メールテンプレート
  const emailSubject = replaceVariables(templates.email.reservation_confirmation.subject, variables)
  const emailBody = replaceVariables(templates.email.reservation_confirmation.body, variables)
  
  console.log('  - メール件名: ' + emailSubject)
  console.log('  - メール本文: ' + emailBody.trim().split('\n')[0] + '...')
  
  // SMSテンプレート
  const smsBody = replaceVariables(templates.sms.check_in_reminder, variables)
  console.log('  - SMS本文: ' + smsBody)
  
  console.log('✅ 通知テンプレートテスト完了')
}

/**
 * 全テスト実行
 */
async function runAllTests() {
  console.log('🚀 通知システムテスト開始\n')
  
  // テンプレートテスト
  testNotificationTemplates()
  
  // 各プロバイダーテスト
  await testEmailNotification()
  await testSMSNotification()
  await testPushNotification()
  await testWebhookNotification()
  
  console.log('\n🏁 全テスト完了')
}

// コマンドラインから直接実行された場合
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('テスト実行エラー:', error)
  })
}

module.exports = {
  testEmailNotification,
  testSMSNotification,
  testPushNotification,
  testWebhookNotification,
  testNotificationTemplates,
  runAllTests
}
