"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../auth/middleware");
const session_migration_service_1 = __importDefault(require("../services/session-migration.service"));
const logger_1 = require("../utils/logger");
const response_builder_1 = require("../utils/response-builder");
const router = express_1.default.Router();
/**
 * 既存注文データの移行実行
 * POST /api/v1/session-migration/migrate-orders
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.post('/migrate-orders', middleware_1.authMiddleware, async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        logger_1.logger.info('既存注文データ移行開始', { tenantId });
        const result = await session_migration_service_1.default.migrateExistingOrders(tenantId);
        if (result.success) {
            return response_builder_1.StandardResponseBuilder.success(res, {
                migratedCount: result.migratedCount,
                errors: result.errors
            }, { message: `${result.migratedCount}件の注文を正常に移行しました` });
        }
        else {
            return response_builder_1.StandardResponseBuilder.success(res, {
                migratedCount: result.migratedCount,
                errors: result.errors
            }, { message: `${result.migratedCount}件を移行しましたが、${result.errors.length}件でエラーが発生しました` });
        }
        logger_1.logger.info('既存注文データ移行完了', {
            tenantId,
            migratedCount: result.migratedCount,
            errorCount: result.errors.length
        });
    }
    catch (error) {
        logger_1.logger.error('既存注文データ移行エラー', error);
        const errorResponse = response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', '注文データの移行に失敗しました');
        return res.status(errorResponse.status).json(errorResponse.response);
    }
});
/**
 * セッション統計情報取得
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * GET /api/v1/session-migration/statistics
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.get('/statistics', middleware_1.authMiddleware, async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        const statistics = await session_migration_service_1.default.getSessionStatistics(tenantId);
        return response_builder_1.StandardResponseBuilder.success(res, { statistics });
        logger_1.logger.info('セッション統計情報取得完了', { tenantId, statistics });
    }
    catch (error) {
        logger_1.logger.error('セッション統計情報取得エラー', error);
        const errorResponse = response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', 'セッション統計情報の取得に失敗しました');
        return res.status(errorResponse.status).json(errorResponse.response);
    }
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * 後方互換性チェック
 * GET /api/v1/session-migration/compatibility-check
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
router.get('/compatibility-check', middleware_1.authMiddleware, async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        const compatibility = await session_migration_service_1.default.checkBackwardCompatibility(tenantId);
        return response_builder_1.StandardResponseBuilder.success(res, { compatibility });
        logger_1.logger.info('後方互換性チェック完了', { tenantId, compatibility });
    }
    catch (error) {
        logger_1.logger.error('後方互換性チェックエラー', error);
        const errorResponse = response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', '後方互換性チェックに失敗しました');
        return res.status(errorResponse.status).json(errorResponse.response);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
});
/**
 * 移行状況レポート取得
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * GET /api/v1/session-migration/report
 */
router.get('/report', middleware_1.authMiddleware, async (req, res) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tenantId = req.user?.tenant_id;
        if (!tenantId) {
            return res.status(400).json(response_builder_1.StandardResponseBuilder.error('BAD_REQUEST', 'テナントIDが必要です').response);
        }
        const [statistics, compatibility] = await Promise.all([
            session_migration_service_1.default.getSessionStatistics(tenantId),
            session_migration_service_1.default.checkBackwardCompatibility(tenantId)
        ]);
        const report = {
            generatedAt: new Date(),
            tenantId,
            statistics,
            compatibility,
            migrationStatus: {
                isComplete: compatibility.isCompatible,
                completionRate: statistics.orders.mappingRate,
                pendingActions: compatibility.recommendations
            }
        };
        return response_builder_1.StandardResponseBuilder.success(res, { report });
        logger_1.logger.info('移行状況レポート取得完了', { tenantId });
    }
    catch (error) {
        logger_1.logger.error('移行状況レポート取得エラー', error);
        const errorResponse = response_builder_1.StandardResponseBuilder.error('INTERNAL_ERROR', '移行状況レポートの取得に失敗しました');
        return res.status(errorResponse.status).json(errorResponse.response);
    }
});
exports.default = router;
