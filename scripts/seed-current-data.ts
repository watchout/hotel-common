
// seed-current-data.ts
import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * 現在のスキーマに合わせたシードデータ作成
 */
async function seedCurrentData() {
  console.log('🌱 現在のスキーマ対応シードデータ作成開始...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://kaneko@localhost:5432/hotel_unified_db"
      }
    }
  });
  
  try {
    // 1. テナント確認・作成
    console.log('🏢 テナント確認中...');
    let defaultTenant = await prisma.tenant.findFirst({
      where: { id: 'default' }
    });
    
    if (!defaultTenant) {
      console.log('🏢 デフォルトテナント作成中...');
      defaultTenant = await prisma.tenant.create({
        data: {
          id: 'default',
          name: 'デフォルトホテル',
          domain: 'default.hotel.com',
          status: 'active',
          contactEmail: 'admin@default.hotel.com',
          features: ['basic', 'ai_concierge'],
          planType: 'standard',
          settings: {
            timezone: 'Asia/Tokyo',
            currency: 'JPY',
            language: 'ja'
          }
        }
      });
      console.log('✅ デフォルトテナント作成完了');
    } else {
      console.log('✅ デフォルトテナント既存');
    }
    
    // 2. スタッフアカウント確認・作成
    console.log('👥 スタッフアカウント確認中...');
    const existingStaff = await prisma.staff.findFirst({
      where: { 
        email: 'admin@omotenasuai.com',
        tenant_id: defaultTenant.id 
      }
    });
    
    if (!existingStaff) {
      console.log('👥 管理者スタッフ作成中...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.staff.create({
        data: {
          id: uuidv4(),
          tenant_id: defaultTenant.id,
          email: 'admin@omotenasuai.com',
          name: '管理者',
          role: 'admin',
          department: 'management',
          password_hash: hashedPassword,
          is_active: true
        }
      });
      console.log('✅ 管理者スタッフ作成完了');
    } else {
      console.log('✅ 管理者スタッフ既存');
    }
    
    // 3. 客室データ作成
    console.log('🏨 客室データ確認中...');
    const roomCount = await prisma.room.count({
      where: { tenantId: defaultTenant.id }
    });
    
    if (roomCount === 0) {
      console.log('🏨 客室データ作成中...');
      const rooms = [
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
      
      for (const roomData of rooms) {
        await prisma.room.create({
          data: {
            id: uuidv4(),
            tenantId: defaultTenant.id,
            roomNumber: roomData.roomNumber,
            roomType: roomData.roomType,
            floor: roomData.floor,
            status: 'AVAILABLE',
            capacity: roomData.capacity,
            amenities: {
              wifi: true,
              tv: true,
              aircon: true,
              minibar: roomData.roomType !== 'standard'
            },
            notes: `${roomData.roomType}タイプの客室`
          }
        });
      }
      console.log('✅ 客室データ作成完了 (10室)');
    } else {
      console.log(`✅ 客室データ既存 (${roomCount}室)`);
    }
    
    // 4. 客室グレード作成
    console.log('🏆 客室グレード確認中...');
    const gradeCount = await prisma.room_grades.count({
      where: { tenant_id: defaultTenant.id }
    });
    
    if (gradeCount === 0) {
      console.log('🏆 客室グレード作成中...');
      const grades = [
        { name: 'スタンダード', code: 'standard', description: '基本的な設備を備えた客室' },
        { name: 'デラックス', code: 'deluxe', description: '広めの客室と充実した設備' },
        { name: 'スイート', code: 'suite', description: '贅沢な空間とプレミアム設備' },
        { name: 'プレジデンシャル', code: 'presidential', description: '最高級の客室とサービス' }
      ];
      
      for (const gradeData of grades) {
        await prisma.room_grades.create({
          data: {
            id: uuidv4(),
            tenant_id: defaultTenant.id,
            name: gradeData.name,
            code: gradeData.code,
            description: gradeData.description,
            updated_at: new Date()
          }
        });
      }
      console.log('✅ 客室グレード作成完了 (4種類)');
    } else {
      console.log(`✅ 客室グレード既存 (${gradeCount}種類)`);
    }
    
    // 5. 顧客データ作成
    console.log('👤 顧客データ確認中...');
    const customerCount = await prisma.customers.count({
      where: { tenant_id: defaultTenant.id }
    });
    
    if (customerCount === 0) {
      console.log('👤 顧客データ作成中...');
      const customers = [
        { name: '田中太郎', email: 'tanaka@example.com', phone: '090-1234-5678' },
        { name: '佐藤花子', email: 'sato@example.com', phone: '090-2345-6789' },
        { name: '鈴木一郎', email: 'suzuki@example.com', phone: '090-3456-7890' }
      ];
      
      for (const customerData of customers) {
        await prisma.customers.create({
          data: {
            id: uuidv4(),
            tenant_id: defaultTenant.id,
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            total_points: Math.floor(Math.random() * 1000),
            preferences: {
              roomType: 'standard',
              floorPreference: 'high',
              smokingPreference: 'non-smoking'
            },
            updated_at: new Date()
          }
        });
      }
      console.log('✅ 顧客データ作成完了 (3名)');
    } else {
      console.log(`✅ 顧客データ既存 (${customerCount}名)`);
    }
    
    // 6. 統計情報表示
    // 6. 会計データ（Invoice/Payment/Transaction）サンプル作成
    console.log('💳 会計サンプルデータ確認中...');
    const seedInvoiceNumber = 'INV-SEED-0001';

    // 金額計算
    const seedItems = [
      { description: 'Room fee', quantity: 1, unit_price: 9000, tax_rate: 0.1 },
      { description: 'Breakfast', quantity: 2, unit_price: 800, tax_rate: 0.1 }
    ];
    const seedSubtotal = seedItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
    const seedTax = seedItems.reduce((sum, i) => sum + Math.round(i.quantity * i.unit_price * i.tax_rate), 0);
    const seedTotal = seedSubtotal + seedTax;

    // Invoice upsert（invoiceNumberはユニーク）
    const seedInvoice = await prisma.invoice.upsert({
      where: { invoiceNumber: seedInvoiceNumber },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        invoiceNumber: seedInvoiceNumber,
        customerName: 'シード顧客',
        customerEmail: 'seed@example.com',
        billingAddress: { address: '東京都千代田区1-1', city: '千代田区', postal_code: '100-0001', country: 'JP' },
        items: seedItems,
        subtotal: seedSubtotal,
        taxAmount: seedTax,
        totalAmount: seedTotal,
        status: 'DRAFT',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: 'Seed用の請求データ',
      }
    });

    // Transaction upsert（固定IDで冪等に）
    const txnId = 'txn-seed-0001';
    await prisma.transaction.upsert({
      where: { id: txnId },
      update: {},
      create: {
        id: txnId,
        tenantId: defaultTenant.id,
        invoiceId: seedInvoice.id,
        type: 'INVOICE',
        amount: seedSubtotal,
        taxAmount: seedTax,
        totalAmount: seedTotal,
        status: 'PENDING',
        description: 'Seed invoice transaction'
      }
    });

    // Payment upsert（Transactionと1:1、transactionIdはユニーク）
    const payId = 'pay-seed-0001';
    await prisma.payment.upsert({
      where: { id: payId },
      update: {},
      create: {
        id: payId,
        tenantId: defaultTenant.id,
        transactionId: txnId,
        invoiceId: seedInvoice.id,
        paymentMethod: 'cash',
        amount: Math.floor(seedTotal / 2),
        status: 'PENDING',
        reference: 'SEED-PAY-1',
        metadata: { method: 'cash' },
        processedAt: new Date(),
      }
    });

    console.log('✅ 会計サンプルデータ作成・更新完了');

    console.log('\n📊 シードデータ作成結果:');
    const finalStats = {
      tenants: await prisma.tenant.count(),
      staff: await prisma.staff.count(),
      rooms: await prisma.room.count(),
      roomGrades: await prisma.room_grades.count(),
      customers: await prisma.customers.count()
    };
    
    Object.entries(finalStats).forEach(([key, count]) => {
      console.log(`   - ${key}: ${count}件`);
    });
    
    console.log('\n🎉 シードデータ作成完了！');
    
  } catch (error) {
    console.error('❌ シードデータ作成エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
seedCurrentData().catch(e => {
  console.error('❌ シードスクリプト実行エラー:', e);
  process.exit(1);
});
