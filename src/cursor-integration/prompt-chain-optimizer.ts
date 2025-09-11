/**
 * 🔗 プロンプトチェーン最適化システム (文献7準拠)
 * Tree of Thought・区切り文字・出力例提供
 */

export interface PromptChainConfig {
  taskType: 'simple' | 'complex' | 'design' | 'debug' | 'analysis';
  cotEnabled: boolean;
  useDelimiters: boolean;
  includeExamples: boolean;
  reasoningLevel: 'basic' | 'advanced' | 'expert';
}

export interface ChainOfThoughtStep {
  stepNumber: number;
  title: string;
  description: string;
  questions: string[];
  expectedOutput: string;
}

export interface PromptChainResult {
  originalPrompt: string;
  optimizedPrompt: string;
  cotSteps: ChainOfThoughtStep[];
  delimitersUsed: string[];
  examplesIncluded: number;
}

/**
 * Chain of Thought（CoT）テンプレート生成
 */
export class ChainOfThoughtBuilder {
  static buildHotelCommonCoT(taskType: string, context: string): ChainOfThoughtStep[] {
    const baseSteps: ChainOfThoughtStep[] = [
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

  static formatCoTPrompt(steps: ChainOfThoughtStep[], originalTask: string): string {
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

/**
 * 区切り文字システム
 */
export class DelimiterSystem {
  private delimiters = {
    context: '=== HOTEL_CONTEXT ===',
    task: '>>> TASK_OBJECTIVE >>>',
    style: '### STYLE_TONE ###',
    audience: '``` AUDIENCE_TARGET ```',
    format: '--- RESPONSE_FORMAT ---',
    data: '▼▼▼ INPUT_DATA ▼▼▼',
    constraints: '◆◆◆ CONSTRAINTS ◆◆◆',
    examples: '★★★ EXAMPLES ★★★'
  };

  structurePrompt(
    context: string,
    task: string,
    style: string = 'professional',
    audience: string = 'developers',
    format: string = 'structured response',
    data: string = '',
    constraints: string[] = [],
    examples: string[] = []
  ): string {
    let structured = '';

    structured += `${this.delimiters.context}\n${context}\n${this.delimiters.context.replace('===', '/===')}\n\n`;
    structured += `${this.delimiters.task}\n${task}\n${this.delimiters.task.replace('>>>', '/>>>')}\n\n`;
    structured += `${this.delimiters.style}\n${style}\n${this.delimiters.style.replace('###', '/###')}\n\n`;
    structured += `${this.delimiters.audience}\n${audience}\n${this.delimiters.audience.replace('```', '/```')}\n\n`;
    structured += `${this.delimiters.format}\n${format}\n${this.delimiters.format.replace('---', '/---')}\n\n`;

    if (data) {
      structured += `${this.delimiters.data}\n${data}\n${this.delimiters.data.replace('▼▼▼', '▲▲▲ /INPUT_DATA ▲▲▲')}\n\n`;
    }

    if (constraints.length > 0) {
      structured += `${this.delimiters.constraints}\n`;
      constraints.forEach(constraint => {
        structured += `- ${constraint}\n`;
      });
      structured += `${this.delimiters.constraints.replace('◆◆◆', '◆◆◆ /CONSTRAINTS ◆◆◆')}\n\n`;
    }

    if (examples.length > 0) {
      structured += `${this.delimiters.examples}\n`;
      examples.forEach(example => {
        structured += `${example}\n`;
      });
      structured += `${this.delimiters.examples.replace('★★★', '★★★ /EXAMPLES ★★★')}\n\n`;
    }

    return structured;
  }
}

/**
 * 出力例データベース
 */
export class ExamplesDatabase {
  private static hotelCommonExamples = {
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

  static getExamples(taskType: string, count: number = 2): string[] {
    const examples = this.hotelCommonExamples[taskType as keyof typeof this.hotelCommonExamples] || [];
    return examples.slice(0, count);
  }

  static formatExamples(examples: string[]): string {
    if (examples.length === 0) return '';
    
    let formatted = '参考例:\n';
    examples.forEach((example, index) => {
      formatted += `例${index + 1}: ${example}\n\n`;
    });
    return formatted;
  }
}

/**
 * プロンプトチェーン最適化メインクラス
 */
export class PromptChainOptimizer {
  private config: PromptChainConfig;
  private delimiterSystem: DelimiterSystem;

  constructor(config: Partial<PromptChainConfig> = {}) {
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

  optimizePrompt(
    task: string,
    context: string = 'hotel-common development environment'
  ): PromptChainResult {
    const originalPrompt = `${task}\nContext: ${context}`;
    let optimizedPrompt = '';
    let cotSteps: ChainOfThoughtStep[] = [];
    let delimitersUsed: string[] = [];
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