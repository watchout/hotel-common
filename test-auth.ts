// test-auth.ts
import axios from 'axios';

// テスト設定
const API_BASE_URL = 'http://localhost:3400'; // サーバーのURLに合わせて変更してください
const TEST_EMAIL = 'admin@omotenasuai.com';
const TEST_PASSWORD = 'admin123';

// ログインテスト
async function testLogin() {
  console.log('🔑 ログインテスト開始...');
  
  try {
    // メールとパスワードのみでログイン
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('✅ ログイン成功!');
    console.log('📋 ユーザー情報:', loginResponse.data.data.user);
    console.log('🏢 現在のテナント:', loginResponse.data.data.tenant);
    console.log('🏢 利用可能なテナント一覧:');
    loginResponse.data.data.availableTenants.forEach((tenant: any) => {
      console.log(`  - ${tenant.name} (ID: ${tenant.id}, ロール: ${tenant.staffRole})`);
    });
    
    const accessToken = loginResponse.data.data.accessToken;
    const availableTenants = loginResponse.data.data.availableTenants;
    
    // 別のテナントがある場合はテナント切り替えをテスト
    if (availableTenants.length > 1) {
      await testSwitchTenant(accessToken, availableTenants[1].id);
    }
    
    // トークン検証のテスト
    await testValidateToken(accessToken);
    
    return true;
  } catch (error) {
    console.error('❌ ログインテスト失敗:', error.response?.data || error.message);
    return false;
  }
}

// テナント切り替えテスト
async function testSwitchTenant(accessToken: string, tenantId: string) {
  console.log(`\n🔄 テナント切り替えテスト開始... (テナントID: ${tenantId})`);
  
  try {
    const switchResponse = await axios.post(
      `${API_BASE_URL}/api/v1/auth/switch-tenant`,
      { tenantId },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    console.log('✅ テナント切り替え成功!');
    console.log('📋 ユーザー情報:', switchResponse.data.data.user);
    console.log('🏢 新しいテナント:', switchResponse.data.data.tenant);
    
    return true;
  } catch (error) {
    console.error('❌ テナント切り替えテスト失敗:', error.response?.data || error.message);
    return false;
  }
}

// トークン検証テスト
async function testValidateToken(accessToken: string) {
  console.log('\n🔐 トークン検証テスト開始...');
  
  try {
    const validateResponse = await axios.get(
      `${API_BASE_URL}/api/v1/auth/validate-token`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    console.log('✅ トークン検証成功!');
    console.log('📋 トークン情報:', validateResponse.data.data);
    
    return true;
  } catch (error) {
    console.error('❌ トークン検証テスト失敗:', error.response?.data || error.message);
    return false;
  }
}

// メイン実行関数
async function runTests() {
  console.log('🧪 認証システムテスト開始\n');
  
  const loginSuccess = await testLogin();
  
  if (loginSuccess) {
    console.log('\n✅ すべてのテストが正常に完了しました!');
  } else {
    console.log('\n❌ テストに失敗しました。エラーを確認してください。');
  }
}

// テスト実行
runTests().catch(error => {
  console.error('❌ テスト実行中にエラーが発生しました:', error);
});
