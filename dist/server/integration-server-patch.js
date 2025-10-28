"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendHotelIntegrationServer = extendHotelIntegrationServer;
const integration_server_1 = require("./integration-server");
/**
 * HotelIntegrationServerクラスを拡張してaddRouterメソッドを追加
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendHotelIntegrationServer() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // プロトタイプにaddRouterメソッドを追加
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    integration_server_1.HotelIntegrationServer.prototype.addRouter = function (path, router) {
        if (!this.app) {
            console.error('Server app is not initialized');
            return;
        }
        this.app.use(path, router);
        console.log(`Router added to path: ${path}`);
    };
}
