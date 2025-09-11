import express from 'express'
import { RoomService } from '../../../services/room.service'
import { verifyTenantAuth } from '../../../auth/middleware'
import { 
  CreateRoomRequestSchema,
  UpdateRoomRequestSchema,
  UpdateRoomStatusRequestSchema,
  RoomSearchParamsSchema,
  RoomAvailabilitySearchSchema
} from '../../../schemas/room'
import { StandardResponseBuilder } from '../../../standards/api-standards'

const router = express.Router()

/**
 * 部屋管理APIルーター
 * PMS基本機能の部屋管理
 */

// 認証ミドルウェアを適用
router.use(verifyTenantAuth)

/**
 * 部屋作成
 * POST /api/v1/rooms
 */
router.post('/api/v1/rooms', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    // リクエストデータ検証
    const validationResult = CreateRoomRequestSchema.safeParse({
      ...req.body,
      tenant_id: tenantId
    })

    if (!validationResult.success) {
      return res.status(400).json(StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response)
    }

    const room = await RoomService.createRoom(validationResult.data)

    return res.status(201).json(StandardResponseBuilder.success(res, room).response)
  } catch (error) {
    console.error('部屋作成エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_CREATE_ERROR', 
      error instanceof Error ? error.message : '部屋作成に失敗しました').response)
  }
})

/**
 * 部屋詳細取得
 * GET /api/v1/rooms/:id
 */
router.get('/api/v1/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenant_id
    const includeGrade = req.query.include_grade === 'true'

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    const room = await RoomService.getRoomById(id, tenantId, includeGrade)

    if (!room) {
      return res.status(404).json(StandardResponseBuilder.error('ROOM_NOT_FOUND', '指定された部屋が見つかりません').response)
    }

    return StandardResponseBuilder.success(res, room)
  } catch (error) {
    console.error('部屋取得エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_GET_ERROR',
      error instanceof Error ? error.message : '部屋取得に失敗しました').response)
  }
})

/**
 * 部屋番号で取得
 * GET /api/v1/rooms/by-number/:roomNumber
 */
router.get('/api/v1/rooms/by-number/:roomNumber', async (req, res) => {
  try {
    const { roomNumber } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    const room = await RoomService.getRoomByNumber(roomNumber, tenantId)

    if (!room) {
      return res.status(404).json(StandardResponseBuilder.error('ROOM_NOT_FOUND', '指定された部屋が見つかりません').response)
    }

    return StandardResponseBuilder.success(res, room)
  } catch (error) {
    console.error('部屋番号取得エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_GET_ERROR',
      error instanceof Error ? error.message : '部屋取得に失敗しました').response)
  }
})

/**
 * 部屋一覧取得
 * GET /api/v1/rooms
 */
router.get('/api/v1/rooms', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    // クエリパラメータ検証
    const validationResult = RoomSearchParamsSchema.safeParse({
      ...req.query,
      tenant_id: tenantId
    })

    if (!validationResult.success) {
      return res.status(400).json(StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response)
    }

    const result = await RoomService.getRooms(validationResult.data)

    return res.status(200).json(StandardResponseBuilder.success(res, {
      rooms: result.rooms,
      pagination: {
        page: Math.floor(validationResult.data.offset / validationResult.data.limit) + 1,
        limit: validationResult.data.limit,
        total: result.total,
        has_next: result.hasNext
      }
    }).response)
  } catch (error) {
    console.error('部屋一覧取得エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOMS_GET_ERROR',
      error instanceof Error ? error.message : '部屋一覧取得に失敗しました').response)
  }
})

/**
 * 部屋更新
 * PUT /api/v1/rooms/:id
 */
router.put('/api/v1/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    // リクエストデータ検証
    const validationResult = UpdateRoomRequestSchema.safeParse({
      ...req.body,
      updated_by: req.user?.user_id
    })

    if (!validationResult.success) {
      return res.status(400).json(StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response)
    }

    const room = await RoomService.updateRoom(id, tenantId, validationResult.data)

    return res.status(200).json(StandardResponseBuilder.success(res, room).response)
  } catch (error) {
    console.error('部屋更新エラー:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json(StandardResponseBuilder.error('ROOM_NOT_FOUND', '指定された部屋が見つかりません').response)
    }
    return res.status(500).json(StandardResponseBuilder.error('ROOM_UPDATE_ERROR',
      error instanceof Error ? error.message : '部屋更新に失敗しました').response)
  }
})

/**
 * 部屋ステータス更新
 * PATCH /api/v1/rooms/:id/status
 */
router.patch('/api/v1/rooms/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    // リクエストデータ検証
    const validationResult = UpdateRoomStatusRequestSchema.safeParse({
      ...req.body,
      updated_by: req.user?.user_id
    })

    if (!validationResult.success) {
      return res.status(400).json(StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response)
    }

    const room = await RoomService.updateRoomStatus(id, tenantId, validationResult.data)

    return res.status(200).json(StandardResponseBuilder.success(res, room).response)
  } catch (error) {
    console.error('部屋ステータス更新エラー:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json(StandardResponseBuilder.error('ROOM_NOT_FOUND', '指定された部屋が見つかりません').response)
    }
    return res.status(500).json(StandardResponseBuilder.error('ROOM_STATUS_UPDATE_ERROR',
      error instanceof Error ? error.message : '部屋ステータス更新に失敗しました').response)
  }
})

/**
 * 部屋削除（論理削除）
 * DELETE /api/v1/rooms/:id
 */
router.delete('/api/v1/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    const room = await RoomService.deleteRoom(id, tenantId, req.user?.user_id)

    return res.status(200).json(StandardResponseBuilder.success(res, room).response)
  } catch (error) {
    console.error('部屋削除エラー:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json(StandardResponseBuilder.error('ROOM_NOT_FOUND', '指定された部屋が見つかりません').response)
    }
    return res.status(500).json(StandardResponseBuilder.error('ROOM_DELETE_ERROR',
      error instanceof Error ? error.message : '部屋削除に失敗しました').response)
  }
})

/**
 * フロア別部屋取得
 * GET /api/v1/rooms/by-floor/:floorNumber
 */
router.get('/api/v1/rooms/by-floor/:floorNumber', async (req, res) => {
  try {
    const { floorNumber } = req.params
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    const floorNum = parseInt(floorNumber, 10)
    if (isNaN(floorNum) || floorNum < 1) {
      return res.status(400).json(StandardResponseBuilder.error('INVALID_FLOOR_NUMBER', '無効なフロア番号です').response)
    }

    const rooms = await RoomService.getRoomsByFloor(floorNum, tenantId)

    return StandardResponseBuilder.success(res, rooms)
  } catch (error) {
    console.error('フロア別部屋取得エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOMS_BY_FLOOR_ERROR',
      error instanceof Error ? error.message : 'フロア別部屋取得に失敗しました').response)
  }
})

/**
 * 空室検索
 * POST /api/v1/rooms/search-available
 */
router.post('/api/v1/rooms/search-available', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    // リクエストデータ検証
    const validationResult = RoomAvailabilitySearchSchema.safeParse({
      ...req.body,
      tenant_id: tenantId
    })

    if (!validationResult.success) {
      return res.status(400).json(StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー').response)
    }

    const rooms = await RoomService.searchAvailableRooms(validationResult.data)

    return StandardResponseBuilder.success(res, rooms)
  } catch (error) {
    console.error('空室検索エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_AVAILABILITY_SEARCH_ERROR',
      error instanceof Error ? error.message : '空室検索に失敗しました').response)
  }
})

/**
 * 部屋統計取得
 * GET /api/v1/rooms/stats
 */
router.get('/api/v1/rooms/stats', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id

    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です').response)
    }

    const stats = await RoomService.getRoomStats(tenantId)

    return StandardResponseBuilder.success(res, stats)
  } catch (error) {
    console.error('部屋統計取得エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_STATS_ERROR',
      error instanceof Error ? error.message : '部屋統計取得に失敗しました').response)
  }
})

export default router
