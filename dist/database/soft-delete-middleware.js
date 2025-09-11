"use strict";
/**
 * ソフトデリート用Prismaミドルウェア
 *
 * このミドルウェアは、Prismaクエリに自動的にソフトデリートフィルタを適用します。
 * is_deleted = falseの条件を自動的に追加し、削除済みレコードを除外します。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSoftDeleteMiddleware = setupSoftDeleteMiddleware;
exports.getSoftDeleteFilter = getSoftDeleteFilter;
const logger_1 = require("../utils/logger");
const logger = logger_1.HotelLogger.getInstance();
/**
 * ソフトデリート対応テーブル定義
 * 各テーブルのソフトデリートフィールド名を定義
 */
const SOFT_DELETE_TABLES = {
    // 完全対応テーブル
    'Order': {
        deletedField: 'isDeleted'
    },
    // 部分対応テーブル（isActiveフィールド使用）
    'deviceRoom': {
        // is_deletedフィールドが存在するようになったため、有効化
        deletedField: 'is_deleted',
        activeField: 'isActive'
    },
    'response_trees': {
        deletedField: 'is_deleted',
        activeField: 'isActive'
    },
    'staff': {
        deletedField: 'is_deleted',
        activeField: 'is_active'
    },
    'admin': {
        deletedField: 'is_deleted',
        activeField: 'is_active'
    },
    'room_grades': {
        deletedField: 'is_deleted',
        activeField: 'is_active',
        statusField: 'status',
        statusValue: ['active']
    },
    // 部分対応テーブル（statusフィールド使用）
    'Tenant': {
        deletedField: 'is_deleted',
        statusField: 'status',
        statusValue: ['active']
    },
    'campaigns': {
        deletedField: 'is_deleted',
        statusField: 'status',
        statusValue: ['DRAFT', 'ACTIVE', 'PAUSED', 'SCHEDULED']
    }
};
/**
 * Prismaミドルウェア設定関数
 * @param prisma PrismaClientインスタンス
 */
function setupSoftDeleteMiddleware(prisma) {
    logger.info('ソフトデリートミドルウェアを設定中...');
    prisma.$use(async (params, next) => {
        // 検索系操作のみ対象
        const isQueryAction = ['findUnique', 'findFirst', 'findMany', 'count', 'aggregate'].includes(params.action);
        // 対象テーブルかチェック
        const tableConfig = SOFT_DELETE_TABLES[params.model || ''];
        // 対象テーブルでない場合、そのまま次へ
        if (!isQueryAction || !tableConfig) {
            return next(params);
        }
        // パラメータがない場合は初期化
        if (!params.args) {
            params.args = {};
        }
        // whereがない場合は初期化
        if (!params.args.where) {
            params.args.where = {};
        }
        // 明示的にis_deleted指定がある場合はそのまま使用
        const { deletedField, activeField, statusField, statusValue } = tableConfig;
        // 削除フラグが明示的に指定されていない場合のみ適用
        if (params.args.where[deletedField] === undefined) {
            if (deletedField) {
                // is_deleted = false を追加
                params.args.where[deletedField] = false;
            }
            // アクティブフラグがある場合
            if (activeField && params.args.where[activeField] === undefined) {
                params.args.where[activeField] = true;
            }
            // ステータスフィールドがある場合
            if (statusField && statusValue && params.args.where[statusField] === undefined) {
                if (statusValue.length === 1) {
                    params.args.where[statusField] = statusValue[0];
                }
                else if (statusValue.length > 1) {
                    params.args.where[statusField] = { in: statusValue };
                }
            }
        }
        // 次のミドルウェアまたは実際のクエリ実行へ
        return next(params);
    });
    logger.info('ソフトデリートミドルウェア設定完了');
}
/**
 * ソフトデリート用Whereフィルタ生成関数
 * 手動でクエリを作成する際に使用
 */
function getSoftDeleteFilter(modelName) {
    const tableConfig = SOFT_DELETE_TABLES[modelName];
    if (!tableConfig) {
        return {};
    }
    const filter = {};
    const { deletedField, activeField, statusField, statusValue } = tableConfig;
    // 削除フラグ
    if (deletedField) {
        filter[deletedField] = false;
    }
    // アクティブフラグ
    if (activeField) {
        filter[activeField] = true;
    }
    // ステータスフィールド
    if (statusField && statusValue) {
        if (statusValue.length === 1) {
            filter[statusField] = statusValue[0];
        }
        else if (statusValue.length > 1) {
            filter[statusField] = { in: statusValue };
        }
    }
    return filter;
}
