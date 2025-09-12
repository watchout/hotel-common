import type { RoomGrade, CreateRoomGradeRequest, UpdateRoomGradeRequest } from '../schemas/room-grade';
/**
 * 客室ランク管理サービス
 * 複数システム共通の基幹データ管理
 */
export declare class RoomGradeService {
    private static logger;
    /**
     * 客室ランク作成
     */
    static createRoomGrade(data: CreateRoomGradeRequest): Promise<RoomGrade>;
    /**
     * 客室ランク一覧取得
     */
    static getRoomGrades(tenantId: string): Promise<RoomGrade[]>;
    /**
     * 客室ランク詳細取得
     */
    static getRoomGradeById(id: string, tenantId: string): Promise<RoomGrade | null>;
    /**
     * 客室ランク更新
     */
    static updateRoomGrade(id: string, tenantId: string, data: UpdateRoomGradeRequest): Promise<RoomGrade>;
    /**
     * 客室ランク削除（物理削除）
     */
    static deleteRoomGrade(id: string, tenantId: string, deletedBy?: string): Promise<void>;
}
