// seed-sql-data.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * SQLを使った直接的なシードデータ作成
 */
async function seedSqlData() {
  console.log('🌱 SQLベースシードデータ作成開始...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://kaneko@localhost:5432/hotel_unified_db"
      }
    }
  });
  
  try {
    // 1. 客室データ作成
    console.log('🏨 客室データ作成中...');
    
    const roomsData = [
      { roomNumber: '101', roomType: 'standard', floor: 1, capacity: 2 },
      { roomNumber: '102', roomType: 'standard', floor: 1, capacity: 2 },
      { roomNumber: '103', roomType: 'deluxe', floor: 1, capacity: 3 },
      { roomNumber: '201', roomType: 'standard', floor: 2, capacity: 2 },
      { roomNumber: '202', roomType: 'standard', floor: 2, capacity: 2 },
      { roomNumber: '203', roomType: 'suite', floor: 2, capacity: 4 },
      { roomNumber: '301', roomType: 'standard', floor: 3, capacity: 2 },
      { roomNumber: '302', roomType: 'deluxe', floor: 3, capacity: 3 },
      { roomNumber: '303', roomType: 'suite', floor: 3, capacity: 4 },
      { roomNumber: '401', roomType: 'presidential', floor: 4, capacity: 6 }
    ];
    
    for (const room of roomsData) {
      await prisma.$executeRaw`
        INSERT INTO rooms (id, "tenantId", "roomNumber", "roomType", floor, status, capacity, amenities, notes, "createdAt", "updatedAt", "isDeleted")
        VALUES (
          gen_random_uuid()::text,
          'default',
          ${room.roomNumber},
          ${room.roomType},
          ${room.floor},
          'AVAILABLE',
          ${room.capacity},
          '{"wifi": true, "tv": true, "aircon": true}',
          ${room.roomType + 'タイプの客室'},
          NOW(),
          NOW(),
          false
        )
        ON CONFLICT ("tenantId", "roomNumber") DO NOTHING
      `;
    }
    
    console.log('✅ 客室データ作成完了');
    
    // 2. 客室グレード作成
    console.log('🏆 客室グレード作成中...');
    
    const grades = [
      { name: 'スタンダード', code: 'standard', description: '基本的な設備を備えた客室' },
      { name: 'デラックス', code: 'deluxe', description: '広めの客室と充実した設備' },
      { name: 'スイート', code: 'suite', description: '贅沢な空間とプレミアム設備' },
      { name: 'プレジデンシャル', code: 'presidential', description: '最高級の客室とサービス' }
    ];
    
    for (const grade of grades) {
      await prisma.$executeRaw`
        INSERT INTO room_grades (id, tenant_id, code, name, description, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text,
          'default',
          ${grade.code},
          ${grade.name},
          ${grade.description},
          NOW(),
          NOW()
        )
        ON CONFLICT (tenant_id, code) DO NOTHING
      `;
    }
    
    console.log('✅ 客室グレード作成完了');
    
    // 3. 顧客データ作成
    console.log('👤 顧客データ作成中...');
    
    const customers = [
      { name: '田中太郎', email: 'tanaka@example.com', phone: '090-1234-5678' },
      { name: '佐藤花子', email: 'sato@example.com', phone: '090-2345-6789' },
      { name: '鈴木一郎', email: 'suzuki@example.com', phone: '090-3456-7890' }
    ];
    
    for (const customer of customers) {
      await prisma.$executeRaw`
        INSERT INTO customers (id, tenant_id, name, email, phone, total_points, preferences, created_at, updated_at, is_deleted)
        VALUES (
          gen_random_uuid()::text,
          'default',
          ${customer.name},
          ${customer.email},
          ${customer.phone},
          ${Math.floor(Math.random() * 1000)},
          '{"roomType": "standard", "floorPreference": "high"}',
          NOW(),
          NOW(),
          false
        )
        ON CONFLICT DO NOTHING
      `;
    }
    
    console.log('✅ 顧客データ作成完了');
    
    // 4. 統計情報表示
    console.log('\n📊 シードデータ作成結果:');
    
    const roomCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM rooms WHERE "tenantId" = 'default'`;
    const gradeCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM room_grades WHERE tenant_id = 'default'`;
    const customerCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM customers WHERE tenant_id = 'default'`;
    const staffCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM staff WHERE tenant_id = 'default'`;
    
    console.log(`   - rooms: ${(roomCount as any)[0].count}件`);
    console.log(`   - room_grades: ${(gradeCount as any)[0].count}件`);
    console.log(`   - customers: ${(customerCount as any)[0].count}件`);
    console.log(`   - staff: ${(staffCount as any)[0].count}件`);
    
    console.log('\n🎉 シードデータ作成完了！');
    
  } catch (error) {
    console.error('❌ シードデータ作成エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
seedSqlData().catch(e => {
  console.error('❌ シードスクリプト実行エラー:', e);
  process.exit(1);
});

