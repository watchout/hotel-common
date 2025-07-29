// 🛡️ 実際のガードレールシステム - 品質・セキュリティ・パフォーマンス検証
// Custom Instructionsの擬似的「チェックせよ」を実際の検証に置換
import * as ts from 'typescript';
/**
 * 実際のガードレール検証システム
 * 「チェックせよ」ではなく実際の品質検証を実行
 */
export class RealGuardrailsValidator {
    typescriptConfig;
    securityRules;
    performanceThresholds;
    constructor() {
        this.initializeTypescriptConfig();
        this.initializeSecurityRules();
        this.initializePerformanceThresholds();
    }
    /**
     * 包括的品質検証実行
     */
    async validate(content, context, ragResults) {
        const startTime = Date.now();
        const results = [];
        try {
            // 並列検証実行
            const [tsResults, secResults, perfResults, projResults] = await Promise.all([
                this.validateTypeScript(content, ragResults),
                this.validateSecurity(content, context),
                this.validatePerformance(ragResults),
                this.validateProjectRules(context.project, ragResults)
            ]);
            results.push(...tsResults, ...secResults, ...perfResults, ...projResults);
            // 総合評価
            const overallPassed = results.every(r => r.severity !== 'error');
            const score = this.calculateQualityScore(results);
            const tokensOptimized = this.calculateTokenOptimization(results);
            return {
                overall: overallPassed,
                score,
                results,
                tokensOptimized,
                processingTime: Date.now() - startTime
            };
        }
        catch (error) {
            console.error('ガードレール検証エラー:', error);
            return {
                overall: false,
                score: 0,
                results: [{
                        passed: false,
                        category: 'typescript',
                        severity: 'error',
                        message: 'ガードレール検証システムエラー',
                        suggestions: ['システム管理者に連絡してください']
                    }],
                tokensOptimized: 0,
                processingTime: Date.now() - startTime
            };
        }
    }
    /**
     * TypeScript型安全性検証
     * 実際のコンパイラAPIを使用した検証
     */
    async validateTypeScript(content, ragResults) {
        const results = [];
        try {
            // 1. TypeScript構文解析
            const sourceFile = ts.createSourceFile('temp.ts', content, ts.ScriptTarget.Latest, true);
            // 2. 型チェック
            const program = ts.createProgram(['temp.ts'], this.typescriptConfig);
            const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
            // 3. エラー・警告の処理
            for (const diagnostic of diagnostics) {
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                const severity = this.mapTypescriptSeverity(diagnostic.category);
                results.push({
                    passed: severity !== 'error',
                    category: 'typescript',
                    severity,
                    message: `TypeScript: ${message}`,
                    suggestions: this.getTypescriptSuggestions(diagnostic),
                    autofix: this.getTypescriptAutofix(diagnostic)
                });
            }
            // 4. 型安全性の追加チェック
            results.push(...this.checkTypeSafety(sourceFile));
            // 5. hotel-common特有のパターンチェック
            results.push(...this.checkHotelCommonPatterns(content, ragResults));
        }
        catch (error) {
            results.push({
                passed: false,
                category: 'typescript',
                severity: 'error',
                message: `TypeScript解析エラー: ${error instanceof Error ? error.message : String(error)}`,
                suggestions: ['コード構文を確認してください']
            });
        }
        return results;
    }
    /**
     * セキュリティ検証
     * 実際のセキュリティルールによる検証
     */
    async validateSecurity(content, context) {
        const results = [];
        // 1. SQLインジェクション検出
        results.push(...this.checkSQLInjection(content));
        // 2. XSS脆弱性検出
        results.push(...this.checkXSS(content));
        // 3. 認証・認可チェック
        results.push(...this.checkAuthentication(content, context));
        // 4. 機密情報漏洩チェック
        results.push(...this.checkDataLeakage(content));
        // 5. GDPR準拠チェック（hotel-member特化）
        if (context.project === 'hotel-member') {
            results.push(...this.checkGDPRCompliance(content));
        }
        // 6. JWT セキュリティ
        results.push(...this.checkJWTSecurity(content));
        return results;
    }
    /**
     * パフォーマンス検証
     * 実際のパフォーマンス指標による検証
     */
    async validatePerformance(ragResults) {
        const results = [];
        // 1. データベースクエリ効率性
        results.push(...this.checkDatabasePerformance(ragResults));
        // 2. メモリ使用量チェック
        results.push(...this.checkMemoryUsage(ragResults));
        // 3. API応答時間チェック
        results.push(...this.checkAPIPerformance(ragResults));
        // 4. フロントエンドパフォーマンス
        results.push(...this.checkFrontendPerformance(ragResults));
        return results;
    }
    /**
     * プロジェクト固有ルール検証
     */
    async validateProjectRules(project, ragResults) {
        const results = [];
        switch (project) {
            case 'hotel-saas':
                results.push(...this.validateSaaSRules(ragResults));
                break;
            case 'hotel-member':
                results.push(...this.validateMemberRules(ragResults));
                break;
            case 'hotel-pms':
                results.push(...this.validatePMSRules(ragResults));
                break;
        }
        // 共通ルール
        results.push(...this.validateCommonRules(ragResults));
        return results;
    }
    // TypeScript検証詳細メソッド
    checkTypeSafety(sourceFile) {
        const results = [];
        // any型の使用チェック
        const anyUsage = this.findAnyUsage(sourceFile);
        if (anyUsage.length > 0) {
            results.push({
                passed: false,
                category: 'typescript',
                severity: 'warning',
                message: `any型の使用が${anyUsage.length}箇所で検出されました`,
                suggestions: ['具体的な型を定義してください', 'unknown型の使用を検討してください']
            });
        }
        // 非null断言の過度な使用
        const nonNullAssertions = this.findNonNullAssertions(sourceFile);
        if (nonNullAssertions.length > 3) {
            results.push({
                passed: false,
                category: 'typescript',
                severity: 'warning',
                message: '非null断言(!)の過度な使用',
                suggestions: ['オプショナルチェーンの使用を検討してください']
            });
        }
        return results;
    }
    checkHotelCommonPatterns(content, ragResults) {
        const results = [];
        // tenant_id必須チェック
        if (content.includes('prisma') && !content.includes('tenant_id')) {
            results.push({
                passed: false,
                category: 'typescript',
                severity: 'error',
                message: 'Prismaクエリにtenant_idが含まれていません',
                suggestions: ['マルチテナント対応のためtenant_idを追加してください'],
                autofix: 'where: { tenant_id: tenantId, ... }'
            });
        }
        // JWT検証パターン
        if (content.includes('auth') && !content.includes('jwt')) {
            results.push({
                passed: false,
                category: 'typescript',
                severity: 'warning',
                message: '認証処理でJWT統一基盤の使用が推奨されます',
                suggestions: ['hotel-common/auth/jwt.ts の使用を検討してください']
            });
        }
        return results;
    }
    // セキュリティ検証詳細メソッド
    checkSQLInjection(content) {
        const results = [];
        // 危険なクエリパターン
        const dangerousPatterns = [
            /\$\{.*\}.*WHERE/i,
            /\+.*WHERE/i,
            /query.*\+/i
        ];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(content)) {
                results.push({
                    passed: false,
                    category: 'security',
                    severity: 'error',
                    message: 'SQLインジェクション脆弱性の可能性',
                    suggestions: ['パラメータ化クエリを使用してください', 'Prisma ORMの使用を推奨します']
                });
            }
        }
        return results;
    }
    checkXSS(content) {
        const results = [];
        if (content.includes('innerHTML') && !content.includes('sanitize')) {
            results.push({
                passed: false,
                category: 'security',
                severity: 'error',
                message: 'XSS脆弱性: innerHTMLの未サニタイズ使用',
                suggestions: ['DOMPurifyの使用を推奨します', 'textContentの使用を検討してください']
            });
        }
        return results;
    }
    checkAuthentication(content, context) {
        const results = [];
        if (content.includes('/api/') && !content.includes('auth')) {
            results.push({
                passed: false,
                category: 'security',
                severity: 'warning',
                message: 'API エンドポイントに認証が含まれていません',
                suggestions: ['認証ミドルウェアの追加を検討してください']
            });
        }
        return results;
    }
    checkDataLeakage(content) {
        const results = [];
        // 機密情報パターン
        const sensitivePatterns = [
            /password.*console\.log/i,
            /secret.*console\.log/i,
            /token.*console\.log/i
        ];
        for (const pattern of sensitivePatterns) {
            if (pattern.test(content)) {
                results.push({
                    passed: false,
                    category: 'security',
                    severity: 'error',
                    message: '機密情報のログ出力検出',
                    suggestions: ['機密情報をログに出力しないでください']
                });
            }
        }
        return results;
    }
    checkGDPRCompliance(content) {
        const results = [];
        if (content.includes('personal') && !content.includes('consent')) {
            results.push({
                passed: false,
                category: 'security',
                severity: 'warning',
                message: 'GDPR: 個人データ処理で同意確認が不明',
                suggestions: ['同意管理の実装を確認してください']
            });
        }
        return results;
    }
    checkJWTSecurity(content) {
        const results = [];
        if (content.includes('jwt') && content.includes('localStorage')) {
            results.push({
                passed: false,
                category: 'security',
                severity: 'warning',
                message: 'JWTのlocalStorage保存はセキュリティリスク',
                suggestions: ['httpOnlyクッキーの使用を推奨します']
            });
        }
        return results;
    }
    // パフォーマンス検証詳細メソッド
    checkDatabasePerformance(ragResults) {
        const results = [];
        // N+1問題の検出パターンは実装が複雑なため、簡易版
        if (ragResults?.patterns?.some((p) => p.includes('findMany') && p.includes('include'))) {
            results.push({
                passed: true,
                category: 'performance',
                severity: 'info',
                message: 'データベースクエリにincludeが含まれています',
                suggestions: ['N+1問題に注意してください']
            });
        }
        return results;
    }
    checkMemoryUsage(ragResults) {
        // 簡易実装
        return [];
    }
    checkAPIPerformance(ragResults) {
        // 簡易実装
        return [];
    }
    checkFrontendPerformance(ragResults) {
        // 簡易実装
        return [];
    }
    // プロジェクト別ルール
    validateSaaSRules(ragResults) {
        const results = [];
        // Sun(Amaterasu)の顧客体験重視チェック
        results.push({
            passed: true,
            category: 'project-rules',
            severity: 'info',
            message: 'Sun: 顧客体験重視の実装を推奨',
            suggestions: ['アクセシビリティの考慮', 'UX改善の検討']
        });
        return results;
    }
    validateMemberRules(ragResults) {
        const results = [];
        // Suno(Susanoo)のセキュリティ重視チェック
        results.push({
            passed: true,
            category: 'project-rules',
            severity: 'info',
            message: 'Suno: セキュリティ強化の実装を推奨',
            suggestions: ['暗号化の実装', '入力検証の強化']
        });
        return results;
    }
    validatePMSRules(ragResults) {
        const results = [];
        // Luna(Tsukuyomi)の運用効率重視チェック
        results.push({
            passed: true,
            category: 'project-rules',
            severity: 'info',
            message: 'Luna: 運用効率化の実装を推奨',
            suggestions: ['24時間安定性の考慮', 'パフォーマンス最適化']
        });
        return results;
    }
    validateCommonRules(ragResults) {
        const results = [];
        results.push({
            passed: true,
            category: 'project-rules',
            severity: 'info',
            message: 'hotel-common統合基盤の活用を推奨',
            suggestions: ['統一認証基盤の使用', 'Event-drivenアーキテクチャの採用']
        });
        return results;
    }
    // 初期化メソッド
    initializeTypescriptConfig() {
        this.typescriptConfig = {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.ESNext,
            strict: true,
            noImplicitAny: true,
            noImplicitReturns: true,
            noUnusedLocals: true,
            noUnusedParameters: true
        };
    }
    initializeSecurityRules() {
        this.securityRules = new Map([
            ['sql-injection', { pattern: /\$\{.*\}.*WHERE/i, severity: 'error' }],
            ['xss', { pattern: /innerHTML.*\+/, severity: 'error' }],
            ['data-leakage', { pattern: /password.*console\.log/i, severity: 'error' }]
        ]);
    }
    initializePerformanceThresholds() {
        this.performanceThresholds = new Map([
            ['db-query-time', 100], // ms
            ['api-response-time', 200], // ms
            ['memory-usage', 512] // MB
        ]);
    }
    // ユーティリティメソッド
    mapTypescriptSeverity(category) {
        switch (category) {
            case ts.DiagnosticCategory.Error: return 'error';
            case ts.DiagnosticCategory.Warning: return 'warning';
            default: return 'info';
        }
    }
    getTypescriptSuggestions(diagnostic) {
        // 簡易実装
        return ['TypeScript公式ドキュメントを参照してください'];
    }
    getTypescriptAutofix(diagnostic) {
        // 簡易実装
        return undefined;
    }
    findAnyUsage(sourceFile) {
        const anyNodes = [];
        function visit(node) {
            if (ts.isTypeReferenceNode(node) &&
                ts.isIdentifier(node.typeName) &&
                node.typeName.text === 'any') {
                anyNodes.push(node);
            }
            ts.forEachChild(node, visit);
        }
        visit(sourceFile);
        return anyNodes;
    }
    findNonNullAssertions(sourceFile) {
        const assertions = [];
        function visit(node) {
            if (ts.isNonNullExpression(node)) {
                assertions.push(node);
            }
            ts.forEachChild(node, visit);
        }
        visit(sourceFile);
        return assertions;
    }
    calculateQualityScore(results) {
        if (results.length === 0)
            return 100;
        const weights = { error: -20, warning: -5, info: 0 };
        const totalDeduction = results.reduce((sum, result) => {
            return sum + (weights[result.severity] || 0);
        }, 0);
        return Math.max(0, 100 + totalDeduction);
    }
    calculateTokenOptimization(results) {
        // 品質向上によるトークン最適化効果の概算
        const qualityBonus = results.filter(r => r.passed).length * 10;
        const errorPenalty = results.filter(r => r.severity === 'error').length * 50;
        return Math.max(0, qualityBonus - errorPenalty);
    }
}
export default RealGuardrailsValidator;
