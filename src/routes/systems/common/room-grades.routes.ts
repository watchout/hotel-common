import express from 'express'
import { RoomGradeService } from '../../../services/room-grade.service'
import { verifyTenantAuth } from '../../../auth/middleware'
import { 
  CreateRoomGradeRequestSchema,
  UpdateRoomGradeRequestSchema
} from '../../../schemas/room-grade'
import { StandardResponseBuilder } from '../../../utils/response-builder'

const router = express.Router()

/**
 * 客室ランク管理APIルーター
 * 複数システム共通の基幹データ管理
 */

// 認証ミドルウェアを適用
router.use(verifyTenantAuth)

/**
 * 客室ランク作成
 * POST /api/v1/room-grades
 */
router.post('/api/v1/room-grades', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'))
    }

    // リクエストデータ検証
    const validationResult = CreateRoomGradeRequestSchema.safeParse({
      ...req.body,
      tenant_id: tenantId
    })

    if (!validationResult.success) {
      return res.status(400).json(StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー', validationResult.error.issues))
    }

    const roomGrade = await RoomGradeService.createRoomGrade(validationResult.data)

    return StandardResponseBuilder.success(res.status(201), roomGrade)
  } catch (error) {
    console.error('客室ランク作成エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_GRADE_CREATE_ERROR', 
      error instanceof Error ? error.message : '客室ランク作成に失敗しました'))
  }
})

/**
 * 客室ランク一覧取得
 * GET /api/v1/room-grades
 */
router.get('/api/v1/room-grades', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'))
    }

    const roomGrades = await RoomGradeService.getRoomGrades(tenantId)

    return StandardResponseBuilder.success(res, roomGrades)
  } catch (error) {
    console.error('客室ランク一覧取得エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_GRADE_LIST_ERROR', 
      error instanceof Error ? error.message : '客室ランク一覧取得に失敗しました'))
  }
})

/**
 * 客室ランク詳細取得
 * GET /api/v1/room-grades/:id
 */
router.get('/api/v1/room-grades/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'))
    }

    const { id } = req.params
    if (!id) {
      return res.status(400).json(StandardResponseBuilder.error('ROOM_GRADE_ID_REQUIRED', '客室ランクIDが必要です'))
    }

    const roomGrade = await RoomGradeService.getRoomGradeById(id, tenantId)

    if (!roomGrade) {
      return res.status(404).json(StandardResponseBuilder.error('ROOM_GRADE_NOT_FOUND', '客室ランクが見つかりません'))
    }

    return StandardResponseBuilder.success(res, roomGrade)
  } catch (error) {
    console.error('客室ランク詳細取得エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_GRADE_GET_ERROR', 
      error instanceof Error ? error.message : '客室ランク詳細取得に失敗しました'))
  }
})

/**
 * 客室ランク更新
 * PUT /api/v1/room-grades/:id
 */
router.put('/api/v1/room-grades/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'))
    }

    const { id } = req.params
    if (!id) {
      return res.status(400).json(StandardResponseBuilder.error('ROOM_GRADE_ID_REQUIRED', '客室ランクIDが必要です'))
    }

    // リクエストデータ検証
    const validationResult = UpdateRoomGradeRequestSchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).json(StandardResponseBuilder.error('VALIDATION_ERROR', 'バリデーションエラー', validationResult.error.issues))
    }

    const updatedRoomGrade = await RoomGradeService.updateRoomGrade(id, tenantId, validationResult.data)

    return StandardResponseBuilder.success(res, updatedRoomGrade)
  } catch (error) {
    console.error('客室ランク更新エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_GRADE_UPDATE_ERROR', 
      error instanceof Error ? error.message : '客室ランク更新に失敗しました'))
  }
})

/**
 * 客室ランク削除
 * DELETE /api/v1/room-grades/:id
 */
router.delete('/api/v1/room-grades/:id', async (req, res) => {
  try {
    const tenantId = req.user?.tenant_id
    if (!tenantId) {
      return res.status(400).json(StandardResponseBuilder.error('TENANT_ID_REQUIRED', 'テナントIDが必要です'))
    }

    const { id } = req.params
    if (!id) {
      return res.status(400).json(StandardResponseBuilder.error('ROOM_GRADE_ID_REQUIRED', '客室ランクIDが必要です'))
    }

    const deletedBy = req.user?.user_id || req.user?.email || 'system'
    await RoomGradeService.deleteRoomGrade(id, tenantId, deletedBy)

    return StandardResponseBuilder.success(res, { message: '客室ランクを削除しました' })
  } catch (error) {
    console.error('客室ランク削除エラー:', error)
    return res.status(500).json(StandardResponseBuilder.error('ROOM_GRADE_DELETE_ERROR', 
      error instanceof Error ? error.message : '客室ランク削除に失敗しました'))
  }
})

export default router
