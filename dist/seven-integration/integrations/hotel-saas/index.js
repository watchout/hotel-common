"use strict";
/**
 * hotel-saas専用統合ライブラリ
 * Phase 1: JWT認証のみ統合、SQLite + 独自API維持
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTEGRATION_EXAMPLES = exports.HOTEL_SAAS_CONFIG = exports.HotelSaasAuth = exports.JwtManager = void 0;
const jwt_1 = require("../../auth/jwt");
// JWT認証機能のエクスポート
var jwt_2 = require("../../auth/jwt");
Object.defineProperty(exports, "JwtManager", { enumerable: true, get: function () { return jwt_2.JwtManager; } });
// hotel-saas用カスタム認証クラス
class HotelSaasAuth {
    /**
     * hotel-saas用の簡易認証ラッパー
     * 既存SQLite + 独自APIを維持しながらJWTのみ統合
     */
    /**
     * ログイン処理（hotel-saas既存ロジック + JWT生成）
     */
    static async loginWithJWT(userCredentials, existingAuthLogic) {
        try {
            // 1. 既存のhotel-saas認証ロジック実行
            const authResult = await existingAuthLogic(userCredentials);
            if (!authResult.success) {
                return { success: false, error: authResult.error };
            }
            // 2. 統一JWT生成
            const jwtPayload = {
                user_id: authResult.staff.id,
                tenant_id: authResult.staff.tenantId || 'default',
                email: authResult.staff.email,
                role: authResult.staff.role || 'staff',
                level: authResult.staff.baseLevel || 3,
                permissions: authResult.staff.permissions || []
            };
            const tokens = jwt_1.JwtManager.generateTokenPair(jwtPayload);
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
     * トークン検証ミドルウェア
     */
    static verifyToken(token) {
        const cleanToken = jwt_1.JwtManager.extractTokenFromBearer(token) || token;
        const payload = jwt_1.JwtManager.verifyAccessToken(cleanToken);
        if (!payload) {
            return { valid: false, error: 'Invalid or expired token' };
        }
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
     * パスワードハッシュ化（既存システムとの互換性維持）
     */
    static hashPassword = jwt_1.JwtManager.hashPassword;
    static verifyPassword = jwt_1.JwtManager.verifyPassword;
}
exports.HotelSaasAuth = HotelSaasAuth;
/**
 * hotel-saas統合設定
 */
exports.HOTEL_SAAS_CONFIG = {
    JWT_SECRET: process.env.JWT_SECRET || 'hotel-common-secret-change-in-production',
    ACCESS_TOKEN_EXPIRES: '8h',
    REFRESH_TOKEN_EXPIRES: '30d',
    SYSTEM_ID: 'hotel-saas'
};
/**
 * 使用例とサンプルコード
 */
exports.INTEGRATION_EXAMPLES = {
    // Express.js での使用例
    EXPRESS_USAGE: `
// hotel-saas/src/auth/jwt-integration.js
import { HotelSaasAuth } from '@hotel-common/integrations/hotel-saas'

// 既存のログイン処理を拡張
app.post('/login', async (req, res) => {
  const result = await HotelSaasAuth.loginWithJWT(
    req.body,
    // 既存の認証ロジックを渡す
    async (creds) => {
      // 既存のSQLite認証処理
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
    // 段階的移行の例
    GRADUAL_MIGRATION: `
// Phase 1: 認証のみ統合（現在）
import { HotelSaasAuth } from '@hotel-common/integrations/hotel-saas'

// Phase 2: 新機能で統一APIクライアント使用（将来）
import { HotelApiClient } from '@hotel-common/api'

// Phase 3: データベース統合（MVP完成後）
import { HotelDatabase } from '@hotel-common/database'
`
};
//# sourceMappingURL=index.js.map