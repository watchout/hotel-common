/**
 * テスト用のテナントを作成するスクリプト
 */
const { PrismaClient } = require('../src/generated/prisma');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function createTestTenant() {
  try {
    // テスト用テナントの作成
    const tenant = await prisma.tenant.create({
      data: {
        id: 'test_tenant_1',
        name: 'テスト用テナント',
        domain: 'test-tenant-1.example.com'
      }
    });
    
    console.log('テスト用テナント作成完了:', tenant);
    
    // サービス利用情報の登録
    await prisma.tenant_services.create({
      data: {
        id: `ts_${uuidv4().substring(0, 8)}`,
        tenant_id: tenant.id,
        service_type: 'hotel-saas',
        plan_type: 'standard',
        is_active: true,
        activated_at: new Date(),
        service_config: {},
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('サービス利用情報登録完了: hotel-saas');
    
    await prisma.tenant_services.create({
      data: {
        id: `ts_${uuidv4().substring(0, 8)}`,
        tenant_id: tenant.id,
        service_type: 'hotel-pms',
        plan_type: 'standard',
        is_active: true,
        activated_at: new Date(),
        service_config: {},
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('サービス利用情報登録完了: hotel-pms');
    
    await prisma.tenant_services.create({
      data: {
        id: `ts_${uuidv4().substring(0, 8)}`,
        tenant_id: tenant.id,
        service_type: 'hotel-member',
        plan_type: 'standard',
        is_active: true,
        activated_at: new Date(),
        service_config: {},
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('サービス利用情報登録完了: hotel-member');
    
    console.log('テスト用テナントの作成が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
createTestTenant();