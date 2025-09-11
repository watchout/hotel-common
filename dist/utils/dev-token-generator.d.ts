/**
 * 開発用JWTトークン生成ユーティリティ
 * 本番同等の有効なトークンを生成
 */
export declare class DevTokenGenerator {
    /**
     * 開発用管理者トークン生成
     */
    static generateAdminToken(tenantId?: string): string;
    /**
     * 開発用スタッフトークン生成
     */
    static generateStaffToken(tenantId?: string): string;
    /**
     * 開発用ゲストトークン生成
     */
    static generateGuestToken(tenantId?: string): string;
    /**
     * トークンの検証・デコード
     */
    static verifyToken(token: string): any;
    /**
     * 開発用トークン一覧表示
     */
    static displayDevTokens(tenantId?: string): void;
}
export default DevTokenGenerator;
