"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRoomRepository = void 0;
const prisma_1 = require("../../database/prisma");
/**
 * DeviceRoomリポジトリ
 * hotel-saas用のデバイス管理機能を提供
 */
class DeviceRoomRepository {
    constructor() {
        // hotelDbを使用
    }
    /**
     * テナントに紐づくすべてのデバイスを取得
     */
    async findAllByTenantId(tenantId) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.findMany({
            where: {
                tenantId,
                isActive: true,
                is_deleted: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    /**
     * 特定の部屋に紐づくデバイスを取得
     */
    async findByRoomId(tenantId, roomId) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.findMany({
            where: {
                tenantId,
                roomId,
                isActive: true,
                is_deleted: false
            }
        });
    }
    /**
     * デバイスIDで特定のデバイスを取得
     */
    async findByDeviceId(deviceId) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.findFirst({
            where: {
                deviceId,
                isActive: true,
                is_deleted: false
            }
        });
    }
    /**
     * 新しいデバイスを作成
     */
    async create(data) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.create({
            data: {
                // idはauto-incrementなので指定しない
                ...data,
                lastUsedAt: new Date(),
                updatedAt: new Date(), // 必須フィールドを追加
                createdAt: new Date(), // 必須フィールドを追加
                isActive: true // デフォルト値を設定
            }
        });
    }
    /**
     * デバイス情報を更新
     */
    async update(id, data) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    /**
     * デバイスの最終使用日時を更新
     */
    async updateLastUsed(id) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.update({
            where: { id },
            data: {
                lastUsedAt: new Date(),
                updatedAt: new Date() // 必須フィールドを追加
            }
        });
    }
    /**
     * デバイスを論理削除（非アクティブ化）
     */
    async deactivate(id) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.update({
            where: { id },
            data: {
                isActive: false,
                is_deleted: true,
                deleted_at: new Date(),
                updatedAt: new Date()
            }
        });
    }
    /**
     * デバイスを物理削除
     */
    async delete(id) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.delete({
            where: { id }
        });
    }
    /**
     * プレイスIDに紐づくデバイスを取得
     */
    async findByPlaceId(tenantId, placeId) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.findMany({
            where: {
                tenantId,
                placeId,
                isActive: true,
                is_deleted: false
            }
        });
    }
    /**
     * デバイスタイプでフィルタリングして取得
     */
    async findByDeviceType(tenantId, deviceType) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.findMany({
            where: {
                tenantId,
                deviceType,
                isActive: true,
                is_deleted: false
            }
        });
    }
    /**
     * ステータスでフィルタリングして取得
     */
    async findByStatus(tenantId, status) {
        return prisma_1.hotelDb.getAdapter().deviceRoom.findMany({
            where: {
                tenantId,
                status,
                isActive: true,
                is_deleted: false
            }
        });
    }
}
exports.DeviceRoomRepository = DeviceRoomRepository;
exports.default = new DeviceRoomRepository();
