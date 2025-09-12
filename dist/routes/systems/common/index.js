"use strict";
/**
 * 共通システム用APIルーター
 * - 認証API
 * - ページ管理API
 * - 操作ログAPI
 * - 会計API
 * - フロントデスク客室管理API
 * - フロントデスク会計API
 * - フロントデスクチェックインAPI
 * - 管理者操作ログAPI
 * - 客室ランク管理API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOperationLogsRouter = exports.frontDeskCheckinRouter = exports.frontDeskAccountingRouter = exports.frontDeskRoomsRouter = exports.accountingRouter = exports.roomMemosRouter = exports.operationLogsRouter = exports.roomGradesRouter = exports.pageRouter = exports.authRouter = void 0;
var auth_routes_1 = require("./auth.routes");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var page_routes_1 = require("./page.routes");
Object.defineProperty(exports, "pageRouter", { enumerable: true, get: function () { return __importDefault(page_routes_1).default; } });
var room_grades_routes_1 = require("./room-grades.routes");
Object.defineProperty(exports, "roomGradesRouter", { enumerable: true, get: function () { return __importDefault(room_grades_routes_1).default; } });
var operation_logs_routes_1 = require("./operation-logs.routes");
Object.defineProperty(exports, "operationLogsRouter", { enumerable: true, get: function () { return __importDefault(operation_logs_routes_1).default; } });
var room_memos_routes_1 = require("./room-memos.routes");
Object.defineProperty(exports, "roomMemosRouter", { enumerable: true, get: function () { return __importDefault(room_memos_routes_1).default; } });
var accounting_routes_1 = require("./accounting.routes");
Object.defineProperty(exports, "accountingRouter", { enumerable: true, get: function () { return __importDefault(accounting_routes_1).default; } });
var front_desk_rooms_routes_1 = require("./front-desk-rooms.routes");
Object.defineProperty(exports, "frontDeskRoomsRouter", { enumerable: true, get: function () { return __importDefault(front_desk_rooms_routes_1).default; } });
var front_desk_accounting_routes_1 = require("./front-desk-accounting.routes");
Object.defineProperty(exports, "frontDeskAccountingRouter", { enumerable: true, get: function () { return __importDefault(front_desk_accounting_routes_1).default; } });
var front_desk_checkin_routes_1 = require("./front-desk-checkin.routes");
Object.defineProperty(exports, "frontDeskCheckinRouter", { enumerable: true, get: function () { return __importDefault(front_desk_checkin_routes_1).default; } });
var admin_operation_logs_routes_1 = require("./admin-operation-logs.routes");
Object.defineProperty(exports, "adminOperationLogsRouter", { enumerable: true, get: function () { return __importDefault(admin_operation_logs_routes_1).default; } });
