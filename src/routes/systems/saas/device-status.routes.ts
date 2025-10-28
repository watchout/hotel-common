import * as express from 'express'


import { authMiddleware } from '../../../auth/middleware'
import { hotelDb } from '../../../database/prisma'
import { ResponseHelper } from '../../../standards/api-response-standards'

import type { Request, Response } from 'express'

const router = express.Router()

/**
 * デバイスステータス確認API
 * パブリックAPI（認証不要）
 */
router.post('/api/v1/devices/check-status', async (req: Request, res: Response) => {
  try {
    const { macAddress, ipAddress, userAgent, pagePath } = req.body

    // 必須パラメータのバリデーション
    if (!macAddress) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DEVICE_DATA',
          message: 'MACアドレスは必須です',
          details: { missingField: 'macAddress' }
        }
      })
    }

    try {
      // MACアドレスからデバイスを検索
      const device = await hotelDb.getAdapter().deviceRoom.findFirst({
        where: {
          macAddress,
          isActive: true
        }
      })

      // デバイスが見つからない場合
      if (!device) {
        return res.json({
          found: false,
          isActive: false
        })
      }

      // IPアドレスが提供されている場合は更新
      if (ipAddress && ipAddress !== device.ipAddress) {
        await hotelDb.getAdapter().deviceRoom.update({
          where: { id: device.id },
          data: {
            ipAddress,
            lastUsedAt: new Date(),
            updatedAt: new Date()
          }
        })
      } else {
        // 最終使用日時のみ更新
        await hotelDb.getAdapter().deviceRoom.update({
          where: { id: device.id },
          data: {
            lastUsedAt: new Date(),
            updatedAt: new Date()
          }
        })
      }

      // レスポンスを返す
      return res.json({
        found: true,
        isActive: device.isActive,
        deviceId: device.deviceId || `device-${device.id}`,
        deviceName: device.roomName || `Room ${device.roomId}`,
        roomId: device.roomId,
        ipAddress: ipAddress || device.ipAddress,
        macAddress: device.macAddress
      })
    } catch (dbError) {
      console.error('データベースエラー:', dbError)
      // テーブルが存在しない場合や他のデータベースエラーの場合
      return res.json({
        found: false,
        isActive: false,
        message: 'デバイス情報を取得できませんでした。マイグレーションが必要です。'
      })
    }
  } catch (error: unknown) {
    console.error('デバイスステータス確認エラー:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '不明なエラーが発生しました',
        details: {}
      }
    })
  }
})

/**
 * クライアントIP取得API
 * パブリックAPI（認証不要）
 */
router.get('/api/v1/devices/client-ip', (req: Request, res: Response) => {
  try {
    // クライアントIPを取得（複数のヘッダーをチェック）
    const xForwardedFor = req.headers['x-forwarded-for']
    const xRealIp = req.headers['x-real-ip']
    const xClientIp = req.headers['x-client-ip']
    
    // 最も信頼できるIPを特定
    let clientIp = req.ip || req.socket.remoteAddress || '0.0.0.0'
    
    // x-forwarded-forが存在する場合は最初のIPを使用
    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor) 
        ? xForwardedFor[0] 
        : xForwardedFor.split(',')[0].trim()
      clientIp = ips
    }

    return res.json({
      ip: clientIp,
      headers: {
        'x-forwarded-for': xForwardedFor || null,
        'x-real-ip': xRealIp || null,
        'x-client-ip': xClientIp || null
      }
    })
  } catch (error: unknown) {
    console.error('クライアントIP取得エラー:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '不明なエラーが発生しました',
        details: {}
      }
    })
  }
})

/**
 * デバイス数取得API
 * 管理者権限が必要
 */
router.get('/api/v1/devices/count', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DEVICE_DATA',
          message: 'テナントIDが指定されていません',
          details: {}
        }
      })
    }

    try {
      // デバイスの総数を取得
      const totalCount = await hotelDb.getAdapter().deviceRoom.count({
        where: { tenantId }
      })

      // アクティブなデバイス数を取得
      const activeCount = await hotelDb.getAdapter().deviceRoom.count({
        where: {
          tenantId,
          isActive: true
        }
      })

      // 非アクティブなデバイス数を取得
      const inactiveCount = await hotelDb.getAdapter().deviceRoom.count({
        where: {
          tenantId,
          isActive: false
        }
      })

      // デバイスタイプ別の集計
      const devicesByType = await hotelDb.getAdapter().deviceRoom.groupBy({
        by: ['deviceType'],
        where: { tenantId },
        _count: true
      })

      const byType: Record<string, number> = {}
      devicesByType.forEach((item: any) => {
        if (item.deviceType) {
          byType[item.deviceType] = item._count
        }
      })

      // ステータス別の集計
      const devicesByStatus = await hotelDb.getAdapter().deviceRoom.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true
      })

      const byStatus: Record<string, number> = {}
      devicesByStatus.forEach((item: any) => {
        if (item.status) {
          byStatus[item.status] = item._count
        }
      })

      return res.json({
        success: true,
        count: {
          total: totalCount,
          active: activeCount,
          inactive: inactiveCount,
          byType,
          byStatus
        }
      })
    } catch (dbError) {
      console.error('データベースエラー:', dbError)
      // テーブルが存在しない場合や他のデータベースエラーの場合
      return res.json({
        success: true,
        count: {
          total: 0,
          active: 0,
          inactive: 0,
          byType: {},
          byStatus: {},
          message: 'デバイス情報を取得できませんでした。マイグレーションが必要です。'
        }
      })
    }
  } catch (error: unknown) {
    console.error('デバイス数取得エラー:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '不明なエラーが発生しました',
        details: {}
      }
    })
  }
})

export default router
