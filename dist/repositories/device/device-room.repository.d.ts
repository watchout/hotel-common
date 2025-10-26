/**
 * DeviceRoomリポジトリ
 * hotel-saas用のデバイス管理機能を提供
 */
export declare class DeviceRoomRepository {
    constructor();
    /**
     * テナントに紐づくすべてのデバイスを取得
     */
    findAllByTenantId(tenantId: string): Promise<any>;
    /**
     * 特定の部屋に紐づくデバイスを取得
     */
    findByRoomId(tenantId: string, roomId: string): Promise<any>;
    /**
     * デバイスIDで特定のデバイスを取得
     */
    findByDeviceId(deviceId: string): Promise<any>;
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
    }): Promise<any>;
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
    }): Promise<any>;
    /**
     * デバイスの最終使用日時を更新
     */
    updateLastUsed(id: number): Promise<any>;
    /**
     * デバイスを論理削除（非アクティブ化）
     */
    deactivate(id: number): Promise<any>;
    /**
     * デバイスを物理削除
     */
    delete(id: number): Promise<any>;
    /**
     * プレイスIDに紐づくデバイスを取得
     */
    findByPlaceId(tenantId: string, placeId: string): Promise<any>;
    /**
     * デバイスタイプでフィルタリングして取得
     */
    findByDeviceType(tenantId: string, deviceType: string): Promise<any>;
    /**
     * ステータスでフィルタリングして取得
     */
    findByStatus(tenantId: string, status: string): Promise<any>;
}
declare const _default: DeviceRoomRepository;
export default _default;
