"use strict";
/**
 * PMSシステム用APIルーター
 * - 予約管理API
 * - 部屋管理API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = exports.reservationRouter = void 0;
var reservation_routes_1 = require("./reservation.routes");
Object.defineProperty(exports, "reservationRouter", { enumerable: true, get: function () { return __importDefault(reservation_routes_1).default; } });
var room_routes_1 = require("./room.routes");
Object.defineProperty(exports, "roomRouter", { enumerable: true, get: function () { return __importDefault(room_routes_1).default; } });
