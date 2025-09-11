/**
 * Google Playアプリ選択機能のバリデーション関数
 */
import { Request, Response, NextFunction } from 'express';
/**
 * リクエストボディのバリデーション
 */
export declare const validateBody: (schema: any) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * パッケージ名の一意性チェック
 */
export declare const validateUniquePackageName: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GooglePlayAppの存在チェック
 */
export declare const validateGooglePlayAppExists: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * HotelAppの存在チェック
 */
export declare const validateHotelAppExists: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * LayoutAppBlockの存在チェック
 */
export declare const validateLayoutAppBlockExists: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
