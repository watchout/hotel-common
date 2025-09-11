"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const prisma_1 = require("../database/prisma");
const logger_1 = require("../utils/logger");
/**
 * 予約管理サービス
 * PMS中心の予約統合管理
 *
 * 注意: 現在reservationsテーブルが存在しないため、一時的に無効化
 */
class ReservationService {
    static logger = logger_1.HotelLogger.getInstance();
    /**
     * 予約作成
     */
    static async createReservation(data) {
        try {
            this.logger.info('予約作成開始', {
                data: {
                    tenant_id: data.tenant_id,
                    user_id: data.user_id,
                    checkin_date: data.checkin_date,
                    checkout_date: data.checkout_date
                }
            });
            // 日付検証
            const checkinDate = new Date(data.checkin_date);
            const checkoutDate = new Date(data.checkout_date);
            if (checkinDate >= checkoutDate) {
                throw new Error('チェックアウト日はチェックイン日より後である必要があります');
            }
            if (checkinDate < new Date()) {
                throw new Error('チェックイン日は現在日時より後である必要があります');
            }
            // 確認番号生成
            const confirmationNumber = this.generateConfirmationNumber();
            const reservation = await prisma_1.hotelDb.getAdapter().reservation.create({
                data: {
                    tenantId: data.tenant_id,
                    roomId: 'room-default', // 必須フィールド
                    guestName: 'Guest ' + data.user_id.substring(0, 8),
                    guestEmail: data.guest_email,
                    guestPhone: data.guest_phone,
                    checkinDate: checkinDate,
                    checkoutDate: checkoutDate,
                    adults: data.guest_count || 1,
                    children: 0,
                    status: 'pending',
                    confirmationNumber: confirmationNumber,
                    totalAmount: data.total_amount,
                    paidAmount: 0,
                    notes: data.notes,
                    specialRequests: data.special_requests,
                    createdBy: data.user_id
                }
            });
            this.logger.info('予約作成完了', {
                data: {
                    reservation_id: reservation.id,
                    confirmation_number: confirmationNumber
                }
            });
            return reservation;
        }
        catch (error) {
            this.logger.error('予約作成エラー', error);
            throw error;
        }
    }
    /**
     * 予約取得（ID指定）
     */
    static async getReservationById(id, tenantId) {
        try {
            const reservation = await prisma_1.hotelDb.getAdapter().reservation.findFirst({
                where: {
                    id,
                    tenantId,
                    isDeleted: false
                },
                include: {
                    room: true
                }
            });
            return reservation;
        }
        catch (error) {
            this.logger.error('予約取得エラー', error);
            throw error;
        }
    }
    /**
     * 予約一覧取得（検索・フィルタ対応）
     */
    static async getReservations(params) {
        try {
            const where = {
                tenantId: params.tenant_id,
                isDeleted: false
            };
            // フィルタ条件構築
            if (params.status) {
                where.status = params.status;
            }
            if (params.checkin_date_from || params.checkin_date_to) {
                where.checkinDate = {};
                if (params.checkin_date_from) {
                    where.checkinDate.gte = new Date(params.checkin_date_from);
                }
                if (params.checkin_date_to) {
                    where.checkinDate.lte = new Date(params.checkin_date_to);
                }
            }
            if (params.checkout_date_from || params.checkout_date_to) {
                where.checkoutDate = {};
                if (params.checkout_date_from) {
                    where.checkoutDate.gte = new Date(params.checkout_date_from);
                }
                if (params.checkout_date_to) {
                    where.checkoutDate.lte = new Date(params.checkout_date_to);
                }
            }
            if (params.room_number) {
                where.room = {
                    roomNumber: {
                        contains: params.room_number,
                        mode: 'insensitive'
                    }
                };
            }
            if (params.confirmation_number) {
                where.confirmationNumber = params.confirmation_number;
            }
            if (params.guest_email) {
                where.guestEmail = {
                    contains: params.guest_email,
                    mode: 'insensitive'
                };
            }
            // 総件数取得
            const total = await prisma_1.hotelDb.getAdapter().reservation.count({ where });
            // データ取得
            const reservations = await prisma_1.hotelDb.getAdapter().reservation.findMany({
                where,
                include: {
                    room: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: params.offset,
                take: params.limit
            });
            const hasNext = params.offset + params.limit < total;
            return {
                reservations: reservations,
                total,
                hasNext
            };
        }
        catch (error) {
            this.logger.error('予約一覧取得エラー', error);
            throw error;
        }
    }
    /**
     * 予約更新
     */
    static async updateReservation(id, tenantId, data) {
        try {
            this.logger.info('予約更新開始', {
                data: {
                    reservation_id: id,
                    tenant_id: tenantId
                }
            });
            // 日付検証（更新される場合）
            if (data.checkin_date && data.checkout_date) {
                const checkinDate = new Date(data.checkin_date);
                const checkoutDate = new Date(data.checkout_date);
                if (checkinDate >= checkoutDate) {
                    throw new Error('チェックアウト日はチェックイン日より後である必要があります');
                }
            }
            const updateData = {};
            // 日付フィールドの変換
            if (data.checkin_date) {
                updateData.checkinDate = new Date(data.checkin_date);
            }
            if (data.checkout_date) {
                updateData.checkoutDate = new Date(data.checkout_date);
            }
            if (data.guest_name) {
                updateData.guestName = data.guest_name;
            }
            if (data.guest_email) {
                updateData.guestEmail = data.guest_email;
            }
            if (data.guest_phone) {
                updateData.guestPhone = data.guest_phone;
            }
            if (data.status) {
                updateData.status = data.status;
            }
            if (data.total_amount !== undefined) {
                updateData.totalAmount = data.total_amount;
            }
            if (data.notes) {
                updateData.notes = data.notes;
            }
            if (data.special_requests) {
                updateData.specialRequests = data.special_requests;
            }
            const reservation = await prisma_1.hotelDb.getAdapter().reservation.update({
                where: {
                    id,
                    tenantId,
                    isDeleted: false
                },
                data: updateData
            });
            this.logger.info('予約更新完了', {
                data: {
                    reservation_id: id
                }
            });
            return reservation;
        }
        catch (error) {
            this.logger.error('予約更新エラー', error);
            throw error;
        }
    }
    /**
     * 予約キャンセル
     */
    static async cancelReservation(id, tenantId, cancelledBy) {
        try {
            this.logger.info('予約キャンセル開始', {
                data: {
                    reservation_id: id,
                    tenant_id: tenantId,
                    cancelled_by: cancelledBy
                }
            });
            const reservation = await prisma_1.hotelDb.getAdapter().reservation.update({
                where: {
                    id,
                    tenantId,
                    isDeleted: false
                },
                data: {
                    status: 'cancelled'
                }
            });
            this.logger.info('予約キャンセル完了', {
                data: {
                    reservation_id: id
                }
            });
            return reservation;
        }
        catch (error) {
            this.logger.error('予約キャンセルエラー', error);
            throw error;
        }
    }
    /**
     * チェックイン処理
     */
    static async checkIn(id, tenantId, roomNumber, checkedInBy) {
        try {
            this.logger.info('チェックイン処理開始', {
                data: {
                    reservation_id: id,
                    tenant_id: tenantId,
                    room_number: roomNumber
                }
            });
            const reservation = await prisma_1.hotelDb.getAdapter().reservation.update({
                where: {
                    id,
                    tenantId,
                    isDeleted: false
                },
                data: {
                    status: 'checked_in'
                }
            });
            this.logger.info('チェックイン処理完了', {
                data: {
                    reservation_id: id,
                    room_number: roomNumber
                }
            });
            return reservation;
        }
        catch (error) {
            this.logger.error('チェックイン処理エラー', error);
            throw error;
        }
    }
    /**
     * チェックアウト処理
     */
    static async checkOut(id, tenantId, checkedOutBy) {
        try {
            this.logger.info('チェックアウト処理開始', {
                data: {
                    reservation_id: id,
                    tenant_id: tenantId
                }
            });
            const reservation = await prisma_1.hotelDb.getAdapter().reservation.update({
                where: {
                    id,
                    tenantId,
                    isDeleted: false
                },
                data: {
                    status: 'completed'
                }
            });
            this.logger.info('チェックアウト処理完了', {
                data: {
                    reservation_id: id
                }
            });
            return reservation;
        }
        catch (error) {
            this.logger.error('チェックアウト処理エラー', error);
            throw error;
        }
    }
    /**
     * 確認番号生成
     */
    static generateConfirmationNumber() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `HTL-${timestamp}-${random}`.toUpperCase();
    }
    /**
     * 予約統計取得
     */
    static async getReservationStats(tenantId) {
        try {
            const [total, pending, confirmed, checkedIn, completed, cancelled] = await Promise.all([
                prisma_1.hotelDb.getAdapter().reservation.count({ where: { tenantId, isDeleted: false } }),
                prisma_1.hotelDb.getAdapter().reservation.count({ where: { tenantId, status: 'pending', isDeleted: false } }),
                prisma_1.hotelDb.getAdapter().reservation.count({ where: { tenantId, status: 'confirmed', isDeleted: false } }),
                prisma_1.hotelDb.getAdapter().reservation.count({ where: { tenantId, status: 'checked_in', isDeleted: false } }),
                prisma_1.hotelDb.getAdapter().reservation.count({ where: { tenantId, status: 'completed', isDeleted: false } }),
                prisma_1.hotelDb.getAdapter().reservation.count({ where: { tenantId, status: 'cancelled', isDeleted: false } })
            ]);
            return {
                total,
                pending,
                confirmed,
                checked_in: checkedIn,
                completed,
                cancelled
            };
        }
        catch (error) {
            this.logger.error('予約統計取得エラー', error);
            throw error;
        }
    }
}
exports.ReservationService = ReservationService;
