"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRoomService = void 0;
const device_room_repository_1 = __importDefault(require("../../repositories/device/device-room.repository"));
/**
 * DeviceRoomサービス
 * hotel-saas用のデバイス管理機能を提供
 */
class DeviceRoomService {
    /**
     * テナントに紐づくすべてのデバイスを取得
     */
    async getAllDevicesByTenant(tenantId) {
        return device_room_repository_1.default.findAllByTenantId(tenantId);
    }
    /**
     * 特定の部屋に紐づくデバイスを取得
     */
    async getDevicesByRoom(tenantId, roomId) {
        return device_room_repository_1.default.findByRoomId(tenantId, roomId);
    }
    /**
     * デバイスIDで特定のデバイスを取得
     */
    async getDeviceByDeviceId(deviceId) {
        return device_room_repository_1.default.findByDeviceId(deviceId);
    }
    /**
     * 新しいデバイスを登録
     */
    async registerDevice(data) {
        // 必須フィールドの検証
        if (!data.tenantId || !data.roomId) {
            throw new Error('テナントIDと部屋IDは必須です');
        }
        // デバイスIDが指定されている場合、重複チェック
        if (data.deviceId) {
            const existingDevice = await device_room_repository_1.default.findByDeviceId(data.deviceId);
            if (existingDevice) {
                throw new Error('このデバイスIDは既に登録されています');
            }
        }
        // デバイスステータスのデフォルト設定
        if (!data.status) {
            data.status = 'active';
        }
        return device_room_repository_1.default.create(data);
    }
    /**
     * デバイス情報を更新
     */
    async updateDevice(id, data) {
        // デバイスの存在確認
        const device = await device_room_repository_1.default.findByDeviceId(id.toString());
        if (!device) {
            throw new Error('指定されたデバイスが見つかりません');
        }
        // デバイスIDが変更される場合、重複チェック
        if (data.deviceId && data.deviceId !== device.deviceId) {
            const existingDevice = await device_room_repository_1.default.findByDeviceId(data.deviceId);
            if (existingDevice && existingDevice.id !== id) {
                throw new Error('このデバイスIDは既に使用されています');
            }
        }
        return device_room_repository_1.default.update(id, data);
    }
    /**
     * デバイスの最終使用日時を更新
     */
    async updateDeviceLastUsed(id) {
        return device_room_repository_1.default.updateLastUsed(id);
    }
    /**
     * デバイスを非アクティブ化（論理削除）
     */
    async deactivateDevice(id) {
        return device_room_repository_1.default.deactivate(id);
    }
    /**
     * デバイスを物理削除
     */
    async deleteDevice(id) {
        return device_room_repository_1.default.delete(id);
    }
    /**
     * プレイスIDに紐づくデバイスを取得
     */
    async getDevicesByPlace(tenantId, placeId) {
        return device_room_repository_1.default.findByPlaceId(tenantId, placeId);
    }
    /**
     * デバイスタイプでフィルタリングして取得
     */
    async getDevicesByType(tenantId, deviceType) {
        return device_room_repository_1.default.findByDeviceType(tenantId, deviceType);
    }
    /**
     * ステータスでフィルタリングして取得
     */
    async getDevicesByStatus(tenantId, status) {
        return device_room_repository_1.default.findByStatus(tenantId, status);
    }
    /**
     * デバイスの一括登録
     */
    async bulkRegisterDevices(devices) {
        const results = [];
        for (const device of devices) {
            try {
                const result = await this.registerDevice(device);
                results.push({ success: true, device: result });
            }
            catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : '不明なエラー',
                    device
                });
            }
        }
        return {
            total: devices.length,
            success: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }
}
exports.DeviceRoomService = DeviceRoomService;
exports.default = new DeviceRoomService();
