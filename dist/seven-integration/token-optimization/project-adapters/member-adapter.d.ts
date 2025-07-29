import { TokenOptimizationConfig } from '../index';
export interface HotelMemberOptimizationConfig extends TokenOptimizationConfig {
    securityFocus: boolean;
    privacyCompliance: boolean;
    gdprMode: boolean;
}
export declare class HotelMemberAdapter {
    private optimizer;
    private memberConfig;
    constructor(customConfig?: Partial<HotelMemberOptimizationConfig>);
    optimizeSecurityRequest(request: string, context?: string): Promise<{
        optimizedPrompt: string;
        securityChecklist: string[];
        tokenReduction: number;
    }>;
    optimizeGDPRRequest(request: string, context?: string): Promise<{
        optimizedPrompt: string;
        privacyCompliance: string[];
        tokenReduction: number;
    }>;
    private addSecurityContext;
    private addGDPRContext;
    private generateSecurityChecklist;
    private generateGDPRChecklist;
    getAdapterStats(): {
        projectType: string;
        securityMode: boolean;
        gdprCompliant: boolean;
        optimizationStats: any;
    };
}
