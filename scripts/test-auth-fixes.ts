#!/usr/bin/env tsx
/**
 * 認証修正内容のテストスクリプト
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3400';

interface TestResult {
  name: string;
  success: boolean;
  details: any;
}

async function testAuthFixes(): Promise<void> {
  const results: TestResult[] = [];
  
  console.log('🔧 認証修正内容のテスト開始\n');

  // 1. ログインテスト（JWTペイロード確認）
  try {
    console.log('1️⃣ ログインテスト（JWTペイロード確認）');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'admin@omotenasuai.com',
      password: 'password123',
      tenantId: 'default'
    });

    const { accessToken } = loginResponse.data.data;
    
    // JWTデコード（検証なし）
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    
    console.log('✅ JWT Payload:', {
      user_id: payload.user_id,
      tenant_id: payload.tenant_id,
      accessible_tenants: payload.accessible_tenants,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
      exp: new Date(payload.exp * 1000).toISOString()
    });

    // accessible_tenants検証
    const hasAccessibleTenants = Array.isArray(payload.accessible_tenants);
    const tenantIdInAccessible = payload.accessible_tenants?.includes(payload.tenant_id);
    
    results.push({
      name: 'JWT Payload Structure',
      success: hasAccessibleTenants && tenantIdInAccessible,
      details: {
        hasAccessibleTenants,
        tenantIdInAccessible,
        accessible_tenants: payload.accessible_tenants
      }
    });

    // 2. /api/v1/admin/tenant/current テスト
    console.log('\n2️⃣ /api/v1/admin/tenant/current テスト');
    try {
      const currentTenantResponse = await axios.get(`${BASE_URL}/api/v1/admin/tenant/current`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Current Tenant Response:', {
        success: currentTenantResponse.data.success,
        tenant_id: currentTenantResponse.data.data.tenant?.id,
        user_accessible_tenants: currentTenantResponse.data.data.user?.accessible_tenants
      });

      results.push({
        name: 'Admin Tenant Current API',
        success: currentTenantResponse.data.success === true,
        details: currentTenantResponse.data
      });
    } catch (error: any) {
      console.log('❌ Current Tenant Error:', error.response?.data || error.message);
      results.push({
        name: 'Admin Tenant Current API',
        success: false,
        details: error.response?.data || error.message
      });
    }

    // 3. X-Tenant-ID不一致テスト
    console.log('\n3️⃣ X-Tenant-ID不一致テスト');
    try {
      await axios.get(`${BASE_URL}/api/v1/admin/tenant/current`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Tenant-ID': 'wrong-tenant-id',
          'Content-Type': 'application/json'
        }
      });
      
      results.push({
        name: 'X-Tenant-ID Mismatch Validation',
        success: false,
        details: 'Expected 400 error but got success'
      });
    } catch (error: any) {
      const is400Error = error.response?.status === 400;
      const isTenantMismatch = error.response?.data?.error?.code === 'TENANT_MISMATCH';
      
      console.log('✅ X-Tenant-ID Mismatch Response:', {
        status: error.response?.status,
        error_code: error.response?.data?.error?.code,
        message: error.response?.data?.error?.message
      });

      results.push({
        name: 'X-Tenant-ID Mismatch Validation',
        success: is400Error && isTenantMismatch,
        details: {
          status: error.response?.status,
          error_code: error.response?.data?.error?.code,
          expected_400: is400Error,
          expected_tenant_mismatch: isTenantMismatch
        }
      });
    }

    // 4. Switch Tenant テスト
    console.log('\n4️⃣ Switch Tenant テスト');
    try {
      const switchResponse = await axios.post(`${BASE_URL}/api/v1/auth/switch-tenant`, {
        tenantId: 'default'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const hasAccessToken = !!switchResponse.data.data.accessToken;
      const hasRefreshToken = !!switchResponse.data.data.refreshToken;
      const hasExpiresIn = typeof switchResponse.data.data.expiresIn === 'number';
      const hasTokenType = switchResponse.data.data.tokenType === 'Bearer';

      console.log('✅ Switch Tenant Response:', {
        success: switchResponse.data.success,
        hasAccessToken,
        hasRefreshToken,
        expiresIn: switchResponse.data.data.expiresIn,
        tokenType: switchResponse.data.data.tokenType,
        hasExpiresIn,
        hasTokenType
      });

      results.push({
        name: 'Switch Tenant API',
        success: hasAccessToken && hasRefreshToken && hasExpiresIn && hasTokenType,
        details: {
          hasAccessToken,
          hasRefreshToken,
          hasExpiresIn,
          hasTokenType,
          response: switchResponse.data.data
        }
      });
    } catch (error: any) {
      console.log('❌ Switch Tenant Error:', error.response?.data || error.message);
      results.push({
        name: 'Switch Tenant API',
        success: false,
        details: error.response?.data || error.message
      });
    }

    // 5. Refresh Token テスト
    console.log('\n5️⃣ Refresh Token テスト');
    try {
      const refreshResponse = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
        refreshToken: loginResponse.data.data.refreshToken
      });

      const hasAccessToken = !!refreshResponse.data.data.accessToken;
      const hasRefreshToken = !!refreshResponse.data.data.refreshToken;
      const hasExpiresAt = !!refreshResponse.data.data.expires_at;

      console.log('✅ Refresh Token Response:', {
        success: refreshResponse.data.success,
        hasAccessToken,
        hasRefreshToken,
        expires_at: refreshResponse.data.data.expires_at,
        actualResponse: refreshResponse.data.data
      });

      results.push({
        name: 'Refresh Token API',
        success: hasAccessToken && hasRefreshToken && hasExpiresAt,
        details: {
          hasAccessToken,
          hasRefreshToken,
          hasExpiresAt,
          response: refreshResponse.data.data
        }
      });
    } catch (error: any) {
      console.log('❌ Refresh Token Error:', error.response?.data || error.message);
      results.push({
        name: 'Refresh Token API',
        success: false,
        details: error.response?.data || error.message
      });
    }

  } catch (error: any) {
    console.log('❌ Login Error:', error.response?.data || error.message);
    results.push({
      name: 'Login Test',
      success: false,
      details: error.response?.data || error.message
    });
  }

  // 結果サマリー
  console.log('\n📊 テスト結果サマリー');
  console.log('='.repeat(50));
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log('='.repeat(50));
  console.log(`成功: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  if (successCount === totalCount) {
    console.log('🎉 すべてのテストが成功しました！');
  } else {
    console.log('⚠️  一部のテストが失敗しました。詳細を確認してください。');
  }
}

// スクリプト実行
if (require.main === module) {
  testAuthFixes().catch(console.error);
}
