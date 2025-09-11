import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleSeed() {
  console.log('🌱 シンプルシード開始...');

  try {
    // 直接SQLでデータ挿入
    console.log('🏢 テナント作成...');
    await prisma.$executeRaw`
      INSERT INTO "Tenant" (id, name, domain, status, "contactName", "contactEmail", "updatedAt")
      VALUES ('default', 'デフォルトホテル', 'default.hotel.local', 'active', '管理者', 'admin@hotel.local', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('🏠 部屋作成...');
    await prisma.$executeRaw`
      INSERT INTO "Room" (id, tenant_id, room_number, floor, capacity, status, accessibility_features, special_features, is_active, updated_at)
      VALUES 
        ('room-101', 'default', '101', 1, 2, 'AVAILABLE', '[]', '{}', true, NOW()),
        ('room-102', 'default', '102', 1, 2, 'AVAILABLE', '[]', '{}', true, NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('📋 予約作成...');
    await prisma.$executeRaw`
      INSERT INTO "Reservation" (id, tenant_id, room_id, guest_name, check_in_date, check_out_date, guest_count, status, origin, total_amount, paid_amount, updated_at)
      VALUES 
        ('res-001', 'default', 'room-101', '田中太郎', '2025-08-28 15:00:00', '2025-08-29 11:00:00', 2, 'CHECKED_IN', 'WALK_IN', 15000, 0, NOW()),
        ('res-002', 'default', 'room-102', '佐藤花子', '2025-08-28 00:00:00', '2025-08-30 00:00:00', 2, 'CHECKED_IN', 'ONLINE', 32000, 32000, NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('🔑 チェックインセッション作成...');
    await prisma.$executeRaw`
      INSERT INTO checkin_sessions (id, "tenantId", "sessionNumber", "reservationId", "roomId", "guestInfo", adults, children, "checkInAt", "plannedCheckOut", status, notes, "updatedAt")
      VALUES 
        ('session-001', 'default', 'R101-20250828-001', 'res-001', 'room-101', '{"primaryGuest":{"firstName":"太郎","lastName":"田中"}}', 2, 0, '2025-08-28 15:00:00', '2025-08-29 11:00:00', 'ACTIVE', 'ウォークイン', NOW()),
        ('session-002', 'default', 'R102-20250828-001', 'res-002', 'room-102', '{"primaryGuest":{"firstName":"花子","lastName":"佐藤"}}', 1, 1, '2025-08-28 00:00:00', '2025-08-30 00:00:00', 'ACTIVE', 'オンライン予約', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('🍽️ 注文作成...');
    await prisma.$executeRaw`
      INSERT INTO "Order" (id, uuid, "tenantId", "roomId", "sessionId", status, items, total, "createdAt", "updatedAt")
      VALUES 
        (1, 'order-001', 'default', 'room-101', 'session-001', 'received', '{"items":[{"name":"コーヒー","price":500,"quantity":2}]}', 1000, '2025-08-28 16:00:00', '2025-08-28 16:00:00'),
        (2, 'order-002', 'default', 'room-102', 'session-002', 'received', '{"items":[{"name":"朝食","price":2500,"quantity":2}]}', 5000, '2025-08-28 08:00:00', '2025-08-28 08:00:00')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('🎉 シンプルシード完了!');

  } catch (error) {
    console.error('❌ シードエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  simpleSeed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { simpleSeed };


