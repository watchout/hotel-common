import { hotelDb } from '../src/database/prisma'
import { HotelLogger } from '../src/utils/logger'

async function setupRoomGrades() {
  const logger = HotelLogger.getInstance()
  const db = hotelDb.getClient()

  try {
    await hotelDb.connect()
    logger.info('Connected to Hotel Common Database')

    // 既存テナント取得
    const tenant = await db.tenant.findFirst({
      where: { code: 'sample-hotel' }
    })

    if (!tenant) {
      logger.error('サンプルテナントが見つかりません。先にsetup-initial-data.tsを実行してください。')
      return
    }

    logger.info(`テナント確認完了: ${tenant.code}`)

    // 基本room_gradesデータ作成
    const roomGrades = [
      {
        grade_code: 'STD',
        grade_name: 'スタンダード',
        grade_name_en: 'Standard',
        description: 'シンプルで快適な基本客室',
        grade_level: 1,
        default_capacity: 2,
        max_capacity: 3,
        room_size_sqm: 20.0,
        standard_amenities: ['Wi-Fi', 'TV', 'エアコン', '冷蔵庫', 'ドライヤー'],
        premium_amenities: [],
        included_services: [],
        member_only: false,
        min_stay_nights: 1,
        advance_booking_days: 0,
        display_order: 1,
        is_active: true,
        is_public: true,
        pricing_category: 'standard'
      },
      {
        grade_code: 'DLX',
        grade_name: 'デラックス',
        grade_name_en: 'Deluxe',
        description: '広々とした上質な客室、ワンランク上の快適さ',
        grade_level: 2,
        default_capacity: 2,
        max_capacity: 4,
        room_size_sqm: 30.0,
        standard_amenities: ['Wi-Fi', 'TV', 'エアコン', '冷蔵庫', 'ドライヤー'],
        premium_amenities: ['バルコニー', 'ミニバー', 'コーヒーメーカー'],
        included_services: ['朝食'],
        member_only: false,
        min_stay_nights: 1,
        advance_booking_days: 0,
        display_order: 2,
        is_active: true,
        is_public: true,
        pricing_category: 'deluxe'
      },
      {
        grade_code: 'STE',
        grade_name: 'スイート',
        grade_name_en: 'Suite',
        description: '最高級の広々としたスイートルーム、特別なひとときを',
        grade_level: 3,
        default_capacity: 2,
        max_capacity: 6,
        room_size_sqm: 50.0,
        standard_amenities: ['Wi-Fi', 'TV', 'エアコン', '冷蔵庫', 'ドライヤー'],
        premium_amenities: ['バルコニー', 'ジャグジー', 'ミニバー', 'コーヒーメーカー', 'リビングエリア'],
        included_services: ['朝食', 'ラウンジアクセス', '24時間ルームサービス'],
        member_only: false,
        min_stay_nights: 1,
        advance_booking_days: 7,
        display_order: 3,
        is_active: true,
        is_public: true,
        pricing_category: 'suite'
      },
      {
        grade_code: 'VIP',
        grade_name: 'VIPスイート',
        grade_name_en: 'VIP Suite',
        description: '会員様専用の最上級スイートルーム',
        grade_level: 4,
        default_capacity: 2,
        max_capacity: 8,
        room_size_sqm: 80.0,
        standard_amenities: ['Wi-Fi', 'TV', 'エアコン', '冷蔵庫', 'ドライヤー'],
        premium_amenities: ['プライベートバルコニー', 'ジャグジー', 'ミニバー', 'エスプレッソマシン', 'リビングエリア', 'ダイニングエリア'],
        included_services: ['朝食', 'ラウンジアクセス', '24時間ルームサービス', 'コンシェルジュサービス', 'プライベートチェックイン'],
        member_only: true,
        min_stay_nights: 2,
        advance_booking_days: 14,
        display_order: 4,
        is_active: true,
        is_public: false,
        pricing_category: 'vip'
      }
    ]

    for (const gradeData of roomGrades) {
      const roomGrade = await db.room_grade.create({
        data: {
          tenant_id: tenant.id,
          ...gradeData
        }
      })
      logger.info(`Room Grade created: ${roomGrade.grade_code} - ${roomGrade.grade_name}`)
    }

    // 既存roomデータの更新（room_type → room_grade_id）
    const existingRooms = await db.room.findMany({
      where: { tenant_id: tenant.id }
    })

    if (existingRooms.length > 0) {
      logger.info(`既存客室のグレード設定を開始: ${existingRooms.length}室`)

      for (const room of existingRooms) {
        let gradeCode = 'STD' // デフォルト

        // room_typeからgradeCodeを判定
        switch (room.room_type.toLowerCase()) {
          case 'standard':
            gradeCode = 'STD'
            break
          case 'deluxe':
            gradeCode = 'DLX'
            break
          case 'suite':
            gradeCode = 'STE'
            break
          default:
            gradeCode = 'STD'
        }

        // 対応するroom_gradeを取得
        const roomGrade = await db.room_grade.findFirst({
          where: {
            tenant_id: tenant.id,
            grade_code: gradeCode
          }
        })

        if (roomGrade) {
          await db.room.update({
            where: { id: room.id },
            data: {
              room_grade_id: roomGrade.id,
              pricing_room_code: `${room.room_number}_${gradeCode}`
            }
          })

          logger.info(`Room grade updated: ${room.room_number} (${room.room_type} → ${gradeCode})`)
        }
      }
    }

    // 会員グレードアクセス設定例（ゴールド会員向け）
    const vipGrade = await db.room_grade.findFirst({
      where: {
        tenant_id: tenant.id,
        grade_code: 'VIP'
      }
    })

    if (vipGrade) {
      await db.member_grade_access.create({
        data: {
          tenant_id: tenant.id,
          room_grade_id: vipGrade.id,
          member_rank_id: 'gold',
          access_type: 'FULL',
          priority_booking_hours: 24,
          max_bookings_per_month: 4
        }
      })

      logger.info('Member grade access created: VIP grade for gold members')
    }

    logger.info('✅ Room grades setup completed successfully!')

  } catch (error) {
    logger.error(`Room grades setup failed: ${error}`)
  } finally {
    await hotelDb.disconnect()
  }
}

// スクリプト実行
if (require.main === module) {
  setupRoomGrades()
    .then(() => {
      console.log('🎉 Room grades setup script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Room grades setup script failed:', error)
      process.exit(1)
    })
}

export { setupRoomGrades } 