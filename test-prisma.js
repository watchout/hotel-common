const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function test() {
  try {
    const tenant = await prisma.tenant.create({
      data: {
        id: 'test-tenant-3',
        name: 'テストテナント1',
        domain: 'test2.example.com',
        contactName: '管理者',
        contactEmail: 'admin@test1.example.com',
        updatedAt: new Date()
      }
    });
    
    console.log('テナント作成成功:', tenant);
    
    // AdditionalDevicesモデルのテスト
    const device = await prisma.additionalDevices.create({
      data: {
        id: 'test-device-1',
        tenantId: tenant.id,
        deviceType: 'tablet',
        deviceName: 'テスト端末1',
        monthlyCost: 1200,
        updatedAt: new Date()
      }
    });
    
    console.log('デバイス作成成功:', device);
    
    // Customersモデルのテスト
    const customer = await prisma.customers.create({
      data: {
        id: 'test-customer-1',
        tenant_id: tenant.id,
        name: 'テスト顧客1',
        email: 'test1@example.com',
        phone: '090-1234-5678',
        updated_at: new Date()
      }
    });
    
    console.log('顧客作成成功:', customer);
    
  } catch (e) {
    console.error('エラー:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();