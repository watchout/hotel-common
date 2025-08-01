#!/usr/bin/env node
/**
 * 🚀 強化版RAGシステム実装（精度向上版）
 * 技術ドキュメント大幅拡張 + 精度向上
 */

// 環境変数を最初に読み込み
require('dotenv').config();

const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { ChatOpenAI } = require('@langchain/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('langchain/document');
const fs = require('fs');
const path = require('path');

console.log('🚀 強化版RAGシステム - 技術ドキュメント拡張版');

class EnhancedRAGSystem {
    constructor() {
        // 環境変数チェック
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️ OPENAI_API_KEY が設定されていません');
            this.mockMode = true;
        } else {
            this.mockMode = false;
            console.log('🔑 OpenAI APIキー確認済み - 強化RAGモード');

            this.embeddings = new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY,
                modelName: 'text-embedding-ada-002',
                batchSize: 512,
            });

            this.llm = new ChatOpenAI({
                openAIApiKey: process.env.OPENAI_API_KEY,
                modelName: 'gpt-3.5-turbo',
                temperature: 0.1,
                maxTokens: 800, // より詳細な回答のため拡張
            });
        }

        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000, // チャンクサイズ拡大
            chunkOverlap: 100,
        });
    }

    // 強化版ドキュメント収集（技術文書重点）
    async collectTechnicalDocuments() {
        console.log('\n📚 技術ドキュメント収集中... (強化版)');

        const documents = [];
        const technicalFiles = [
            // ai-development-optimization（文献1-7）
            'docs/ai-development-optimization/reference-materials/01-llm-pitfalls-analysis.md',
            'docs/ai-development-optimization/reference-materials/02-token-optimization-techniques.md',
            'docs/ai-development-optimization/reference-materials/03-llm-guardrails-enterprise-guide.md',
            'docs/ai-development-optimization/reference-materials/04-cursor-cost-optimization-mcp-integration.md',
            'docs/ai-development-optimization/reference-materials/05-llm-development-process-optimization.md',
            'docs/ai-development-optimization/reference-materials/06-weel-rag-development-cases.md',
            'docs/ai-development-optimization/reference-materials/07-alibaba-prompt-engineering-best-practices.md',
            'docs/ai-development-optimization/reference-materials/collection-status.md',

            // 基本技術仕様
            'docs/API_SPEC.md',
            'docs/ARCHITECTURE.md',
            'docs/DEVELOPMENT_RULES.md',
            'docs/DEVELOPMENT_TROUBLESHOOTING_GUIDE.md',

            // 統合仕様
            'docs/api-integration-spec.md',
            'docs/auth-integration-spec.md',
            'docs/database-integration-spec.md',

            // 実装ガイド
            'docs/development-setup.md',
            'docs/IMPLEMENTATION_PLAN.md',
            'docs/MVP_DEV_TASKS.md',

            // UI/UX
            'docs/UI_STYLE_GUIDE.md',
            'docs/UI_COMPONENTS.md',

            // 既存AIルール（参考用）
            './.cursor/rules/hotel-common-ai-rules.md',
            './.cursor/rules/hotel-saas-ai-rules.md',
            './.cursor/rules/hotel-member-ai-rules.md'
        ];

        for (const filePath of technicalFiles) {
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    // 文字制限を大幅拡張（8000文字）
                    const limitedContent = content.substring(0, 8000);

                    // ファイルタイプを詳細に分類
                    let docType = 'unknown';
                    if (filePath.includes('API')) docType = 'api-spec';
                    else if (filePath.includes('ARCHITECTURE')) docType = 'architecture';
                    else if (filePath.includes('TROUBLESHOOTING')) docType = 'troubleshooting';
                    else if (filePath.includes('integration')) docType = 'integration';
                    else if (filePath.includes('UI')) docType = 'ui-guide';
                    else if (filePath.includes('ai-rules')) docType = 'ai-rules';
                    else if (filePath.includes('DEVELOPMENT')) docType = 'development-guide';

                    documents.push(new Document({
                        pageContent: limitedContent,
                        metadata: {
                            source: filePath,
                            filename: path.basename(filePath),
                            type: docType,
                            length: limitedContent.length
                        }
                    }));

                    console.log(`  ✅ ${path.basename(filePath)} (${limitedContent.length}文字) [${docType}]`);
                } catch (error) {
                    console.log(`  ❌ ${path.basename(filePath)} - 読み込み失敗`);
                }
            } else {
                console.log(`  ⚠️ ${path.basename(filePath)} - ファイル未発見`);
            }
        }

        console.log(`✅ ${documents.length}件の技術ドキュメントを収集`);
        return documents;
    }

    // カスタムクエリ対応検索
    async search(query, vectorStore) {
        if (this.mockMode) {
            console.log(`🔍 モック検索: "${query}"`);
            return [
                'モックモード: 技術ドキュメント検索シミュレーション',
                'モックモード: 関連情報が見つかりました'
            ];
        }

        console.log(`🔍 技術文書検索: "${query}"`);
        const searchResults = await vectorStore.similaritySearch(query, 4); // 検索結果を4件に拡大

        console.log(`✅ ${searchResults.length}件の関連技術情報を発見`);
        searchResults.forEach((result, index) => {
            const preview = result.pageContent.substring(0, 120);
            const docType = result.metadata.type || 'unknown';
            console.log(`  ${index + 1}. [${docType}] ${preview}...`);
        });

        return searchResults;
    }

    // 強化版質問応答（技術的詳細重視）
    async answerTechnicalQuestion(query, searchResults) {
        if (this.mockMode) {
            return 'モックモード: 技術的な回答をシミュレーション中...';
        }

        try {
            const context = searchResults
                .map(result => `[${result.metadata.type || 'doc'}] ${result.pageContent}`)
                .join('\n\n');

            const enhancedPrompt = `
あなたは経験豊富なフルスタック開発者です。以下の技術ドキュメントを参考に、開発者向けの具体的で実用的な回答を提供してください。

【重要な回答方針】
1. 具体的な実装手順やコード例を含める
2. TypeScriptエラーの場合は修正方法を明示
3. 設定ファイルの変更が必要な場合は具体的に示す
4. 抽象的な説明ではなく、実際に作業できる情報を提供

【技術ドキュメント】
${context}

【開発者の質問】
${query}

【具体的で実用的な回答】`;

            const response = await this.llm.invoke([
                { role: 'user', content: enhancedPrompt }
            ]);

            return response.content;
        } catch (error) {
            console.error('強化LLM呼び出しエラー:', error.message);
            return 'エラー: 技術的回答生成に失敗しました。';
        }
    }

    // 強化版RAGテスト
    async runEnhancedRAGTest(customQuery = null) {
        console.log('\n🚀 強化版RAGシステムテスト開始\n');

        try {
            // 1. 技術ドキュメント収集
            const documents = await this.collectTechnicalDocuments();
            if (documents.length === 0) {
                throw new Error('技術ドキュメントが見つかりません');
            }

            // 2. ベクトルストア構築
            const vectorStore = await this.buildVectorStore(documents);

            // 3. テスト検索（カスタムクエリ対応）
            const testQuery = customQuery || 'layouts/admin.vue TypeScriptエラーの修正方法';
            const searchResults = await this.search(testQuery, vectorStore);

            // 4. 強化版質問応答
            if (!this.mockMode && searchResults.length > 0) {
                console.log('\n💬 強化RAG技術回答:');
                const answer = await this.answerTechnicalQuestion(testQuery, searchResults);
                console.log(`回答: ${answer}`);
            }

            return {
                success: true,
                documents: documents.length,
                mockMode: this.mockMode,
                query: testQuery,
                message: this.mockMode
                    ? 'モックモードで強化システム確認完了'
                    : '強化版RAGシステム技術回答完了'
            };

        } catch (error) {
            console.error('❌ 強化RAGシステムエラー:', error.message);
            return {
                success: false,
                documents: 0,
                mockMode: this.mockMode,
                message: `強化RAGテスト失敗: ${error.message}`
            };
        }
    }

    // ベクトルストア構築（メモリ内）
    async buildVectorStore(documents) {
        if (this.mockMode) {
            return { mock: true };
        }

        console.log('🔄 技術ドキュメントをチャンクに分割中...');
        const allChunks = [];

        for (const doc of documents) {
            const chunks = await this.textSplitter.splitDocuments([doc]);
            allChunks.push(...chunks);
        }

        console.log(`📄 ${allChunks.length}個の技術チャンクを生成`);

        console.log('🔄 強化ベクトルストア構築中...');
        const vectorStore = await MemoryVectorStore.fromDocuments(
            allChunks,
            this.embeddings
        );

        console.log('✅ 強化ベクトルストア構築完了');
        return vectorStore;
    }
}

// テスト実行
if (require.main === module) {
    const enhancedRAG = new EnhancedRAGSystem();

    // コマンドライン引数からカスタムクエリを取得
    const customQuery = process.argv.slice(2).join(' ') || null;

    enhancedRAG.runEnhancedRAGTest(customQuery)
        .then(result => {
            console.log('\n🏆 強化版RAGシステムテスト完了');
            console.log(`状況: ${result.success ? '✅ 成功' : '❌ 失敗'}`);
            console.log(`モード: ${result.mockMode ? '🧪 モック' : '🚀 強化版本物'}`);
            console.log(`技術文書: ${result.documents}件`);
            if (result.query) {
                console.log(`クエリ: ${result.query}`);
            }
            console.log(`\n💡 ${result.message}`);

            if (!result.mockMode) {
                console.log('\n💰 推定コスト: 数セント〜数十セント');
                console.log('📝 強化版RAGシステムで技術精度向上！');
            }
        })
        .catch(error => {
            console.error('❌ 強化テスト失敗:', error);
        });
}

module.exports = { EnhancedRAGSystem }; 