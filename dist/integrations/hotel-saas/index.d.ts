/**
 * hotel-saas専用統合ライブラリ
 * 完全統合モード実装
 */
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../../types/auth';
/**
 * hotel-saas統合設定
 */
export declare const HOTEL_SAAS_CONFIG: {
    JWT_SECRET: string;
    ACCESS_TOKEN_EXPIRES: string;
    REFRESH_TOKEN_EXPIRES: string;
    SYSTEM_ID: string;
    INTEGRATION_MODE: string;
    USE_UNIFIED_DATABASE: boolean;
    USE_EVENT_DRIVEN: boolean;
};
export declare class JwtManager {
    static generateTokenPair(payload: any): {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
    static verifyAccessToken(token: string): string | jwt.JwtPayload | null;
    static extractTokenFromBearer(bearerToken: string): string | null;
    static hashPassword(password: string): string;
    static verifyPassword(password: string, hash: string): boolean;
}
export type { JwtPayload } from '../../types/auth';
export interface HotelSaasAuthResponse {
    success: boolean;
    user?: any;
    error?: string;
}
export declare class HotelSaasAuth {
    /**
     * hotel-saas用の認証機能
     * 完全統合モード実装
     */
    /**
     * ログイン処理（統合認証）
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
     * JWT生成メソッド（hotel-saas側から直接呼び出し用）
     */
    static generateToken(payload: any, options?: {
        expiresIn?: string;
    }): string;
    /**
     * トークン検証
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
     * トークン検証（validateTokenメソッド - 互換性のため）
     */
    static validateToken(token: string): {
        valid: boolean;
        payload?: JwtPayload;
        error?: string;
    };
    /**
     * パスワードハッシュ化（既存システムとの互換性維持）
     */
    static hashPassword: typeof JwtManager.hashPassword;
    static verifyPassword: typeof JwtManager.verifyPassword;
}
/**
 * 使用例とサンプルコード
 */
export declare const INTEGRATION_EXAMPLES: {
    EXPRESS_USAGE: string;
    DEVICE_API_USAGE: string;
};
