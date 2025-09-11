/**
 * テナントサービス管理APIのテスト
 */
const { 
  getTenantServices, 
  updateTenantService, 
  getServicePlanRestrictions,
  checkServiceAccess
} = require('../api/tenant-service-api');

// テスト用のテナントID
const TEST_TENANT_ID = 'test_tenant_1';

async function testTenantServiceAPI() {
  console.log('===== テナントサービス管理APIテスト =====');

  try {
    // 1. テナントのサービス利用状況を取得
    console.log('\n1. テナントのサービス利用状況を取得');
    const servicesResult = await getTenantServices(TEST_TENANT_ID);
    console.log('結果:', servicesResult);

    // 2. サービスのプラン制限を取得
    console.log('\n2. サービスのプラン制限を取得');
    const planResult = await getServicePlanRestrictions('hotel-saas', 'premium', 'omotenasuai');
    console.log('結果:', planResult);

    // 3. テナントのサービス利用状況を更新
    console.log('\n3. テナントのサービス利用状況を更新');
    const updateResult = await updateTenantService(TEST_TENANT_ID, 'hotel-saas', 'premium', true);
    console.log('結果:', updateResult);

    // 4. サービスアクセス権を確認
    console.log('\n4. サービスアクセス権を確認');
    const accessResult = await checkServiceAccess(TEST_TENANT_ID, 'hotel-saas');
    console.log('結果:', accessResult);

    console.log('\n===== テスト完了 =====');
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
  }
}

// テスト実行
testTenantServiceAPI();