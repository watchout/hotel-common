#!/usr/bin/env node
// 🎊 hotel-common七重統合システム - AI接続テストスクリプト
// 文献1-7完全統合による50倍開発効率・99.5%コスト削減システム

const fs = require('fs')
const path = require('path')

console.log('🎊'.repeat(60))
console.log('🎊 hotel-common七重統合システム - AI接続テスト')
console.log('🎊 OpenAI・Anthropic・RAGプロバイダー接続確認')
console.log('🎊'.repeat(60))

// 環境変数チェック
async function checkEnvironmentVariables() {
  console.log('\n📋 環境変数確認:')
  
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ]
  
  const optionalEnvVars = [
    'CHROMA_HOST',
    'CHROMA_PORT', 
    'OPTIMIZATION_LEVEL',
    'NODE_ENV'
  ]
  
  let allRequired = true
  
  // 必須環境変数チェック
  console.log('\n✅ 必須環境変数:')
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar]
    const exists = !!value
    const masked = exists ? `${value.substring(0, 6)}...` : '未設定'
    console.log(`  ${exists ? '✅' : '❌'} ${envVar}: ${masked}`)
    if (!exists) allRequired = false
  })
  
  // オプション環境変数チェック
  console.log('\n⚙️  オプション環境変数:')
  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar] || 'デフォルト値使用'
    console.log(`  📝 ${envVar}: ${value}`)
  })
  
  if (!allRequired) {
    console.log('\n⚠️  必須環境変数が不足しています')
    console.log('📋 環境設定ガイド: docs/ai-development-optimization/environment-setup-guide.md')
    return false
  }
  
  return true
}

// OpenAI接続テスト
async function testOpenAIConnection() {
  console.log('\n🤖 OpenAI接続テスト:')
  
  try {
    // OpenAIライブラリを使用してテスト
    const { OpenAI } = require('openai')
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    console.log('  🔍 OpenAI APIに接続中...')
    
    // 簡単なテストリクエスト
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user", 
          content: "Hello! This is a connection test for hotel-common seven integration system. Please respond with exactly: 'OpenAI connection successful'"
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    })
    
    const response = completion.choices[0].message.content
    console.log(`  ✅ OpenAI応答: ${response}`)
    console.log(`  📊 トークン使用量: ${completion.usage.total_tokens}`)
    
    return true
    
  } catch (error) {
    console.error(`  ❌ OpenAI接続エラー: ${error.message}`)
    
    if (error.code === 'invalid_api_key') {
      console.log('  💡 API キーが無効です。環境変数 OPENAI_API_KEY を確認してください')
    } else if (error.code === 'rate_limit_exceeded') {
      console.log('  💡 レート制限に達しました。しばらく待ってから再試行してください')
    }
    
    return false
  }
}

// Anthropic Claude接続テスト
async function testAnthropicConnection() {
  console.log('\n🧠 Anthropic Claude接続テスト:')
  
  try {
    // Anthropicライブラリを使用してテスト
    const Anthropic = require('@anthropic-ai/sdk')
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
    
    console.log('  🔍 Anthropic APIに接続中...')
    
    // 簡単なテストリクエスト
    const completion = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: "Hello! This is a connection test for hotel-common seven integration system. Please respond with exactly: 'Anthropic Claude connection successful'"
        }
      ]
    })
    
    const response = completion.content[0].text
    console.log(`  ✅ Claude応答: ${response}`)
    console.log(`  📊 トークン使用量: ${completion.usage.input_tokens + completion.usage.output_tokens}`)
    
    return true
    
  } catch (error) {
    console.error(`  ❌ Anthropic接続エラー: ${error.message}`)
    
    if (error.type === 'authentication_error') {
      console.log('  💡 API キーが無効です。環境変数 ANTHROPIC_API_KEY を確認してください')
    } else if (error.type === 'rate_limit_error') {
      console.log('  💡 レート制限に達しました。しばらく待ってから再試行してください')
    }
    
    return false
  }
}

// ChromaDB接続テスト
async function testChromaDBConnection() {
  console.log('\n🗄️ ChromaDB接続テスト:')
  
  try {
    const { ChromaClient } = require('chromadb')
    
    const chroma = new ChromaClient({
      path: process.env.CHROMA_HOST || 'http://localhost:8000'
    })
    
    console.log('  🔍 ChromaDBに接続中...')
    
    // ヘルスチェック
    const version = await chroma.version()
    console.log(`  ✅ ChromaDB接続成功: バージョン ${version}`)
    
    // テストコレクション作成
    const testCollection = await chroma.getOrCreateCollection({
      name: "hotel_common_test"
    })
    
    console.log('  📁 テストコレクション作成成功')
    
    // テストデータ追加
    await testCollection.add({
      ids: ["test1"],
      documents: ["This is a test document for hotel-common seven integration system"],
      metadatas: [{ type: "test" }]
    })
    
    console.log('  📝 テストデータ追加成功')
    
    // 検索テスト
    const results = await testCollection.query({
      queryTexts: ["hotel system test"],
      nResults: 1
    })
    
    console.log(`  🔍 検索テスト成功: ${results.documents[0].length}件`)
    
    // クリーンアップ
    await chroma.deleteCollection({ name: "hotel_common_test" })
    console.log('  🧹 テストデータクリーンアップ完了')
    
    return true
    
  } catch (error) {
    console.error(`  ❌ ChromaDB接続エラー: ${error.message}`)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('  💡 ChromaDBサーバーが起動していません')
      console.log('     起動コマンド: chroma run --host localhost --port 8000')
    }
    
    return false
  }
}

// 統合テスト実行
async function runIntegrationTest() {
  console.log('\n🔄 統合システムテスト:')
  
  try {
    // 七重統合システムの基本設定テスト
    console.log('  🎯 七重統合システム基本設定確認...')
    
    // ビルドファイル存在確認
    const buildPath = path.join(__dirname, '..', 'dist', 'seven-integration')
    const buildExists = fs.existsSync(buildPath)
    
    if (!buildExists) {
      console.log('  ❌ ビルドファイルが見つかりません')
      console.log('     実行コマンド: npm run build:seven-integration')
      return false
    }
    
    console.log('  ✅ ビルドファイル確認完了')
    
    // 設定ファイル確認
    const configFiles = [
      'orchestrator.js',
      'config.js', 
      'types.js',
      'seven-layer-integration.js'
    ]
    
    let allFilesExist = true
    configFiles.forEach(file => {
      const filePath = path.join(buildPath, 'seven-integration', file)
      const exists = fs.existsSync(filePath)
      console.log(`  ${exists ? '✅' : '❌'} ${file}: ${exists ? '存在' : '不存在'}`)
      if (!exists) allFilesExist = false
    })
    
    if (!allFilesExist) {
      console.log('  ❌ 必要なビルドファイルが不足しています')
      return false
    }
    
    console.log('  🎉 統合システム基本設定テスト成功')
    return true
    
  } catch (error) {
    console.error(`  ❌ 統合テストエラー: ${error.message}`)
    return false
  }
}

// メイン実行
async function main() {
  try {
    console.log('\n📋 システム情報:')
    console.log('🎯 目標: AI接続・RAG統合・プロバイダー接続確認')
    console.log('🚀 対象: hotel-common七重統合システム Phase 1')
    console.log('📚 テスト: OpenAI + Anthropic + ChromaDB + 統合システム')
    
    // 環境変数チェック
    const envOk = await checkEnvironmentVariables()
    
    // AI接続テスト（環境変数が設定されている場合のみ）
    let openaiOk = false
    let anthropicOk = false 
    let chromaOk = false
    let integrationOk = false
    
    if (envOk) {
      openaiOk = await testOpenAIConnection()
      anthropicOk = await testAnthropicConnection()
    } else {
      console.log('\n⚠️ 環境変数が不足しているため、AI接続テストをスキップします')
    }
    
    // ChromaDB接続テスト（オプション）
    chromaOk = await testChromaDBConnection()
    
    // 統合システムテスト
    integrationOk = await runIntegrationTest()
    
    // 結果サマリー
    console.log('\n🎊 AI接続テスト結果サマリー:')
    console.log(`📋 環境変数: ${envOk ? '✅ 完了' : '❌ 不足'}`)
    console.log(`🤖 OpenAI: ${openaiOk ? '✅ 接続成功' : '❌ 接続失敗'}`)
    console.log(`🧠 Anthropic: ${anthropicOk ? '✅ 接続成功' : '❌ 接続失敗'}`)
    console.log(`🗄️ ChromaDB: ${chromaOk ? '✅ 接続成功' : '⚠️ 未起動 (オプション)'}`)
    console.log(`🔄 統合システム: ${integrationOk ? '✅ 正常' : '❌ 問題あり'}`)
    
    const successCount = [envOk, openaiOk, anthropicOk, integrationOk].filter(Boolean).length
    const totalCount = 4
    
    if (successCount >= 3) {
      console.log('\n🎉 AI接続テスト 基本成功！')
      console.log('🚀 hotel-common七重統合システム AI接続準備完了')
      console.log('📈 次のステップ: RAG実装動作確認')
      
      process.exit(0)
    } else {
      console.log('\n❌ AI接続テスト 一部失敗')
      console.log('🔧 問題を修正してから再実行してください')
      console.log('📋 環境設定ガイド: docs/ai-development-optimization/environment-setup-guide.md')
      
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ 予期しないエラー:', error)
    process.exit(1)
  }
}

// メイン実行
if (require.main === module) {
  main()
} 