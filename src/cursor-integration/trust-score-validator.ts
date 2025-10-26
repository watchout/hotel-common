/**
 * 🎯 信頼スコア評価システム (文献1準拠)
 * ハルシネーション防止・自動検証
 */

import { readFile } from 'fs/promises';

export interface TrustScoreResult {
  score: number; // 0-100の信頼度
  confidence: 'high' | 'medium' | 'low' | 'critical';
  factChecks: FactCheckResult[];
  recommendations: string[];
  requiresManualReview: boolean;
}

export interface FactCheckResult {
  category: 'schema' | 'api' | 'typescript' | 'business_logic';
  item: string;
  verified: boolean;
  evidence: string;
  confidence: number;
}

/**
 * Knowledge Base検証（文献1要求事項）
 */
export class KnowledgeBaseValidator {
  private prismaSchema = '';
  private apiSpecs: any = {};
  private typescriptDefinitions: any = {};

  async initialize(): Promise<void> {
    try {
      // Prismaスキーマ読み込み
      this.prismaSchema = await readFile('prisma/schema.prisma', 'utf-8');
      
      // API仕様読み込み（存在する場合）
      try {
        const apiSpecFiles = [
          'docs/api-specs/hotel-saas-openapi.yaml',
          'docs/api-specs/hotel-member-openapi.yaml',
          'docs/api-specs/hotel-pms-openapi.yaml'
        ];
        // 実装可能な場合のみ読み込み
      } catch (e) {
        console.log('API specs not found, using basic validation');
      }
    } catch (error) {
      console.error('Knowledge base initialization failed:', error);
    }
  }

  /**
   * Prismaスキーマとの照合検証
   */
  async verifyAgainstPrismaSchema(content: string): Promise<FactCheckResult[]> {
    const results: FactCheckResult[] = [];

    // テーブル名検証
    const tableMatches = content.match(/\b(customer|customers|user|users|staff|reservation|room)\b/gi);
    if (tableMatches) {
      for (const match of tableMatches) {
        const isValid = this.prismaSchema.includes(`model ${match}`) || 
                       this.prismaSchema.includes(`model ${match}s`) ||
                       this.prismaSchema.includes(`model ${match.slice(0, -1)}`);
        
        results.push({
          category: 'schema',
          item: `Table reference: ${match}`,
          verified: isValid,
          evidence: isValid ? 'Found in prisma.schema' : 'Not found in prisma.schema',
          confidence: 0.95
        });
      }
    }

    // フィールド名検証
    const fieldMatches = content.match(/\.(id|name|email|phone|address|tenant_id|created_at|updated_at)\b/gi);
    if (fieldMatches) {
      for (const match of fieldMatches) {
        const fieldName = match.substring(1); // remove dot
        const isValid = this.prismaSchema.includes(fieldName);
        
        results.push({
          category: 'schema',
          item: `Field reference: ${fieldName}`,
          verified: isValid,
          evidence: isValid ? 'Found in prisma.schema' : 'Not found in prisma.schema',
          confidence: 0.90
        });
      }
    }

    return results;
  }

  /**
   * TypeScript型安全性検証
   */
  async verifyTypeScriptSafety(content: string): Promise<FactCheckResult[]> {
    const results: FactCheckResult[] = [];

    // "as any" 使用検出
    const asAnyMatches = content.match(/as\s+any/g);
    if (asAnyMatches) {
      results.push({
        category: 'typescript',
        item: `Unsafe type casting: ${asAnyMatches.length} instances`,
        verified: false,
        evidence: 'Type safety violations detected',
        confidence: 0.98
      });
    }

    // 未定義型使用検証
    const typeMatches = content.match(/:\s*([A-Z][a-zA-Z]*)/g);
    if (typeMatches) {
      const knownTypes = ['string', 'number', 'boolean', 'Date', 'Prisma', 'User', 'Staff', 'Customer', 'Reservation', 'Room'];
      
      for (const match of typeMatches) {
        const typeName = match.substring(2); // remove ": "
        const isKnown = knownTypes.some(kt => typeName.includes(kt));
        
        if (!isKnown) {
          results.push({
            category: 'typescript',
            item: `Unknown type: ${typeName}`,
            verified: false,
            evidence: 'Type not in known definitions',
            confidence: 0.80
          });
        }
      }
    }

    return results;
  }

  /**
   * ビジネスロジック検証
   */
  async verifyBusinessLogic(content: string): Promise<FactCheckResult[]> {
    const results: FactCheckResult[] = [];

    // tenant_id必須チェック
    if (content.includes('prisma.') || content.includes('database')) {
      const hasTenantId = content.includes('tenant_id') || content.includes('tenantId');
      results.push({
        category: 'business_logic',
        item: 'Multi-tenant compliance',
        verified: hasTenantId,
        evidence: hasTenantId ? 'tenant_id found in database operations' : 'Missing tenant_id in database operations',
        confidence: 0.95
      });
    }

    // エラーハンドリング検証
    const hasErrorHandling = content.includes('try') && content.includes('catch') ||
                           content.includes('error') ||
                           content.includes('throw');
    
    if (content.includes('await') || content.includes('async')) {
      results.push({
        category: 'business_logic',
        item: 'Error handling in async operations',
        verified: hasErrorHandling,
        evidence: hasErrorHandling ? 'Error handling found' : 'Missing error handling for async operations',
        confidence: 0.85
      });
    }

    return results;
  }
}

/**
 * 信頼スコア計算エンジン
 */
export class TrustScoreCalculator {
  private knowledgeBase: KnowledgeBaseValidator;

  constructor() {
    this.knowledgeBase = new KnowledgeBaseValidator();
  }

  async initialize(): Promise<void> {
    await this.knowledgeBase.initialize();
  }

  async calculateTrustScore(content: string, context: any = {}): Promise<TrustScoreResult> {
    const factChecks: FactCheckResult[] = [];
    
    // 各種検証実行
    const schemaChecks = await this.knowledgeBase.verifyAgainstPrismaSchema(content);
    const typescriptChecks = await this.knowledgeBase.verifyTypeScriptSafety(content);
    const businessChecks = await this.knowledgeBase.verifyBusinessLogic(content);
    
    factChecks.push(...schemaChecks, ...typescriptChecks, ...businessChecks);

    // 信頼スコア計算
    const totalChecks = factChecks.length;
    const passedChecks = factChecks.filter(fc => fc.verified).length;
    const failedChecks = totalChecks - passedChecks;
    
    let baseScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 85;
    
    // 重大な違反による減点
    const criticalFailures = factChecks.filter(fc => 
      !fc.verified && 
      (fc.category === 'business_logic' || fc.item.includes('tenant_id'))
    ).length;
    
    baseScore = Math.max(0, baseScore - (criticalFailures * 25));

    // 信頼度レベル決定
    let confidence: 'high' | 'medium' | 'low' | 'critical';
    if (baseScore >= 85) confidence = 'high';
    else if (baseScore >= 70) confidence = 'medium';
    else if (baseScore >= 50) confidence = 'low';
    else confidence = 'critical';

    // 推奨事項生成
    const recommendations: string[] = [];
    const requiresManualReview = confidence === 'low' || confidence === 'critical';

    if (failedChecks > 0) {
      recommendations.push(`${failedChecks}件の検証項目が失敗しました。詳細を確認してください。`);
    }

    if (criticalFailures > 0) {
      recommendations.push('重大な違反項目があります。実装前に必ず修正してください。');
    }

    if (baseScore < 70) {
      recommendations.push('信頼度が低いため、実装前に仕様書と照合してください。');
    }

    if (requiresManualReview) {
      recommendations.push('手動レビューが必要です。技術責任者の確認を求めてください。');
    }

    return {
      score: Math.round(baseScore),
      confidence,
      factChecks,
      recommendations,
      requiresManualReview
    };
  }

  /**
   * 信頼性レポート生成
   */
  async generateTrustReport(content: string, context: any = {}): Promise<string> {
    const result = await this.calculateTrustScore(content, context);
    
    let report = `🎯 信頼スコア評価レポート\n`;
    report += `📊 信頼度: ${result.score}/100 (${result.confidence.toUpperCase()})\n`;
    report += `🔍 手動レビュー: ${result.requiresManualReview ? '必要' : '不要'}\n\n`;

    // カテゴリ別結果
    const categories = ['schema', 'typescript', 'business_logic', 'api'];
    for (const category of categories) {
      const categoryChecks = result.factChecks.filter(fc => fc.category === category);
      if (categoryChecks.length > 0) {
        const passed = categoryChecks.filter(fc => fc.verified).length;
        report += `📋 ${category.toUpperCase()}検証: ${passed}/${categoryChecks.length}項目合格\n`;
        
        for (const check of categoryChecks) {
          const status = check.verified ? '✅' : '❌';
          report += `  ${status} ${check.item} (信頼度: ${(check.confidence * 100).toFixed(0)}%)\n`;
          if (!check.verified) {
            report += `    理由: ${check.evidence}\n`;
          }
        }
        report += `\n`;
      }
    }

    // 推奨事項
    if (result.recommendations.length > 0) {
      report += `💡 推奨事項:\n`;
      for (const rec of result.recommendations) {
        report += `  - ${rec}\n`;
      }
    }

    return report;
  }
}

// テスト実行部分
async function testTrustScoreValidator() {
  console.log('🎯 信頼スコア評価システム動作テスト開始');
  
  const calculator = new TrustScoreCalculator();
  await calculator.initialize();
  
  // テストケース1: 良質なコード
  const goodCode = `
    async function createCustomer(tenantId: string, customerData: Customer) {
      try {
        const customer = await prisma.customer.create({
          data: {
            ...customerData,
            tenantId
          }
        });
        return customer;
      } catch (error) {
        throw new Error('Customer creation failed');
      }
    }
  `;
  
  console.log('\n📋 テストケース1: 良質なコード');
  const result1 = await calculator.calculateTrustScore(goodCode);
  console.log(`信頼度: ${result1.score}/100 (${result1.confidence})`);
  console.log(`手動レビュー: ${result1.requiresManualReview ? '必要' : '不要'}`);
  
  // テストケース2: 問題のあるコード
  const badCode = `
    function getUser(id) {
      const data = fetch('/api/users/' + id) as any;
      return data.customer.name;
    }
  `;
  
  console.log('\n📋 テストケース2: 問題のあるコード');
  const result2 = await calculator.calculateTrustScore(badCode);
  console.log(`信頼度: ${result2.score}/100 (${result2.confidence})`);
  console.log(`手動レビュー: ${result2.requiresManualReview ? '必要' : '不要'}`);
  console.log(`推奨事項: ${result2.recommendations.length}件`);
  
  // 詳細レポート出力
  const report = await calculator.generateTrustReport(badCode);
  console.log('\n📄 詳細レポート:');
  console.log(report);
  
  console.log('\n🏆 信頼スコア評価システムテスト完了');
}

// 実行
testTrustScoreValidator().catch(console.error); 