"use strict";
/** @req: REQ-API-GEN-000 */
/**
 * 汎用CRUD ルーター
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 *
 * フィーチャーフラグ: GENERIC_RESOURCES_ENABLED
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const _resource__get_1 = __importDefault(require("./resources/[resource].get"));
const _resource__post_1 = __importDefault(require("./resources/[resource].post"));
const _resource___id__get_1 = __importDefault(require("./resources/[resource]-[id].get"));
const _resource___id__patch_1 = __importDefault(require("./resources/[resource]-[id].patch"));
const _resource___id__delete_1 = __importDefault(require("./resources/[resource]-[id].delete"));
const router = (0, express_1.Router)();
// フィーチャーフラグチェック
const isEnabled = process.env.GENERIC_RESOURCES_ENABLED === 'true';
if (isEnabled) {
    console.log('✅ [hotel-common] Generic Resources API: ENABLED');
    // GET /api/v1/admin/resources/:resource - 一覧取得
    router.get('/resources/:resource', _resource__get_1.default);
    // POST /api/v1/admin/resources/:resource - 作成
    router.post('/resources/:resource', _resource__post_1.default);
    // GET /api/v1/admin/resources/:resource/:id - 単体取得
    router.get('/resources/:resource/:id', _resource___id__get_1.default);
    // PATCH /api/v1/admin/resources/:resource/:id - 更新
    router.patch('/resources/:resource/:id', _resource___id__patch_1.default);
    // DELETE /api/v1/admin/resources/:resource/:id - 削除
    router.delete('/resources/:resource/:id', _resource___id__delete_1.default);
}
else {
    console.log('⚠️ [hotel-common] Generic Resources API: DISABLED');
    // 無効時は404を返す
    router.all('/resources/*', (req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 'FEATURE_DISABLED',
                message: 'Generic Resources API is currently disabled'
            }
        });
    });
}
exports.default = router;
