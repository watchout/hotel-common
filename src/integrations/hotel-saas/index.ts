/**
 * hotel-saas専用統合ライブラリ
 * 完全統合モード実装
 */

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import type { JwtPayload } from '../../types/auth'
import type { StringValue } from 'ms'

/**
 * hotel-saas統合設定
 */
export const HOTEL_SAAS_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'hotel-common-secret-change-in-production',
  ACCESS_TOKEN_EXPIRES: '8h',
  REFRESH_TOKEN_EXPIRES: '30d',
  SYSTEM_ID: 'hotel-saas',
  // 完全統合モード設定
  INTEGRATION_MODE: 'FULL',
  USE_UNIFIED_DATABASE: true,
  USE_EVENT_DRIVEN: true
}

// JWT認証機能のエクスポート
export class JwtManager {
  static generateTokenPair(payload: any) {
    const accessToken = jwt.sign(payload, HOTEL_SAAS_CONFIG.JWT_SECRET, { 
      expiresIn: HOTEL_SAAS_CONFIG.ACCESS_TOKEN_EXPIRES as StringValue 
    });
    const refreshToken = jwt.sign(payload, HOTEL_SAAS_CONFIG.JWT_SECRET, { 
      expiresIn: HOTEL_SAAS_CONFIG.REFRESH_TOKEN_EXPIRES as StringValue 
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: 28800 // 8時間（秒）
    };
  }

  static verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, HOTEL_SAAS_CONFIG.JWT_SECRET);
    } catch (error: unknown) {
      return null;
    }
  }

  static extractTokenFromBearer(bearerToken: string) {
    const parts = bearerToken.split(' ');
    return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  }

  static hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  static verifyPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}

// 認証用型定義のエクスポート
export type { 
  JwtPayload
} from '../../types/auth'

// hotel-saas用の追加型定義
export interface HotelSaasAuthResponse {
  success: boolean
  user?: any
  error?: string
}

// hotel-saas用認証クラス（完全統合モード）
export class HotelSaasAuth {
  /**
   * hotel-saas用の認証機能
   * 完全統合モード実装
   */
  
  /**
   * ログイン処理（統合認証）
   */
  static async loginWithJWT(
    userCredentials: { email: string; password: string },
    existingAuthLogic: (creds: any) => Promise<any>
  ): Promise<{
    success: boolean
    tokens?: {
      accessToken: string
      refreshToken: string
      expiresIn: number
    }
    user?: any
    error?: string
  }> {
    try {
      // 既存認証ロジック実行
      const authResult = await existingAuthLogic(userCredentials)
      
      if (!authResult.success) {
        return { success: false, error: authResult.error }
      }
      
      // 統一JWT生成
      const jwtPayload: Omit<JwtPayload, 'iat' | 'exp' | 'jti'> = {
        user_id: authResult.staff.id,
        tenant_id: authResult.staff.tenantId || 'default',
        email: authResult.staff.email,
        role: authResult.staff.role || 'staff',
        level: authResult.staff.baseLevel || 3,
        permissions: authResult.staff.permissions || []
      }
      
      // JWTトークン生成
      const tokens = JwtManager.generateTokenPair(jwtPayload)
      
      return {
        success: true,
        tokens,
        user: authResult.user
      }
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }
    }
  }
  
  /**
   * JWT生成メソッド（hotel-saas側から直接呼び出し用）
   */
  static generateToken(payload: any, options?: { expiresIn?: string }): string {
    try {
      const expiresIn = options?.expiresIn || HOTEL_SAAS_CONFIG.ACCESS_TOKEN_EXPIRES;
      return jwt.sign(payload, HOTEL_SAAS_CONFIG.JWT_SECRET, { 
        expiresIn: expiresIn as StringValue 
      });
    } catch (error: unknown) {
      throw new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * トークン検証
   */
  static verifyToken(token: string): {
    valid: boolean
    payload?: JwtPayload
    error?: string
  } {
    const cleanToken = JwtManager.extractTokenFromBearer(token) || token
    const payload = JwtManager.verifyAccessToken(cleanToken)
    
    if (!payload) {
      return { valid: false, error: 'Invalid or expired token' }
    }
    
    // @ts-ignore - 型定義が不完全
    return { valid: true, payload }
  }
  
  /**
   * Express.js用認証ミドルウェア
   */
  static expressMiddleware() {
    return (req: any, res: any, next: any) => {
      const authHeader = req.headers.authorization
      
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' })
      }
      
      const result = HotelSaasAuth.verifyToken(authHeader)
      
      if (!result.valid) {
        return res.status(401).json({ error: result.error })
      }
      
      req.user = result.payload
      next()
    }
  }
  
  /**
   * トークン検証（validateTokenメソッド - 互換性のため）
   */
  static validateToken(token: string) {
    return HotelSaasAuth.verifyToken(token)
  }
  
  /**
   * パスワードハッシュ化（既存システムとの互換性維持）
   */
  static hashPassword = JwtManager.hashPassword
  static verifyPassword = JwtManager.verifyPassword
}



/**
 * 使用例とサンプルコード
 */
export const INTEGRATION_EXAMPLES = {
  // 完全統合モードでの使用例
  EXPRESS_USAGE: `
// hotel-saas/src/auth/jwt-integration.js
import { HotelSaasAuth } from '@hotel-common/integrations/hotel-saas'

// 統合認証を使用したログイン処理
app.post('/login', async (req, res) => {
  const result = await HotelSaasAuth.loginWithJWT(
    req.body,
    // 既存の認証ロジックを渡す
    async (creds) => {
      // 既存の認証処理
      return await existingAuthFunction(creds)
    }
  )
  
  if (result.success) {
    res.json({
      tokens: result.tokens,
      user: result.user
    })
  } else {
    res.status(401).json({ error: result.error })
  }
})

// 保護されたルートで使用
app.use('/api/protected', HotelSaasAuth.expressMiddleware())
`,

  // デバイス管理APIの使用例
  DEVICE_API_USAGE: `
// hotel-saas/src/device/device-api.js
import axios from 'axios'

// デバイス一覧取得
export async function getDevices(token) {
  return axios.get('http://localhost:3400/api/v1/devices', {
    headers: {
      Authorization: \`Bearer \${token}\`
    }
  })
}

// 新しいデバイス登録
export async function registerDevice(token, deviceData) {
  return axios.post('http://localhost:3400/api/v1/devices', deviceData, {
    headers: {
      Authorization: \`Bearer \${token}\`
    }
  })
}

// デバイス情報更新
export async function updateDevice(token, deviceId, deviceData) {
  return axios.put(\`http://localhost:3400/api/v1/devices/\${deviceId}\`, deviceData, {
    headers: {
      Authorization: \`Bearer \${token}\`
    }
  })
}
`
}