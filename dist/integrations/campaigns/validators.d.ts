import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { PrismaAdapter } from '../../database/prisma-adapter';
/**
 * リクエストボディのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
export declare function validateBody<T>(schema: ZodSchema<T>): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * クエリパラメータのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
export declare function validateQuery<T>(schema: ZodSchema<T>): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * パスパラメータのバリデーション用ミドルウェア
 * @param schema バリデーションスキーマ
 */
export declare function validateParams<T>(schema: ZodSchema<T>): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * キャンペーンコードの一意性をチェック
 * @param adapter Prismaアダプター
 */
export declare function validateUniqueCampaignCode(adapter: PrismaAdapter): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * キャンペーンカテゴリーコードの一意性をチェック
 * @param adapter Prismaアダプター
 */
export declare function validateUniqueCategoryCode(adapter: PrismaAdapter): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
