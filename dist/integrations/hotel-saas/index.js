"use strict";
/**
 * hotel-saas専用統合ライブラリ
 * 完全統合モード実装
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTEGRATION_EXAMPLES = exports.HotelSaasAuth = exports.JwtManager = exports.HOTEL_SAAS_CONFIG = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * hotel-saas統合設定
 */
exports.HOTEL_SAAS_CONFIG = {
    JWT_SECRET: process.env.JWT_SECRET || 'hotel-common-secret-change-in-production',
    ACCESS_TOKEN_EXPIRES: '8h',
    REFRESH_TOKEN_EXPIRES: '30d',
    SYSTEM_ID: 'hotel-saas',
    // 完全統合モード設定
    INTEGRATION_MODE: 'FULL',
    USE_UNIFIED_DATABASE: true,
    USE_EVENT_DRIVEN: true
};
// JWT認証機能のエクスポート
class JwtManager {
    static generateTokenPair(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, exports.HOTEL_SAAS_CONFIG.JWT_SECRET, {
            expiresIn: exports.HOTEL_SAAS_CONFIG.ACCESS_TOKEN_EXPIRES
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, exports.HOTEL_SAAS_CONFIG.JWT_SECRET, {
            expiresIn: exports.HOTEL_SAAS_CONFIG.REFRESH_TOKEN_EXPIRES
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 28800 // 8時間（秒）
        };
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, exports.HOTEL_SAAS_CONFIG.JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
    static extractTokenFromBearer(bearerToken) {
        const parts = bearerToken.split(' ');
        return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
    }
    static hashPassword(password) {
        return bcrypt_1.default.hashSync(password, 10);
    }
    static verifyPassword(password, hash) {
        return bcrypt_1.default.compareSync(password, hash);
    }
}
exports.JwtManager = JwtManager;
// hotel-saas用認証クラス（完全統合モード）
class HotelSaasAuth {
    /**
     * hotel-saas用の認証機能
     * 完全統合モード実装
     */
    /**
     * ログイン処理（統合認証）
     */
    static async loginWithJWT(userCredentials, existingAuthLogic) {
        try {
            // 既存認証ロジック実行
            const authResult = await existingAuthLogic(userCredentials);
            if (!authResult.success) {
                return { success: false, error: authResult.error };
            }
            // 統一JWT生成
            const jwtPayload = {
                user_id: authResult.staff.id,
                tenant_id: authResult.staff.tenantId || 'default',
                email: authResult.staff.email,
                role: authResult.staff.role || 'staff',
                level: authResult.staff.baseLevel || 3,
                permissions: authResult.staff.permissions || []
            };
            // JWTトークン生成
            const tokens = JwtManager.generateTokenPair(jwtPayload);
            return {
                success: true,
                tokens,
                user: authResult.user
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed'
            };
        }
    }
    /**
     * JWT生成メソッド（hotel-saas側から直接呼び出し用）
     */
    static generateToken(payload, options) {
        try {
            const expiresIn = options?.expiresIn || exports.HOTEL_SAAS_CONFIG.ACCESS_TOKEN_EXPIRES;
            return jsonwebtoken_1.default.sign(payload, exports.HOTEL_SAAS_CONFIG.JWT_SECRET, {
                expiresIn: expiresIn
            });
        }
        catch (error) {
            throw new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * トークン検証
     */
    static verifyToken(token) {
        const cleanToken = JwtManager.extractTokenFromBearer(token) || token;
        const payload = JwtManager.verifyAccessToken(cleanToken);
        if (!payload) {
            return { valid: false, error: 'Invalid or expired token' };
        }
        // @ts-ignore - 型定義が不完全
        return { valid: true, payload };
    }
    /**
     * Express.js用認証ミドルウェア
     */
    static expressMiddleware() {
        return (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: 'Authorization header required' });
            }
            const result = HotelSaasAuth.verifyToken(authHeader);
            if (!result.valid) {
                return res.status(401).json({ error: result.error });
            }
            req.user = result.payload;
            next();
        };
    }
    /**
     * トークン検証（validateTokenメソッド - 互換性のため）
     */
    static validateToken(token) {
        return HotelSaasAuth.verifyToken(token);
    }
    /**
     * パスワードハッシュ化（既存システムとの互換性維持）
     */
    static hashPassword = JwtManager.hashPassword;
    static verifyPassword = JwtManager.verifyPassword;
}
exports.HotelSaasAuth = HotelSaasAuth;
/**
 * 使用例とサンプルコード
 */
exports.INTEGRATION_EXAMPLES = {
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
};
