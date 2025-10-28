/**
 * DeviceRoomサービス
 * hotel-saas用のデバイス管理機能を提供
 */
export declare class DeviceRoomService {
    /**
     * テナントに紐づくすべてのデバイスを取得
     */
    getAllDevicesByTenant(tenantId: string): Promise<any>;
    /**
     * 特定の部屋に紐づくデバイスを取得
     */
    getDevicesByRoom(tenantId: string, roomId: string): Promise<any>;
    /**
     * デバイスIDで特定のデバイスを取得
     */
    getDeviceByDeviceId(deviceId: string): Promise<any>;
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
    }): Promise<any>;
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
    }): Promise<any>;
    /**
     * デバイスの最終使用日時を更新
     */
    updateDeviceLastUsed(id: number): Promise<any>;
    /**
     * デバイスを非アクティブ化（論理削除）
     */
    deactivateDevice(id: number): Promise<any>;
    /**
     * デバイスを物理削除
     */
    deleteDevice(id: number): Promise<any>;
    /**
     * プレイスIDに紐づくデバイスを取得
     */
    getDevicesByPlace(tenantId: string, placeId: string): Promise<any>;
    /**
     * デバイスタイプでフィルタリングして取得
     */
    getDevicesByType(tenantId: string, deviceType: string): Promise<any>;
    /**
     * ステータスでフィルタリングして取得
     */
    getDevicesByStatus(tenantId: string, status: string): Promise<any>;
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
            device: any;
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
