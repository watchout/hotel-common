import type { HierarchicalJWTPayload, JWTOptions } from './types';
/**
 * JWTトークンを生成
 * @param payload ペイロード
 * @param options オプション
 * @returns 生成されたトークン
 */
export declare function generateToken(payload: HierarchicalJWTPayload, options?: Partial<JWTOptions>): string;
/**
 * JWTトークンを検証
 * @param token トークン
 * @param secret シークレットキー
 * @returns デコードされたペイロード
 */
export declare function verifyToken(token: string, secret?: string): HierarchicalJWTPayload;
/**
 * JWTトークンをデコード（検証なし）
 * @param token トークン
 * @returns デコードされたペイロード
 */
export declare function decodeToken(token: string): HierarchicalJWTPayload | null;
