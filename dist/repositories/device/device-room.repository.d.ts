/**
 * DeviceRoomリポジトリ
 * hotel-saas用のデバイス管理機能を提供
 */
export declare class DeviceRoomRepository {
    constructor();
    /**
     * テナントに紐づくすべてのデバイスを取得
     */
    findAllByTenantId(tenantId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    findByRoomId(tenantId: string, roomId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    findByDeviceId(deviceId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    } | null>;
    /**
     * 新しいデバイスを作成
     */
    create(data: {
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
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    update(id: number, data: {
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
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    updateLastUsed(id: number): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }>;
    /**
     * デバイスを論理削除（非アクティブ化）
     */
    deactivate(id: number): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    delete(id: number): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    findByPlaceId(tenantId: string, placeId: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    findByDeviceType(tenantId: string, deviceType: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
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
    findByStatus(tenantId: string, status: string): Promise<{
        tenantId: string;
        is_deleted: boolean;
        isActive: boolean;
        status: string | null;
        id: number;
        deleted_at: Date | null;
        deleted_by: string | null;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string | null;
        roomId: string;
        placeId: string | null;
        roomName: string | null;
        deviceType: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        lastUsedAt: Date | null;
    }[]>;
}
declare const _default: DeviceRoomRepository;
export default _default;
