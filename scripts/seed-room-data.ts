import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoomData() {
  try {
    console.log('🏨 客室データのシード開始...');

    // デフォルトテナントIDを取得
    const defaultTenant = await prisma.tenant.findFirst({
      where: { id: 'default' }
    });

    if (!defaultTenant) {
      console.error('❌ デフォルトテナントが見つかりません');
      return;
    }

    const tenantId = defaultTenant.id;

    // 既存の客室データをチェック
    const existingRooms = await prisma.room.count({
      where: { tenantId, isDeleted: false }
    });

    if (existingRooms > 0) {
      console.log(`ℹ️  既に${existingRooms}件の客室データが存在します`);
      return;
    }

    // サンプル客室データ
    const roomsData = [
      // 1階 - スタンダードルーム
      {
        tenantId,
        roomNumber: '101',
        roomType: 'standard',
        floor: 1,
        status: 'available',
        capacity: 2,
        amenities: ['wifi', 'tv', 'ac', 'desk'],
        lastCleaned: new Date('2025-08-27T10:00:00Z')
      },
      {
        tenantId,
        roomNumber: '102',
        roomType: 'standard',
        floor: 1,
        status: 'occupied',
        capacity: 2,
        amenities: ['wifi', 'tv', 'ac', 'desk'],
        lastCleaned: new Date('2025-08-27T08:00:00Z')
      },
      {
        tenantId,
        roomNumber: '103',
        roomType: 'standard',
        floor: 1,
        status: 'cleaning',
        capacity: 2,
        amenities: ['wifi', 'tv', 'ac', 'desk'],
        lastCleaned: new Date('2025-08-27T12:00:00Z')
      },
      {
        tenantId,
        roomNumber: '104',
        roomType: 'standard',
        floor: 1,
        status: 'available',
        capacity: 2,
        amenities: ['wifi', 'tv', 'ac', 'desk'],
        lastCleaned: new Date('2025-08-27T09:00:00Z')
      },
      {
        tenantId,
        roomNumber: '105',
        roomType: 'deluxe',
        floor: 1,
        status: 'available',
        capacity: 3,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa'],
        lastCleaned: new Date('2025-08-27T11:00:00Z')
      },

      // 2階 - デラックス・スイート
      {
        tenantId,
        roomNumber: '201',
        roomType: 'deluxe',
        floor: 2,
        status: 'occupied',
        capacity: 3,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa'],
        lastCleaned: new Date('2025-08-27T07:00:00Z')
      },
      {
        tenantId,
        roomNumber: '202',
        roomType: 'deluxe',
        floor: 2,
        status: 'maintenance',
        capacity: 3,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa'],
        lastCleaned: new Date('2025-08-26T16:00:00Z')
      },
      {
        tenantId,
        roomNumber: '203',
        roomType: 'suite',
        floor: 2,
        status: 'available',
        capacity: 4,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa', 'jacuzzi', 'kitchenette'],
        lastCleaned: new Date('2025-08-27T13:00:00Z')
      },
      {
        tenantId,
        roomNumber: '204',
        roomType: 'suite',
        floor: 2,
        status: 'occupied',
        capacity: 4,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa', 'jacuzzi', 'kitchenette'],
        lastCleaned: new Date('2025-08-27T06:00:00Z')
      },

      // 3階 - スイートルーム
      {
        tenantId,
        roomNumber: '301',
        roomType: 'suite',
        floor: 3,
        status: 'available',
        capacity: 4,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa', 'jacuzzi', 'kitchenette', 'balcony'],
        lastCleaned: new Date('2025-08-27T14:00:00Z')
      },
      {
        tenantId,
        roomNumber: '302',
        roomType: 'suite',
        floor: 3,
        status: 'available',
        capacity: 4,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa', 'jacuzzi', 'kitchenette', 'balcony'],
        lastCleaned: new Date('2025-08-27T15:00:00Z')
      },
      {
        tenantId,
        roomNumber: '303',
        roomType: 'suite',
        floor: 3,
        status: 'cleaning',
        capacity: 4,
        amenities: ['wifi', 'tv', 'ac', 'desk', 'minibar', 'sofa', 'jacuzzi', 'kitchenette', 'balcony'],
        lastCleaned: new Date('2025-08-27T02:00:00Z')
      }
    ];

    // バッチでデータを挿入
    const createdRooms = await prisma.room.createMany({
      data: roomsData,
      skipDuplicates: true
    });

    console.log(`✅ ${createdRooms.count}件の客室データを作成しました`);

    // 作成されたデータの統計を表示
    const stats = await prisma.room.groupBy({
      by: ['status', 'roomType'],
      where: { tenantId, isDeleted: false },
      _count: { id: true }
    });

    console.log('\n📊 客室データ統計:');
    stats.forEach(stat => {
      console.log(`  ${stat.roomType} (${stat.status}): ${stat._count.id}件`);
    });

  } catch (error) {
    console.error('❌ 客室データシードエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  seedRoomData()
    .then(() => {
      console.log('🎉 客室データシード完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 客室データシード失敗:', error);
      process.exit(1);
    });
}

export { seedRoomData };



