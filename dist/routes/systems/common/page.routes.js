"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../../../auth/middleware");
const admin_page_controller_1 = __importDefault(require("../../../controllers/pages/admin-page.controller"));
const public_page_controller_1 = __importDefault(require("../../../controllers/pages/public-page.controller"));
const router = express_1.default.Router();
// 管理者向けAPI
// すべてのページ取得
router.get('/api/v1/admin/pages', middleware_1.verifyAdminAuth, admin_page_controller_1.default.getAllPages);
// ページ取得
router.get('/api/v1/admin/pages/:slug', middleware_1.verifyAdminAuth, admin_page_controller_1.default.getPage);
// ページ保存
router.post('/api/v1/admin/pages/:slug', middleware_1.verifyAdminAuth, admin_page_controller_1.default.savePage);
// ページ公開
router.post('/api/v1/admin/pages/:slug/publish', middleware_1.verifyAdminAuth, admin_page_controller_1.default.publishPage);
// ページ履歴取得
router.get('/api/v1/admin/pages/:slug/history', middleware_1.verifyAdminAuth, admin_page_controller_1.default.getPageHistory);
// 特定バージョンの履歴取得（クエリパラメータ方式に変更）
router.get('/api/v1/admin/page-history', middleware_1.verifyAdminAuth, admin_page_controller_1.default.getPageHistoryVersion);
// バージョン復元
router.post('/api/v1/admin/pages/:slug/restore', middleware_1.verifyAdminAuth, admin_page_controller_1.default.restorePageVersion);
// 公開向けAPI
// 公開ページ取得（認証不要）
router.get('/api/v1/pages/:slug', public_page_controller_1.default.getPublicPage);
exports.default = router;
