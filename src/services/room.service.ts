import { hotelDb } from '../database/prisma'
import type { Prisma } from '../generated/prisma'
import { HotelLogger } from '../utils/logger'

import type {
  CreateRoomRequest,
  Room,
  RoomAvailabilitySearch,
  RoomSearchParams,
  UpdateRoomRequest,
  UpdateRoomStatusRequest
} from '../schemas/room'

/**
 * 部屋管理サービス
 * PMS基本機能の部屋管理
 */
export class RoomService {
  private static logger = HotelLogger.getInstance()

  /**
   * 部屋作成
   */
  static async createRoom(data: CreateRoomRequest): Promise<Room> {
    try {
      this.logger.info('部屋作成開始', {
        data: {
          tenantId: data.tenant_id,
          roomNumber: data.room_number,
          roomType: data.room_type
        }
      })

      // 部屋番号の重複チェック
      const existingRoom = await hotelDb.getAdapter().room.findFirst({
        where: {
          tenantId: data.tenant_id,
          roomNumber: data.room_number
        }
      })

      if (existingRoom) {
        throw new Error(`部屋番号 ${data.room_number} は既に存在します`)
      }

      const room = await hotelDb.getAdapter().room.create({
        data: {
          tenantId: data.tenant_id,
          roomNumber: data.room_number,
          roomType: data.room_type,
          floor: data.floor_number,
          capacity: data.capacity,
          // baseRate: data.base_rate,
          // roomGradeId: data.roomGradeId,
          // room_size_sqm: data.room_size_sqm,
          amenities: data.amenities,
          // is_smoking: data.is_smoking,
          // is_accessible: data.is_accessible,
          // // bed_configuration: data.bed_configuration,
          // bathroomType: data.bathroomType,
          // // view_type: data.view_type,
          // status: 'available',
          // isActive: true,
          notes: data.notes,
          // createdBy: data.createdBy,
          // createdBy_system: 'hotel-common'
        }
      })

      this.logger.info('部屋作成完了', {
        data: {
          room_id: room.id,
          roomNumber: data.room_number
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return room as any as Room
    } catch (error: unknown) {
      this.logger.error('部屋作成エラー', error as Error)
      throw error
    }
  }

  /**
   * 部屋取得（ID指定）
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getRoomById(id: string, tenantId: string, includeGrade = false): Promise<Room | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      const room = await hotelDb.getAdapter().room.findFirst({
        where: {
          id,
          tenantId: tenantId
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return room as any as Room | null
    } catch (error: unknown) {
      this.logger.error('部屋取得エラー', error as Error)
      throw error
    }
  }

  /**
   * 部屋番号で取得
   */
  static async getRoomByNumber(roomNumber: string, tenantId: string): Promise<Room | null> {
    try {
      const room = await hotelDb.getAdapter().room.findFirst({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: {
          roomNumber: roomNumber,
          tenantId: tenantId
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return room as any as Room | null
    } catch (error: unknown) {
      this.logger.error('部屋番号取得エラー', error as Error)
      throw error
    }
  }

  /**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   * 部屋一覧取得（検索・フィルタ対応）
   */
  static async getRooms(params: RoomSearchParams): Promise<{
    rooms: Room[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    total: number
    hasNext: boolean
  }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        tenantId: params.tenant_id
      }

      // フィルタ条件構築
      if (params.status) {
        where.status = params.status
      }

      if (params.room_type) {
        where.roomType = params.room_type
      }

      if (params.floor_number) {
        where.floor_number = params.floor_number
      }

      if (params.capacity_min || params.capacity_max) {
        where.capacity = {}
        if (params.capacity_min) {
          where.capacity.gte = params.capacity_min
        }
        if (params.capacity_max) {
          where.capacity.lte = params.capacity_max
        }
      }

      if (params.is_smoking !== undefined) {
        where.is_smoking = params.is_smoking
      }

      if (params.is_accessible !== undefined) {
        where.is_accessible = params.is_accessible
      }

      if (params.is_active !== undefined) {
        where.isActive = params.is_active
      }

      if (params.room_grade_id) {
        where.roomGradeId = params.room_grade_id
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  status: {
                    in: ['confirmed', 'checked_in']
                  }
                }
              ]
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
          }
        }
      }

      // 総件数取得
      const total = await hotelDb.getAdapter().room.count({ where })

      // データ取得
      const rooms = await hotelDb.getAdapter().room.findMany({
        where,
        orderBy: [
          { floor: 'asc' },
          { roomNumber: 'asc' }
        ],
        skip: params.offset,
        take: params.limit
      })

      const hasNext = params.offset + params.limit < total

      return {
        // @ts-expect-error
        rooms: rooms as Room[],
        total,
        hasNext
      }
    } catch (error: unknown) {
      this.logger.error('部屋一覧取得エラー', error as Error)
      throw error
    }
  }

  /**
   * 部屋更新
   */
  static async updateRoom(
    id: string,
    tenantId: string,
    data: UpdateRoomRequest
  ): Promise<Room> {
    try {
      this.logger.info('部屋更新開始', {
        data: {
          room_id: id,
          tenantId: tenantId
        }
      })

      // 部屋番号の重複チェック（変更される場合）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.room_number) {
        const existingRoom = await hotelDb.getAdapter().room.findFirst({
          where: {
            tenantId: tenantId,
            roomNumber: data.room_number,
            NOT: { id }
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })

        if (existingRoom) {
          throw new Error(`部屋番号 ${data.room_number} は既に存在します`)
        }
      }

      const dataOut: Prisma.RoomUpdateInput = ((): Prisma.RoomUpdateInput => {
        const out: Prisma.RoomUpdateInput = {
          updatedAt: new Date()
        }
        if (data.room_number !== undefined) out.roomNumber = data.room_number
        if (data.room_type !== undefined) out.roomType = data.room_type
        if (data.floor_number !== undefined) out.floor = data.floor_number
        if (data.capacity !== undefined) out.capacity = data.capacity
        if (data.amenities !== undefined) out.amenities = data.amenities
        if (data.notes !== undefined) out.notes = data.notes
        if (data.status !== undefined) out.status = data.status
        return out
      })()

      const room = await hotelDb.getAdapter().room.update({
        where: {
          id,
          tenantId: tenantId
        },
        data: dataOut
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })

      this.logger.info('部屋更新完了', {
        data: {
          room_id: id
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return room as any as Room
    } catch (error: unknown) {
      this.logger.error('部屋更新エラー', error as Error)
      throw error
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  /**
   * 部屋ステータス更新
   */
  static async updateRoomStatus(
    id: string,
    tenantId: string,
    data: UpdateRoomStatusRequest
  ): Promise<Room> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      this.logger.info('部屋ステータス更新開始', {
        data: {
          room_id: id,
          tenantId: tenantId,
          status: data.status
        }
      })

      const dataOut: Prisma.RoomUpdateInput = ((): Prisma.RoomUpdateInput => {
        const out: Prisma.RoomUpdateInput = {
        status: data.status,
          updatedAt: new Date()
        }
        if (data.notes) out.notes = data.notes
        return out
      })()

      const room = await hotelDb.getAdapter().room.update({
        where: {
          id,
          tenantId: tenantId
        },
        data: dataOut
      })

      this.logger.info('部屋ステータス更新完了', {
        data: {
          room_id: id,
          status: data.status
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return room as any as Room
    } catch (error: unknown) {
      this.logger.error('部屋ステータス更新エラー', error as Error)
      throw error
    }
  }

  /**
   * 部屋削除（論理削除）
   */
  static async deleteRoom(id: string, tenantId: string, deletedBy?: string): Promise<Room> {
    try {
      this.logger.info('部屋削除開始', {
        data: {
          room_id: id,
          tenantId: tenantId
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })

      const room = await hotelDb.getAdapter().room.update({
        where: {
          id,
          tenantId: tenantId
        },
        data: ((): Record<string, unknown> => ({
          // isActive: false,
          status: 'out_of_order',
          updatedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // updatedBy: deletedBy,
          // updatedBy_system: 'hotel-common'
        }))()
      })

      this.logger.info('部屋削除完了', {
        data: {
          room_id: id
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return room as any as Room
    } catch (error: unknown) {
      this.logger.error('部屋削除エラー', error as Error)
      throw error
    }
  }

  /**
   * フロア別部屋取得
   */
  static async getRoomsByFloor(floorNumber: number, tenantId: string): Promise<Room[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      const rooms = await hotelDb.getAdapter().room.findMany({
        where: {
          tenantId: tenantId,
          floor: floorNumber,
          // isActive: true
        },
        orderBy: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          roomNumber: 'asc'
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rooms as any as Room[]
    } catch (error: unknown) {
      this.logger.error('フロア別部屋取得エラー', error as Error)
      throw error
    }
  }

  /**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   * 空室検索
   */
  static async searchAvailableRooms(params: RoomAvailabilitySearch): Promise<Room[]> {
    try {
      this.logger.info('空室検索開始', {
        data: {
          tenantId: params.tenant_id,
          checkin_date: params.checkin_date,
          checkout_date: params.checkout_date,
          guest_count: params.guest_count
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        tenantId: params.tenant_id,
        // isActive: true,
        status: {
          in: ['available', 'cleaning']
        },
        capacity: {
          gte: params.guest_count
        }
      }

      // 部屋タイプフィルタ
      if (params.room_type) {
        where.roomType = params.room_type
      }

      // 喫煙・禁煙フィルタ
      if (params.is_smoking !== undefined) {
        where.is_smoking = params.is_smoking
      }

      // バリアフリーフィルタ
      if (params.is_accessible !== undefined) {
        where.is_accessible = params.is_accessible
      }

      // 部屋グレードフィルタ
      if (params.room_grade_id) {
        where.roomGradeId = params.room_grade_id
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              },
              {
                status: {
                  in: ['confirmed', 'checked_in']
                }
              }
            ]
          }
        }
      }

      const rooms = await hotelDb.getAdapter().room.findMany({
        where,
        orderBy: [
          { floor: 'asc' },
          { roomNumber: 'asc' }
        ]
      })

      this.logger.info('空室検索完了', {
        data: {
          found_rooms: rooms.length
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rooms as any as Room[]
    } catch (error: unknown) {
      this.logger.error('空室検索エラー', error as Error)
      throw error
    }
  }

  /**
   * 部屋統計取得
   */
  static async getRoomStats(tenantId: string): Promise<{
    total: number
    available: number
    occupied: number
    cleaning: number
    maintenance: number
    out_of_order: number
    by_type: Record<string, number>
    by_floor: Record<number, number>
  }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try {
      const [
        total,
        available,
        occupied,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cleaning,
        maintenance,
        outOfOrder,
        roomsByType,
        roomsByFloor
      ] = await Promise.all([
        hotelDb.getAdapter().room.count({ where: { tenantId: tenantId } }),
        hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'available' } }),
        hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'occupied' } }),
        hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'cleaning' } }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'maintenance' } }),
        hotelDb.getAdapter().room.count({ where: { tenantId: tenantId, status: 'out_of_order' } }),
        hotelDb.getAdapter().room.groupBy({
          by: ['roomType'],
          where: { tenantId: tenantId },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          _count: true
        }),
        hotelDb.getAdapter().room.groupBy({
          by: ['floor'],
          where: { tenantId: tenantId },
          _count: true
        })
      ])

      const byType: Record<string, number> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roomsByType.forEach((item: any) => {
        byType[item.roomType] = item._count
      })

      const byFloor: Record<number, number> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roomsByFloor.forEach((item: any) => {
        byFloor[item.floor_number] = item._count
      })

      return {
        total,
        available,
        occupied,
        cleaning,
        maintenance,
        out_of_order: outOfOrder,
        by_type: byType,
        by_floor: byFloor
      }
    } catch (error: unknown) {
      this.logger.error('部屋統計取得エラー', error as Error)
      throw error
    }
  }
}
