"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const prisma_1 = require("../database/prisma");
const logger_1 = require("../utils/logger");
/**
 * 部屋管理サービス
 * PMS基本機能の部屋管理
 */
class RoomService {
    static logger = logger_1.HotelLogger.getInstance();
    /**
     * 部屋作成
     */
    static async createRoom(data) {
        try {
            this.logger.info('部屋作成開始', {
                data: {
                    tenant_id: data.tenant_id,
                    room_number: data.room_number,
                    room_type: data.room_type
                }
            });
            // 部屋番号の重複チェック
            const existingRoom = await prisma_1.hotelDb.getAdapter().room.findFirst({
                where: {
                    tenant_id: data.tenant_id,
                    room_number: data.room_number
                }
            });
            if (existingRoom) {
                throw new Error(`部屋番号 ${data.room_number} は既に存在します`);
            }
            const room = await prisma_1.hotelDb.getAdapter().room.create({
                data: {
                    tenant_id: data.tenant_id,
                    room_number: data.room_number,
                    room_type: data.room_type,
                    floor_number: data.floor_number,
                    capacity: data.capacity,
                    base_rate: data.base_rate,
                    room_grade_id: data.room_grade_id,
                    room_size_sqm: data.room_size_sqm,
                    amenities: data.amenities,
                    is_smoking: data.is_smoking,
                    is_accessible: data.is_accessible,
                    bed_configuration: data.bed_configuration,
                    bathroom_type: data.bathroom_type,
                    view_type: data.view_type,
                    status: 'available',
                    is_active: true,
                    notes: data.notes,
                    created_by: data.created_by,
                    created_by_system: 'hotel-common'
                }
            });
            this.logger.info('部屋作成完了', {
                data: {
                    room_id: room.id,
                    room_number: data.room_number
                }
            });
            return room;
        }
        catch (error) {
            this.logger.error('部屋作成エラー', error);
            throw error;
        }
    }
    /**
     * 部屋取得（ID指定）
     */
    static async getRoomById(id, tenantId, includeGrade = false) {
        try {
            const include = {};
            if (includeGrade) {
                include.roomGrade = true;
            }
            const room = await prisma_1.hotelDb.getAdapter().room.findFirst({
                where: {
                    id,
                    tenant_id: tenantId
                },
                include
            });
            return room;
        }
        catch (error) {
            this.logger.error('部屋取得エラー', error);
            throw error;
        }
    }
    /**
     * 部屋番号で取得
     */
    static async getRoomByNumber(roomNumber, tenantId) {
        try {
            const room = await prisma_1.hotelDb.getAdapter().room.findFirst({
                where: {
                    room_number: roomNumber,
                    tenant_id: tenantId
                }
            });
            return room;
        }
        catch (error) {
            this.logger.error('部屋番号取得エラー', error);
            throw error;
        }
    }
    /**
     * 部屋一覧取得（検索・フィルタ対応）
     */
    static async getRooms(params) {
        try {
            const where = {
                tenant_id: params.tenant_id
            };
            // フィルタ条件構築
            if (params.status) {
                where.status = params.status;
            }
            if (params.room_type) {
                where.room_type = params.room_type;
            }
            if (params.floor_number) {
                where.floor_number = params.floor_number;
            }
            if (params.capacity_min || params.capacity_max) {
                where.capacity = {};
                if (params.capacity_min) {
                    where.capacity.gte = params.capacity_min;
                }
                if (params.capacity_max) {
                    where.capacity.lte = params.capacity_max;
                }
            }
            if (params.is_smoking !== undefined) {
                where.is_smoking = params.is_smoking;
            }
            if (params.is_accessible !== undefined) {
                where.is_accessible = params.is_accessible;
            }
            if (params.is_active !== undefined) {
                where.is_active = params.is_active;
            }
            if (params.room_grade_id) {
                where.room_grade_id = params.room_grade_id;
            }
            // 空室期間チェック（予約との重複確認）
            if (params.available_from && params.available_to) {
                where.NOT = {
                    reservations: {
                        some: {
                            AND: [
                                {
                                    checkin_date: {
                                        lt: new Date(params.available_to)
                                    }
                                },
                                {
                                    checkout_date: {
                                        gt: new Date(params.available_from)
                                    }
                                },
                                {
                                    status: {
                                        in: ['confirmed', 'checked_in']
                                    }
                                }
                            ]
                        }
                    }
                };
            }
            const include = {};
            if (params.include_grade) {
                include.roomGrade = true;
            }
            // 総件数取得
            const total = await prisma_1.hotelDb.getAdapter().room.count({ where });
            // データ取得
            const rooms = await prisma_1.hotelDb.getAdapter().room.findMany({
                where,
                include,
                orderBy: [
                    { floor_number: 'asc' },
                    { room_number: 'asc' }
                ],
                skip: params.offset,
                take: params.limit
            });
            const hasNext = params.offset + params.limit < total;
            return {
                rooms: rooms,
                total,
                hasNext
            };
        }
        catch (error) {
            this.logger.error('部屋一覧取得エラー', error);
            throw error;
        }
    }
    /**
     * 部屋更新
     */
    static async updateRoom(id, tenantId, data) {
        try {
            this.logger.info('部屋更新開始', {
                data: {
                    room_id: id,
                    tenant_id: tenantId
                }
            });
            // 部屋番号の重複チェック（変更される場合）
            if (data.room_number) {
                const existingRoom = await prisma_1.hotelDb.getAdapter().room.findFirst({
                    where: {
                        tenant_id: tenantId,
                        room_number: data.room_number,
                        NOT: { id }
                    }
                });
                if (existingRoom) {
                    throw new Error(`部屋番号 ${data.room_number} は既に存在します`);
                }
            }
            const updateData = {
                ...data,
                updated_at: new Date(),
                updated_by_system: 'hotel-common'
            };
            const room = await prisma_1.hotelDb.getAdapter().room.update({
                where: {
                    id,
                    tenant_id: tenantId
                },
                data: updateData
            });
            this.logger.info('部屋更新完了', {
                data: {
                    room_id: id
                }
            });
            return room;
        }
        catch (error) {
            this.logger.error('部屋更新エラー', error);
            throw error;
        }
    }
    /**
     * 部屋ステータス更新
     */
    static async updateRoomStatus(id, tenantId, data) {
        try {
            this.logger.info('部屋ステータス更新開始', {
                data: {
                    room_id: id,
                    tenant_id: tenantId,
                    status: data.status
                }
            });
            const updateData = {
                status: data.status,
                updated_at: new Date(),
                updated_by: data.updated_by,
                updated_by_system: 'hotel-common'
            };
            if (data.notes) {
                updateData.notes = data.notes;
            }
            if (data.maintenance_notes) {
                updateData.maintenance_notes = data.maintenance_notes;
            }
            // ステータス別の追加処理
            if (data.status === 'cleaning') {
                updateData.last_cleaned_at = new Date();
            }
            else if (data.status === 'maintenance') {
                updateData.last_maintenance_at = new Date();
            }
            const room = await prisma_1.hotelDb.getAdapter().room.update({
                where: {
                    id,
                    tenant_id: tenantId
                },
                data: updateData
            });
            this.logger.info('部屋ステータス更新完了', {
                data: {
                    room_id: id,
                    status: data.status
                }
            });
            return room;
        }
        catch (error) {
            this.logger.error('部屋ステータス更新エラー', error);
            throw error;
        }
    }
    /**
     * 部屋削除（論理削除）
     */
    static async deleteRoom(id, tenantId, deletedBy) {
        try {
            this.logger.info('部屋削除開始', {
                data: {
                    room_id: id,
                    tenant_id: tenantId
                }
            });
            const room = await prisma_1.hotelDb.getAdapter().room.update({
                where: {
                    id,
                    tenant_id: tenantId
                },
                data: {
                    is_active: false,
                    status: 'out_of_order',
                    updated_at: new Date(),
                    updated_by: deletedBy,
                    updated_by_system: 'hotel-common'
                }
            });
            this.logger.info('部屋削除完了', {
                data: {
                    room_id: id
                }
            });
            return room;
        }
        catch (error) {
            this.logger.error('部屋削除エラー', error);
            throw error;
        }
    }
    /**
     * フロア別部屋取得
     */
    static async getRoomsByFloor(floorNumber, tenantId) {
        try {
            const rooms = await prisma_1.hotelDb.getAdapter().room.findMany({
                where: {
                    tenant_id: tenantId,
                    floor_number: floorNumber,
                    is_active: true
                },
                orderBy: {
                    room_number: 'asc'
                }
            });
            return rooms;
        }
        catch (error) {
            this.logger.error('フロア別部屋取得エラー', error);
            throw error;
        }
    }
    /**
     * 空室検索
     */
    static async searchAvailableRooms(params) {
        try {
            this.logger.info('空室検索開始', {
                data: {
                    tenant_id: params.tenant_id,
                    checkin_date: params.checkin_date,
                    checkout_date: params.checkout_date,
                    guest_count: params.guest_count
                }
            });
            const where = {
                tenant_id: params.tenant_id,
                is_active: true,
                status: {
                    in: ['available', 'cleaning']
                },
                capacity: {
                    gte: params.guest_count
                }
            };
            // 部屋タイプフィルタ
            if (params.room_type) {
                where.room_type = params.room_type;
            }
            // 喫煙・禁煙フィルタ
            if (params.is_smoking !== undefined) {
                where.is_smoking = params.is_smoking;
            }
            // バリアフリーフィルタ
            if (params.is_accessible !== undefined) {
                where.is_accessible = params.is_accessible;
            }
            // 部屋グレードフィルタ
            if (params.room_grade_id) {
                where.room_grade_id = params.room_grade_id;
            }
            // 予約との重複チェック
            where.NOT = {
                reservations: {
                    some: {
                        AND: [
                            {
                                checkin_date: {
                                    lt: new Date(params.checkout_date)
                                }
                            },
                            {
                                checkout_date: {
                                    gt: new Date(params.checkin_date)
                                }
                            },
                            {
                                status: {
                                    in: ['confirmed', 'checked_in']
                                }
                            }
                        ]
                    }
                }
            };
            const rooms = await prisma_1.hotelDb.getAdapter().room.findMany({
                where,
                include: {
                    roomGrade: true
                },
                orderBy: [
                    { floor_number: 'asc' },
                    { room_number: 'asc' }
                ]
            });
            this.logger.info('空室検索完了', {
                data: {
                    found_rooms: rooms.length
                }
            });
            return rooms;
        }
        catch (error) {
            this.logger.error('空室検索エラー', error);
            throw error;
        }
    }
    /**
     * 部屋統計取得
     */
    static async getRoomStats(tenantId) {
        try {
            const [total, available, occupied, cleaning, maintenance, outOfOrder, roomsByType, roomsByFloor] = await Promise.all([
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenant_id: tenantId, is_active: true } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenant_id: tenantId, status: 'available', is_active: true } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenant_id: tenantId, status: 'occupied', is_active: true } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenant_id: tenantId, status: 'cleaning', is_active: true } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenant_id: tenantId, status: 'maintenance', is_active: true } }),
                prisma_1.hotelDb.getAdapter().room.count({ where: { tenant_id: tenantId, status: 'out_of_order', is_active: true } }),
                prisma_1.hotelDb.getAdapter().room.groupBy({
                    by: ['room_type'],
                    where: { tenant_id: tenantId, is_active: true },
                    _count: true
                }),
                prisma_1.hotelDb.getAdapter().room.groupBy({
                    by: ['floor_number'],
                    where: { tenant_id: tenantId, is_active: true },
                    _count: true
                })
            ]);
            const byType = {};
            roomsByType.forEach((item) => {
                byType[item.room_type] = item._count;
            });
            const byFloor = {};
            roomsByFloor.forEach((item) => {
                byFloor[item.floor_number] = item._count;
            });
            return {
                total,
                available,
                occupied,
                cleaning,
                maintenance,
                out_of_order: outOfOrder,
                by_type: byType,
                by_floor: byFloor
            };
        }
        catch (error) {
            this.logger.error('部屋統計取得エラー', error);
            throw error;
        }
    }
}
exports.RoomService = RoomService;
