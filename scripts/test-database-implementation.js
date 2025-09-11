/**
 * データベース実装テストスクリプト
 * 統一データベーススキーマ仕様書に基づいた実装テストを行います
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function runTests() {
  try {
    console.log('データベース実装テストを開始します...');

    // テナント関連のテスト
    await testTenants();
    
    // 顧客関連のテスト
    await testCustomers();
    
    // デバイス関連のテスト
    await testDevices();
    
    // システムイベント関連のテスト
    await testSystemEvents();
    
    // リレーション関連のテスト
    await testRelations();

    console.log('全てのテストが正常に完了しました！');

  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * テナント関連のテスト
 */
async function testTenants() {
  console.log('\n--- テナントテスト ---');
  
  // テナント一覧の取得
  const tenants = await prisma.tenant.findMany();
  console.log(`テナント数: ${tenants.length}`);
  
  if (tenants.length === 0) {
    console.warn('警告: テナントが存在しません。先にテストデータを作成してください。');
    return;
  }
  
  // テナント情報の確認
  const tenant = tenants[0];
  console.log('テナント情報:', {
    id: tenant.id,
    name: tenant.name,
    domain: tenant.domain,
    planType: tenant.planType,
    planCategory: tenant.planCategory
  });
  
  // テナントのリレーション確認
  const tenantWithRelations = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    include: {
      customers: true,
      additional_devices: true,
      _count: {
        select: {
          customers: true,
          additional_devices: true
        }
      }
    }
  });
  
  console.log('テナントリレーション:', {
    顧客数: tenantWithRelations._count.customers,
    デバイス数: tenantWithRelations._count.additional_devices
  });
  
  console.log('テナントテスト完了');
}

/**
 * 顧客関連のテスト
 */
async function testCustomers() {
  console.log('\n--- 顧客テスト ---');
  
  // 顧客一覧の取得
  const customers = await prisma.customers.findMany();
  console.log(`顧客数: ${customers.length}`);
  
  if (customers.length === 0) {
    console.warn('警告: 顧客が存在しません。先にテストデータを作成してください。');
    return;
  }
  
  // 顧客情報の確認
  const customer = customers[0];
  console.log('顧客情報:', {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    origin_system: customer.origin_system
  });
  
  // テナントごとの顧客数
  const customersByTenant = await prisma.customers.groupBy({
    by: ['tenant_id'],
    _count: {
      id: true
    }
  });
  
  console.log('テナントごとの顧客数:');
  customersByTenant.forEach(item => {
    console.log(`- テナント ${item.tenant_id}: ${item._count.id}名`);
  });
  
  console.log('顧客テスト完了');
}

/**
 * デバイス関連のテスト
 */
async function testDevices() {
  console.log('\n--- デバイステスト ---');
  
  // デバイス一覧の取得
  const devices = await prisma.additionalDevices.findMany();
  console.log(`デバイス数: ${devices.length}`);
  
  if (devices.length === 0) {
    console.warn('警告: デバイスが存在しません。先にテストデータを作成してください。');
    return;
  }
  
  // デバイス情報の確認
  const device = devices[0];
  console.log('デバイス情報:', {
    id: device.id,
    deviceType: device.deviceType,
    deviceName: device.deviceName,
    monthlyCost: device.monthlyCost,
    status: device.status
  });
  
  // テナントごとのデバイス数
  const devicesByTenant = await prisma.additionalDevices.groupBy({
    by: ['tenantId'],
    _count: {
      id: true
    },
    _sum: {
      monthlyCost: true
    }
  });
  
  console.log('テナントごとのデバイス情報:');
  devicesByTenant.forEach(item => {
    console.log(`- テナント ${item.tenantId}: ${item._count.id}台, 合計月額コスト: ${item._sum.monthlyCost}円`);
  });
  
  console.log('デバイステスト完了');
}

/**
 * システムイベント関連のテスト
 */
async function testSystemEvents() {
  console.log('\n--- システムイベントテスト ---');
  
  // システムイベント一覧の取得
  const events = await prisma.systemEvent.findMany();
  console.log(`システムイベント数: ${events.length}`);
  
  if (events.length === 0) {
    console.warn('警告: システムイベントが存在しません。先にテストデータを作成してください。');
    return;
  }
  
  // システムイベント情報の確認
  const event = events[0];
  console.log('システムイベント情報:', {
    id: event.id,
    tenantId: event.tenantId,
    eventType: event.eventType,
    action: event.action,
    sourceSystem: event.sourceSystem,
    targetSystem: event.targetSystem,
    entityType: event.entityType,
    entityId: event.entityId
  });
  
  console.log('システムイベントテスト完了');
}

/**
 * リレーション関連のテスト
 */
async function testRelations() {
  console.log('\n--- リレーションテスト ---');
  
  // テナントと関連するエンティティを取得
  const tenants = await prisma.tenant.findMany();
  
  if (tenants.length === 0) {
    console.warn('警告: テナントが存在しません。先にテストデータを作成してください。');
    return;
  }
  
  const tenant = tenants[0];
  
  // テナントに関連する顧客を取得
  const customers = await prisma.customers.findMany({
    where: { tenant_id: tenant.id }
  });
  
  // テナントに関連するデバイスを取得
  const devices = await prisma.additionalDevices.findMany({
    where: { tenantId: tenant.id }
  });
  
  // テナントに関連するシステムイベントを取得
  const events = await prisma.systemEvent.findMany({
    where: { tenantId: tenant.id }
  });
  
  console.log(`テナント ${tenant.id} のリレーション:`, {
    顧客数: customers.length,
    デバイス数: devices.length,
    イベント数: events.length
  });
  
  // 顧客とテナントのリレーション確認
  if (customers.length > 0) {
    const customer = customers[0];
    const customerWithTenant = await prisma.customers.findUnique({
      where: { id: customer.id },
      include: { Tenant: true }
    });
    
    console.log('顧客のテナント情報:', {
      顧客ID: customer.id,
      顧客名: customer.name,
      テナントID: customerWithTenant.Tenant.id,
      テナント名: customerWithTenant.Tenant.name
    });
  }
  
  console.log('リレーションテスト完了');
}

// スクリプト実行
runTests();