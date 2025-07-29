"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtManager = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// JWT設定定数
const JWT_SECRET = process.env.JWT_SECRET || 'hotel-common-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hotel-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRES = '8h'; // 8時間
const REFRESH_TOKEN_EXPIRES = '30d'; // 30日
class JwtManager {
    /**
     * アクセストークンを生成
     */
    static generateAccessToken(payload) {
        const jwtPayload = {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8時間後
            jti: crypto_1.default.randomUUID()
        };
        return jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRES
        });
    }
    /**
     * リフレッシュトークンを生成
     */
    static generateRefreshToken(userId, tenantId) {
        const payload = {
            user_id: userId,
            tenant_id: tenantId,
            type: 'refresh',
            jti: crypto_1.default.randomUUID()
        };
        return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES
        });
    }
    /**
     * アクセストークンを検証
     */
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * リフレッシュトークンを検証
     */
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * トークンペアを生成（アクセス＋リフレッシュ）
     */
    static generateTokenPair(userPayload) {
        const accessToken = this.generateAccessToken(userPayload);
        const refreshToken = this.generateRefreshToken(userPayload.user_id, userPayload.tenant_id);
        return {
            accessToken,
            refreshToken,
            expiresIn: 8 * 60 * 60 // 8時間（秒）
        };
    }
    /**
     * パスワードハッシュ化
     */
    static hashPassword(password) {
        const salt = crypto_1.default.randomBytes(16).toString('hex');
        const hash = crypto_1.default.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }
    /**
     * パスワード検証
     */
    static verifyPassword(password, hashedPassword) {
        const [salt, hash] = hashedPassword.split(':');
        const verifyHash = crypto_1.default.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }
    /**
     * API Key生成
     */
    static generateApiKey() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Bearerトークンからトークン部分を抽出
     */
    static extractTokenFromBearer(bearerToken) {
        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            return null;
        }
        return bearerToken.substring(7);
    }
}
exports.JwtManager = JwtManager;
//# sourceMappingURL=jwt.js.map