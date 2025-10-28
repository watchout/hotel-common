import crypto from 'crypto'

import { hotelDb } from '../database/prisma'
import { HotelLogger } from '../utils/logger'

import type { 
  RoomGrade, 
  CreateRoomGradeRequest, 
  UpdateRoomGradeRequest
} from '../schemas/room-grade'

/**
 * 客室ランク管理サービス
 * 複数システム共通の基幹データ管理
 */
export class RoomGradeService {
  private static logger = HotelLogger.getInstance()

  /**
   * 客室ランク作成
   */
  static async createRoomGrade(data: CreateRoomGradeRequest): Promise<RoomGrade> {
    try {
      this.logger.info('客室ランク作成開始', { 
        data: { 
          tenant_id: data.tenant_id, 
          name: data.name
        } 
      })

      // 名前の重複チェック（既存スキーマに合わせる）
      const existingGrade = await hotelDb.getAdapter().room_grades.findFirst({
        where: {
          tenant_id: data.tenant_id,
          name: data.name
        }
      })

      if (existingGrade) {
        throw new Error(`客室ランク名 "${data.name}" は既に存在します`)
      }

      // 既存スキーマに合わせてUUIDを生成
      const id = crypto.randomUUID()
      const code = `GRADE_${Date.now()}`
      
      const roomGrade = await hotelDb.getAdapter().room_grades.create({
        data: {
          id,
          tenant_id: data.tenant_id,
          code,
          name: data.name,
          description: data.description,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      this.logger.info('客室ランク作成完了', { 
        roomGradeId: roomGrade.id,
        name: roomGrade.name
      })

      return {
        ...roomGrade,
        created_at: roomGrade.created_at.toISOString(),
        updated_at: roomGrade.updated_at.toISOString()
      } as RoomGrade
    } catch (error: unknown) {
      this.logger.error('客室ランク作成エラー', error as Error)
      throw error
    }
  }

  /**
   * 客室ランク一覧取得
   */
  static async getRoomGrades(tenantId: string): Promise<RoomGrade[]> {
    try {
      this.logger.info('客室ランク一覧取得開始', { tenant_id: tenantId })

      const roomGrades = await hotelDb.getAdapter().room_grades.findMany({
        where: {
          tenant_id: tenantId
        },
        orderBy: [
          { created_at: 'asc' }
        ]
      })

      this.logger.info('客室ランク一覧取得完了', { 
        tenant_id: tenantId,
        count: roomGrades.length
      })

      return roomGrades.map(rg => ({
        ...rg,
        created_at: rg.created_at.toISOString(),
        updated_at: rg.updated_at.toISOString()
      })) as RoomGrade[]
    } catch (error: unknown) {
      this.logger.error('客室ランク一覧取得エラー', error as Error)
      throw error
    }
  }

  /**
   * 客室ランク詳細取得
   */
  static async getRoomGradeById(id: string, tenantId: string): Promise<RoomGrade | null> {
    try {
      this.logger.info('客室ランク詳細取得開始', { id, tenant_id: tenantId })

      const roomGrade = await hotelDb.getAdapter().room_grades.findFirst({
        where: {
          id,
          tenant_id: tenantId
        }
      })

      if (!roomGrade) {
        this.logger.warn('客室ランクが見つかりません', { id, tenant_id: tenantId })
        return null
      }

      this.logger.info('客室ランク詳細取得完了', { 
        id: roomGrade.id,
        name: roomGrade.name
      })

      return {
        ...roomGrade,
        created_at: roomGrade.created_at.toISOString(),
        updated_at: roomGrade.updated_at.toISOString()
      } as RoomGrade
    } catch (error: unknown) {
      this.logger.error('客室ランク詳細取得エラー', error as Error)
      throw error
    }
  }

  /**
   * 客室ランク更新
   */
  static async updateRoomGrade(id: string, tenantId: string, data: UpdateRoomGradeRequest): Promise<RoomGrade> {
    try {
      this.logger.info('客室ランク更新開始', { 
        id, 
        tenant_id: tenantId,
        data: { name: data.name }
      })

      // 存在確認
      const existingGrade = await hotelDb.getAdapter().room_grades.findFirst({
        where: {
          id,
          tenant_id: tenantId
        }
      })

      if (!existingGrade) {
        throw new Error(`客室ランクが見つかりません: ${id}`)
      }

      // 名前変更時の重複チェック
      if (data.name && data.name !== existingGrade.name) {
        const duplicateGrade = await hotelDb.getAdapter().room_grades.findFirst({
          where: {
            tenant_id: tenantId,
            name: data.name,
            id: { not: id }
          }
        })

        if (duplicateGrade) {
          throw new Error(`客室ランク名 "${data.name}" は既に存在します`)
        }
      }

      const updatedGrade = await hotelDb.getAdapter().room_grades.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          updated_at: new Date()
        }
      })

      this.logger.info('客室ランク更新完了', { 
        id: updatedGrade.id,
        name: updatedGrade.name
      })

      return {
        ...updatedGrade,
        created_at: updatedGrade.created_at.toISOString(),
        updated_at: updatedGrade.updated_at.toISOString()
      } as RoomGrade
    } catch (error: unknown) {
      this.logger.error('客室ランク更新エラー', error as Error)
      throw error
    }
  }

  /**
   * 客室ランク削除（物理削除）
   */
  static async deleteRoomGrade(id: string, tenantId: string, deletedBy?: string): Promise<void> {
    try {
      this.logger.info('客室ランク削除開始', { id, tenant_id: tenantId })

      // 存在確認
      const existingGrade = await hotelDb.getAdapter().room_grades.findFirst({
        where: {
          id,
          tenant_id: tenantId
        }
      })

      if (!existingGrade) {
        throw new Error(`客室ランクが見つかりません: ${id}`)
      }

      // 物理削除
      await hotelDb.getAdapter().room_grades.delete({
        where: { id }
      })

      this.logger.info('客室ランク削除完了', { 
        id,
        name: existingGrade.name
      })
    } catch (error: unknown) {
      this.logger.error('客室ランク削除エラー', error as Error)
      throw error
    }
  }
}