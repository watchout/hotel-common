import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { HierarchicalJWTPayload } from './types';

/**
 * 管理者認証ミドルウェア
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '認証トークンが必要です'
      });
    }
    
    // @ts-ignore - 型の互換性の問題
    const decoded = verifyToken(token) as HierarchicalJWTPayload;
    
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '管理者権限が必要です'
      });
    }
    
    // @ts-ignore - 型の互換性の問題
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: '無効なトークンです'
    });
  }
};