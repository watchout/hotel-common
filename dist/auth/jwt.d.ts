import { JwtPayload } from '../types/auth';
export declare class JwtManager {
    /**
     * アクセストークンを生成
     */
    static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'jti'>): string;
    /**
     * リフレッシュトークンを生成
     */
    static generateRefreshToken(userId: string, tenantId: string): string;
    /**
     * アクセストークンを検証
     */
    static verifyAccessToken(token: string): JwtPayload | null;
    /**
     * リフレッシュトークンを検証
     */
    static verifyRefreshToken(token: string): any | null;
    /**
     * トークンペアを生成（アクセス＋リフレッシュ）
     */
    static generateTokenPair(userPayload: Omit<JwtPayload, 'iat' | 'exp' | 'jti'>): {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
    /**
     * パスワードハッシュ化
     */
    static hashPassword(password: string): string;
    /**
     * パスワード検証
     */
    static verifyPassword(password: string, hashedPassword: string): boolean;
    /**
     * API Key生成
     */
    static generateApiKey(): string;
    /**
     * Bearerトークンからトークン部分を抽出
     */
    static extractTokenFromBearer(bearerToken: string): string | null;
}
