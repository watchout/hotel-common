import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { hotelDb } from '../database'
import { HotelLogger } from '../utils/logger'
import type { Admin, AdminLevel } from '../generated/prisma'

// Express Request型拡張
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string
        email: string
        username: string
        displayName: string
        adminLevel: 'chainadmin' | 'groupadmin' | 'superadmin'
        accessibleGroupIds: string[]
        accessibleChainIds: string[]
        accessibleTenantIds: string[]
        isActive: boolean
      }
    }
  }
}

const router = express.Router()
const logger = HotelLogger.getInstance()

// JWT設定
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key'
const JWT_EXPIRES_IN = '8h'

// 認証ミドルウェア
const authenticateAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'ADMIN_TOKEN_REQUIRED' })
    }
    
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const admin = await hotelDb.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        adminLevel: true,
        accessibleGroupIds: true,
        accessibleChainIds: true,
        accessibleTenantIds: true,
        isActive: true
      }
    })
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'ADMIN_INVALID_TOKEN' })
    }
    
    req.admin = admin
    next()
  } catch (error) {
    res.status(401).json({ error: 'ADMIN_TOKEN_INVALID' })
  }
}

// 権限レベルチェック
const requireAdminLevel = (requiredLevel: 'chainadmin' | 'groupadmin' | 'superadmin') => {
  const levelHierarchy = {
    chainadmin: 1,
    groupadmin: 2,
    superadmin: 3
  }
  
  return (req: any, res: any, next: any) => {
    const userLevel = levelHierarchy[req.admin.adminLevel as keyof typeof levelHierarchy]
    const reqLevel = levelHierarchy[requiredLevel]
    
    if (userLevel >= reqLevel) {
      next()
    } else {
      res.status(403).json({ 
        error: 'ADMIN_INSUFFICIENT_PERMISSION',
        required: requiredLevel,
        current: req.admin.adminLevel
      })
    }
  }
}

// ログ記録ヘルパー
const logAdminAction = async (
  adminId: string,
  action: string,
  success: boolean = true,
  targetType?: string,
  targetId?: string,
  req?: any,
  errorMessage?: string
) => {
  try {
    await hotelDb.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        success,
        errorMessage
      }
    })
  } catch (error) {
    logger.error('管理者ログ記録エラー:', error as Error)
  }
}

// ===== 認証API =====

// ログイン
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'EMAIL_PASSWORD_REQUIRED' 
      })
    }
    
    const admin = await hotelDb.admin.findUnique({
      where: { email }
    })
    
    if (!admin || !admin.isActive) {
      await logAdminAction('unknown', 'LOGIN', false, undefined, undefined, req, 'Admin not found')
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' })
    }
    
    // アカウントロック確認
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      await logAdminAction(admin.id, 'LOGIN', false, undefined, undefined, req, 'Account locked')
      return res.status(423).json({ 
        error: 'ACCOUNT_LOCKED',
        lockedUntil: admin.lockedUntil
      })
    }
    
    const passwordValid = await bcrypt.compare(password, admin.passwordHash)
    
    if (!passwordValid) {
      // ログイン試行回数を増やす
      const newAttempts = admin.loginAttempts + 1
      const updateData: any = { loginAttempts: newAttempts }
      
      // 5回失敗で30分ロック
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000)
      }
      
      await hotelDb.admin.update({
        where: { id: admin.id },
        data: updateData
      })
      
      await logAdminAction(admin.id, 'LOGIN', false, undefined, undefined, req, 'Invalid password')
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' })
    }
    
    // ログイン成功 - 試行回数リセット
    await hotelDb.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0,
        lockedUntil: null
      }
    })
    
    const token = jwt.sign(
      { adminId: admin.id, adminLevel: admin.adminLevel },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    
    await logAdminAction(admin.id, 'LOGIN', true, undefined, undefined, req)
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        displayName: admin.displayName,
        adminLevel: admin.adminLevel
      }
    })
    
  } catch (error) {
    logger.error('管理者ログインエラー:', error as Error)
    res.status(500).json({ error: 'LOGIN_ERROR' })
  }
})

// ===== データ取得API =====

// テナント一覧（chainadmin以上）
router.get('/tenants', authenticateAdmin, requireAdminLevel('chainadmin'), async (req, res) => {
  try {
    const admin = req.admin!
    
    // アクセス可能テナントフィルタ
    let whereClause: any = {}
    if (admin.adminLevel === 'chainadmin' && admin.accessibleTenantIds.length > 0) {
      whereClause.id = { in: admin.accessibleTenantIds }
    }
    
    const tenants = await hotelDb.tenant.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        domain: true,
        planType: true,
        status: true,
        contactName: true,
        contactEmail: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })
    
          await logAdminAction(req.admin!.id, 'VIEW_TENANTS', true, 'tenant', undefined, req)
      
      res.json({
        success: true,
        tenants,
        count: tenants.length
      })
    
  } catch (error) {
    logger.error('テナント一覧取得エラー:', error as Error)
    res.status(500).json({ error: 'TENANTS_FETCH_ERROR' })
  }
})

// チェーン一覧（groupadmin以上）
router.get('/chains', authenticateAdmin, requireAdminLevel('groupadmin'), async (req, res) => {
  try {
    const admin = req.admin!
    
    // TODO: チェーン概念の実装
    // 現在はテナントをグループ化した概念として返す
    const chains = [
      {
        id: 'chain-1',
        name: 'Sample Hotel Chain',
        tenantsCount: await hotelDb.tenant.count(),
        status: 'active'
      }
    ]
    
    await logAdminAction(admin.id, 'VIEW_CHAINS', true, 'chain', undefined, req)
    
    res.json({
      success: true,
      chains,
      count: chains.length
    })
    
  } catch (error) {
    logger.error('チェーン一覧取得エラー:', error as Error)
    res.status(500).json({ error: 'CHAINS_FETCH_ERROR' })
  }
})

// グループ一覧（superadmin専用）
router.get('/groups', authenticateAdmin, requireAdminLevel('superadmin'), async (req, res) => {
  try {
    const admin = req.admin!
    
    // TODO: グループ概念の実装
    // 現在は全体統計として返す
    const groups = [
      {
        id: 'group-1',
        name: 'Hotel Management Group',
        chainsCount: 1,
        tenantsCount: await hotelDb.tenant.count(),
        status: 'active'
      }
    ]
    
    await logAdminAction(admin.id, 'VIEW_GROUPS', true, 'group', undefined, req)
    
    res.json({
      success: true,
      groups,
      count: groups.length
    })
    
  } catch (error) {
    logger.error('グループ一覧取得エラー:', error as Error)
    res.status(500).json({ error: 'GROUPS_FETCH_ERROR' })
  }
})

// 統合状況ダッシュボード（superadmin専用）
router.get('/integration-status', authenticateAdmin, requireAdminLevel('superadmin'), async (req, res) => {
  try {
    const admin = req.admin!
    
    // 各システムの統合状況を返す
    const integrationStatus = {
      overview: {
        totalTenants: await hotelDb.tenant.count(),
        totalStaff: await hotelDb.staff.count(),
        totalCustomers: await hotelDb.customers.count(),
        totalReservations: await hotelDb.reservation.count()
      },
      systems: {
        'hotel-saas': {
          status: 'PARTIAL',
          integrationLevel: 60,
          issues: ['Customer model missing', 'Staff migration pending']
        },
        'hotel-member': {
          status: 'DISCONNECTED', 
          integrationLevel: 0,
          issues: ['DB connection failed', 'Schema not integrated']
        },
        'hotel-pms': {
          status: 'MINIMAL',
          integrationLevel: 20,
          issues: ['Limited schema integration', 'Staff migration pending']
        }
      }
    }
    
    await logAdminAction(admin.id, 'VIEW_INTEGRATION_STATUS', true, 'system', undefined, req)
    
    res.json({
      success: true,
      integrationStatus
    })
    
  } catch (error) {
    logger.error('統合状況取得エラー:', error as Error)
    res.status(500).json({ error: 'INTEGRATION_STATUS_ERROR' })
  }
})

export default router 