import type { Reservation, CreateReservationRequest, UpdateReservationRequest, ReservationSearchParams } from '../schemas/reservation';
/**
 * 予約管理サービス
 * PMS中心の予約統合管理
 *
 * 注意: 現在reservationsテーブルが存在しないため、一時的に無効化
 */
export declare class ReservationService {
    private static logger;
    /**
     * 予約作成
     */
    static createReservation(data: CreateReservationRequest): Promise<Reservation>;
    /**
     * 予約取得（ID指定）
     */
    static getReservationById(id: string, tenantId: string): Promise<Reservation | null>;
    /**
     * 予約一覧取得（検索・フィルタ対応）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
     */
    static getReservations(params: ReservationSearchParams): Promise<{
        reservations: Reservation[];
        total: number;
        hasNext: boolean;
    }>;
    /**
     * 予約更新
     */
    static updateReservation(id: string, tenantId: string, data: UpdateReservationRequest): Promise<Reservation>;
    /**
     * 予約キャンセル
     */
    static cancelReservation(id: string, tenantId: string, cancelledBy?: string): Promise<Reservation>;
    /**
     * チェックイン処理
     */
    static checkIn(id: string, tenantId: string, roomNumber: string, checkedInBy?: string): Promise<Reservation>;
    /**
     * チェックアウト処理
     */
    static checkOut(id: string, tenantId: string, checkedOutBy?: string): Promise<Reservation>;
    /**
     * 確認番号生成
     */
    private static generateConfirmationNumber;
    /**
     * 予約統計取得
     */
    static getReservationStats(tenantId: string): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        checked_in: number;
        completed: number;
        cancelled: number;
    }>;
}
