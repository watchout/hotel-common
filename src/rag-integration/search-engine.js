// 🔥 RAG統合検索エンジン
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
    console.log(`🔍 横断検索実行: "${query}"`);
    
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
    
    console.log(`✅ 検索完了: ${results.totalMatches}件マッチ`);
    
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
