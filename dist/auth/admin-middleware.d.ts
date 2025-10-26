import type { Request, Response, NextFunction } from 'express';
/**
 * 管理者認証ミドルウェア
 */
export declare const adminAuthMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
