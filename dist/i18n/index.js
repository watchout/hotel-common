"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createI18nInstance = exports.TranslationConfig = exports.RuntimeTranslationSystem = void 0;
// hotel-common多言語基盤システム
__exportStar(require("./types"), exports);
__exportStar(require("./runtime"), exports);
__exportStar(require("./config"), exports);
// メイン翻訳システム
var runtime_1 = require("./runtime");
Object.defineProperty(exports, "RuntimeTranslationSystem", { enumerable: true, get: function () { return runtime_1.RuntimeTranslationSystem; } });
var config_1 = require("./config");
Object.defineProperty(exports, "TranslationConfig", { enumerable: true, get: function () { return config_1.TranslationConfig; } });
var factory_1 = require("./factory");
Object.defineProperty(exports, "createI18nInstance", { enumerable: true, get: function () { return factory_1.createI18nInstance; } });
