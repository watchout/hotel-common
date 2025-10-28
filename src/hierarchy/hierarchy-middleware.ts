
import { HierarchicalJwtManager } from './jwt-extension'
import { HierarchyPermissionManager } from './permission-manager'
import { HotelLogger } from '../utils/logger'

import type {
  HierarchicalJWTPayload,
  DataType,
  OrganizationType,
  HierarchyLevel
} from './types'
import type { Request, Response, NextFunction } from 'express'

// Express Request型拡張
declare global {
// eslint-disable-next-line @typescript-eslint/no-namespace
// eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: HierarchicalJWTPayload
      hierarchy?: HierarchicalJWTPayload['hierarchy_context']
      accessibleTenants?: string[]
    }
  }
}

/**
 * Hotel Group階層権限チェックミドルウェア
 */
export class HierarchyMiddleware {
  private static logger = HotelLogger.getInstance()

  /**
   * 階層JWT認証ミドルウェア
   */
  static authenticate() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            error: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication token required'
          })
        }

        const token = authHeader.substring(7)
        const decoded = HierarchicalJwtManager.verifyHierarchicalToken(token)
        
        if (!decoded) {
          return res.status(401).json({
            error: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          })
        }

        // リクエストオブジェクトに階層情報付きユーザー情報を設定
        req.user = decoded
        req.hierarchy = decoded.hierarchy_context
        req.accessibleTenants = decoded.accessible_tenants

        next()

      } catch (error: unknown) {
        this.logger.error('階層認証ミドルウェアエラー:', error as Error)
        return res.status(500).json({
          error: 'AUTHENTICATION_ERROR',
          message: 'Authentication middleware error'
        })
      }
    }
  }

  /**
   * データアクセス権限チェック
   */
  static requireDataAccess(
    dataType: DataType,
    operation: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' = 'READ'
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User authentication required'
          })
        }

        // テナントIDを取得（パラメータ、ボディ、クエリから）
        const targetTenantId = req.params.tenantId || 
                              req.body?.tenant_id || 
                              req.query.tenant_id as string ||
                              req.user.tenant_id

        if (!targetTenantId) {
          return res.status(400).json({
            error: 'TENANT_ID_REQUIRED',
            message: 'Target tenant ID required'
          })
        }

        // 権限チェック実行
        const accessResult = await HierarchyPermissionManager.checkHierarchyAccess({
          user_token: req.user,
          target_resource: {
            tenant_id: targetTenantId,
            data_type: dataType
          },
          operation,
          additional_context: {
            client_ip: req.ip,
            user_agent: req.get('User-Agent'),
            request_path: req.path,
            request_method: req.method
          }
        })

        if (!accessResult.allowed) {
          return res.status(403).json({
            error: 'ACCESS_DENIED',
            message: accessResult.reason,
            details: {
              data_type: dataType,
              operation,
              target_tenant: targetTenantId,
              user_organization: req.hierarchy?.organization_id,
              effective_scope: accessResult.effective_scope,
              effective_level: accessResult.effective_level
            }
          })
        }

        // アクセス許可情報をリクエストに付加
        req.accessPermission = {
          data_type: dataType,
          operation,
          effective_scope: accessResult.effective_scope,
          effective_level: accessResult.effective_level,
          restrictions: accessResult.restrictions
        }

        next()

      } catch (error: unknown) {
        this.logger.error('データアクセス権限チェックエラー:', error as Error)
        return res.status(500).json({
          error: 'PERMISSION_CHECK_ERROR',
          message: 'Permission check failed'
        })
      }
    }
  }

  /**
   * 組織レベル制限
   */
  static requireOrganizationLevel(
    minLevel: HierarchyLevel,
    maxLevel?: HierarchyLevel
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.hierarchy) {
          return res.status(401).json({
            error: 'HIERARCHY_CONTEXT_REQUIRED',
            message: 'Hierarchy context required'
          })
        }

        const userLevel = req.hierarchy.organization_level

        if (userLevel < minLevel) {
          return res.status(403).json({
            error: 'INSUFFICIENT_ORGANIZATION_LEVEL',
            message: `Minimum organization level ${minLevel} required`,
            details: {
              user_level: userLevel,
              required_min_level: minLevel
            }
          })
        }

        if (maxLevel && userLevel > maxLevel) {
          return res.status(403).json({
            error: 'EXCEEDED_ORGANIZATION_LEVEL',
            message: `Maximum organization level ${maxLevel} exceeded`,
            details: {
              user_level: userLevel,
              required_max_level: maxLevel
            }
          })
        }

        next()

      } catch (error: unknown) {
        this.logger.error('組織レベル制限チェックエラー:', error as Error)
        return res.status(500).json({
          error: 'ORGANIZATION_LEVEL_CHECK_ERROR',
          message: 'Organization level check failed'
        })
      }
    }
  }

  /**
   * 組織タイプ制限
   */
  static requireOrganizationType(...allowedTypes: OrganizationType[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.hierarchy) {
          return res.status(401).json({
            error: 'HIERARCHY_CONTEXT_REQUIRED',
            message: 'Hierarchy context required'
          })
        }

        const userOrgType = req.hierarchy.organization_type

        if (!allowedTypes.includes(userOrgType)) {
          return res.status(403).json({
            error: 'INVALID_ORGANIZATION_TYPE',
            message: `Organization type not allowed`,
            details: {
              user_organization_type: userOrgType,
              allowed_types: allowedTypes
            }
          })
        }

        next()

      } catch (error: unknown) {
        this.logger.error('組織タイプ制限チェックエラー:', error as Error)
        return res.status(500).json({
          error: 'ORGANIZATION_TYPE_CHECK_ERROR',
          message: 'Organization type check failed'
        })
      }
    }
  }

  /**
   * テナントアクセス権限チェック
   */
  static requireTenantAccess() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User authentication required'
          })
        }

        const targetTenantId = req.params.tenantId || 
                              req.body?.tenant_id || 
                              req.query.tenant_id as string

        if (!targetTenantId) {
          return res.status(400).json({
            error: 'TENANT_ID_REQUIRED',
            message: 'Target tenant ID required'
          })
        }

        // アクセス可能テナント一覧に含まれているかチェック
        const accessibleTenants = req.accessibleTenants || [req.user.tenant_id]
        
        if (!accessibleTenants.includes(targetTenantId)) {
          return res.status(403).json({
            error: 'TENANT_ACCESS_DENIED',
            message: 'Access to target tenant not allowed',
            details: {
              target_tenant: targetTenantId,
              accessible_tenants: accessibleTenants.length,
              user_organization: req.hierarchy?.organization_id
            }
          })
        }

        next()

      } catch (error: unknown) {
        this.logger.error('テナントアクセス権限チェックエラー:', error as Error)
        return res.status(500).json({
          error: 'TENANT_ACCESS_CHECK_ERROR',
          message: 'Tenant access check failed'
        })
      }
    }
  }

  /**
   * 管理者権限チェック
   */
  static requireAdminRole() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User authentication required'
          })
        }

        const allowedRoles = ['ADMIN', 'OWNER', 'SYSTEM']
        
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            error: 'ADMIN_ROLE_REQUIRED',
            message: 'Administrator role required',
            details: {
              user_role: req.user.role,
              required_roles: allowedRoles
            }
          })
        }

        next()

      } catch (error: unknown) {
        this.logger.error('管理者権限チェックエラー:', error as Error)
        return res.status(500).json({
          error: 'ADMIN_ROLE_CHECK_ERROR',
          message: 'Administrator role check failed'
        })
      }
    }
  }

  /**
   * 複合権限チェック（複数条件を組み合わせ）
   */
  static requireCombinedPermissions(options: {
    dataAccess?: {
      dataType: DataType
      operation?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'
    }
    organizationLevel?: {
      min?: HierarchyLevel
      max?: HierarchyLevel
    }
    organizationType?: OrganizationType[]
    adminRole?: boolean
    tenantAccess?: boolean
  }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 認証確認
        if (!req.user) {
          return res.status(401).json({
            error: 'AUTHENTICATION_REQUIRED',
            message: 'User authentication required'
          })
        }

        // データアクセス権限チェック
        if (options.dataAccess) {
          const targetTenantId = req.params.tenantId || 
                                req.body?.tenant_id || 
                                req.query.tenant_id as string ||
                                req.user.tenant_id

          const accessResult = await HierarchyPermissionManager.checkHierarchyAccess({
            user_token: req.user,
            target_resource: {
              tenant_id: targetTenantId,
              data_type: options.dataAccess.dataType
            },
            operation: options.dataAccess.operation || 'READ'
          })

          if (!accessResult.allowed) {
            return res.status(403).json({
              error: 'DATA_ACCESS_DENIED',
              message: accessResult.reason
            })
          }
        }

        // 組織レベルチェック
        if (options.organizationLevel && req.hierarchy) {
          const userLevel = req.hierarchy.organization_level
          
          if (options.organizationLevel.min && userLevel < options.organizationLevel.min) {
            return res.status(403).json({
              error: 'INSUFFICIENT_ORGANIZATION_LEVEL',
              message: `Minimum level ${options.organizationLevel.min} required`
            })
          }
          
          if (options.organizationLevel.max && userLevel > options.organizationLevel.max) {
            return res.status(403).json({
              error: 'EXCEEDED_ORGANIZATION_LEVEL',
              message: `Maximum level ${options.organizationLevel.max} exceeded`
            })
          }
        }

        // 組織タイプチェック
        if (options.organizationType && req.hierarchy) {
          if (!options.organizationType.includes(req.hierarchy.organization_type)) {
            return res.status(403).json({
              error: 'INVALID_ORGANIZATION_TYPE',
              message: 'Organization type not allowed'
            })
          }
        }

        // 管理者権限チェック
        if (options.adminRole) {
          const allowedRoles = ['ADMIN', 'OWNER', 'SYSTEM']
          if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
              error: 'ADMIN_ROLE_REQUIRED',
              message: 'Administrator role required'
            })
          }
        }

        next()

      } catch (error: unknown) {
        this.logger.error('複合権限チェックエラー:', error as Error)
        return res.status(500).json({
          error: 'COMBINED_PERMISSION_CHECK_ERROR',
          message: 'Combined permission check failed'
        })
      }
    }
  }
}

// Express Request型拡張
declare module 'express-serve-static-core' {
  interface Request {
    accessPermission?: {
      data_type: DataType
      operation: string
      effective_scope?: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      effective_level?: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      restrictions?: Record<string, any>
    }
  }
} 