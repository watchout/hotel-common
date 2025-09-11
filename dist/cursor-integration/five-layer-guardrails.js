"use strict";
/**
 * 🛡️ 5層ガードレールシステム (文献3準拠)
 * エンタープライズレベルの安全性確保
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiveLayerGuardrailSystem = exports.MonitoringGuardrail = exports.OutputValidationGuardrail = exports.BusinessLogicGuardrail = exports.ProcessingGuardrail = exports.InputValidationGuardrail = void 0;
/**
 * Layer 1: 入力検証ガードレール
 */
class InputValidationGuardrail {
    getLayer() { return 1; }
    getName() { return 'Input Validation Layer'; }
    async validate(input, context) {
        const violations = [];
        let riskLevel = 'low';
        // フォーマットチェック
        if (typeof input !== 'string' && typeof input !== 'object') {
            violations.push('Invalid input format detected');
            riskLevel = 'high';
        }
        // ジェイルブレイク検出
        if (typeof input === 'string') {
            const dangerousPatterns = [
                /ignore\s+previous\s+instructions/i,
                /forget\s+everything/i,
                /act\s+as\s+if/i,
                /pretend\s+you\s+are/i
            ];
            for (const pattern of dangerousPatterns) {
                if (pattern.test(input)) {
                    violations.push(`Potential prompt injection detected: ${pattern.source}`);
                    riskLevel = 'critical';
                }
            }
        }
        // コンテンツフィルタリング
        if (typeof input === 'string') {
            const inappropriateContent = [
                /password/i,
                /secret/i,
                /private.*key/i
            ];
            for (const pattern of inappropriateContent) {
                if (pattern.test(input)) {
                    violations.push(`Sensitive content detected: ${pattern.source}`);
                    riskLevel = 'high';
                }
            }
        }
        return {
            passed: violations.length === 0,
            violations,
            riskLevel,
            confidence: 0.95
        };
    }
}
exports.InputValidationGuardrail = InputValidationGuardrail;
/**
 * Layer 2: 処理ガードレール
 */
class ProcessingGuardrail {
    getLayer() { return 2; }
    getName() { return 'Processing Control Layer'; }
    async validate(input, context) {
        const violations = [];
        let riskLevel = 'low';
        // LLM処理制御
        if (context.llmUsage) {
            if (context.llmUsage.tokens > 4000) {
                violations.push('Token usage exceeds recommended limit');
                riskLevel = 'medium';
            }
            if (context.llmUsage.cost > 1.0) {
                violations.push('Cost exceeds budget threshold');
                riskLevel = 'high';
            }
        }
        // レスポンス時間監視
        if (context.responseTime > 5000) {
            violations.push('Response time exceeds acceptable limit');
            riskLevel = 'medium';
        }
        return {
            passed: violations.length === 0,
            violations,
            riskLevel,
            confidence: 0.90
        };
    }
}
exports.ProcessingGuardrail = ProcessingGuardrail;
/**
 * Layer 3: 業務ロジックガードレール
 */
class BusinessLogicGuardrail {
    getLayer() { return 3; }
    getName() { return 'Business Logic Validation Layer'; }
    async validate(input, context) {
        const violations = [];
        let riskLevel = 'low';
        // プロジェクト固有制約チェック
        if (context.project === 'hotel-common') {
            // マルチテナント制約
            if (context.operation === 'database' && !context.tenantId) {
                violations.push('Missing tenant_id in database operation');
                riskLevel = 'critical';
            }
            // TypeScript制約
            if (context.codeGeneration && context.typescript) {
                if (context.typescript.errors > 0) {
                    violations.push(`TypeScript errors detected: ${context.typescript.errors}`);
                    riskLevel = 'high';
                }
            }
        }
        // セキュリティ要件チェック
        if (context.security) {
            if (!context.security.https) {
                violations.push('HTTPS not enforced');
                riskLevel = 'high';
            }
            if (!context.security.auth) {
                violations.push('Authentication not implemented');
                riskLevel = 'critical';
            }
        }
        return {
            passed: violations.length === 0,
            violations,
            riskLevel,
            confidence: 0.88
        };
    }
}
exports.BusinessLogicGuardrail = BusinessLogicGuardrail;
/**
 * Layer 4: 出力検証ガードレール
 */
class OutputValidationGuardrail {
    getLayer() { return 4; }
    getName() { return 'Output Validation Layer'; }
    async validate(input, context) {
        const violations = [];
        let riskLevel = 'low';
        // ハルシネーション検出
        if (context.outputContent) {
            const hallucinationPatterns = [
                /as\s+any/g,
                /TODO:/g,
                /FIXME:/g,
                /console\.log/g
            ];
            for (const pattern of hallucinationPatterns) {
                const matches = context.outputContent.match(pattern);
                if (matches && matches.length > 3) {
                    violations.push(`Potential hallucination or placeholder code detected: ${pattern.source}`);
                    riskLevel = 'medium';
                }
            }
        }
        // 構造化応答検証
        if (context.expectedFormat) {
            if (context.expectedFormat === 'json' && context.outputContent) {
                try {
                    JSON.parse(context.outputContent);
                }
                catch (e) {
                    violations.push('Invalid JSON format in response');
                    riskLevel = 'medium';
                }
            }
        }
        // 情報漏洩チェック
        if (context.outputContent && typeof context.outputContent === 'string') {
            const sensitivePatterns = [
                /api[_-]?key/i,
                /password/i,
                /secret/i,
                /private[_-]?key/i
            ];
            for (const pattern of sensitivePatterns) {
                if (pattern.test(context.outputContent)) {
                    violations.push(`Potential sensitive information in output: ${pattern.source}`);
                    riskLevel = 'critical';
                }
            }
        }
        return {
            passed: violations.length === 0,
            violations,
            riskLevel,
            confidence: 0.92
        };
    }
}
exports.OutputValidationGuardrail = OutputValidationGuardrail;
/**
 * Layer 5: 監視・ログガードレール
 */
class MonitoringGuardrail {
    getLayer() { return 5; }
    getName() { return 'Monitoring & Logging Layer'; }
    async validate(input, context) {
        const violations = [];
        let riskLevel = 'low';
        // ログ記録確認
        if (!context.loggingEnabled) {
            violations.push('Logging not enabled for this operation');
            riskLevel = 'medium';
        }
        // 監査証跡確認
        if (context.requiresAudit && !context.auditTrail) {
            violations.push('Audit trail missing for sensitive operation');
            riskLevel = 'high';
        }
        // パフォーマンス監視
        if (context.performance) {
            if (context.performance.memoryUsage > 512 * 1024 * 1024) { // 512MB
                violations.push('Memory usage exceeds threshold');
                riskLevel = 'medium';
            }
            if (context.performance.cpuUsage > 80) {
                violations.push('CPU usage exceeds threshold');
                riskLevel = 'medium';
            }
        }
        return {
            passed: violations.length === 0,
            violations,
            riskLevel,
            confidence: 0.85
        };
    }
}
exports.MonitoringGuardrail = MonitoringGuardrail;
/**
 * 統合5層ガードレールシステム
 */
class FiveLayerGuardrailSystem {
    layers;
    constructor() {
        this.layers = [
            new InputValidationGuardrail(),
            new ProcessingGuardrail(),
            new BusinessLogicGuardrail(),
            new OutputValidationGuardrail(),
            new MonitoringGuardrail()
        ];
    }
    async validateAll(input, context = {}) {
        const layerResults = [];
        const criticalViolations = [];
        let overallRiskLevel = 'low';
        for (const layer of this.layers) {
            const result = await layer.validate(input, context);
            layerResults.push({
                layer: layer.getLayer(),
                name: layer.getName(),
                result
            });
            if (result.riskLevel === 'critical') {
                overallRiskLevel = 'critical';
                criticalViolations.push(...result.violations);
            }
            else if (result.riskLevel === 'high' && overallRiskLevel !== 'critical') {
                overallRiskLevel = 'high';
            }
            else if (result.riskLevel === 'medium' && ['low'].includes(overallRiskLevel)) {
                overallRiskLevel = 'medium';
            }
        }
        const overallPassed = layerResults.every(lr => lr.result.passed);
        return {
            overallPassed,
            layerResults,
            criticalViolations,
            overallRiskLevel
        };
    }
    async getValidationReport(input, context = {}) {
        const validation = await this.validateAll(input, context);
        let report = `🛡️ 5層ガードレールシステム検証レポート\n`;
        report += `📊 総合結果: ${validation.overallPassed ? '✅ 合格' : '❌ 不合格'}\n`;
        report += `⚠️ リスクレベル: ${validation.overallRiskLevel.toUpperCase()}\n\n`;
        for (const layerResult of validation.layerResults) {
            report += `Layer ${layerResult.layer}: ${layerResult.name}\n`;
            report += `  状態: ${layerResult.result.passed ? '✅ 合格' : '❌ 不合格'}\n`;
            report += `  信頼度: ${(layerResult.result.confidence * 100).toFixed(1)}%\n`;
            if (layerResult.result.violations.length > 0) {
                report += `  違反項目:\n`;
                for (const violation of layerResult.result.violations) {
                    report += `    - ${violation}\n`;
                }
            }
            report += `\n`;
        }
        if (validation.criticalViolations.length > 0) {
            report += `🚨 重大違反項目:\n`;
            for (const violation of validation.criticalViolations) {
                report += `  - ${violation}\n`;
            }
        }
        return report;
    }
}
exports.FiveLayerGuardrailSystem = FiveLayerGuardrailSystem;
// テスト実行部分
async function testFiveLayerGuardrails() {
    console.log('🛡️ 5層ガードレールシステム動作テスト開始');
    const guardrails = new FiveLayerGuardrailSystem();
    // テストケース1: 正常なコード
    const normalCode = `
    async function getUserData(tenantId: string, userId: string) {
      try {
        const user = await prisma.user.findFirst({
          where: { id: userId, tenantId }
        });
        return user;
      } catch (error) {
        throw new Error('User not found');
      }
    }
  `;
    console.log('\n📋 テストケース1: 正常なコード');
    const result1 = await guardrails.validateAll(normalCode, {
        project: 'hotel-common',
        operation: 'database',
        tenantId: 'test-tenant',
        typescript: { errors: 0 },
        security: { https: true, auth: true },
        loggingEnabled: true,
        responseTime: 1000
    });
    console.log(`結果: ${result1.overallPassed ? '✅ 合格' : '❌ 不合格'}`);
    console.log(`リスクレベル: ${result1.overallRiskLevel}`);
    // テストケース2: 問題のあるコード
    const problematicCode = `
    function getData() {
      const data = fetch('/api/secret') as any;
      return data.password;
    }
  `;
    console.log('\n📋 テストケース2: 問題のあるコード');
    const result2 = await guardrails.validateAll(problematicCode, {
        project: 'hotel-common',
        operation: 'database',
        typescript: { errors: 3 },
        security: { https: false, auth: false },
        loggingEnabled: false,
        responseTime: 8000,
        outputContent: problematicCode
    });
    console.log(`結果: ${result2.overallPassed ? '✅ 合格' : '❌ 不合格'}`);
    console.log(`リスクレベル: ${result2.overallRiskLevel}`);
    console.log(`重大違反: ${result2.criticalViolations.length}件`);
    // 詳細レポート出力
    const report = await guardrails.getValidationReport(problematicCode, {
        project: 'hotel-common',
        operation: 'database',
        typescript: { errors: 3 },
        security: { https: false, auth: false },
        loggingEnabled: false,
        responseTime: 8000,
        outputContent: problematicCode
    });
    console.log('\n📄 詳細レポート:');
    console.log(report);
    console.log('\n🏆 5層ガードレールシステムテスト完了');
}
// 実行
testFiveLayerGuardrails().catch(console.error);
