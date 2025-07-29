import { TokenOptimizationSystem } from '../index';
export class HotelMemberAdapter {
    optimizer;
    memberConfig;
    constructor(customConfig) {
        this.memberConfig = {
            projectType: 'hotel-member',
            securityFocus: true,
            privacyCompliance: true,
            gdprMode: true,
            languageOptimization: {
                taskType: 'complex',
                thinkingLanguage: 'english',
                outputLanguage: 'japanese'
            },
            contextManagement: {
                maxTokens: 4000,
                autoOptimize: true
            },
            ...customConfig
        };
        this.optimizer = new TokenOptimizationSystem(this.memberConfig);
    }
    async optimizeSecurityRequest(request, context) {
        const securityContext = this.addSecurityContext(context);
        const result = await this.optimizer.optimizeRequest(request, securityContext);
        return {
            optimizedPrompt: result.optimizedPrompt,
            securityChecklist: this.generateSecurityChecklist(),
            tokenReduction: result.tokenReduction
        };
    }
    async optimizeGDPRRequest(request, context) {
        const gdprContext = this.addGDPRContext(context);
        const result = await this.optimizer.optimizeRequest(request, gdprContext);
        return {
            optimizedPrompt: result.optimizedPrompt,
            privacyCompliance: this.generateGDPRChecklist(),
            tokenReduction: result.tokenReduction
        };
    }
    addSecurityContext(context) {
        const securityConstraints = [
            "Security Priority: Data protection is paramount",
            "Authentication: JWT validation required",
            "Authorization: Role-based access control",
            "Data Encryption: All sensitive data must be encrypted",
            "Audit Logging: All actions must be logged"
        ];
        const baseContext = context || '';
        return `${baseContext}\n\nSECURITY CONSTRAINTS:\n${securityConstraints.join('\n')}`;
    }
    addGDPRContext(context) {
        const gdprConstraints = [
            "GDPR Compliance: Right to be forgotten",
            "Data Minimization: Collect only necessary data",
            "Consent Management: Explicit user consent required",
            "Data Portability: Export functionality required",
            "Privacy by Design: Default privacy settings"
        ];
        const baseContext = context || '';
        return `${baseContext}\n\nGDPR CONSTRAINTS:\n${gdprConstraints.join('\n')}`;
    }
    generateSecurityChecklist() {
        return [
            "Input validation and sanitization",
            "SQL injection prevention",
            "XSS protection",
            "CSRF token validation",
            "Rate limiting implementation",
            "Secure session management"
        ];
    }
    generateGDPRChecklist() {
        return [
            "User consent tracking",
            "Data deletion capabilities",
            "Privacy policy compliance",
            "Data export functionality",
            "Anonymization procedures",
            "Breach notification system"
        ];
    }
    getAdapterStats() {
        return {
            projectType: this.memberConfig.projectType,
            securityMode: this.memberConfig.securityFocus,
            gdprCompliant: this.memberConfig.gdprMode,
            optimizationStats: this.optimizer.getStats()
        };
    }
}
