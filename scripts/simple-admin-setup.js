const bcrypt = require('bcrypt')
const { PrismaClient } = require('../src/generated/prisma')

async function setupAdminUsers() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Admin管理者セットアップ開始...')
    
    // 既存のAdmin管理者を確認
    const existingAdmins = await prisma.admin.findMany()
    
    if (existingAdmins.length > 0) {
      console.log(`✅ 既存のAdmin管理者が${existingAdmins.length}人見つかりました`)
      console.log('⏭️ スキップします（既存データ保護）')
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
        adminLevel: 'superadmin',
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
        adminLevel: 'groupadmin',
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
        adminLevel: 'chainadmin',
        accessibleGroupIds: [],
        accessibleChainIds: ['chain-1'],
        accessibleTenantIds: [],
        isActive: true
      }
    ]
    
    // 管理者を作成
    for (const adminData of adminUsers) {
      const admin = await prisma.admin.create({
        data: adminData
      })
      
      console.log(`✅ Admin管理者作成完了: ${admin.email} (${admin.adminLevel})`)
    }
    
    // 初期ログを作成
    const superAdmin = await prisma.admin.findFirst({ 
      where: { email: 'superadmin@hotel.com' } 
    })
    
    await prisma.adminLog.create({
      data: {
        adminId: superAdmin.id,
        action: 'SYSTEM_SETUP',
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Admin Setup Script'
      }
    })
    
    console.log('')
    console.log('🎉 Admin管理者セットアップ完了!')
    console.log('')
    console.log('📋 作成されたアカウント:')
    console.log('  superadmin@hotel.com / admin123 (全権限)')
    console.log('  groupadmin@hotel.com / admin123 (グループ管理)')
    console.log('  chainadmin@hotel.com / admin123 (チェーン管理)')
    console.log('')
    console.log('🌐 管理画面アクセス: http://localhost:3500')
    
  } catch (error) {
    console.error('❌ Admin管理者セットアップエラー:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 実行
setupAdminUsers()
  .then(() => {
    console.log('✅ Admin管理者セットアップが正常に完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Admin管理者セットアップが失敗しました:', error)
    process.exit(1)
  }) 