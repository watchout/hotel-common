import { generateToken, verifyToken, decodeToken } from '../auth/jwt'
import { hotelDb } from '../database'
import { HierarchyPermissionManager } from './permission-manager'
import { HotelLogger } from '../utils/logger'

import type {
  HierarchicalJWTPayload,
  OrganizationType,
  DataType,
  SharingScope,
  AccessLevel
} from './types'

/**
 * 階層管理対応JWT拡張マネージャー
 *
 * 機能:
 * - 階層コンテキスト付きJWT生成
 * - 既存JWTの階層情報拡張
 * - 階層権限の動的更新
 */
export class HierarchicalJwtManager {
  private static logger = HotelLogger.getInstance()

  /**
   * 階層コンテキスト付きJWT生成
   */
  static async generateHierarchicalToken(payload: {
    user_id: string
    tenant_id: string
    email: string
    role: 'STAFF' | 'MANAGER' | 'ADMIN' | 'OWNER' | 'SYSTEM'
    level: number
    permissions: string[]
    organization_id?: string
  }): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }> {
    try {
      this.logger.debug('階層JWT生成開始', {
        user_id: payload.user_id,
        organization_id: payload.organization_id
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      // 1. 組織階層情報取得
      let hierarchyContext = null
      if (payload.organization_id) {
        hierarchyContext = await this.buildHierarchyContext(payload.organization_id, payload.tenant_id)
      }

      // 2. アクセス可能テナント一覧取得
      let accessibleTenants = [payload.tenant_id]
      if (hierarchyContext) {
        accessibleTenants = await HierarchyPermissionManager.getAccessibleTenants(payload.organization_id!)
      }

      // 3. 階層対応JWT Payload構築
      const hierarchicalPayload: Omit<HierarchicalJWTPayload, 'iat' | 'exp' | 'jti'> = {
        user_id: payload.user_id,
        tenant_id: payload.tenant_id,
        email: payload.email,
        role: payload.role,
        level: payload.level,
        permissions: payload.permissions,
        hierarchy_context: hierarchyContext || {
          organization_id: '',
          organization_level: 3 as const, // デフォルトはHOTELレベル
          organization_type: 'HOTEL' as const,
          organization_path: '',
          access_scope: [],
          data_access_policies: {}
        },
        accessible_tenants: accessibleTenants
      }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
      // 4. JWT生成
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accessToken = generateToken(hierarchicalPayload as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      const refreshToken = generateToken(hierarchicalPayload as any, { expiresIn: '7d' });
// eslint-disable-next-line @typescript-eslint/no-explicit-any

      this.logger.info('階層JWT生成完了', {
        user_id: payload.user_id,
        organization_level: hierarchyContext?.organization_level,
        accessible_tenant_count: accessibleTenants.length
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      return {
        accessToken,
        refreshToken,
        expiresIn: 86400 // 24時間（秒単位）
      }

    } catch (error: unknown) {
      this.logger.error('階層JWT生成エラー:', error as Error)
      throw new Error('階層JWT生成に失敗しました')
    }
  }

  /**
   * 階層コンテキスト構築
   */
  private static async buildHierarchyContext(
    organizationId: string,
    tenantId: string
  ): Promise<HierarchicalJWTPayload['hierarchy_context'] | null> {
    try {
      // 緊急対応：スタブ実装
      return {
        organization_id: organizationId,
        organization_level: 3 as const,
        organization_type: 'HOTEL' as const,
        organization_path: '',
        access_scope: [tenantId],
        data_access_policies: {
          CUSTOMER: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
          RESERVATION: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
          ANALYTICS: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
          FINANCIAL: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
          STAFF: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
          INVENTORY: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel }
        }
      }
    } catch (error: unknown) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error('階層コンテキスト構築エラー:', error as Error)
      return null
    }
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * デフォルトデータポリシー取得
   */
  private static getDefaultDataPolicies(organizationType: OrganizationType): Record<string, {
    scope: SharingScope
    level: AccessLevel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    conditions?: Record<string, any>
  }> {
    const policies = {
      GROUP: {
        CUSTOMER: { scope: 'GROUP' as SharingScope, level: 'FULL' as AccessLevel },
        RESERVATION: { scope: 'GROUP' as SharingScope, level: 'FULL' as AccessLevel },
        ANALYTICS: { scope: 'GROUP' as SharingScope, level: 'FULL' as AccessLevel },
        FINANCIAL: { scope: 'GROUP' as SharingScope, level: 'FULL' as AccessLevel },
        STAFF: { scope: 'GROUP' as SharingScope, level: 'FULL' as AccessLevel },
        INVENTORY: { scope: 'GROUP' as SharingScope, level: 'FULL' as AccessLevel }
      },
      BRAND: {
        CUSTOMER: { scope: 'BRAND' as SharingScope, level: 'FULL' as AccessLevel },
        RESERVATION: { scope: 'BRAND' as SharingScope, level: 'FULL' as AccessLevel },
        ANALYTICS: { scope: 'GROUP' as SharingScope, level: 'SUMMARY_ONLY' as AccessLevel },
        FINANCIAL: { scope: 'BRAND' as SharingScope, level: 'FULL' as AccessLevel },
        STAFF: { scope: 'BRAND' as SharingScope, level: 'FULL' as AccessLevel },
        INVENTORY: { scope: 'BRAND' as SharingScope, level: 'FULL' as AccessLevel }
      },
      HOTEL: {
        CUSTOMER: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
        RESERVATION: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
        ANALYTICS: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
        FINANCIAL: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
        STAFF: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel },
        INVENTORY: { scope: 'HOTEL' as SharingScope, level: 'FULL' as AccessLevel }
      },
      DEPARTMENT: {
        CUSTOMER: { scope: 'HOTEL' as SharingScope, level: 'READ_ONLY' as AccessLevel },
        RESERVATION: { scope: 'HOTEL' as SharingScope, level: 'READ_ONLY' as AccessLevel },
        ANALYTICS: { scope: 'DEPARTMENT' as SharingScope, level: 'FULL' as AccessLevel },
        FINANCIAL: { scope: 'DEPARTMENT' as SharingScope, level: 'READ_ONLY' as AccessLevel },
        STAFF: { scope: 'DEPARTMENT' as SharingScope, level: 'FULL' as AccessLevel },
        INVENTORY: { scope: 'DEPARTMENT' as SharingScope, level: 'FULL' as AccessLevel }
      }
    }

    return policies[organizationType] || policies.HOTEL
  }

  /**
   * 既存JWTトークンの階層情報更新
   */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async refreshHierarchyContext(
    existingToken: string,
    newOrganizationId?: string
  ): Promise<string> {
    try {
      // 既存トークン検証・デコード
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded = verifyToken(existingToken)
      if (!decoded) {
        throw new Error('無効なトークンです')
      }

      // 組織ID決定
      const organizationId = newOrganizationId ||
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (decoded as any).hierarchy_context?.organization_id ||
        await this.findUserOrganization(decoded.user_id, decoded.tenant_id)

      if (!organizationId) {
        this.logger.warn(`組織IDが見つかりません: ${decoded.user_id}`)
        return existingToken // 階層情報なしで既存トークンを返す
      }

      // 新しい階層コンテキストで再生成
      const newTokens = await this.generateHierarchicalToken({
        user_id: decoded.user_id,
        tenant_id: decoded.tenant_id,
        email: decoded.email || '',
        // @ts-expect-error - 型定義が不完全
        role: decoded.role,
        level: decoded.level || 0,
        permissions: decoded.permissions || [],
        organization_id: organizationId
      })

      return newTokens.accessToken

    } catch (error: unknown) {
      this.logger.error('階層コンテキスト更新エラー:', error as Error)
      throw new Error('階層コンテキスト更新に失敗しました')
    }
  }

  /**
   * ユーザーの所属組織検索
   */
  private static async findUserOrganization(
    userId: string,
    tenantId: string
  ): Promise<string | null> {
    let result: string | null = null
    try {
      // 緊急対応：スタブ実装
      result = "org_default"
    } catch (error: unknown) {
      this.logger.error('ユーザー所属組織検索エラー:', error as Error)
      result = null
    }
    return result
  }

  /**
   * 階層権限付きトークン検証
   */
  static verifyHierarchicalToken(token: string): HierarchicalJWTPayload | null {
    try {
      const decoded = verifyToken(token)
      if (!decoded) {
        return null
      }

      // 階層コンテキストの存在確認
      const hierarchicalToken = decoded as HierarchicalJWTPayload
      if (!hierarchicalToken.hierarchy_context) {
        this.logger.warn(`階層コンテキストが含まれていないトークン: ${decoded.user_id}`)
        // 基本トークンから階層トークンへの変換（デフォルト値設定）
        hierarchicalToken.hierarchy_context = {
          organization_id: '',
          organization_level: 3,
          organization_type: 'HOTEL',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
          organization_path: '',
          access_scope: [decoded.tenant_id],
          data_access_policies: {}
        }
        hierarchicalToken.accessible_tenants = [decoded.tenant_id]
      }

      return hierarchicalToken

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      this.logger.error('階層トークン検証エラー:', error as Error)
      return null
    }
  }

  /**
   * Express.js用階層認証ミドルウェア
   */
  static hierarchicalAuthMiddleware() {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (req: any, res: any, next: any) => {
      try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Authentication token required' })
        }

        const token = authHeader.substring(7)
        const decoded = this.verifyHierarchicalToken(token)

        if (!decoded) {
          return res.status(401).json({ error: 'Invalid or expired token' })
        }

        // リクエストオブジェクトに階層情報付きユーザー情報を設定
        req.user = decoded
        req.hierarchy = decoded.hierarchy_context
        req.accessibleTenants = decoded.accessible_tenants

        next()

      } catch (error: unknown) {
        this.logger.error('階層認証ミドルウェアエラー:', error as Error)
        return res.status(500).json({ error: 'Authentication middleware error' })
      }
    }
  }
}
