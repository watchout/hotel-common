import express from 'express'

import { authMiddleware } from '../../../auth/middleware'
import DeviceRoomService from '../../../services/device/device-room.service'

const router = express.Router()

/**
 * DeviceRoom管理用APIルーター
 * hotel-saas用のデバイス管理機能を提供
 */

// 認証ミドルウェアを適用（すべてのエンドポイントに認証が必要）
router.use(authMiddleware)

/**
 * テナントに紐づくすべてのデバイスを取得
 */
router.get('/api/v1/devices', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'テナントIDが指定されていません'
      })
    }

    const devices = await DeviceRoomService.getAllDevicesByTenant(tenantId)

    return res.json({
      success: true,
      count: devices.length,
      devices
    })
  } catch (error: unknown) {
    console.error('デバイス一覧取得エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * 部屋IDに紐づくデバイスを取得
 */
router.get('/api/v1/devices/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'テナントIDが指定されていません'
      })
    }

    const devices = await DeviceRoomService.getDevicesByRoom(tenantId, roomId)

    return res.json({
      success: true,
      count: devices.length,
      devices
    })
  } catch (error: unknown) {
    console.error('部屋デバイス取得エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * デバイスIDで特定のデバイスを取得
 */
router.get('/api/v1/devices/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params

    const device = await DeviceRoomService.getDeviceByDeviceId(deviceId)

    if (!device) {
      return res.status(404).json({
        success: false,
        error: '指定されたデバイスが見つかりません'
      })
    }

    // テナントアクセス権限の確認
    if (device.tenantId !== req.user?.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'このデバイスへのアクセス権限がありません'
      })
    }

    return res.json({
      success: true,
      device
    })
  } catch (error: unknown) {
    console.error('デバイス取得エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * 新しいデバイスを登録
 */
router.post('/api/v1/devices', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'テナントIDが指定されていません'
      })
    }

    const deviceData = {
      ...req.body,
      tenantId
    }

    const device = await DeviceRoomService.registerDevice(deviceData)

    return res.status(201).json({
      success: true,
      device
    })
  } catch (error: unknown) {
    console.error('デバイス登録エラー:', error)
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * デバイス情報を更新
 */
router.put('/api/v1/devices/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deviceId = parseInt(id)

    if (isNaN(deviceId)) {
      return res.status(400).json({
        success: false,
        error: '無効なデバイスIDです'
      })
    }

    // デバイスの存在確認とテナント権限チェック
    const existingDevice = await DeviceRoomService.getDeviceByDeviceId(id)
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        error: '指定されたデバイスが見つかりません'
      })
    }

    if (existingDevice.tenantId !== req.user?.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'このデバイスへのアクセス権限がありません'
      })
    }

    const updatedDevice = await DeviceRoomService.updateDevice(deviceId, req.body)

    return res.json({
      success: true,
      device: updatedDevice
    })
  } catch (error: unknown) {
    console.error('デバイス更新エラー:', error)
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * デバイスの最終使用日時を更新
 */
router.patch('/api/v1/devices/:id/last-used', async (req, res) => {
  try {
    const { id } = req.params
    const deviceId = parseInt(id)

    if (isNaN(deviceId)) {
      return res.status(400).json({
        success: false,
        error: '無効なデバイスIDです'
      })
    }

    // デバイスの存在確認とテナント権限チェック
    const existingDevice = await DeviceRoomService.getDeviceByDeviceId(id)
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        error: '指定されたデバイスが見つかりません'
      })
    }

    if (existingDevice.tenantId !== req.user?.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'このデバイスへのアクセス権限がありません'
      })
    }

    const updatedDevice = await DeviceRoomService.updateDeviceLastUsed(deviceId)

    return res.json({
      success: true,
      device: updatedDevice
    })
  } catch (error: unknown) {
    console.error('デバイス最終使用日時更新エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * デバイスを非アクティブ化（論理削除）
 */
router.delete('/api/v1/devices/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params
    const deviceId = parseInt(id)

    if (isNaN(deviceId)) {
      return res.status(400).json({
        success: false,
        error: '無効なデバイスIDです'
      })
    }

    // デバイスの存在確認とテナント権限チェック
    const existingDevice = await DeviceRoomService.getDeviceByDeviceId(id)
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        error: '指定されたデバイスが見つかりません'
      })
    }

    if (existingDevice.tenantId !== req.user?.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'このデバイスへのアクセス権限がありません'
      })
    }

    const deactivatedDevice = await DeviceRoomService.deactivateDevice(deviceId)

    return res.json({
      success: true,
      device: deactivatedDevice
    })
  } catch (error: unknown) {
    console.error('デバイス非アクティブ化エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * デバイスを物理削除
 */
router.delete('/api/v1/devices/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deviceId = parseInt(id)

    if (isNaN(deviceId)) {
      return res.status(400).json({
        success: false,
        error: '無効なデバイスIDです'
      })
    }

    // デバイスの存在確認とテナント権限チェック
    const existingDevice = await DeviceRoomService.getDeviceByDeviceId(id)
    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        error: '指定されたデバイスが見つかりません'
      })
    }

    if (existingDevice.tenantId !== req.user?.tenant_id) {
      return res.status(403).json({
        success: false,
        error: 'このデバイスへのアクセス権限がありません'
      })
    }

    await DeviceRoomService.deleteDevice(deviceId)

    return res.json({
      success: true,
      message: 'デバイスが正常に削除されました'
    })
  } catch (error: unknown) {
    console.error('デバイス削除エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * プレイスIDに紐づくデバイスを取得
 */
router.get('/api/v1/devices/place/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'テナントIDが指定されていません'
      })
    }

    const devices = await DeviceRoomService.getDevicesByPlace(tenantId, placeId)

    return res.json({
      success: true,
      count: devices.length,
      devices
    })
  } catch (error: unknown) {
    console.error('プレイスデバイス取得エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * デバイスタイプでフィルタリングして取得
 */
router.get('/api/v1/devices/type/:deviceType', async (req, res) => {
  try {
    const { deviceType } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'テナントIDが指定されていません'
      })
    }

    const devices = await DeviceRoomService.getDevicesByType(tenantId, deviceType)

    return res.json({
      success: true,
      count: devices.length,
      devices
    })
  } catch (error: unknown) {
    console.error('デバイスタイプ検索エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * ステータスでフィルタリングして取得
 */
router.get('/api/v1/devices/status/:status', async (req, res) => {
  try {
    const { status } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'テナントIDが指定されていません'
      })
    }

    const devices = await DeviceRoomService.getDevicesByStatus(tenantId, status)

    return res.json({
      success: true,
      count: devices.length,
      devices
    })
  } catch (error: unknown) {
    console.error('ステータス検索エラー:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

/**
 * デバイスの一括登録
 */
router.post('/api/v1/devices/bulk', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'テナントIDが指定されていません'
      })
    }

    const { devices } = req.body

    if (!Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'デバイスの配列が必要です'
      })
    }

    // 各デバイスにテナントIDを追加
    const devicesWithTenant = devices.map(device => ({
      ...device,
      tenantId
    }))

    const result = await DeviceRoomService.bulkRegisterDevices(devicesWithTenant)

    return res.status(201).json({
      ...result
    })
  } catch (error: unknown) {
    console.error('デバイス一括登録エラー:', error)
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    })
  }
})

export default router
