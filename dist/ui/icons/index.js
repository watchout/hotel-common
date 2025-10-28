"use strict";
/**
 * アイコンモジュールエントリーポイント
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iconExists = exports.preloadIcons = exports.getFullIconName = exports.FEATURE_ICONS = exports.SYSTEM_ICONS = exports.ICON_COLORS = exports.ICON_SIZES = exports.DEFAULT_ICON_SET = exports.ICON_SETS = exports.SystemIcon = exports.HotelIcon = void 0;
// コンポーネント
var Icon_1 = require("./components/Icon");
Object.defineProperty(exports, "HotelIcon", { enumerable: true, get: function () { return __importDefault(Icon_1).default; } });
var SystemIcon_1 = require("./components/SystemIcon");
Object.defineProperty(exports, "SystemIcon", { enumerable: true, get: function () { return __importDefault(SystemIcon_1).default; } });
// 定数
var iconSets_1 = require("./constants/iconSets");
Object.defineProperty(exports, "ICON_SETS", { enumerable: true, get: function () { return iconSets_1.ICON_SETS; } });
Object.defineProperty(exports, "DEFAULT_ICON_SET", { enumerable: true, get: function () { return iconSets_1.DEFAULT_ICON_SET; } });
Object.defineProperty(exports, "ICON_SIZES", { enumerable: true, get: function () { return iconSets_1.ICON_SIZES; } });
Object.defineProperty(exports, "ICON_COLORS", { enumerable: true, get: function () { return iconSets_1.ICON_COLORS; } });
var systemIcons_1 = require("./constants/systemIcons");
Object.defineProperty(exports, "SYSTEM_ICONS", { enumerable: true, get: function () { return systemIcons_1.SYSTEM_ICONS; } });
Object.defineProperty(exports, "FEATURE_ICONS", { enumerable: true, get: function () { return systemIcons_1.FEATURE_ICONS; } });
// ユーティリティ
var iconLoader_1 = require("./utils/iconLoader");
Object.defineProperty(exports, "getFullIconName", { enumerable: true, get: function () { return iconLoader_1.getFullIconName; } });
Object.defineProperty(exports, "preloadIcons", { enumerable: true, get: function () { return iconLoader_1.preloadIcons; } });
Object.defineProperty(exports, "iconExists", { enumerable: true, get: function () { return iconLoader_1.iconExists; } });
// 型定義
__exportStar(require("./types"), exports);
/**
 * Vue用プラグイン
 */
const Icon_2 = __importDefault(require("./components/Icon"));
const SystemIcon_2 = __importDefault(require("./components/SystemIcon"));
exports.default = {
    install(app) {
        app.component('HotelIcon', Icon_2.default);
        app.component('SystemIcon', SystemIcon_2.default);
    }
};
