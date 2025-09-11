/**
 * ソフトデリート用Prismaミドルウェア
 *
 * このミドルウェアは、Prismaクエリに自動的にソフトデリートフィルタを適用します。
 * is_deleted = falseの条件を自動的に追加し、削除済みレコードを除外します。
 */
import { PrismaClient } from '@prisma/client';
/**
 * Prismaミドルウェア設定関数
 * @param prisma PrismaClientインスタンス
 */
export declare function setupSoftDeleteMiddleware(prisma: PrismaClient): void;
/**
 * ソフトデリート用Whereフィルタ生成関数
 * 手動でクエリを作成する際に使用
 */
export declare function getSoftDeleteFilter(modelName: string): Record<string, any>;
