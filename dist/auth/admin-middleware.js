"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = void 0;
const jwt_1 = require("./jwt");
/**
 * 管理者認証ミドルウェア
 */
const adminAuthMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: '認証トークンが必要です'
            });
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - 型の互換性の問題
        const decoded = (0, jwt_1.verifyToken)(token);
        if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'FORBIDDEN',
                message: '管理者権限が必要です'
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - 型の互換性の問題
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: '無効なトークンです'
        });
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
