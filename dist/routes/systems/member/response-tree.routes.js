"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const response_tree_controller_1 = require("../../../controllers/response-tree/response-tree.controller");
const response_node_controller_1 = require("../../../controllers/response-tree/response-node.controller");
const response_session_controller_1 = require("../../../controllers/response-tree/response-session.controller");
const response_mobile_link_controller_1 = require("../../../controllers/response-tree/response-mobile-link.controller");
const admin_response_tree_controller_1 = require("../../../controllers/response-tree/admin-response-tree.controller");
const middleware_1 = require("../../../auth/middleware");
const admin_middleware_1 = require("../../../auth/admin-middleware");
const router = express_1.default.Router();
const responseTreeController = new response_tree_controller_1.ResponseTreeController();
const responseNodeController = new response_node_controller_1.ResponseNodeController();
const responseSessionController = new response_session_controller_1.ResponseSessionController();
const responseMobileLinkController = new response_mobile_link_controller_1.ResponseMobileLinkController();
const adminResponseTreeController = new admin_response_tree_controller_1.AdminResponseTreeController();
// レスポンスツリー管理API
router.get('/response-tree', middleware_1.authMiddleware, responseTreeController.getActiveTrees.bind(responseTreeController));
router.get('/response-tree/:treeId', middleware_1.authMiddleware, responseTreeController.getTreeById.bind(responseTreeController));
// レスポンスノード管理API
router.get('/response-tree/nodes/:nodeId', middleware_1.authMiddleware, responseNodeController.getNodeById.bind(responseNodeController));
router.get('/response-tree/nodes/:nodeId/children', middleware_1.authMiddleware, responseNodeController.getChildNodes.bind(responseNodeController));
router.get('/response-tree/search', middleware_1.authMiddleware, responseNodeController.searchNodes.bind(responseNodeController));
// セッション管理API
router.post('/response-tree/sessions', middleware_1.authMiddleware, responseSessionController.startSession.bind(responseSessionController));
router.get('/response-tree/sessions/:sessionId', middleware_1.authMiddleware, responseSessionController.getSession.bind(responseSessionController));
router.put('/response-tree/sessions/:sessionId', middleware_1.authMiddleware, responseSessionController.updateSession.bind(responseSessionController));
router.delete('/response-tree/sessions/:sessionId', middleware_1.authMiddleware, responseSessionController.endSession.bind(responseSessionController));
// モバイル連携API
router.post('/response-tree/mobile-link', middleware_1.authMiddleware, responseMobileLinkController.createMobileLink.bind(responseMobileLinkController));
router.get('/response-tree/mobile-link/:linkCode', middleware_1.authMiddleware, responseMobileLinkController.getMobileLink.bind(responseMobileLinkController));
router.post('/response-tree/mobile-link/:linkCode/connect', middleware_1.authMiddleware, responseMobileLinkController.connectMobileLink.bind(responseMobileLinkController));
router.get('/response-tree/qrcode/:linkCode', middleware_1.authMiddleware, responseMobileLinkController.getQRCode.bind(responseMobileLinkController));
// 管理者向けAPI
router.post('/admin/response-tree', admin_middleware_1.adminAuthMiddleware, adminResponseTreeController.createTree.bind(adminResponseTreeController));
router.put('/admin/response-tree/:treeId', admin_middleware_1.adminAuthMiddleware, adminResponseTreeController.updateTree.bind(adminResponseTreeController));
router.post('/admin/response-tree/:treeId/publish', admin_middleware_1.adminAuthMiddleware, adminResponseTreeController.publishTree.bind(adminResponseTreeController));
router.post('/admin/response-tree/:treeId/nodes', admin_middleware_1.adminAuthMiddleware, adminResponseTreeController.createNode.bind(adminResponseTreeController));
exports.default = router;
