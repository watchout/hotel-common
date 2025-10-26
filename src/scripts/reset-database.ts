import { PrismaClient } from '@prisma/client'

import { hotelDb } from '../database/prisma'

/**
 * データベースリセットスクリプト
 * 開発環境でのテスト用にデータベースをリセットします
 * 注意: 本番環境では絶対に実行しないでください！
 */

const prisma = new PrismaClient()

async function main() {
  console.log('⚠️ データベースリセット処理を開始します...')
  console.log('⚠️ 全てのデータが削除されます。本番環境では絶対に実行しないでください！')
  
  // 環境チェック
  const env = process.env.NODE_ENV || 'development'
  if (env === 'production') {
    console.error('❌ 本番環境でのリセットは禁止されています！')
    process.exit(1)
  }

  try {
    // 1. DeviceRoomテーブルのクリア
    console.log('🗑️ DeviceRoomテーブルをクリア中...')
    await hotelDb.getAdapter().deviceRoom.deleteMany({})
    console.log('✅ DeviceRoomテーブルのクリア完了')

    // 2. TenantSystemPlanテーブルのクリア
    console.log('🗑️ TenantSystemPlanテーブルをクリア中...')
    await hotelDb.getAdapter().tenantSystemPlan.deleteMany({})
    console.log('✅ TenantSystemPlanテーブルのクリア完了')

    // 3. SystemPlanRestrictionsテーブルのクリア
    console.log('🗑️ SystemPlanRestrictionsテーブルをクリア中...')
    await hotelDb.getAdapter().systemPlanRestrictions.deleteMany({})
    console.log('✅ SystemPlanRestrictionsテーブルのクリア完了')

    // 4. スタッフテーブルのクリア（存在する場合）
    try {
      console.log('🗑️ スタッフテーブルをクリア中...')
      await prisma.$executeRaw`DELETE FROM staff WHERE 1=1`
      console.log('✅ スタッフテーブルのクリア完了')
    } catch (error) {
      console.log('⚠️ スタッフテーブルが存在しないか、クリアに失敗しました')
    }

    // 5. Tenantテーブルのクリア（最後に実行する必要がある）
    console.log('🗑️ Tenantテーブルをクリア中...')
    await prisma.tenant.deleteMany({})
    console.log('✅ Tenantテーブルのクリア完了')

    console.log('🎉 データベースのリセットが完了しました！')
    console.log('ℹ️ テスト用データを作成するには src/scripts/seed-test-data.ts を実行してください')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// スクリプト実行
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
