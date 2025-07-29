/**
 * hotel-saas専用統合ライブラリ
 * Phase 1: JWT認証のみ統合、SQLite + 独自API維持
 */
import { JwtManager } from '../../auth/jwt';
import type { JwtPayload } from '../../types/auth';
export { JwtManager } from '../../auth/jwt';
export type { JwtPayload } from '../../types/auth';
export interface HotelSaasAuthResponse {
    success: boolean;
    user?: any;
    error?: string;
}
export declare class HotelSaasAuth {
    /**
     * hotel-saas用の簡易認証ラッパー
     * 既存SQLite + 独自APIを維持しながらJWTのみ統合
     */
    /**
     * ログイン処理（hotel-saas既存ロジック + JWT生成）
     */
    static loginWithJWT(userCredentials: {
        email: string;
        password: string;
    }, existingAuthLogic: (creds: any) => Promise<any>): Promise<{
        success: boolean;
        tokens?: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
        user?: any;
        error?: string;
    }>;
    /**
     * トークン検証ミドルウェア
     */
    static verifyToken(token: string): {
        valid: boolean;
        payload?: JwtPayload;
        error?: string;
    };
    /**
     * Express.js用認証ミドルウェア
     */
    static expressMiddleware(): (req: any, res: any, next: any) => any;
    /**
     * パスワードハッシュ化（既存システムとの互換性維持）
     */
    static hashPassword: typeof JwtManager.hashPassword;
    static verifyPassword: typeof JwtManager.verifyPassword;
}
/**
 * hotel-saas統合設定
 */
export declare const HOTEL_SAAS_CONFIG: {
    readonly JWT_SECRET: string;
    readonly ACCESS_TOKEN_EXPIRES: "8h";
    readonly REFRESH_TOKEN_EXPIRES: "30d";
    readonly SYSTEM_ID: "hotel-saas";
};
/**
 * 使用例とサンプルコード
 */
export declare const INTEGRATION_EXAMPLES: {
    EXPRESS_USAGE: string;
    GRADUAL_MIGRATION: string;
};
//# sourceMappingURL=index.d.ts.map