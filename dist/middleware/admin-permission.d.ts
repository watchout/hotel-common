/**
 * 管理者権限チェックミドルウェア
 * baseLevelベースの権限管理（既存roleフィールドから計算）
 */
import type { Request, Response, NextFunction } from 'express';
/**
 * 管理者権限レベルチェックミドルウェア
 */
export declare const requireAdminLevel: (requiredLevel: number) => (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * スタッフ管理権限チェック（レベル3以上）
 */
export declare const requireStaffManagementPermission: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * スタッフ作成・削除権限チェック（レベル4以上）
 */
export declare const requireStaffAdminPermission: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * システム管理権限チェック（レベル5）
 */
export declare const requireSystemAdminPermission: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * 自分より上位レベルのスタッフ操作を防ぐミドルウェア
 */
export declare const preventHigherLevelStaffOperation: () => (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => void;
/**
 * テナント管理者権限チェック
 */
export declare const requireTenantAdmin: (req: Request & {
    user?: any;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
