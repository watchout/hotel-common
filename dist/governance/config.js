// 段階的ガバナンス設定システム
// 移行スケジュールと連動した監視レベル管理
// 現在の監視設定（段階的移行中）
export const CURRENT_GOVERNANCE_CONFIG = {
    'hotel-saas': {
        systemId: 'hotel-saas',
        level: 0,
        monitoring: false,
        checkpoints: [],
        notes: '既存開発継続中・移行準備期間',
        effectiveDate: new Date('2024-12-01'),
        nextReviewDate: new Date('2025-03-01')
    },
    'hotel-member': {
        systemId: 'hotel-member',
        level: 0,
        monitoring: false,
        checkpoints: [],
        notes: 'PostgreSQL移行中・統一基盤移行準備',
        effectiveDate: new Date('2024-12-01'),
        nextReviewDate: new Date('2025-02-01')
    },
    'hotel-pms': {
        systemId: 'hotel-pms',
        level: 0, // 開発開始時にLevel 3に引き上げ予定
        monitoring: false,
        checkpoints: [],
        notes: '仕様策定中・統一基盤完全準拠予定',
        effectiveDate: new Date('2024-12-01'),
        nextReviewDate: new Date('2025-01-01')
    },
    'hotel-common': {
        systemId: 'hotel-common',
        level: 3,
        monitoring: true,
        mode: 'full-enforcement',
        checkpoints: [
            'api-format-compliance',
            'error-handling-standard',
            'authentication-unified',
            'database-schema-compliance',
            'source-tracking-mandatory',
            'security-best-practices'
        ],
        notes: '統一基盤・厳格監視適用中',
        effectiveDate: new Date('2024-12-01')
    }
};
// 監視ルール定義
export const GOVERNANCE_RULES = [
    // Level 1: 基本警告ルール
    {
        id: 'api-format-warning',
        name: 'API統一形式チェック',
        description: '統一APIレスポンス形式との乖離を警告',
        level: 1,
        category: 'api-format',
        severity: 'warning',
        enforcement: 'warn',
        autoFix: false
    },
    {
        id: 'error-code-consistency',
        name: 'エラーコード一貫性チェック',
        description: '定義済みエラーコードの使用確認',
        level: 1,
        category: 'error-handling',
        severity: 'warning',
        enforcement: 'warn',
        autoFix: true
    },
    // Level 2: 重要項目ブロッキング
    {
        id: 'security-violation-block',
        name: 'セキュリティ違反検出',
        description: '認証・認可の重大な問題をブロック',
        level: 2,
        category: 'security',
        severity: 'critical',
        enforcement: 'block',
        autoFix: false
    },
    {
        id: 'data-corruption-prevention',
        name: 'データ破損防止',
        description: 'データ整合性を破る操作をブロック',
        level: 2,
        category: 'database',
        severity: 'critical',
        enforcement: 'block',
        autoFix: false
    },
    // Level 3: 厳格な統一基盤準拠
    {
        id: 'api-format-enforcement',
        name: 'API形式強制',
        description: '統一APIレスポンス形式の完全準拠',
        level: 3,
        category: 'api-format',
        severity: 'error',
        enforcement: 'block',
        autoFix: true
    },
    {
        id: 'jwt-authentication-required',
        name: 'JWT認証必須',
        description: '統一JWT認証の完全適用',
        level: 3,
        category: 'authentication',
        severity: 'error',
        enforcement: 'block',
        autoFix: false
    },
    {
        id: 'source-tracking-mandatory',
        name: 'ソーストラッキング必須',
        description: 'origin_system等の必須フィールド確認',
        level: 3,
        category: 'source-tracking',
        severity: 'error',
        enforcement: 'block',
        autoFix: true
    },
    {
        id: 'postgresql-schema-compliance',
        name: 'PostgreSQLスキーマ準拠',
        description: '統一データベーススキーマの完全準拠',
        level: 3,
        category: 'database',
        severity: 'error',
        enforcement: 'block',
        autoFix: false
    }
];
// ガバナンス管理クラス
export class GovernanceManager {
    static instance;
    config;
    constructor() {
        this.config = { ...CURRENT_GOVERNANCE_CONFIG };
    }
    static getInstance() {
        if (!GovernanceManager.instance) {
            GovernanceManager.instance = new GovernanceManager();
        }
        return GovernanceManager.instance;
    }
    // 監視レベル更新（段階的移行）
    updateGovernanceLevel(systemId, newLevel, effectiveDate = new Date(), reason) {
        const currentConfig = this.config[systemId];
        if (newLevel > currentConfig.level) {
            console.log(`📈 [${systemId}] 監視レベル向上: ${currentConfig.level} → ${newLevel}`);
            if (reason)
                console.log(`理由: ${reason}`);
        }
        this.config[systemId] = {
            ...currentConfig,
            level: newLevel,
            monitoring: newLevel > 0,
            effectiveDate,
            notes: reason || currentConfig.notes
        };
        // 適用ルールの更新
        this.updateCheckpoints(systemId);
    }
    // システムの監視ルール取得
    getApplicableRules(systemId) {
        const systemConfig = this.config[systemId];
        return GOVERNANCE_RULES.filter(rule => rule.level <= systemConfig.level);
    }
    // チェックポイント自動更新
    updateCheckpoints(systemId) {
        const config = this.config[systemId];
        const applicableRules = this.getApplicableRules(systemId);
        config.checkpoints = applicableRules.map(rule => rule.id);
        // モード設定
        if (config.level === 1) {
            config.mode = 'warning-only';
        }
        else if (config.level === 2) {
            config.mode = 'selective-block';
        }
        else if (config.level === 3) {
            config.mode = 'full-enforcement';
        }
    }
    // 違反チェック実行
    async checkCompliance(systemId, target, data) {
        const config = this.config[systemId];
        if (!config.monitoring) {
            return {
                systemId,
                level: config.level,
                compliant: true,
                violations: [],
                warnings: [],
                notes: '監視無効（移行準備期間）'
            };
        }
        const applicableRules = this.getApplicableRules(systemId);
        const violations = [];
        const warnings = [];
        for (const rule of applicableRules) {
            const violation = await this.checkRule(rule, data);
            if (violation) {
                if (rule.enforcement === 'block') {
                    violations.push(violation);
                }
                else if (rule.enforcement === 'warn') {
                    warnings.push(violation);
                }
            }
        }
        return {
            systemId,
            level: config.level,
            compliant: violations.length === 0,
            violations,
            warnings,
            blocking: config.mode === 'full-enforcement' ||
                (config.mode === 'selective-block' && violations.some(v => v.severity === 'critical'))
        };
    }
    // 個別ルールチェック
    async checkRule(rule, data) {
        // 実際のルール実装は、各カテゴリごとに具体的なチェック処理を行う
        // ここでは基本的な枠組みのみ実装
        switch (rule.category) {
            case 'api-format':
                return this.checkApiFormat(rule, data);
            case 'error-handling':
                return this.checkErrorHandling(rule, data);
            case 'authentication':
                return this.checkAuthentication(rule, data);
            case 'database':
                return this.checkDatabase(rule, data);
            case 'source-tracking':
                return this.checkSourceTracking(rule, data);
            case 'security':
                return this.checkSecurity(rule, data);
            default:
                return null;
        }
    }
    // API形式チェック実装例
    checkApiFormat(rule, data) {
        if (rule.id === 'api-format-warning' || rule.id === 'api-format-enforcement') {
            // 統一APIレスポンス形式チェック
            if (data && typeof data === 'object') {
                const hasSuccess = 'success' in data;
                const hasTimestamp = 'timestamp' in data;
                const hasRequestId = 'request_id' in data;
                if (!hasSuccess || !hasTimestamp || !hasRequestId) {
                    return {
                        ruleId: rule.id,
                        message: '統一APIレスポンス形式に準拠していません',
                        severity: rule.severity,
                        category: rule.category,
                        suggestion: 'ApiResponse<T>インターフェースを使用してください',
                        autoFixable: rule.autoFix ?? false
                    };
                }
            }
        }
        return null;
    }
    // その他チェック方法は同様に実装...
    checkErrorHandling(rule, data) {
        // エラーハンドリングチェック実装
        return null;
    }
    checkAuthentication(rule, data) {
        // 認証チェック実装
        return null;
    }
    checkDatabase(rule, data) {
        // データベースチェック実装
        return null;
    }
    checkSourceTracking(rule, data) {
        // ソーストラッキングチェック実装
        return null;
    }
    checkSecurity(rule, data) {
        // セキュリティチェック実装
        return null;
    }
    // 移行計画生成
    generateMigrationPlan(systemId, targetLevel) {
        const currentConfig = this.config[systemId];
        const currentRules = this.getApplicableRules(systemId);
        const targetRules = GOVERNANCE_RULES.filter(rule => rule.level <= targetLevel);
        const newRules = targetRules.filter(rule => !currentRules.includes(rule));
        return {
            systemId,
            currentLevel: currentConfig.level,
            targetLevel,
            phases: this.generateMigrationPhases(currentConfig.level, targetLevel, newRules),
            estimatedDuration: this.estimateMigrationDuration(newRules),
            risks: this.identifyMigrationRisks(newRules),
            rollbackPlan: this.generateRollbackPlan(systemId)
        };
    }
    generateMigrationPhases(currentLevel, targetLevel, newRules) {
        const phases = [];
        for (let level = currentLevel + 1; level <= targetLevel; level++) {
            const levelRules = newRules.filter(rule => rule.level === level);
            phases.push({
                level: level,
                duration: Math.ceil(levelRules.length * 0.5), // 1ルールあたり0.5週間
                rules: levelRules,
                dependencies: this.identifyDependencies(levelRules)
            });
        }
        return phases;
    }
    estimateMigrationDuration(rules) {
        // ルール数に基づく期間見積もり（週単位）
        return Math.max(1, Math.ceil(rules.length * 0.3));
    }
    identifyMigrationRisks(rules) {
        // 移行リスクの特定
        const risks = [];
        const criticalRules = rules.filter(rule => rule.severity === 'critical');
        if (criticalRules.length > 0) {
            risks.push({
                type: 'breaking-change',
                severity: 'high',
                description: 'クリティカルルールの導入により既存機能が影響を受ける可能性',
                mitigation: '段階的導入と十分なテスト期間の確保'
            });
        }
        return risks;
    }
    identifyDependencies(rules) {
        // ルール間の依存関係特定
        const dependencies = [];
        if (rules.some(rule => rule.category === 'authentication')) {
            dependencies.push('JWT認証基盤の構築');
        }
        if (rules.some(rule => rule.category === 'database')) {
            dependencies.push('PostgreSQL移行の完了');
        }
        return dependencies;
    }
    generateRollbackPlan(systemId) {
        return {
            systemId,
            steps: [
                '1. 監視レベルの即座降格',
                '2. 旧設定ファイルへの復帰',
                '3. 影響範囲の確認',
                '4. 再移行計画の策定'
            ],
            maxRollbackTime: '15分',
            dataPreservation: true
        };
    }
    // 現在の設定取得
    getCurrentConfig(systemId) {
        if (systemId) {
            return this.config[systemId];
        }
        return this.config;
    }
}
// エクスポート
export const governanceManager = GovernanceManager.getInstance();
