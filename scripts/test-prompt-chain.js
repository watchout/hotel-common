#!/usr/bin/env node
/**
 * 🔗 プロンプトチェーン最適化システムテスト
 */

require('dotenv').config();

// TypeScriptファイルから必要な機能をJavaScriptで再実装
class ChainOfThoughtBuilder {
  static buildHotelCommonCoT(taskType, context) {
    const baseSteps = [
      {
        stepNumber: 1,
        title: '状況分析',
        description: '現在の状況を詳細に把握',
        questions: [
          '関連する情報・データは何か？',
          '制約条件・前提条件は何か？',
          'hotel-common特有の要件は何か？'
        ],
        expectedOutput: '状況の構造化された理解'
      },
      {
        stepNumber: 2,
        title: '問題分解',
        description: '複雑な問題を小さな要素に分解',
        questions: [
          '問題の核心は何か？',
          'どのように分解できるか？',
          '各要素の優先順位は？'
        ],
        expectedOutput: '管理可能な小タスクのリスト'
      },
      {
        stepNumber: 3,
        title: '解決策検討',
        description: '複数の解決策案を検討',
        questions: [
          'どのような解決策があるか？',
          '各案のメリット・デメリットは？',
          'リスク・コスト・効果は？'
        ],
        expectedOutput: '評価済み解決策の比較表'
      },
      {
        stepNumber: 4,
        title: '最適解選択',
        description: '評価基準に基づく最適解選択',
        questions: [
          '最も適切な解決策は？',
          '実装可能性は十分か？',
          '代替案は準備されているか？'
        ],
        expectedOutput: '選択された解決策と根拠'
      },
      {
        stepNumber: 5,
        title: '実行計画策定',
        description: '具体的実行ステップ作成',
        questions: [
          '具体的な実行手順は？',
          'タイムラインは適切か？',
          '進捗監視方法は？'
        ],
        expectedOutput: '詳細実行計画書'
      }
    ];

    // タスクタイプに応じてカスタマイズ
    if (taskType === 'debug') {
      baseSteps[0].questions.push('エラーの根本原因は何か？');
      baseSteps[2].questions.push('修正による副作用はあるか？');
    } else if (taskType === 'design') {
      baseSteps[1].questions.push('アーキテクチャ要件は何か？');
      baseSteps[3].questions.push('スケーラビリティは確保されているか？');
    }

    return baseSteps;
  }

  static formatCoTPrompt(steps, originalTask) {
    let prompt = `=== 思考プロセス（Chain of Thought） ===\n\n`;
    prompt += `元のタスク: ${originalTask}\n\n`;
    
    steps.forEach(step => {
      prompt += `Step ${step.stepNumber}: ${step.title}\n`;
      prompt += `${step.description}\n`;
      prompt += `考慮すべき質問:\n`;
      step.questions.forEach(q => {
        prompt += `- ${q}\n`;
      });
      prompt += `期待される出力: ${step.expectedOutput}\n\n`;
    });

    prompt += `=== 最終判断 ===\n`;
    prompt += `上記の思考プロセスを経て、最終的な解決策を提示してください。\n`;
    prompt += `回答は日本語で、詳細なコメント付きで提供してください。\n`;

    return prompt;
  }
}

class DelimiterSystem {
  constructor() {
    this.delimiters = {
      context: '=== HOTEL_CONTEXT ===',
      task: '>>> TASK_OBJECTIVE >>>',
      style: '### STYLE_TONE ###',
      audience: '``` AUDIENCE_TARGET ```',
      format: '--- RESPONSE_FORMAT ---',
      data: '▼▼▼ INPUT_DATA ▼▼▼',
      constraints: '◆◆◆ CONSTRAINTS ◆◆◆',
      examples: '★★★ EXAMPLES ★★★'
    };
  }

  structurePrompt(context, task, style = 'professional', audience = 'developers', 
                  format = 'structured response', data = '', constraints = [], examples = []) {
    let structured = '';

    structured += `${this.delimiters.context}\n${context}\n/=== HOTEL_CONTEXT ===\n\n`;
    structured += `${this.delimiters.task}\n${task}\n/>>> TASK_OBJECTIVE >>>\n\n`;
    structured += `${this.delimiters.style}\n${style}\n/### STYLE_TONE ###\n\n`;
    structured += `${this.delimiters.audience}\n${audience}\n/\`\`\` AUDIENCE_TARGET \`\`\`\n\n`;
    structured += `${this.delimiters.format}\n${format}\n/--- RESPONSE_FORMAT ---\n\n`;

    if (data) {
      structured += `${this.delimiters.data}\n${data}\n▲▲▲ /INPUT_DATA ▲▲▲\n\n`;
    }

    if (constraints.length > 0) {
      structured += `${this.delimiters.constraints}\n`;
      constraints.forEach(constraint => {
        structured += `- ${constraint}\n`;
      });
      structured += `◆◆◆ /CONSTRAINTS ◆◆◆\n\n`;
    }

    if (examples.length > 0) {
      structured += `${this.delimiters.examples}\n`;
      examples.forEach(example => {
        structured += `${example}\n`;
      });
      structured += `★★★ /EXAMPLES ★★★\n\n`;
    }

    return structured;
  }
}

class ExamplesDatabase {
  static hotelCommonExamples = {
    typescript_error: [
      `元の問題: Property 'tenant_id' does not exist
解決策: テーブル定義を確認し、正しいフィールド名（tenantId）を使用
実装: const user = await prisma.user.findFirst({ where: { tenantId } });`
    ],
    api_implementation: [
      `GET /api/customers エンドポイント:
- JWT認証必須
- tenant_id によるデータ分離
- Zod バリデーション適用
- エラーハンドリング完備`
    ],
    architecture_design: [
      `マイクロサービス設計パターン:
1. API Gateway (統一エントリーポイント)
2. Authentication Service (JWT管理)
3. Business Services (hotel-saas, hotel-member, hotel-pms)
4. Database Per Service (テナント分離)`
    ]
  };

  static getExamples(taskType, count = 2) {
    const examples = this.hotelCommonExamples[taskType] || [];
    return examples.slice(0, count);
  }

  static formatExamples(examples) {
    if (examples.length === 0) return '';
    
    let formatted = '参考例:\n';
    examples.forEach((example, index) => {
      formatted += `例${index + 1}: ${example}\n\n`;
    });
    return formatted;
  }
}

class PromptChainOptimizer {
  constructor(config = {}) {
    this.config = {
      taskType: 'complex',
      cotEnabled: true,
      useDelimiters: true,
      includeExamples: true,
      reasoningLevel: 'advanced',
      ...config
    };
    this.delimiterSystem = new DelimiterSystem();
  }

  optimizePrompt(task, context = 'hotel-common development environment') {
    const originalPrompt = `${task}\nContext: ${context}`;
    let optimizedPrompt = '';
    let cotSteps = [];
    let delimitersUsed = [];
    let examplesIncluded = 0;

    // Step 1: Chain of Thought 適用
    if (this.config.cotEnabled) {
      cotSteps = ChainOfThoughtBuilder.buildHotelCommonCoT(this.config.taskType, context);
      const cotPrompt = ChainOfThoughtBuilder.formatCoTPrompt(cotSteps, task);
      optimizedPrompt += cotPrompt + '\n\n';
    }

    // Step 2: 区切り文字による構造化
    if (this.config.useDelimiters) {
      const constraints = [
        'hotel-common プロジェクト制約遵守',
        'マルチテナント要件対応',
        'TypeScript型安全性確保',
        'Prisma ORM使用',
        '日本語コメント必須'
      ];

      const structuredPrompt = this.delimiterSystem.structurePrompt(
        context,
        task,
        'professional, detailed, hotel-industry focused',
        'hotel-common development team',
        'structured implementation with comments',
        '',
        constraints,
        []
      );

      optimizedPrompt += structuredPrompt;
      delimitersUsed = ['context', 'task', 'style', 'audience', 'format', 'constraints'];
    }

    // Step 3: 出力例追加
    if (this.config.includeExamples) {
      const examples = ExamplesDatabase.getExamples(this.config.taskType, 2);
      if (examples.length > 0) {
        optimizedPrompt += '\n' + ExamplesDatabase.formatExamples(examples);
        examplesIncluded = examples.length;
      }
    }

    return {
      originalPrompt,
      optimizedPrompt,
      cotSteps,
      delimitersUsed,
      examplesIncluded
    };
  }
}

// テスト実行
async function testPromptChainOptimizer() {
  console.log('🔗 プロンプトチェーン最適化システムテスト開始');

  // テストケース1: TypeScriptエラーデバッグ
  console.log('\n📋 テストケース1: TypeScriptエラーデバッグ');
  const debugOptimizer = new PromptChainOptimizer({
    taskType: 'debug',
    cotEnabled: true,
    useDelimiters: true,
    includeExamples: true
  });

  const debugResult = debugOptimizer.optimizePrompt(
    'Property tenant_id does not exist on type Customer',
    'hotel-common TypeScript project with Prisma ORM'
  );

  console.log(`Chain of Thought ステップ数: ${debugResult.cotSteps.length}`);
  console.log(`区切り文字使用数: ${debugResult.delimitersUsed.length}`);
  console.log(`出力例数: ${debugResult.examplesIncluded}`);
  console.log(`最適化プロンプト長: ${debugResult.optimizedPrompt.length}文字`);

  // テストケース2: API設計
  console.log('\n📋 テストケース2: API設計');
  const designOptimizer = new PromptChainOptimizer({
    taskType: 'design',
    cotEnabled: true,
    useDelimiters: true,
    includeExamples: true
  });

  const designResult = designOptimizer.optimizePrompt(
    'Design RESTful API for customer management',
    'hotel-saas microservice architecture with JWT authentication'
  );

  console.log(`Chain of Thought ステップ数: ${designResult.cotSteps.length}`);
  console.log(`区切り文字使用数: ${designResult.delimitersUsed.length}`);
  console.log(`出力例数: ${designResult.examplesIncluded}`);

  // テストケース3: シンプルモード
  console.log('\n📋 テストケース3: シンプルモード');
  const simpleOptimizer = new PromptChainOptimizer({
    taskType: 'simple',
    cotEnabled: false,
    useDelimiters: false,
    includeExamples: false
  });

  const simpleResult = simpleOptimizer.optimizePrompt(
    'Create a simple user interface component',
    'React TypeScript environment'
  );

  console.log(`Chain of Thought ステップ数: ${simpleResult.cotSteps.length}`);
  console.log(`区切り文字使用数: ${simpleResult.delimitersUsed.length}`);
  console.log(`出力例数: ${simpleResult.examplesIncluded}`);

  // 総合評価
  console.log('\n💡 プロンプトチェーン最適化効果:');
  console.log(`デバッグ最適化: ${debugResult.optimizedPrompt.length}文字 (元: ${debugResult.originalPrompt.length}文字)`);
  console.log(`設計最適化: ${designResult.optimizedPrompt.length}文字 (元: ${designResult.originalPrompt.length}文字)`);
  console.log(`シンプル: ${simpleResult.optimizedPrompt.length}文字 (元: ${simpleResult.originalPrompt.length}文字)`);

  console.log('\n🏆 プロンプトチェーン最適化システムテスト完了');

  return { debugResult, designResult, simpleResult };
}

if (require.main === module) {
  testPromptChainOptimizer().catch(console.error);
}

module.exports = { testPromptChainOptimizer };