import { HierarchyApiManager } from './hierarchy-api'
import { HierarchyPermissionManager } from './permission-manager'
import { HierarchicalJwtManager } from './jwt-extension'
import { HotelLogger } from '../utils/logger'
import type {
  OrganizationHierarchy,
  DataSharingPolicy,
  HierarchicalJWTPayload,
  OrganizationType,
  DataType,
  SharingScope,
  AccessLevel,
  OrganizationTreeNode
} from './types'

/**
 * Hotel Group階層管理統合サービス
 * 
 * 機能統合・高レベルAPI提供
 */
export class HierarchyService {
  private static logger = HotelLogger.getInstance()

  /**
   * 組織階層の完全セットアップ
   */
  static async setupOrganizationHierarchy(setupData: {
    group: {
      name: string
      code: string
      settings?: Record<string, any>
    }
    brands?: Array<{
      name: string
      code: string
      settings?: Record<string, any>
    }>
    hotels?: Array<{
      name: string
      code: string
      brand_code?: string
      settings?: Record<string, any>
    }>
    departments?: Array<{
      name: string
      code: string
      hotel_code: string
      settings?: Record<string, any>
    }>
    preset_id?: string
  }, userId: string): Promise<{
    group: OrganizationHierarchy
    brands: OrganizationHierarchy[]
    hotels: OrganizationHierarchy[]
    departments: OrganizationHierarchy[]
  }> {
    try {
      this.logger.info(`組織階層完全セットアップ開始: ${setupData.group.name}`)

      // 1. グループ作成
      const group = await HierarchyApiManager.createOrganization({
        organization_type: 'GROUP',
        name: setupData.group.name,
        code: setupData.group.code,
        settings: setupData.group.settings
      }, userId)

      // 2. プリセット適用（指定時）
      if (setupData.preset_id) {
        await HierarchyApiManager.applyPreset(group.id, setupData.preset_id, userId)
      }

      // 3. ブランド作成
      const brands: OrganizationHierarchy[] = []
      if (setupData.brands) {
        for (const brandData of setupData.brands) {
          const brand = await HierarchyApiManager.createOrganization({
            organization_type: 'BRAND',
            name: brandData.name,
            code: brandData.code,
            parent_id: group.id,
            settings: brandData.settings
          }, userId)
          brands.push(brand)
        }
      }

      // 4. ホテル作成
      const hotels: OrganizationHierarchy[] = []
      if (setupData.hotels) {
        for (const hotelData of setupData.hotels) {
          // 親ブランド特定
          let parentId = group.id
          if (hotelData.brand_code) {
            const parentBrand = brands.find(b => b.code === hotelData.brand_code)
            if (parentBrand) {
              parentId = parentBrand.id
            }
          }

          const hotel = await HierarchyApiManager.createOrganization({
            organization_type: 'HOTEL',
            name: hotelData.name,
            code: hotelData.code,
            parent_id: parentId,
            settings: hotelData.settings
          }, userId)
          hotels.push(hotel)
        }
      }

      // 5. 部門作成
      const departments: OrganizationHierarchy[] = []
      if (setupData.departments) {
        for (const deptData of setupData.departments) {
          // 親ホテル特定
          const parentHotel = hotels.find(h => h.code === deptData.hotel_code)
          if (!parentHotel) {
            this.logger.warn(`親ホテルが見つかりません: ${deptData.hotel_code}`)
            continue
          }

          const department = await HierarchyApiManager.createOrganization({
            organization_type: 'DEPARTMENT',
            name: deptData.name,
            code: deptData.code,
            parent_id: parentHotel.id,
            settings: deptData.settings
          }, userId)
          departments.push(department)
        }
      }

      this.logger.info(`組織階層完全セットアップ完了: グループID=${group.id}, ブランド数=${brands.length}, ホテル数=${hotels.length}, 部門数=${departments.length}`)

      return { group, brands, hotels, departments }

    } catch (error) {
      this.logger.error('組織階層セットアップエラー:', error as Error)
      throw error
    }
  }

  /**
   * 階層権限付きユーザー登録
   */
  static async createHierarchicalUser(userData: {
    email: string
    username?: string
    password: string
    role: 'STAFF' | 'MANAGER' | 'ADMIN' | 'OWNER'
    level: number
    tenant_id: string
    organization_id: string
    permissions?: string[]
  }): Promise<{
    user: any
    tokens: {
      accessToken: string
      refreshToken: string
      expiresIn: number
    }
  }> {
    try {
      // 1. ユーザー作成（仮実装 - 実際のuser作成APIに置き換え）
      const user = {
        id: `user_${Date.now()}`,
        ...userData,
        password_hash: 'hashed_password', // 実際はハッシュ化
        created_at: new Date()
      }

      // 2. 階層JWT生成
      const tokens = await HierarchicalJwtManager.generateHierarchicalToken({
        user_id: user.id,
        tenant_id: userData.tenant_id,
        email: userData.email,
        role: userData.role,
        level: userData.level,
        permissions: userData.permissions || [],
        organization_id: userData.organization_id
      })

      this.logger.info(`階層権限付きユーザー作成完了: ユーザーID=${user.id}, 組織ID=${userData.organization_id}`)

      return { user, tokens }

    } catch (error) {
      this.logger.error('階層権限付きユーザー作成エラー:', error as Error)
      throw error
    }
  }

  /**
   * 組織階層ツリーの完全情報取得
   */
  static async getCompleteOrganizationTree(
    rootOrganizationId?: string,
    includeStats: boolean = true
  ): Promise<OrganizationTreeNode[]> {
    try {
      const organizations = await HierarchyPermissionManager.getOrganizationTree(rootOrganizationId)
      
      if (!includeStats) {
        return organizations as OrganizationTreeNode[]
      }

      // 統計情報付加
      const enrichedOrgs: OrganizationTreeNode[] = []
      
      for (const org of organizations) {
        const enriched: OrganizationTreeNode = {
          ...org,
          tenant_count: await this.getTenantCount(org.id),
          user_count: await this.getUserCount(org.id),
          has_data_policies: await this.hasDataPolicies(org.id)
        }
        enrichedOrgs.push(enriched)
      }

      return enrichedOrgs

    } catch (error) {
      this.logger.error('組織階層ツリー取得エラー:', error as Error)
      return []
    }
  }

  /**
   * ユーザーの実効権限情報取得
   */
  static async getUserEffectivePermissions(
    userToken: HierarchicalJWTPayload
  ): Promise<{
    organization: OrganizationHierarchy
    accessible_tenants: string[]
    data_permissions: {
      [dataType in DataType]: {
        scope: SharingScope
        level: AccessLevel
        can_read: boolean
        can_create: boolean
        can_update: boolean
        can_delete: boolean
      }
    }
    hierarchy_summary: {
      level: number
      type: OrganizationType
      path: string
      children_count: number
      parent_count: number
    }
  }> {
    try {
      const orgId = userToken.hierarchy_context.organization_id
      
      // 1. 組織情報取得
      const organizations = await HierarchyPermissionManager.getOrganizationTree(orgId, 1)
      const organization = organizations[0]

      if (!organization) {
        throw new Error('組織情報が見つかりません')
      }

      // 2. アクセス可能テナント取得
      const accessibleTenants = await HierarchyPermissionManager.getAccessibleTenants(orgId)

      // 3. データ権限詳細構築
      const dataPermissions: any = {}
      const dataTypes: DataType[] = ['CUSTOMER', 'RESERVATION', 'ANALYTICS', 'FINANCIAL', 'STAFF', 'INVENTORY']
      
      for (const dataType of dataTypes) {
        const policy = userToken.hierarchy_context.data_access_policies[dataType]
        
        if (policy) {
          dataPermissions[dataType] = {
            scope: policy.scope,
            level: policy.level,
            can_read: ['FULL', 'READ_ONLY', 'ANALYTICS_ONLY', 'SUMMARY_ONLY'].includes(policy.level),
            can_create: policy.level === 'FULL',
            can_update: policy.level === 'FULL',
            can_delete: policy.level === 'FULL'
          }
        } else {
          dataPermissions[dataType] = {
            scope: 'NONE' as SharingScope,
            level: 'READ' as AccessLevel,
            can_read: false,
            can_create: false,
            can_update: false,
            can_delete: false
          }
        }
      }

      // 4. 階層サマリー情報
      const hierarchySummary = {
        level: userToken.hierarchy_context.organization_level,
        type: userToken.hierarchy_context.organization_type,
        path: userToken.hierarchy_context.organization_path,
        children_count: await this.getChildrenCount(orgId),
        parent_count: organization.level - 1
      }

      return {
        organization,
        accessible_tenants: accessibleTenants,
        data_permissions: dataPermissions,
        hierarchy_summary: hierarchySummary
      }

    } catch (error) {
      this.logger.error('ユーザー実効権限取得エラー:', error as Error)
      throw error
    }
  }

  /**
   * 権限診断・推奨設定
   */
  static async diagnosePermissions(
    organizationId: string
  ): Promise<{
    current_settings: {
      organization: OrganizationHierarchy
      data_policies: DataSharingPolicy[]
      tenant_count: number
      user_count: number
    }
    recommendations: Array<{
      type: 'SECURITY' | 'PERFORMANCE' | 'COMPLIANCE' | 'EFFICIENCY'
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      title: string
      description: string
      suggested_action: string
    }>
    preset_suggestions: Array<{
      preset_id: string
      match_score: number
      benefits: string[]
      considerations: string[]
    }>
  }> {
    try {
      // 1. 現在設定取得
      const organizations = await HierarchyPermissionManager.getOrganizationTree(organizationId, 1)
      const organization = organizations[0]
      const dataPolicies = await HierarchyPermissionManager.getDataSharingPolicies(organizationId)
      const tenantCount = await this.getTenantCount(organizationId)
      const userCount = await this.getUserCount(organizationId)

      // 2. 推奨事項分析
      const recommendations = this.analyzePermissionRecommendations(
        organization,
        dataPolicies,
        tenantCount,
        userCount
      )

      // 3. プリセット適合度分析
      const presetSuggestions = await this.analyzePresetMatch(organization, dataPolicies)

      return {
        current_settings: {
          organization,
          data_policies: dataPolicies,
          tenant_count: tenantCount,
          user_count: userCount
        },
        recommendations,
        preset_suggestions: presetSuggestions
      }

    } catch (error) {
      this.logger.error('権限診断エラー:', error as Error)
      throw error
    }
  }

  /**
   * 権限推奨事項分析
   */
  private static analyzePermissionRecommendations(
    organization: OrganizationHierarchy,
    policies: DataSharingPolicy[],
    tenantCount: number,
    userCount: number
  ): Array<{
    type: 'SECURITY' | 'PERFORMANCE' | 'COMPLIANCE' | 'EFFICIENCY'
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    title: string
    description: string
    suggested_action: string
  }> {
    const recommendations = []

    // セキュリティ推奨事項
    const fullAccessPolicies = policies.filter(p => p.access_level === 'FULL')
    if (fullAccessPolicies.length > 4) {
      recommendations.push({
        type: 'SECURITY' as const,
        priority: 'HIGH' as const,
        title: '過度な完全アクセス権限',
        description: `${fullAccessPolicies.length}種類のデータで完全アクセス権限が設定されています`,
        suggested_action: '必要最小限の権限原則に基づき、READ_ONLYまたはANALYTICS_ONLYへの変更を検討してください'
      })
    }

    // パフォーマンス推奨事項
    if (tenantCount > 50) {
      recommendations.push({
        type: 'PERFORMANCE' as const,
        priority: 'MEDIUM' as const,
        title: '大規模テナント群でのキャッシュ最適化',
        description: `${tenantCount}のテナントが管理されています`,
        suggested_action: 'Redis階層キャッシュの有効期間延長とプリロード戦略の実装を推奨します'
      })
    }

    // 効率性推奨事項
    if (organization.organization_type === 'GROUP' && policies.length < 6) {
      recommendations.push({
        type: 'EFFICIENCY' as const,
        priority: 'LOW' as const,
        title: 'グループレベルでのデータポリシー未設定',
        description: '一部のデータタイプでポリシーが未設定です',
        suggested_action: 'プリセット適用によりバランスの取れたポリシー設定を行ってください'
      })
    }

    return recommendations
  }

  /**
   * プリセット適合度分析
   */
  private static async analyzePresetMatch(
    organization: OrganizationHierarchy,
    policies: DataSharingPolicy[]
  ): Promise<Array<{
    preset_id: string
    match_score: number
    benefits: string[]
    considerations: string[]
  }>> {
    const { HIERARCHY_PRESETS } = await import('./types')
    const suggestions = []

    for (const [presetId, preset] of Object.entries(HIERARCHY_PRESETS)) {
      let matchCount = 0
      const totalPolicies = Object.keys(preset.data_policies).length

      // 現在の設定との一致度計算
      for (const [dataType, presetPolicy] of Object.entries(preset.data_policies)) {
        const currentPolicy = policies.find(p => p.data_type === dataType)
        if (currentPolicy &&
            currentPolicy.sharing_scope === presetPolicy.sharing_scope &&
            currentPolicy.access_level === presetPolicy.access_level) {
          matchCount++
        }
      }

      const matchScore = Math.round((matchCount / totalPolicies) * 100)

      // 推奨条件（50%以上の一致度または組織タイプが合致）
      if (matchScore >= 50 || preset.organization_type === organization.organization_type) {
        suggestions.push({
          preset_id: presetId,
          match_score: matchScore,
          benefits: this.getPresetBenefits(preset),
          considerations: this.getPresetConsiderations(preset)
        })
      }
    }

    // マッチスコア順にソート
    return suggestions.sort((a, b) => b.match_score - a.match_score)
  }

  /**
   * プリセットのメリット取得
   */
  private static getPresetBenefits(preset: any): string[] {
    const benefits = []
    
    if (preset.features.cross_brand_loyalty) {
      benefits.push('ブランド横断でのポイント共有・優待サービス')
    }
    if (preset.features.unified_pricing) {
      benefits.push('統一価格戦略による運営効率化')
    }
    if (preset.features.brand_independent_pricing) {
      benefits.push('ブランド別価格戦略の柔軟性')
    }
    if (preset.features.independent_operation) {
      benefits.push('完全独立運営による意思決定の迅速化')
    }

    return benefits
  }

  /**
   * プリセットの考慮事項取得
   */
  private static getPresetConsiderations(preset: any): string[] {
    const considerations = []
    
    if (preset.organization_type === 'GROUP') {
      considerations.push('グループ全体の統制強化が必要')
      considerations.push('データガバナンス体制の整備')
    }
    if (preset.organization_type === 'BRAND') {
      considerations.push('ブランド間の調整コスト')
      considerations.push('統一システム運用の複雑性')
    }
    if (preset.organization_type === 'HOTEL') {
      considerations.push('店舗間連携の制限')
      considerations.push('統合分析データの活用制限')
    }

    return considerations
  }

  // ヘルパーメソッド
  private static async getTenantCount(organizationId: string): Promise<number> {
    try {
      const tenants = await HierarchyPermissionManager.getAccessibleTenants(organizationId)
      return tenants.length
    } catch {
      return 0
    }
  }

  private static async getUserCount(organizationId: string): Promise<number> {
    // 実装予定：組織に所属するユーザー数を取得
    return 0
  }

  private static async hasDataPolicies(organizationId: string): Promise<boolean> {
    try {
      const policies = await HierarchyPermissionManager.getDataSharingPolicies(organizationId)
      return policies.length > 0
    } catch {
      return false
    }
  }

  private static async getChildrenCount(organizationId: string): Promise<number> {
    // 実装予定：子組織数を取得
    return 0
  }
} 