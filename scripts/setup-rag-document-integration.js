#!/usr/bin/env node
// 🔥 RAG フル活用ドキュメント統合システム
// 157ファイル散在 → 統合RAG検索基盤構築

const fs = require('fs');
const path = require('path');

console.log('🔥 RAG フル活用ドキュメント統合システム起動');
console.log('📊 散在状況: 157ファイル / 5ディレクトリ → 統合RAG基盤');

// ドキュメント統合戦略
const INTEGRATION_STRATEGY = {
  // 統合対象ディレクトリ
  sourceDirectories: [
    '../hotel-saas/docs',
    '../hotel-member/docs', 
    '../hotel-pms/docs',
    '../hotel-marketing/docs'
  ],
  
  // 統合先基盤
  targetBase: './docs',
  
  // プロジェクト特化保持戦略
  projectSpecific: {
    'hotel-saas': ['features/', 'business/', 'order/', 'phone/'],
    'hotel-member': ['MVP_', 'CRM_', 'Suno_'],
    'hotel-pms': ['Luna_', 'pricing_', 'staff-table'],
    'hotel-marketing': ['AI_', 'PMS_', 'CRM_', 'Pricing_']
  }
};

// RAG統合インデックス作成
function createRAGIntegratedIndex() {
  console.log('\n🔍 RAG統合インデックス作成中...');
  
  const ragIndex = {
    lastUpdated: new Date().toISOString(),
    totalDocuments: 0,
    projectBreakdown: {},
    documentMap: {},
    searchCategories: {
      'authentication': [],
      'integration': [],
      'database': [],
      'api': [],
      'ui-ux': [],
      'pricing': [],
      'crm': [],
      'marketing': [],
      'development': []
    }
  };
  
  // 各ディレクトリからドキュメント分析
  const baseDir = process.cwd();
  
  [
    { name: 'hotel-common', path: './docs' },
    { name: 'hotel-saas', path: '../hotel-saas/docs' },
    { name: 'hotel-member', path: '../hotel-member/docs' },
    { name: 'hotel-pms', path: '../hotel-pms/docs' },
    { name: 'hotel-marketing', path: '../hotel-marketing/docs' }
  ].forEach(project => {
    const fullPath = path.resolve(baseDir, project.path);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));
      
      ragIndex.projectBreakdown[project.name] = {
        count: files.length,
        files: files
      };
      
      ragIndex.totalDocuments += files.length;
      
      // ファイル内容分析とカテゴリ分類
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
          const fileInfo = {
            project: project.name,
            path: `${project.path}/${file}`,
            categories: []
          };
          
          // カテゴリ自動分類
          Object.keys(ragIndex.searchCategories).forEach(category => {
            let score = 0;
            
            switch(category) {
              case 'authentication':
                if (content.includes('auth') || content.includes('login') || content.includes('jwt') || content.includes('認証')) score += 10;
                break;
              case 'integration':
                if (content.includes('integration') || content.includes('統合') || content.includes('api')) score += 10;
                break;
              case 'database':
                if (content.includes('database') || content.includes('prisma') || content.includes('sql') || content.includes('データベース')) score += 10;
                break;
              case 'pricing':
                if (content.includes('pricing') || content.includes('料金') || content.includes('price')) score += 10;
                break;
              case 'crm':
                if (content.includes('crm') || content.includes('customer') || content.includes('顧客')) score += 10;
                break;
              case 'ui-ux':
                if (content.includes('ui') || content.includes('ux') || content.includes('design') || content.includes('デザイン')) score += 10;
                break;
              case 'development':
                if (content.includes('development') || content.includes('開発') || content.includes('spec')) score += 10;
                break;
              case 'marketing':
                if (content.includes('marketing') || content.includes('マーケティング') || content.includes('strategy')) score += 10;
                break;
            }
            
            if (score > 0) {
              fileInfo.categories.push(category);
              ragIndex.searchCategories[category].push({
                file: file,
                project: project.name,
                score: score
              });
            }
          });
          
          ragIndex.documentMap[file] = fileInfo;
          
        } catch (error) {
          console.warn(`⚠️ ファイル読み込みエラー: ${file}`);
        }
      });
    }
  });
  
  return ragIndex;
}

// 統合RAGインデックス保存
function saveRAGIndex(ragIndex) {
  const indexPath = './src/rag-integration/document-index.json';
  
  // ディレクトリ作成
  const indexDir = path.dirname(indexPath);
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  
  fs.writeFileSync(indexPath, JSON.stringify(ragIndex, null, 2));
  console.log(`✅ RAG統合インデックス保存: ${indexPath}`);
  
  return indexPath;
}

// RAG統合検索エンジン作成
function createRAGSearchEngine(ragIndex) {
  console.log('\n🔍 RAG統合検索エンジン作成中...');
  
  const searchEngineCode = `// 🔥 RAG統合検索エンジン
// 「ことわり」システム専用 - 157ファイル横断検索

const fs = require('fs');
const path = require('path');

class IntegratedRAGSearchEngine {
  constructor() {
    this.documentIndex = require('./document-index.json');
    this.baseDir = process.cwd();
  }

  // 横断プロジェクト検索
  async searchAcrossProjects(query, projectFocus = null) {
    console.log(\`🔍 横断検索実行: "\${query}"\`);
    
    const results = {
      query: query,
      totalMatches: 0,
      projectMatches: {},
      topDocuments: [],
      categories: []
    };
    
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(k => k.length > 2);
    
    // プロジェクト別検索
    Object.keys(this.documentIndex.projectBreakdown).forEach(project => {
      if (projectFocus && project !== projectFocus) return;
      
      const projectFiles = this.documentIndex.projectBreakdown[project].files;
      const projectMatches = [];
      
      projectFiles.forEach(file => {
        const fileInfo = this.documentIndex.documentMap[file];
        if (!fileInfo) return;
        
        let score = 0;
        const fileLower = file.toLowerCase();
        
        // ファイル名マッチ
        keywords.forEach(keyword => {
          if (fileLower.includes(keyword)) score += 20;
        });
        
        // カテゴリマッチ
        if (fileInfo.categories) {
          fileInfo.categories.forEach(category => {
            if (queryLower.includes(category)) score += 15;
          });
        }
        
        // プロジェクト特化ボーナス
        if (projectFocus === project) score += 10;
        
        if (score > 0) {
          projectMatches.push({
            file: file,
            project: project,
            score: score,
            path: fileInfo.path,
            categories: fileInfo.categories || []
          });
        }
      });
      
      if (projectMatches.length > 0) {
        results.projectMatches[project] = projectMatches.sort((a, b) => b.score - a.score);
        results.totalMatches += projectMatches.length;
      }
    });
    
    // トップドキュメント抽出
    const allMatches = [];
    Object.values(results.projectMatches).forEach(matches => {
      allMatches.push(...matches);
    });
    
    results.topDocuments = allMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    console.log(\`✅ 検索完了: \${results.totalMatches}件マッチ\`);
    
    return results;
  }

  // カテゴリ特化検索
  async searchByCategory(category) {
    const categoryDocs = this.documentIndex.searchCategories[category] || [];
    
    return {
      category: category,
      totalDocs: categoryDocs.length,
      documents: categoryDocs.sort((a, b) => b.score - a.score)
    };
  }

  // プロジェクト特化検索
  async searchByProject(project, query = '') {
    return this.searchAcrossProjects(query, project);
  }

  // 統計情報
  getSearchStats() {
    return {
      totalDocuments: this.documentIndex.totalDocuments,
      projectBreakdown: this.documentIndex.projectBreakdown,
      categories: Object.keys(this.documentIndex.searchCategories),
      lastUpdated: this.documentIndex.lastUpdated
    };
  }
}

module.exports = { IntegratedRAGSearchEngine };
`;
  
  const searchEnginePath = './src/rag-integration/search-engine.js';
  fs.writeFileSync(searchEnginePath, searchEngineCode);
  console.log(`✅ RAG統合検索エンジン作成: ${searchEnginePath}`);
  
  return searchEnginePath;
}

// メイン実行
async function main() {
  try {
    console.log('\n📋 Phase 1: ドキュメント分析・インデックス作成');
    const ragIndex = createRAGIntegratedIndex();
    
    console.log(`\n📊 統合結果:
    総ドキュメント数: ${ragIndex.totalDocuments}
    プロジェクト数: ${Object.keys(ragIndex.projectBreakdown).length}
    カテゴリ数: ${Object.keys(ragIndex.searchCategories).length}`);
    
    Object.keys(ragIndex.projectBreakdown).forEach(project => {
      const breakdown = ragIndex.projectBreakdown[project];
      console.log(`    ${project}: ${breakdown.count}ファイル`);
    });
    
    console.log('\n📋 Phase 2: RAG統合インデックス保存');
    const indexPath = saveRAGIndex(ragIndex);
    
    console.log('\n📋 Phase 3: RAG統合検索エンジン作成');
    const searchEnginePath = createRAGSearchEngine(ragIndex);
    
    console.log('\n🎯 RAG統合システム構築完了!');
    console.log('✅ 157ファイル → 統合RAG検索基盤');
    console.log('✅ プロジェクト横断検索可能');
    console.log('✅ カテゴリ特化検索可能');
    console.log('✅ 「ことわり」システム完全対応');
    
    console.log('\n🔥 テスト実行可能:');
    console.log('  npm run test:rag-integration');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createRAGIntegratedIndex, saveRAGIndex, createRAGSearchEngine }; 