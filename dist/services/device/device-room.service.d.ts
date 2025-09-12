/**
 * DeviceRoomサービス
 * hotel-saas用のデバイス管理機能を提供
 */
export declare class DeviceRoomService {
    /**
     * テナントに紐づくすべてのデバイスを取得
     */
    getAllDevicesByTenant(tenantId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }[]>;
    /**
     * 特定の部屋に紐づくデバイスを取得
     */
    getDevicesByRoom(tenantId: string, roomId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }[]>;
    /**
     * デバイスIDで特定のデバイスを取得
     */
    getDeviceByDeviceId(deviceId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    } | null>;
    /**
     * 新しいデバイスを登録
     */
    registerDevice(data: {
        tenantId: string;
        roomId: string;
        roomName?: string;
        deviceId?: string;
        deviceType?: string;
        placeId?: string;
        status?: string;
        ipAddress?: string;
        macAddress?: string;
    }): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }>;
    /**
     * デバイス情報を更新
     */
    updateDevice(id: number, data: {
        roomId?: string;
        roomName?: string;
        deviceId?: string;
        deviceType?: string;
        placeId?: string;
        status?: string;
        ipAddress?: string;
        macAddress?: string;
        isActive?: boolean;
    }): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }>;
    /**
     * デバイスの最終使用日時を更新
     */
    updateDeviceLastUsed(id: number): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }>;
    /**
     * デバイスを非アクティブ化（論理削除）
     */
    deactivateDevice(id: number): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }>;
    /**
     * デバイスを物理削除
     */
    deleteDevice(id: number): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }>;
    /**
     * プレイスIDに紐づくデバイスを取得
     */
    getDevicesByPlace(tenantId: string, placeId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }[]>;
    /**
     * デバイスタイプでフィルタリングして取得
     */
    getDevicesByType(tenantId: string, deviceType: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }[]>;
    /**
     * ステータスでフィルタリングして取得
     */
    getDevicesByStatus(tenantId: string, status: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        roomId: string;
        updatedAt: Date;
        deviceId: string | null;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }[]>;
    /**
     * デバイスの一括登録
     */
    bulkRegisterDevices(devices: Array<{
        tenantId: string;
        roomId: string;
        roomName?: string;
        deviceId?: string;
        deviceType?: string;
        placeId?: string;
        status?: string;
        ipAddress?: string;
        macAddress?: string;
    }>): Promise<{
        total: number;
        success: number;
        failed: number;
        results: ({
            success: boolean;
            device: {
                tenantId: string;
                is_deleted: boolean;
                isActive: boolean;
                status: string | null;
                id: number;
                deleted_at: Date | null;
                deleted_by: string | null;
                createdAt: Date;
                roomId: string;
                updatedAt: Date;
                deviceId: string | null;
                placeId: string | null;
                roomName: string | null;
                deviceType: string | null;
                ipAddress: string | null;
                macAddress: string | null;
                lastUsedAt: Date | null;
            };
            error?: undefined;
        } | {
            success: boolean;
            error: string;
            device: {
                tenantId: string;
                roomId: string;
                roomName?: string;
                deviceId?: string;
                deviceType?: string;
                placeId?: string;
                status?: string;
                ipAddress?: string;
                macAddress?: string;
            };
        })[];
    }>;
}
declare const _default: DeviceRoomService;
export default _default;
