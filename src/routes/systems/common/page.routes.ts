import express from 'express';
import adminPageController from '../../../controllers/pages/admin-page.controller';
import publicPageController from '../../../controllers/pages/public-page.controller';
import { verifyAdminAuth, authMiddleware } from '../../../auth/middleware';

const router = express.Router();

// 管理者向けAPI
// すべてのページ取得
router.get('/api/v1/admin/pages', verifyAdminAuth, adminPageController.getAllPages);
// ページ取得
router.get('/api/v1/admin/pages/:slug', verifyAdminAuth, adminPageController.getPage);

// ページ保存
router.post('/api/v1/admin/pages/:slug', verifyAdminAuth, adminPageController.savePage);

// ページ公開
router.post('/api/v1/admin/pages/:slug/publish', verifyAdminAuth, adminPageController.publishPage);

// ページ履歴取得
router.get('/api/v1/admin/pages/:slug/history', verifyAdminAuth, adminPageController.getPageHistory);

// 特定バージョンの履歴取得
router.get('/api/v1/admin/pages/:slug/history/:version', verifyAdminAuth, adminPageController.getPageHistoryVersion);

// バージョン復元
router.post('/api/v1/admin/pages/:slug/restore', verifyAdminAuth, adminPageController.restorePageVersion);

// 公開向けAPI
// 公開ページ取得（認証不要）
router.get('/api/v1/pages/:slug', publicPageController.getPublicPage);

export default router;
