import { hotelDb } from '../../database/prisma'

/**
 * DeviceRoomリポジトリ
 * hotel-saas用のデバイス管理機能を提供
 */
export class DeviceRoomRepository {
  constructor() {
    // hotelDbを使用
  }

  /**
   * テナントに紐づくすべてのデバイスを取得
   */
  async findAllByTenantId(tenantId: string) {
    return hotelDb.getAdapter().deviceRoom.findMany({
      where: {
        tenantId,
        isActive: true,
        is_deleted: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * 特定の部屋に紐づくデバイスを取得
   */
  async findByRoomId(tenantId: string, roomId: string) {
    return hotelDb.getAdapter().deviceRoom.findMany({
      where: {
        tenantId,
        roomId,
        isActive: true,
        is_deleted: false
      }
    })
  }

  /**
   * デバイスIDで特定のデバイスを取得
   */
  async findByDeviceId(deviceId: string) {
    return hotelDb.getAdapter().deviceRoom.findFirst({
      where: {
        deviceId,
        isActive: true,
        is_deleted: false
      }
    })
  }

  /**
   * 新しいデバイスを作成
   */
  async create(data: {
    tenantId: string
    roomId: string
    roomName?: string
    deviceId?: string
    deviceType?: string
    placeId?: string
    status?: string
    ipAddress?: string
    macAddress?: string
  }) {
    return hotelDb.getAdapter().deviceRoom.create({
      data: {
        // idはauto-incrementなので指定しない
        ...data,
        lastUsedAt: new Date(),
        updatedAt: new Date(), // 必須フィールドを追加
        createdAt: new Date(), // 必須フィールドを追加
        isActive: true // デフォルト値を設定
      }
    })
  }

  /**
   * デバイス情報を更新
   */
  async update(id: number, data: {
    roomId?: string
    roomName?: string
    deviceId?: string
    deviceType?: string
    placeId?: string
    status?: string
    ipAddress?: string
    macAddress?: string
    isActive?: boolean
  }) {
    return hotelDb.getAdapter().deviceRoom.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  /**
   * デバイスの最終使用日時を更新
   */
  async updateLastUsed(id: number) {
    return hotelDb.getAdapter().deviceRoom.update({
      where: { id },
      data: {
        lastUsedAt: new Date(),
        updatedAt: new Date() // 必須フィールドを追加
      }
    })
  }

  /**
   * デバイスを論理削除（非アクティブ化）
   */
  async deactivate(id: number) {
    return hotelDb.getAdapter().deviceRoom.update({
      where: { id },
      data: {
        isActive: false,
        is_deleted: true,
        deleted_at: new Date(),
        updatedAt: new Date()
      }
    })
  }

  /**
   * デバイスを物理削除
   */
  async delete(id: number) {
    return hotelDb.getAdapter().deviceRoom.delete({
      where: { id }
    })
  }

  /**
   * プレイスIDに紐づくデバイスを取得
   */
  async findByPlaceId(tenantId: string, placeId: string) {
    return hotelDb.getAdapter().deviceRoom.findMany({
      where: {
        tenantId,
        placeId,
        isActive: true,
        is_deleted: false
      }
    })
  }

  /**
   * デバイスタイプでフィルタリングして取得
   */
  async findByDeviceType(tenantId: string, deviceType: string) {
    return hotelDb.getAdapter().deviceRoom.findMany({
      where: {
        tenantId,
        deviceType,
        isActive: true,
        is_deleted: false
      }
    })
  }

  /**
   * ステータスでフィルタリングして取得
   */
  async findByStatus(tenantId: string, status: string) {
    return hotelDb.getAdapter().deviceRoom.findMany({
      where: {
        tenantId,
        status,
        isActive: true,
        is_deleted: false
      }
    })
  }
}

export default new DeviceRoomRepository()