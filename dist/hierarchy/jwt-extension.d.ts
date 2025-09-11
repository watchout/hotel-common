import type { HierarchicalJWTPayload } from './types';
/**
 * 階層管理対応JWT拡張マネージャー
 *
 * 機能:
 * - 階層コンテキスト付きJWT生成
 * - 既存JWTの階層情報拡張
 * - 階層権限の動的更新
 */
export declare class HierarchicalJwtManager {
    private static logger;
    /**
     * 階層コンテキスト付きJWT生成
     */
    static generateHierarchicalToken(payload: {
        user_id: string;
        tenant_id: string;
        email: string;
        role: 'STAFF' | 'MANAGER' | 'ADMIN' | 'OWNER' | 'SYSTEM';
        level: number;
        permissions: string[];
        organization_id?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    /**
     * 階層コンテキスト構築
     */
    private static buildHierarchyContext;
    /**
     * デフォルトデータポリシー取得
     */
    private static getDefaultDataPolicies;
    /**
     * 既存JWTトークンの階層情報更新
     */
    static refreshHierarchyContext(existingToken: string, newOrganizationId?: string): Promise<string>;
    /**
     * ユーザーの所属組織検索
     */
    private static findUserOrganization;
    /**
     * 階層権限付きトークン検証
     */
    static verifyHierarchicalToken(token: string): HierarchicalJWTPayload | null;
    /**
     * Express.js用階層認証ミドルウェア
     */
    static hierarchicalAuthMiddleware(): (req: any, res: any, next: any) => Promise<any>;
}
