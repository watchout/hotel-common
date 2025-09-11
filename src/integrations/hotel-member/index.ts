// hotel-member階層権限管理統合 - エクスポート

export { HotelMemberHierarchyAdapterStub as HotelMemberHierarchyAdapter } from './hierarchy-adapter-stub'
export { default as hotelMemberApiRouter } from './api-endpoints'

// FastAPI (Python) 向けのREST API URL定義
export const HOTEL_MEMBER_HIERARCHY_ENDPOINTS = {
  // 認証関連
  VERIFY_TOKEN: '/api/hotel-member/hierarchy/auth/verify',
  
  // 権限チェック関連
  CHECK_CUSTOMER_ACCESS: '/api/hotel-member/hierarchy/permissions/check-customer-access',
  CHECK_MEMBERSHIP_RESTRICTIONS: '/api/hotel-member/hierarchy/permissions/check-membership-restrictions',
  CHECK_ANALYTICS_ACCESS: '/api/hotel-member/hierarchy/permissions/check-analytics-access',
  BATCH_CHECK: '/api/hotel-member/hierarchy/permissions/batch-check',
  
  // テナント・組織関連
  GET_ACCESSIBLE_TENANTS: '/api/hotel-member/hierarchy/tenants/accessible',
  GET_PERMISSIONS_DETAIL: '/api/hotel-member/hierarchy/user/permissions-detail',
  
  // ヘルスチェック
  HEALTH_CHECK: '/api/hotel-member/hierarchy/health'
} as const

/**
 * hotel-member階層権限管理統合初期化
 */
export async function initializeHotelMemberHierarchy(): Promise<void> {
  const { HotelLogger } = await import('../../utils/logger')
  const logger = HotelLogger.getInstance()
  
  try {
    logger.info('🎯 hotel-member階層権限管理統合初期化中...')
    
    // ヘルスチェック実行
    const { HotelMemberHierarchyAdapterStub } = await import('./hierarchy-adapter-stub')
    const health = await HotelMemberHierarchyAdapterStub.healthCheckForPython()
    
    if (health.status === 'healthy') {
      logger.info('✅ hotel-member階層権限管理統合初期化完了')
    } else {
      logger.warn('⚠️ hotel-member階層権限管理統合初期化完了（一部機能制限）', health)
    }
    
    logger.info(`
🎯 hotel-member階層権限管理統合稼働中

📊 対応機能:
- 階層JWT認証統合
- 顧客データ階層アクセス制御
- 会員ランク・ポイント階層管理
- グループ分析権限制御
- FastAPI連携エンドポイント

🔗 APIエンドポイント:
${Object.entries(HOTEL_MEMBER_HIERARCHY_ENDPOINTS)
  .map(([key, path]) => `- ${key}: ${path}`)
  .join('\n')}

🎯 実装戦略: 部分対応（顧客データ重点）
⚡ パフォーマンス: 既存機能への影響最小化
🔐 セキュリティ: 階層別データアクセス制御
    `)
    
  } catch (error) {
    logger.error('hotel-member階層権限管理統合初期化エラー:', error as Error)
    throw error
  }
}

/**
 * hotel-member用階層権限ヘルパー関数
 */
export class HotelMemberHierarchyUtils {
  /**
   * FastAPI向け簡易権限チェック
   */
  static async quickPermissionCheck(
    token: string,
    action: 'read_customer' | 'update_customer' | 'manage_tiers' | 'transfer_points' | 'view_analytics'
  ): Promise<boolean> {
    try {
      const { HotelMemberHierarchyAdapterStub } = await import('./hierarchy-adapter-stub')
      
      switch (action) {
        case 'read_customer':
          const readResult = await HotelMemberHierarchyAdapterStub.checkCustomerDataAccessForPython({
            token,
            target_tenant_id: 'default',
            operation: 'READ'
          })
          return readResult.allowed

        case 'update_customer':
          const updateResult = await HotelMemberHierarchyAdapterStub.checkCustomerDataAccessForPython({
            token,
            target_tenant_id: 'default',
            operation: 'UPDATE'
          })
          return updateResult.allowed

        case 'manage_tiers':
          const tierResult = await HotelMemberHierarchyAdapterStub.checkMembershipDataRestrictionsForPython({
            token,
            operation: 'update',
            data_type: 'membership_tier'
          })
          return tierResult.allowed

        case 'transfer_points':
          const transferResult = await HotelMemberHierarchyAdapterStub.checkMembershipDataRestrictionsForPython({
            token,
            operation: 'transfer',
            data_type: 'points_balance'
          })
          return transferResult.allowed

        case 'view_analytics':
          const analyticsResult = await HotelMemberHierarchyAdapterStub.checkGroupAnalyticsAccessForPython({
            token,
            analytics_type: 'membership_summary'
          })
          return analyticsResult.allowed

        default:
          return false
      }
    } catch {
      return false
    }
  }

  /**
   * ユーザーの階層レベル取得
   */
  static async getUserHierarchyLevel(token: string): Promise<number | null> {
    try {
      const { HotelMemberHierarchyAdapterStub } = await import('./hierarchy-adapter-stub')
      const verifyResult = await HotelMemberHierarchyAdapterStub.verifyHierarchicalTokenForPython({ token })
      if (verifyResult.success && verifyResult.user?.hierarchy_context) {
        return verifyResult.user.hierarchy_context.organization_level
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * グループ管理者かどうかチェック
   */
  static async isGroupManager(token: string): Promise<boolean> {
    try {
      const level = await this.getUserHierarchyLevel(token)
      return level !== null && level <= 2 // GROUP/BRAND
    } catch {
      return false
    }
  }

  /**
   * 店舗レベル以下かどうかチェック
   */
  static async isHotelLevelOrBelow(token: string): Promise<boolean> {
    try {
      const level = await this.getUserHierarchyLevel(token)
      return level === null || level >= 3 // HOTEL/DEPARTMENT or no hierarchy
    } catch {
      return true // エラー時は制限的に解釈
    }
  }
}

/**
 * Python FastAPI向けのミドルウェアヘルパー
 */
export const PYTHON_MIDDLEWARE_HELPERS = {
  /**
   * FastAPI Dependency用のJSONレスポンス形式
   */
  createAuthDependencyResponse: (user: any) => ({
    user_id: user.user_id,
    tenant_id: user.tenant_id,
    email: user.email,
    role: user.role,
    level: user.level,
    permissions: user.permissions,
    hierarchy_context: user.hierarchy_context,
    accessible_tenants: user.accessible_tenants
  }),

  /**
   * FastAPI HTTPException用のエラーレスポンス形式
   */
  createErrorResponse: (status_code: number, detail: string, error_type?: string) => ({
    status_code,
    detail,
    error_type: error_type || 'HIERARCHY_ERROR',
    timestamp: new Date().toISOString()
  }),

  /**
   * FastAPI 用の権限チェック結果形式
   */
  createPermissionResponse: (allowed: boolean, reason?: string, metadata?: any) => ({
    allowed,
    reason,
    metadata,
    timestamp: new Date().toISOString()
  })
}

/**
 * hotel-member設定推奨値
 */
export const HOTEL_MEMBER_HIERARCHY_CONFIG = {
  /**
   * 階層レベル別機能制限設定
   */
  FEATURE_RESTRICTIONS: {
    DEPARTMENT: [
      'membership_tier_update',
      'points_cross_brand_transfer',
      'credit_limit_management',
      'group_analytics_access'
    ],
    HOTEL: [
      'cross_brand_data_access',
      'group_wide_campaigns',
      'brand_tier_migration'
    ],
    BRAND: [
      'cross_group_data_sharing'
    ],
    GROUP: [] // 制限なし
  },

  /**
   * データマスキング設定
   */
  DATA_MASKING: {
    DEPARTMENT: {
      phone: 'partial',
      address: 'partial',
      credit_card: 'hidden',
      income_level: 'hidden'
    },
    HOTEL: {
      credit_card: 'masked',
      income_level: 'summary_only'
    },
    BRAND: {
      // マスキングなし
    },
    GROUP: {
      // マスキングなし
    }
  },

  /**
   * キャッシュ設定
   */
  CACHE_TTL: {
    jwt_verification: 300, // 5分
    permission_check: 180, // 3分
    accessible_tenants: 600, // 10分
    user_restrictions: 300 // 5分
  }
}