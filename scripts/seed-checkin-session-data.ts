import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCheckinSessionData() {
  console.log('🏨 チェックインセッション対応データのシード開始...');

  try {
    // 1. テナント作成
    console.log('🏢 テナント作成中...');
    const defaultTenant = await prisma.tenant.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        name: 'デフォルトホテル',
        domain: 'default.hotel-common.local',
        status: 'active'
      }
    });

    // 2. 部屋作成
    console.log('🏠 部屋データ作成中...');
    const roomsData = [
      { id: 'room-101', room_number: '101', tenant_id: defaultTenant.id },
      { id: 'room-102', room_number: '102', tenant_id: defaultTenant.id },
      { id: 'room-103', room_number: '103', tenant_id: defaultTenant.id },
      { id: 'room-104', room_number: '104', tenant_id: defaultTenant.id },
      { id: 'room-201', room_number: '201', tenant_id: defaultTenant.id },
      { id: 'room-202', room_number: '202', tenant_id: defaultTenant.id }
    ];

    for (const roomData of roomsData) {
      await prisma.room.upsert({
        where: { id: roomData.id },
        update: {},
        create: {
          id: roomData.id,
          tenant_id: roomData.tenant_id,
          room_number: roomData.room_number,
          room_grade_id: null,
          floor: parseInt(roomData.room_number.charAt(0)),
          capacity: 2,
          status: 'AVAILABLE',
          accessibility_features: [],
          special_features: {},
          is_active: true,
          updated_at: new Date()
        }
      });
    }

    // 3. 予約作成
    console.log('📋 予約データ作成中...');
    const reservationsData = [
      {
        id: 'res-001',
        tenant_id: defaultTenant.id,
        room_id: 'room-101',
        guest_name: '田中太郎',
        check_in_date: new Date('2025-08-28T15:00:00Z'),
        check_out_date: new Date('2025-08-29T11:00:00Z'),
        guest_count: 2,
        status: 'CHECKED_IN',
        origin: 'WALK_IN',
        total_amount: 15000,
        paid_amount: 0,
        updated_at: new Date()
      },
      {
        id: 'res-002',
        tenant_id: defaultTenant.id,
        room_id: 'room-102',
        guest_name: '佐藤花子',
        check_in_date: new Date('2025-08-28T00:00:00Z'),
        check_out_date: new Date('2025-08-30T00:00:00Z'),
        guest_count: 2,
        status: 'CHECKED_IN',
        origin: 'ONLINE',
        total_amount: 32000,
        paid_amount: 32000,
        updated_at: new Date()
      }
    ];

    for (const reservationData of reservationsData) {
      await prisma.reservation.upsert({
        where: { id: reservationData.id },
        update: {},
        create: reservationData
      });
    }

    // 4. チェックインセッション作成
    console.log('🔑 チェックインセッション作成中...');
    const sessionsData = [
      {
        id: 'session-001',
        tenantId: defaultTenant.id,
        sessionNumber: 'R101-20250828-001',
        reservationId: 'res-001',
        roomId: 'room-101',
        customerId: null,
        guestInfo: {
          primaryGuest: {
            firstName: '太郎',
            lastName: '田中',
            email: 'tanaka@example.com',
            phone: '090-1234-5678'
          },
          additionalGuests: [],
          specialNeeds: [],
          preferences: {}
        },
        adults: 2,
        children: 0,
        checkInAt: new Date('2025-08-28T15:00:00Z'),
        plannedCheckOut: new Date('2025-08-29T11:00:00Z'),
        status: 'ACTIVE',
        notes: 'ウォークイン',
        updatedAt: new Date()
      },
      {
        id: 'session-002',
        tenantId: defaultTenant.id,
        sessionNumber: 'R102-20250828-001',
        reservationId: 'res-002',
        roomId: 'room-102',
        customerId: null,
        guestInfo: {
          primaryGuest: {
            firstName: '花子',
            lastName: '佐藤',
            email: 'sato@example.com',
            phone: '080-9876-5432'
          },
          additionalGuests: [
            {
              firstName: '太郎',
              lastName: '佐藤',
              age: 8,
              relationship: '息子'
            }
          ],
          specialNeeds: [],
          preferences: {}
        },
        adults: 1,
        children: 1,
        checkInAt: new Date('2025-08-28T00:00:00Z'),
        plannedCheckOut: new Date('2025-08-30T00:00:00Z'),
        status: 'ACTIVE',
        notes: 'オンライン予約',
        updatedAt: new Date()
      }
    ];

    for (const sessionData of sessionsData) {
      await prisma.checkinSession.upsert({
        where: { id: sessionData.id },
        update: {},
        create: sessionData
      });
    }

    // 5. 注文データ作成（セッションに紐付け）
    console.log('🍽️ 注文データ作成中...');
    const ordersData = [
      {
        id: 1,
        uuid: 'order-001',
        tenantId: defaultTenant.id,
        roomId: 'room-101',
        sessionId: 'session-001',
        status: 'received',
        items: {
          items: [
            { name: 'コーヒー', price: 500, quantity: 2 },
            { name: 'サンドイッチ', price: 800, quantity: 1 }
          ]
        },
        total: 1800,
        createdAt: new Date('2025-08-28T16:00:00Z'),
        updatedAt: new Date('2025-08-28T16:00:00Z')
      },
      {
        id: 2,
        uuid: 'order-002',
        tenantId: defaultTenant.id,
        roomId: 'room-102',
        sessionId: 'session-002',
        status: 'received',
        items: {
          items: [
            { name: 'ルームサービス朝食', price: 2500, quantity: 2 }
          ]
        },
        total: 5000,
        createdAt: new Date('2025-08-28T08:00:00Z'),
        updatedAt: new Date('2025-08-28T08:00:00Z')
      }
    ];

    for (const orderData of ordersData) {
      await prisma.order.upsert({
        where: { id: orderData.id },
        update: {},
        create: orderData
      });
    }

    console.log('🎉 チェックインセッション対応データのシード完了!');
    console.log('📊 作成されたデータ:');
    console.log(`  - テナント: 1件`);
    console.log(`  - 部屋: ${roomsData.length}件`);
    console.log(`  - 予約: ${reservationsData.length}件`);
    console.log(`  - セッション: ${sessionsData.length}件`);
    console.log(`  - 注文: ${ordersData.length}件`);

  } catch (error) {
    console.error('❌ シードエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  seedCheckinSessionData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedCheckinSessionData };
