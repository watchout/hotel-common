"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationManager = exports.HotelMigrationManager = exports.hotelDb = exports.HotelDatabaseClient = void 0;
// Hotel Common - 統一PostgreSQL基盤
var prisma_1 = require("./prisma");
Object.defineProperty(exports, "HotelDatabaseClient", { enumerable: true, get: function () { return prisma_1.HotelDatabaseClient; } });
Object.defineProperty(exports, "hotelDb", { enumerable: true, get: function () { return prisma_1.hotelDb; } });
var migrations_1 = require("./migrations");
Object.defineProperty(exports, "HotelMigrationManager", { enumerable: true, get: function () { return migrations_1.HotelMigrationManager; } });
Object.defineProperty(exports, "migrationManager", { enumerable: true, get: function () { return migrations_1.migrationManager; } });
//# sourceMappingURL=index.js.map