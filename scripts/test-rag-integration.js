#!/usr/bin/env node
// 🧪 RAG統合システムテスト
// 139ファイル横断検索 + 「ことわり」システム検証

const { IntegratedRAGSearchEngine } = require('../src/rag-integration/search-engine');

console.log('🧪 RAG統合システムテスト開始');

async function testRAGIntegration() {
  try {
    const ragEngine = new IntegratedRAGSearchEngine();
    
    console.log('\n📊 システム統計確認');
    const stats = ragEngine.getSearchStats();
    console.log(`総ドキュメント数: ${stats.totalDocuments}`);
    console.log(`プロジェクト数: ${Object.keys(stats.projectBreakdown).length}`);
    console.log(`カテゴリ数: ${stats.categories.length}`);
    
    Object.keys(stats.projectBreakdown).forEach(project => {
      console.log(`  ${project}: ${stats.projectBreakdown[project].count}ファイル`);
    });
    
    console.log('\n🔍 Test 1: hotel-saas特化検索');
    const saasResult = await ragEngine.searchByProject('hotel-saas', 'authentication login UI');
    console.log(`結果: ${saasResult.totalMatches}件マッチ`);
    if (saasResult.topDocuments.length > 0) {
      console.log(`最適: ${saasResult.topDocuments[0].file} (${saasResult.topDocuments[0].score}pt)`);
    }
    
    console.log('\n🔍 Test 2: プロジェクト横断検索 (pricing)');
    const pricingResult = await ragEngine.searchAcrossProjects('pricing 料金 price');
    console.log(`結果: ${pricingResult.totalMatches}件マッチ`);
    console.log(`プロジェクト分布:`);
    Object.keys(pricingResult.projectMatches).forEach(project => {
      console.log(`  ${project}: ${pricingResult.projectMatches[project].length}件`);
    });
    
    console.log('\n🔍 Test 3: カテゴリ特化検索 (CRM)');
    const crmResult = await ragEngine.searchByCategory('crm');
    console.log(`CRMカテゴリ: ${crmResult.totalDocs}ドキュメント`);
    
    console.log('\n🔍 Test 4: 統合検索 (database integration)');
    const dbResult = await ragEngine.searchAcrossProjects('database integration prisma postgresql');
    console.log(`データベース統合: ${dbResult.totalMatches}件マッチ`);
    if (dbResult.topDocuments.length > 0) {
      console.log(`最適: ${dbResult.topDocuments[0].file} (${dbResult.topDocuments[0].project})`);
    }
    
    console.log('\n✅ RAG統合システムテスト完了');
    console.log('🎯 「ことわり」システム準備完了');
    
    return {
      stats: stats,
      testResults: {
        saasSpecific: saasResult.totalMatches,
        crossProject: pricingResult.totalMatches,
        categorySearch: crmResult.totalDocs,
        integrationSearch: dbResult.totalMatches
      }
    };
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    throw error;
  }
}

if (require.main === module) {
  testRAGIntegration()
    .then(result => {
      console.log('\n🏆 テスト結果サマリー:');
      console.log(`  hotel-saas特化: ${result.testResults.saasSpecific}件`);
      console.log(`  プロジェクト横断: ${result.testResults.crossProject}件`);
      console.log(`  カテゴリ検索: ${result.testResults.categorySearch}件`);
      console.log(`  統合検索: ${result.testResults.integrationSearch}件`);
    })
    .catch(error => {
      process.exit(1);
    });
}

module.exports = { testRAGIntegration }; 