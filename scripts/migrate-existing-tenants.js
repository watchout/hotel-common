/**
 * 既存テナントのサービス利用情報を新しいテーブルに移行するスクリプト
 */
const { PrismaClient } = require('../src/generated/prisma');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function migrateExistingTenants() {
  console.log('既存テナントのサービス利用情報を移行します...');

  try {
    // 全テナントを取得
    const tenants = await prisma.tenant.findMany();

    console.log(`${tenants.length}件のテナントが見つかりました`);

    // 各テナントに対して処理
    for (const tenant of tenants) {
      console.log(`テナントID: ${tenant.id} (${tenant.name}) の処理中...`);

      // 現在のプラン情報を取得（デフォルト値を設定）
      const currentPlanType = 'standard';

      // 利用中のサービスを分析（実際の環境では、より複雑なロジックが必要かもしれません）
      // この例では、すべてのテナントがhotel-saasを利用していると仮定します

      // hotel-saasの利用状況（すべてのテナントが利用していると仮定）
      const usingSaas = true;

      // サービス利用情報を登録
      if (usingSaas) {
        await createTenantService(tenant.id, 'hotel-saas', currentPlanType);
        console.log(`✅ hotel-saas サービス登録完了`);
      }

      // 実際の環境では、hotel-pmsとhotel-memberの利用状況を確認する必要があります
      // ここでは簡略化のため、すべてのテナントが両方のサービスを利用していると仮定します
      await createTenantService(tenant.id, 'hotel-pms', currentPlanType);
      console.log(`✅ hotel-pms サービス登録完了`);

      await createTenantService(tenant.id, 'hotel-member', currentPlanType);
      console.log(`✅ hotel-member サービス登録完了`);

      console.log(`テナントID: ${tenant.id} の処理が完了しました`);
    }

    console.log('すべてのテナントの移行が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// テナントサービス情報を作成する関数
async function createTenantService(tenantId, serviceType, planType) {
  try {
    await prisma.tenant_services.create({
      data: {
        id: `ts_${uuidv4().substring(0, 8)}`,
        tenant_id: tenantId,
        service_type: serviceType,
        plan_type: planType,
        is_active: true,
        activated_at: new Date(),
        service_config: {},
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    return true;
  } catch (error) {
    if (error.code === 'P2002') {
      console.log(`⚠️ テナントID: ${tenantId} の ${serviceType} サービスはすでに登録されています`);
      return false;
    }
    throw error;
  }
}

// スクリプト実行
migrateExistingTenants();