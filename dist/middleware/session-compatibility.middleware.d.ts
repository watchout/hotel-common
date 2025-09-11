import { Request, Response, NextFunction } from 'express';
/**
 * セッション互換性ミドルウェア
 * 既存APIの後方互換性を確保
 */
/**
 * 注文API用セッション自動紐付けミドルウェア
 * セッションIDが未設定の注文に対して自動でセッションを検索・紐付け
 */
export declare const autoSessionMapping: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * レガシーAPI互換性ミドルウェア
 * セッション情報なしでも動作するよう既存APIを拡張
 */
export declare const legacyApiCompatibility: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * セッション必須チェックミドルウェア
 * 新しいAPIでセッションが必須の場合に使用
 */
export declare const requireSession: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * セッション状態チェックミドルウェア
 * セッションが適切な状態かを確認
 */
export declare const validateSessionStatus: (allowedStatuses?: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 移行期間用の柔軟なセッションチェック
 * セッションがない場合でも警告ログを出すだけで処理を継続
 */
export declare const flexibleSessionCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    autoSessionMapping: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    legacyApiCompatibility: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requireSession: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    validateSessionStatus: (allowedStatuses?: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    flexibleSessionCheck: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
