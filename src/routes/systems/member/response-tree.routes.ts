import express from 'express';

import { adminAuthMiddleware } from '../../../auth/admin-middleware';
import { authMiddleware } from '../../../auth/middleware';
import { AdminResponseTreeController } from '../../../controllers/response-tree/admin-response-tree.controller';
import { ResponseMobileLinkController } from '../../../controllers/response-tree/response-mobile-link.controller';
import { ResponseNodeController } from '../../../controllers/response-tree/response-node.controller';
import { ResponseSessionController } from '../../../controllers/response-tree/response-session.controller';
import { ResponseTreeController } from '../../../controllers/response-tree/response-tree.controller';

const router = express.Router();
const responseTreeController = new ResponseTreeController();
const responseNodeController = new ResponseNodeController();
const responseSessionController = new ResponseSessionController();
const responseMobileLinkController = new ResponseMobileLinkController();
const adminResponseTreeController = new AdminResponseTreeController();

// レスポンスツリー管理API
router.get('/response-tree', authMiddleware, responseTreeController.getActiveTrees.bind(responseTreeController));
router.get('/response-tree/:treeId', authMiddleware, responseTreeController.getTreeById.bind(responseTreeController));

// レスポンスノード管理API
router.get('/response-tree/nodes/:nodeId', authMiddleware, responseNodeController.getNodeById.bind(responseNodeController));
router.get('/response-tree/nodes/:nodeId/children', authMiddleware, responseNodeController.getChildNodes.bind(responseNodeController));
router.get('/response-tree/search', authMiddleware, responseNodeController.searchNodes.bind(responseNodeController));

// セッション管理API
router.post('/response-tree/sessions', authMiddleware, responseSessionController.startSession.bind(responseSessionController));
router.get('/response-tree/sessions/:sessionId', authMiddleware, responseSessionController.getSession.bind(responseSessionController));
router.put('/response-tree/sessions/:sessionId', authMiddleware, responseSessionController.updateSession.bind(responseSessionController));
router.delete('/response-tree/sessions/:sessionId', authMiddleware, responseSessionController.endSession.bind(responseSessionController));

// モバイル連携API
router.post('/response-tree/mobile-link', authMiddleware, responseMobileLinkController.createMobileLink.bind(responseMobileLinkController));
router.get('/response-tree/mobile-link/:linkCode', authMiddleware, responseMobileLinkController.getMobileLink.bind(responseMobileLinkController));
router.post('/response-tree/mobile-link/:linkCode/connect', authMiddleware, responseMobileLinkController.connectMobileLink.bind(responseMobileLinkController));
router.get('/response-tree/qrcode/:linkCode', authMiddleware, responseMobileLinkController.getQRCode.bind(responseMobileLinkController));

// 管理者向けAPI
router.post('/admin/response-tree', adminAuthMiddleware, adminResponseTreeController.createTree.bind(adminResponseTreeController));
router.put('/admin/response-tree/:treeId', adminAuthMiddleware, adminResponseTreeController.updateTree.bind(adminResponseTreeController));
router.post('/admin/response-tree/:treeId/publish', adminAuthMiddleware, adminResponseTreeController.publishTree.bind(adminResponseTreeController));
router.post('/admin/response-tree/:treeId/nodes', adminAuthMiddleware, adminResponseTreeController.createNode.bind(adminResponseTreeController));

export default router;