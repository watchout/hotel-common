// 🔍 実際のRAGシステム - hotel-common知識ベース検索
// Custom Instructionsの擬似的指示を実際の検索に置換

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface RAGSearchParams {
  query: string;
  project: string;
  fileType: string;
  maxResults: number;
}

export interface RAGSearchResult {
  content: string;
  source: string;
  relevanceScore: number;
  type: 'documentation' | 'implementation' | 'best-practice';
}

export interface RAGResponse {
  results: RAGSearchResult[];
  totalFound: number;
  processingTime: number;
  tokensUsed: number;
}

/**
 * 実際のRAGシステム実装
 * hotel-common/docs から関連情報を実際に検索・抽出
 */
export class RealRAGService {
  private docsPath: string;
  private knowledgeIndex: Map<string, any>;
  private initialized: boolean = false;

  constructor() {
    this.docsPath = path.join(__dirname, '../../docs');
    this.knowledgeIndex = new Map();
  }

  /**
   * RAGシステム初期化
   * ドキュメントインデックス作成
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🔍 RAGシステム初期化開始...');
    const startTime = Date.now();

    try {
      // hotel-common/docs の全ファイルを索引化
      await this.indexDocuments();
      
      // 実装パターンの索引化
      await this.indexImplementationPatterns();
      
      // ベストプラクティスの索引化
      await this.indexBestPractices();

      this.initialized = true;
      const initTime = Date.now() - startTime;
      console.log(`✅ RAGシステム初期化完了 (${initTime}ms)`);
      
    } catch (error) {
      console.error('❌ RAGシステム初期化エラー:', error);
      throw error;
    }
  }

  /**
   * 実際の検索実行
   * Custom Instructionsの「参照せよ」を実際の検索に置換
   */
  async search(params: RAGSearchParams): Promise<RAGResponse> {
    await this.initialize();
    
    const startTime = Date.now();
    const searchTerms = this.extractSearchTerms(params.query);
    
    // 並列検索実行
    const results = await Promise.all([
      this.searchDocumentation(searchTerms, params),
      this.searchImplementations(searchTerms, params),
      this.searchBestPractices(searchTerms.join(' '), params.project || 'general')
    ]);

    // 結果統合・スコアリング
    const allResults = [...results[0], ...results[1], ...results[2]];
    const scoredResults = this.scoreAndRankResults(allResults, params.query);
    const topResults = scoredResults.slice(0, params.maxResults);

    const processingTime = Date.now() - startTime;
    const tokensUsed = this.calculateTokensUsed(topResults);

    return {
      results: topResults,
      totalFound: allResults.length,
      processingTime,
      tokensUsed
    };
  }

  /**
   * プロジェクト特化検索
   */
  async searchProjectSpecific(project: string, query: string): Promise<RAGSearchResult[]> {
    const projectDocs = await this.findProjectDocuments(project);
    return this.searchInDocuments(projectDocs, query);
  }

  /**
   * ベストプラクティス検索
   */
  async searchBestPractices(intent: string, project: string): Promise<RAGSearchResult[]> {
    const practiceFiles = [
      'ai-development-optimization/**/*.md',
      'system-integration-*.md',
      '**/best-practices*.md'
    ];

    const results: RAGSearchResult[] = [];
    
    for (const pattern of practiceFiles) {
      const files = await glob(pattern, { cwd: this.docsPath });
      for (const file of files) {
        const content = await this.readFileContent(file);
        if (this.isRelevantToBestPractice(content, intent, project)) {
          results.push({
            content: this.extractRelevantSection(content, intent),
            source: file,
            relevanceScore: this.calculateRelevance(content, intent),
            type: 'best-practice'
          });
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * 実装パターン検索
   */
  async searchImplementationPatterns(technology: string, complexity: string): Promise<RAGSearchResult[]> {
    const patternFiles = [
      '**/*-design.md',
      '**/*-specification.md',
      '**/*-architecture.md',
      '**/*-integration*.md'
    ];

    const results: RAGSearchResult[] = [];
    
    for (const pattern of patternFiles) {
      const files = await glob(pattern, { cwd: this.docsPath });
      for (const file of files) {
        const content = await this.readFileContent(file);
        if (this.isRelevantToImplementation(content, technology, complexity)) {
          results.push({
            content: this.extractImplementationPattern(content, technology),
            source: file,
            relevanceScore: this.calculateImplementationRelevance(content, technology, complexity),
            type: 'implementation'
          });
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * ドキュメント索引化
   */
  private async indexDocuments(): Promise<void> {
    const markdownFiles = await glob('**/*.md', { cwd: this.docsPath });
    
    for (const file of markdownFiles) {
      const content = await this.readFileContent(file);
      const sections = this.extractSections(content);
      
      this.knowledgeIndex.set(file, {
        content,
        sections,
        keywords: this.extractKeywords(content),
        lastModified: fs.statSync(path.join(this.docsPath, file)).mtime
      });
    }
  }

  /**
   * 実装パターン索引化
   */
  private async indexImplementationPatterns(): Promise<void> {
    // TypeScriptファイルからパターン抽出
    const srcPath = path.join(__dirname, '../../src');
    const tsFiles = await glob('**/*.ts', { cwd: srcPath });
    
    for (const file of tsFiles) {
      const content = fs.readFileSync(path.join(srcPath, file), 'utf-8');
      const patterns = this.extractCodePatterns(content);
      
      if (patterns.length > 0) {
        this.knowledgeIndex.set(`src/${file}`, {
          content,
          patterns,
          type: 'implementation',
          language: 'typescript'
        });
      }
    }
  }

  /**
   * ベストプラクティス索引化
   */
  private async indexBestPractices(): Promise<void> {
    const practicePatterns = [
      'ai-development-optimization/**/*.md',
      '**/best-practices*.md',
      '**/guidelines*.md'
    ];

    for (const pattern of practicePatterns) {
      const files = await glob(pattern, { cwd: this.docsPath });
      for (const file of files) {
        const content = await this.readFileContent(file);
        const practices = this.extractBestPractices(content);
        
        this.knowledgeIndex.set(`practices/${file}`, {
          content,
          practices,
          type: 'best-practice'
        });
      }
    }
  }

  /**
   * 検索語句抽出
   */
  private extractSearchTerms(query: string): string[] {
    // 日本語・英語混在対応
    const terms = query
      .replace(/[。、！？，．]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 1)
      .map(term => term.toLowerCase());
      
    return [...new Set(terms)]; // 重複除去
  }

  /**
   * ドキュメント検索
   */
  private async searchDocumentation(searchTerms: string[], params: RAGSearchParams): Promise<RAGSearchResult[]> {
    const results: RAGSearchResult[] = [];
    
    for (const [filename, data] of this.knowledgeIndex) {
      if (!filename.endsWith('.md')) continue;
      
      const relevanceScore = this.calculateDocumentRelevance(data.content, searchTerms, params);
      if (relevanceScore > 0.3) { // 閾値
        results.push({
          content: this.extractRelevantContent(data.content, searchTerms),
          source: filename,
          relevanceScore,
          type: 'documentation'
        });
      }
    }
    
    return results;
  }

  /**
   * 実装検索
   */
  public async searchImplementations(searchTerms: string[], params: RAGSearchParams): Promise<RAGSearchResult[]> {
    const results: RAGSearchResult[] = [];
    
    for (const [filename, data] of this.knowledgeIndex) {
      if (data.type !== 'implementation') continue;
      
      const relevanceScore = this.calculateImplementationRelevance(data.content, searchTerms.join(' '), 'medium');
      if (relevanceScore > 0.4) {
        results.push({
          content: this.extractCodeExample(data.content, searchTerms),
          source: filename,
          relevanceScore,
          type: 'implementation'
        });
      }
    }
    
    return results;
  }

  /**
   * ファイル内容読み込み
   */
  private async readFileContent(filePath: string): Promise<string> {
    try {
      return fs.readFileSync(path.join(this.docsPath, filePath), 'utf-8');
    } catch (error) {
      console.warn(`ファイル読み込みエラー: ${filePath}`);
      return '';
    }
  }

  /**
   * プロジェクトドキュメント検索
   */
  private async findProjectDocuments(project: string): Promise<string[]> {
    const patterns = [
      `**/*${project}*.md`,
      `**/${project}/**/*.md`
    ];
    
    const files: string[] = [];
    for (const pattern of patterns) {
      const found = await glob(pattern, { cwd: this.docsPath });
      files.push(...found);
    }
    
    return [...new Set(files)];
  }

  // ユーティリティメソッド
  private extractSections(content: string): any[] {
    const sections = content.split(/^#+\s+/m);
    return sections.map(section => ({
      title: section.split('\n')[0],
      content: section
    }));
  }

  private extractKeywords(content: string): string[] {
    // 簡易キーワード抽出
    const keywords = content
      .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 20);
    
    return [...new Set(keywords)];
  }

  private extractCodePatterns(content: string): any[] {
    // TypeScriptパターン抽出（簡易版）
    const patterns: any[] = [];
    
    // クラス定義
    const classMatches = content.match(/class\s+(\w+)/g);
    if (classMatches) {
      patterns.push(...classMatches.map(match => ({ type: 'class', pattern: match })));
    }
    
    // インターフェース定義
    const interfaceMatches = content.match(/interface\s+(\w+)/g);
    if (interfaceMatches) {
      patterns.push(...interfaceMatches.map(match => ({ type: 'interface', pattern: match })));
    }
    
    return patterns;
  }

  private extractBestPractices(content: string): any[] {
    // ベストプラクティス抽出
    const practices: any[] = [];
    
    // ✅や❌マークのあるセクション
    const practiceMatches = content.match(/[✅❌].+/g);
    if (practiceMatches) {
      practices.push(...practiceMatches.map(match => ({ 
        type: match.startsWith('✅') ? 'good' : 'bad',
        practice: match 
      })));
    }
    
    return practices;
  }

  private calculateDocumentRelevance(content: string, searchTerms: string[], params: RAGSearchParams): number {
    let score = 0;
    const lowerContent = content.toLowerCase();
    
    for (const term of searchTerms) {
      const occurrences = (lowerContent.match(new RegExp(term, 'g')) || []).length;
      score += occurrences * 0.1;
    }
    
    // プロジェクト関連度ボーナス
    if (lowerContent.includes(params.project)) {
      score += 0.5;
    }
    
    return Math.min(score, 1.0);
  }

  private scoreAndRankResults(results: RAGSearchResult[], query: string): RAGSearchResult[] {
    return results
      .map(result => ({
        ...result,
        relevanceScore: this.recalculateRelevance(result, query)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private recalculateRelevance(result: RAGSearchResult, query: string): number {
    // 詳細な関連度計算
    return result.relevanceScore; // 簡易版
  }

  private extractRelevantContent(content: string, searchTerms: string[]): string {
    // 検索語句周辺のコンテキストを抽出
    const lines = content.split('\n');
    const relevantLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (searchTerms.some(term => line.includes(term))) {
        // 前後2行も含める
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        relevantLines.push(...lines.slice(start, end));
        i = end; // 重複回避
      }
    }
    
    return relevantLines.join('\n').substring(0, 1000); // 1000文字制限
  }

  private calculateTokensUsed(results: RAGSearchResult[]): number {
    return results.reduce((total, result) => total + Math.ceil(result.content.length / 4), 0);
  }

  // その他のユーティリティメソッド（簡易実装）
  private searchInDocuments(docs: string[], query: string): Promise<RAGSearchResult[]> {
    return Promise.resolve([]);
  }
  
  private isRelevantToBestPractice(content: string, intent: string, project: string): boolean {
    return content.toLowerCase().includes(intent) || content.toLowerCase().includes(project);
  }
  
  private extractRelevantSection(content: string, intent: string): string {
    return content.substring(0, 500);
  }
  
  private calculateRelevance(content: string, intent: string): number {
    return 0.8;
  }
  
  private isRelevantToImplementation(content: string, technology: string, complexity: string): boolean {
    return content.toLowerCase().includes(technology);
  }
  
  private extractImplementationPattern(content: string, technology: string): string {
    return content.substring(0, 500);
  }
  
  private calculateImplementationRelevance(content: string, technology: string, complexity: string): number {
    return 0.7;
  }
  
  private extractCodeExample(content: string, searchTerms: string[]): string {
    return content.substring(0, 500);
  }
}

export default RealRAGService; 