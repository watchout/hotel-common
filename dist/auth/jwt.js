"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.decodeToken = decodeToken;
const jwt = __importStar(require("jsonwebtoken"));
const DEFAULT_JWT_SECRET = 'hotel-common-development-secret';
const DEFAULT_EXPIRES_IN = '24h';
/**
 * JWTトークンを生成
 * @param payload ペイロード
 * @param options オプション
 * @returns 生成されたトークン
 */
function generateToken(payload, options) {
    const secret = options?.secret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    const expiresIn = options?.expiresIn || process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
    // payloadに既にexpがある場合はオプションを指定しない
    const signOptions = payload.exp
        ? {}
        : { expiresIn: expiresIn };
    return jwt.sign(payload, secret, signOptions);
}
/**
 * JWTトークンを検証
 * @param token トークン
 * @param secret シークレットキー
 * @returns デコードされたペイロード
 */
function verifyToken(token, secret) {
    const jwtSecret = secret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    try {
        // Enforce HS256 and exp validation
        return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
/**
 * JWTトークンをデコード（検証なし）
 * @param token トークン
 * @returns デコードされたペイロード
 */
function decodeToken(token) {
    try {
        return jwt.decode(token);
    }
    catch (error) {
        return null;
    }
}
