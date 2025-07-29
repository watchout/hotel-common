import { hotelDb } from '../src/database/prisma'
import { HotelLogger } from '../src/utils/logger'

async function setupInitialData() {
  const logger = HotelLogger.getInstance()
  const db = hotelDb.getClient()

  try {
    await hotelDb.connect()
    logger.info('Connected to Hotel Common Database')

    // 1. スキーマバージョン記録
    const schemaVersion = await db.schema_version.create({
      data: {
        version: '1.0.0',
        description: 'Initial unified infrastructure with multi-tenant support',
        rollback_sql: 'DROP TABLE IF EXISTS system_events, rooms, reservations, customers, users, tenants, schema_versions CASCADE;'
      }
    })
    logger.info('Schema version recorded', { version: schemaVersion.version })

    // 2. 初期テナント作成
    const tenant = await db.tenant.create({
      data: {
        name: 'サンプルホテル',
        code: 'sample-hotel',
        domain: 'sample-hotel.local',
        plan_type: 'basic',
        status: 'ACTIVE',
        settings: {
          timezone: 'Asia/Tokyo',
          currency: 'JPY',
          language: 'ja'
        }
      }
    })
    logger.info('Initial tenant created', { tenant: tenant.code })

    // 3. システム管理ユーザー作成
          const adminStaff = await db.staff.create({
        data: {
          tenantId: tenant.id,
        email: 'admin@sample-hotel.com',
        username: 'admin',
        password_hash: 'hashed-password-placeholder', // 実際の運用では適切にハッシュ化
        role: 'ADMIN',
        level: 5,
        permissions: ['read', 'write', 'admin', 'system'],
        system_settings: {
          theme: 'light',
          notifications: true
        }
      }
    })
            logger.info('Admin staff created', { staffId: adminStaff.id })

    // 4. サンプル客室作成
    const rooms = await Promise.all([
      db.room.create({
        data: {
          tenant_id: tenant.id,
          room_number: '101',
          room_type: 'standard',
          floor: 1,
          capacity: 2,
          amenities: ['Wi-Fi', 'TV', 'エアコン', '冷蔵庫'],
          base_price: 8000,
          status: 'AVAILABLE',
          attributes: {
            view: 'city',
            smoking: false
          }
        }
      }),
      db.room.create({
        data: {
          tenant_id: tenant.id,
          room_number: '201',
          room_type: 'deluxe',
          floor: 2,
          capacity: 3,
          amenities: ['Wi-Fi', 'TV', 'エアコン', '冷蔵庫', 'バルコニー'],
          base_price: 12000,
          status: 'AVAILABLE',
          attributes: {
            view: 'ocean',
            smoking: false
          }
        }
      })
    ])
    logger.info('Sample rooms created', { roomCount: rooms.length })

    // 5. サンプル顧客作成
    const customer = await db.customer.create({
      data: {
        tenant_id: tenant.id,
        name: '田中太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        member_id: 'M001',
        rank_id: 'gold',
        total_points: 1500,
        total_stays: 5,
        preferences: {
          room_preference: 'ocean_view',
          dietary_requirements: 'none'
        }
      }
    })
    logger.info('Sample customer created', { customerId: customer.id })

    // 6. システムイベント記録
    await db.system_event.create({
      data: {
        tenant_id: tenant.id,
        user_id: adminUser.id,
        event_type: 'SYSTEM',
        source_system: 'hotel-common',
        entity_type: 'initial_setup',
        entity_id: tenant.id,
        action: 'CREATE',
        event_data: {
          message: 'Initial unified infrastructure setup completed',
          components: ['tenant', 'admin_user', 'sample_rooms', 'sample_customer'],
          version: '1.0.0'
        }
      }
    })

    logger.info('✅ Initial data setup completed successfully!')
    
    // 統計情報表示
    const stats = {
      tenants: await db.tenant.count(),
              staff: await db.staff.count(),
      customers: await db.customer.count(),
      rooms: await db.room.count(),
      events: await db.system_event.count()
    }
    
    logger.info('Database statistics', stats)
    
    return {
      success: true,
      tenant,
      adminUser,
      customer,
      rooms,
      stats
    }

  } catch (error) {
    logger.error('Failed to setup initial data', { error })
    throw error
  } finally {
    await hotelDb.disconnect()
  }
}

// スクリプト実行
if (require.main === module) {
  setupInitialData()
    .then((result) => {
      console.log('🎉 統一基盤セットアップ完了!')
      console.log('テナントID:', result.tenant.id)
      console.log('管理者ID:', result.adminUser.id)
      console.log('統計:', result.stats)
    })
    .catch((error) => {
      console.error('❌ セットアップ失敗:', error)
      process.exit(1)
    })
}

export { setupInitialData } 