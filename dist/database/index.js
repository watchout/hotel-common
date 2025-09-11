"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.hotelDb = void 0;
const prisma_1 = require("./prisma");
// シングルトンインスタンスをエクスポート
exports.hotelDb = prisma_1.HotelDatabaseClient.getInstance();
exports.prisma = exports.hotelDb.getAdapter();
