import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { HierarchicalJWTPayload, JWTOptions } from './types';

const DEFAULT_JWT_SECRET = 'hotel-common-development-secret';
const DEFAULT_EXPIRES_IN = '24h';

/**
 * JWTトークンを生成
 * @param payload ペイロード
 * @param options オプション
 * @returns 生成されたトークン
 */
export function generateToken(
  payload: HierarchicalJWTPayload,
  options?: Partial<JWTOptions>
): string {
  const secret = options?.secret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  const expiresIn = options?.expiresIn || process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
  
  // payloadに既にexpがある場合はオプションを指定しない
  const signOptions: jwt.SignOptions = payload.exp
    ? {}
    : { expiresIn: expiresIn as StringValue | number };
  return jwt.sign(payload, secret, signOptions);
}

/**
 * JWTトークンを検証
 * @param token トークン
 * @param secret シークレットキー
 * @returns デコードされたペイロード
 */
export function verifyToken(
  token: string,
  secret?: string
): HierarchicalJWTPayload {
  const jwtSecret = secret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  
  try {
    // Enforce HS256 and exp validation
    return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as HierarchicalJWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * JWTトークンをデコード（検証なし）
 * @param token トークン
 * @returns デコードされたペイロード
 */
export function decodeToken(token: string): HierarchicalJWTPayload | null {
  try {
    return jwt.decode(token) as HierarchicalJWTPayload;
  } catch (error) {
    return null;
  }
}
