"use strict";
/**
 * SaaSシステム用APIルーター
 * - 管理画面統計API
 * - 注文・メニューAPI
 * - デバイス管理API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceRouter = exports.deviceStatusRouter = exports.ordersRouter = exports.adminDashboardRouter = void 0;
var admin_dashboard_routes_1 = require("./admin-dashboard.routes");
Object.defineProperty(exports, "adminDashboardRouter", { enumerable: true, get: function () { return __importDefault(admin_dashboard_routes_1).default; } });
var orders_routes_1 = require("./orders.routes");
Object.defineProperty(exports, "ordersRouter", { enumerable: true, get: function () { return __importDefault(orders_routes_1).default; } });
var device_status_routes_1 = require("./device-status.routes");
Object.defineProperty(exports, "deviceStatusRouter", { enumerable: true, get: function () { return __importDefault(device_status_routes_1).default; } });
var device_routes_1 = require("./device.routes");
Object.defineProperty(exports, "deviceRouter", { enumerable: true, get: function () { return __importDefault(device_routes_1).default; } });
