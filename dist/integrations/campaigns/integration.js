"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCampaignFeature = setupCampaignFeature;
const index_1 = require("./index");
/**
 * キャンペーン機能をサーバーに統合
 * @param server 統合サーバーインスタンス
 */
function setupCampaignFeature(server) {
    // キャンペーン機能を統合
    // @ts-ignore - 引数の型が不一致
    (0, index_1.integrateCampaignFeature)(server);
    console.log('キャンペーン機能の統合が完了しました');
}
