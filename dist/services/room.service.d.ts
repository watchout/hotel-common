import type { Room, CreateRoomRequest, UpdateRoomRequest, UpdateRoomStatusRequest, RoomSearchParams, RoomAvailabilitySearch } from '../schemas/room';
/**
 * 部屋管理サービス
 * PMS基本機能の部屋管理
 */
export declare class RoomService {
    private static logger;
    /**
     * 部屋作成
     */
    static createRoom(data: CreateRoomRequest): Promise<Room>;
    /**
     * 部屋取得（ID指定）
     */
    static getRoomById(id: string, tenantId: string, includeGrade?: boolean): Promise<Room | null>;
    /**
     * 部屋番号で取得
     */
    static getRoomByNumber(roomNumber: string, tenantId: string): Promise<Room | null>;
    /**
     * 部屋一覧取得（検索・フィルタ対応）
     */
    static getRooms(params: RoomSearchParams): Promise<{
        rooms: Room[];
        total: number;
        hasNext: boolean;
    }>;
    /**
     * 部屋更新
     */
    static updateRoom(id: string, tenantId: string, data: UpdateRoomRequest): Promise<Room>;
    /**
     * 部屋ステータス更新
     */
    static updateRoomStatus(id: string, tenantId: string, data: UpdateRoomStatusRequest): Promise<Room>;
    /**
     * 部屋削除（論理削除）
     */
    static deleteRoom(id: string, tenantId: string, deletedBy?: string): Promise<Room>;
    /**
     * フロア別部屋取得
     */
    static getRoomsByFloor(floorNumber: number, tenantId: string): Promise<Room[]>;
    /**
     * 空室検索
     */
    static searchAvailableRooms(params: RoomAvailabilitySearch): Promise<Room[]>;
    /**
     * 部屋統計取得
     */
    static getRoomStats(tenantId: string): Promise<{
        total: number;
        available: number;
        occupied: number;
        cleaning: number;
        maintenance: number;
        out_of_order: number;
        by_type: Record<string, number>;
        by_floor: Record<number, number>;
    }>;
}
