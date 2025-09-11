"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelDb = exports.HotelDatabaseClient = void 0;
exports.getHotelDb = getHotelDb;
exports.withTransaction = withTransaction;
const prisma_1 = require("../generated/prisma");
const prisma_adapter_1 = require("./prisma-adapter");
/**
 * ホテル共通データベースクライアント
 * シングルトンパターンを使用して、アプリケーション全体で一貫したPrismaClientインスタンスを提供します
 */
class HotelDatabaseClient {
    static instance;
    prisma;
    adapter;
    constructor() {
        this.prisma = new prisma_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
        // ソフトデリートミドルウェアを設定（一時的に無効化）
        // setupSoftDeleteMiddleware(this.prisma);
        this.adapter = (0, prisma_adapter_1.createPrismaAdapter)(this.prisma);
    }
    /**
     * シングルトンインスタンスを取得
     */
    static getInstance() {
        if (!HotelDatabaseClient.instance) {
            HotelDatabaseClient.instance = new HotelDatabaseClient();
        }
        return HotelDatabaseClient.instance;
    }
    /**
     * Prismaクライアントインスタンスを取得
     * 注意: 直接Prismaクライアントを使用する場合は、テーブル名がスネークケース・複数形であることに注意
     */
    getClient() {
        return this.prisma;
    }
    /**
     * アダプターを使用したPrismaクライアントを取得
     * 従来のキャメルケース・単数形のモデル名でアクセス可能
     */
    getAdapter() {
        return this.adapter;
    }
    /**
     * トランザクションを実行
     */
    async transaction(fn, options) {
        return this.adapter.$transaction(fn, options);
    }
    /**
     * 以下のゲッターは互換性のために残していますが、
     * 将来的には getAdapter() を使用することを推奨します
     */
    get page() { return this.adapter.page; }
    get pageHistory() { return this.adapter.pageHistory; }
    get responseNode() { return this.adapter.responseNode; }
    get responseTree() { return this.adapter.responseTree; }
    get responseTreeVersion() { return this.adapter.responseTreeVersion; }
    get responseTreeSession() { return this.adapter.responseTreeSession; }
    get responseTreeMobileLink() { return this.adapter.responseTreeMobileLink; }
    get responseTreeHistory() { return this.adapter.responseTreeHistory; }
    get responseNodeTranslation() { return this.adapter.responseNodeTranslation; }
    get campaign() { return this.adapter.campaign; }
    get campaignCategory() { return this.adapter.campaignCategory; }
    get campaignCategoryRelation() { return this.adapter.campaignCategoryRelation; }
    get campaignItem() { return this.adapter.campaignItem; }
    get campaignTranslation() { return this.adapter.campaignTranslation; }
    get campaignUsageLog() { return this.adapter.campaignUsageLog; }
    get deviceVideoCache() { return this.adapter.deviceVideoCache; }
    get notificationTemplate() { return this.adapter.notificationTemplate; }
    get tenantAccessLog() { return this.adapter.tenantAccessLog; }
    get systemEvent() { return this.adapter.systemEvent; }
    get deviceRoom() { return this.adapter.deviceRoom; }
    get order() { return this.adapter.order; }
    get orderItem() { return this.adapter.orderItem; }
    get schemaVersion() { return this.adapter.schemaVersion; }
    get systemPlanRestrictions() { return this.adapter.systemPlanRestrictions; }
    get tenantSystemPlan() { return this.adapter.tenantSystemPlan; }
}
exports.HotelDatabaseClient = HotelDatabaseClient;
// エクスポートするデフォルトインスタンス
exports.hotelDb = HotelDatabaseClient.getInstance();
// 便利なヘルパー関数
function getHotelDb() {
    return HotelDatabaseClient.getInstance();
}
// トランザクション用のヘルパー関数
async function withTransaction(fn, options) {
    return exports.hotelDb.transaction(fn, options);
}
