import bcrypt from 'bcrypt'
import { hotelDb } from '../src/database'
import { HotelLogger } from '../src/utils/logger'

const logger = HotelLogger.getInstance()

async function setupAdminUsers() {
  try {
    logger.info('Admin管理者セットアップ開始...')
    
    await hotelDb.connect()
    const db = hotelDb.getClient()
    
    // 既存のAdmin管理者を確認
    const existingAdmins = await db.admin.findMany()
    
    if (existingAdmins.length > 0) {
      logger.info(`既存のAdmin管理者が${existingAdmins.length}人見つかりました`)
      logger.info('スキップします（既存データ保護）')
      return
    }
    
    // パスワードハッシュ化
    const defaultPassword = 'admin123'
    const passwordHash = await bcrypt.hash(defaultPassword, 12)
    
    // デモAdmin管理者作成
    const adminUsers = [
      {
        email: 'superadmin@hotel.com',
        username: 'superadmin',
        displayName: 'スーパー管理者',
        passwordHash,
        adminLevel: 'superadmin' as const,
        accessibleGroupIds: [],
        accessibleChainIds: [],
        accessibleTenantIds: [],
        isActive: true
      },
      {
        email: 'groupadmin@hotel.com',
        username: 'groupadmin',
        displayName: 'グループ管理者',
        passwordHash,
        adminLevel: 'groupadmin' as const,
        accessibleGroupIds: ['group-1'],
        accessibleChainIds: [],
        accessibleTenantIds: [],
        isActive: true
      },
      {
        email: 'chainadmin@hotel.com',
        username: 'chainadmin',
        displayName: 'チェーン管理者',
        passwordHash,
        adminLevel: 'chainadmin' as const,
        accessibleGroupIds: [],
        accessibleChainIds: ['chain-1'],
        accessibleTenantIds: [],
        isActive: true
      }
    ]
    
    // 管理者を作成
    for (const adminData of adminUsers) {
      const admin = await db.admin.create({
        data: adminData
      })
      
      logger.info(`✅ Admin管理者作成完了: ${admin.email} (${admin.adminLevel})`)
    }
    
    // 初期ログインログを作成
    await db.adminLog.create({
      data: {
        adminId: (await db.admin.findFirst({ where: { email: 'superadmin@hotel.com' } }))!.id,
        action: 'SYSTEM_SETUP',
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Admin Setup Script'
      }
    })
    
    logger.info('🎉 Admin管理者セットアップ完了!')
    logger.info('')
    logger.info('📋 作成されたアカウント:')
    logger.info('  superadmin@hotel.com / admin123 (全権限)')
    logger.info('  groupadmin@hotel.com / admin123 (グループ管理)')
    logger.info('  chainadmin@hotel.com / admin123 (チェーン管理)')
    logger.info('')
    logger.info('🌐 管理画面アクセス: http://localhost:3500')
    
  } catch (error) {
    logger.error('Admin管理者セットアップエラー:', error as Error)
    throw error
  } finally {
    await hotelDb.disconnect()
  }
}

// 直接実行時
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAdminUsers()
    .then(() => {
      logger.info('Admin管理者セットアップが正常に完了しました')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Admin管理者セットアップが失敗しました:', error)
      process.exit(1)
    })
}

export { setupAdminUsers } 