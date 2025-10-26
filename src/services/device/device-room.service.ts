import DeviceRoomRepository from '../../repositories/device/device-room.repository'

/**
 * DeviceRoomサービス
 * hotel-saas用のデバイス管理機能を提供
 */
export class DeviceRoomService {
  /**
   * テナントに紐づくすべてのデバイスを取得
   */
  async getAllDevicesByTenant(tenantId: string) {
    return DeviceRoomRepository.findAllByTenantId(tenantId)
  }

  /**
   * 特定の部屋に紐づくデバイスを取得
   */
  async getDevicesByRoom(tenantId: string, roomId: string) {
    return DeviceRoomRepository.findByRoomId(tenantId, roomId)
  }

  /**
   * デバイスIDで特定のデバイスを取得
   */
  async getDeviceByDeviceId(deviceId: string) {
    return DeviceRoomRepository.findByDeviceId(deviceId)
  }

  /**
   * 新しいデバイスを登録
   */
  async registerDevice(data: {
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
    // 必須フィールドの検証
    if (!data.tenantId || !data.roomId) {
      throw new Error('テナントIDと部屋IDは必須です')
    }

    // デバイスIDが指定されている場合、重複チェック
    if (data.deviceId) {
      const existingDevice = await DeviceRoomRepository.findByDeviceId(data.deviceId)
      if (existingDevice) {
        throw new Error('このデバイスIDは既に登録されています')
      }
    }

    // デバイスステータスのデフォルト設定
    if (!data.status) {
      data.status = 'active'
    }

    return DeviceRoomRepository.create(data)
  }

  /**
   * デバイス情報を更新
   */
  async updateDevice(id: number, data: {
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
    // デバイスの存在確認
    const device = await DeviceRoomRepository.findByDeviceId(id.toString())
    if (!device) {
      throw new Error('指定されたデバイスが見つかりません')
    }

    // デバイスIDが変更される場合、重複チェック
    if (data.deviceId && data.deviceId !== device.deviceId) {
      const existingDevice = await DeviceRoomRepository.findByDeviceId(data.deviceId)
      if (existingDevice && existingDevice.id !== id) {
        throw new Error('このデバイスIDは既に使用されています')
      }
    }

    return DeviceRoomRepository.update(id, data)
  }

  /**
   * デバイスの最終使用日時を更新
   */
  async updateDeviceLastUsed(id: number) {
    return DeviceRoomRepository.updateLastUsed(id)
  }

  /**
   * デバイスを非アクティブ化（論理削除）
   */
  async deactivateDevice(id: number) {
    return DeviceRoomRepository.deactivate(id)
  }

  /**
   * デバイスを物理削除
   */
  async deleteDevice(id: number) {
    return DeviceRoomRepository.delete(id)
  }

  /**
   * プレイスIDに紐づくデバイスを取得
   */
  async getDevicesByPlace(tenantId: string, placeId: string) {
    return DeviceRoomRepository.findByPlaceId(tenantId, placeId)
  }

  /**
   * デバイスタイプでフィルタリングして取得
   */
  async getDevicesByType(tenantId: string, deviceType: string) {
    return DeviceRoomRepository.findByDeviceType(tenantId, deviceType)
  }

  /**
   * ステータスでフィルタリングして取得
   */
  async getDevicesByStatus(tenantId: string, status: string) {
    return DeviceRoomRepository.findByStatus(tenantId, status)
  }

  /**
   * デバイスの一括登録
   */
  async bulkRegisterDevices(devices: Array<{
    tenantId: string
    roomId: string
    roomName?: string
    deviceId?: string
    deviceType?: string
    placeId?: string
    status?: string
    ipAddress?: string
    macAddress?: string
  }>) {
    const results = []
    
    for (const device of devices) {
      try {
        const result = await this.registerDevice(device)
        results.push({ success: true, device: result })
      } catch (error: Error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : '不明なエラー',
          device
        })
      }
    }
    
    return {
      total: devices.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  }
}

export default new DeviceRoomService()
