/**
 * テストデータ作成スクリプト
 * 統一データベーススキーマ仕様書に基づいたテストデータを作成します
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('テストデータ作成を開始します...');

    // テナントデータの作成
    const tenant1 = await createTenant('tenant-1', 'テストホテルA', 'hotel-a.example.com');
    const tenant2 = await createTenant('tenant-2', 'テストホテルB', 'hotel-b.example.com');
    
    console.log('テナントデータを作成しました:', tenant1.id, tenant2.id);

    // 顧客データの作成
    const customer1 = await createCustomer(tenant1.id, '山田太郎', 'yamada@example.com', '090-1234-5678');
    const customer2 = await createCustomer(tenant1.id, '佐藤花子', 'sato@example.com', '090-8765-4321');
    const customer3 = await createCustomer(tenant2.id, '鈴木一郎', 'suzuki@example.com', '090-5555-6666');
    
    console.log('顧客データを作成しました:', customer1.id, customer2.id, customer3.id);

    // 追加デバイスデータの作成
    const device1 = await createDevice(tenant1.id, 'tablet', 'フロントタブレット', 1200);
    const device2 = await createDevice(tenant1.id, 'kiosk', 'エントランスキオスク', 3500);
    const device3 = await createDevice(tenant2.id, 'tablet', 'レストランタブレット', 1200);
    
    console.log('デバイスデータを作成しました:', device1.id, device2.id, device3.id);

    // システムイベントの作成
    const event1 = await createSystemEvent(
      tenant1.id, 
      'CUSTOMER', 
      'CREATE', 
      'hotel-member', 
      'hotel-common', 
      'customer', 
      customer1.id
    );
    
    console.log('システムイベントを作成しました:', event1.id);

    console.log('テストデータの作成が完了しました！');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * テナントを作成する
 */
async function createTenant(id, name, domain) {
  return await prisma.tenant.create({
    data: {
      id,
      name,
      domain,
      planType: 'standard',
      planCategory: 'omotenasuai',
      planSelectedAt: new Date(),
      planChangeable: true,
      maxDevices: 30,
      status: 'active',
      contactName: '管理者',
      contactEmail: `admin@${domain}`,
      contractStartDate: new Date(),
      monthlyPrice: 29800,
      updatedAt: new Date()
    }
  });
}

/**
 * 顧客を作成する
 */
async function createCustomer(tenantId, name, email, phone) {
  return await prisma.customers.create({
    data: {
      id: `customer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: tenantId,
      name,
      email,
      phone,
      origin_system: 'hotel-member',
      synced_at: new Date(),
      updated_by_system: 'hotel-member',
      preferences: {},
      created_at: new Date(),
      updated_at: new Date()
    }
  });
}

/**
 * 追加デバイスを作成する
 */
async function createDevice(tenantId, deviceType, deviceName, monthlyCost) {
  return await prisma.additionalDevices.create({
    data: {
      id: `device-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId,
      deviceType,
      deviceName,
      monthlyCost,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

/**
 * システムイベントを作成する
 */
async function createSystemEvent(tenantId, entityType, action, sourceSystem, targetSystem, entityType2, entityId) {
  return await prisma.systemEvent.create({
    data: {
      id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId,
      eventType: entityType,
      action,
      sourceSystem,
      targetSystem,
      entityType: entityType2,
      entityId,
      eventData: { message: `${action} operation on ${entityType2}` },
      createdAt: new Date()
    }
  });
}

// スクリプト実行
createTestData();