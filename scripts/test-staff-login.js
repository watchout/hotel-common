/**
 * スタッフログインテストスクリプト
 * 作成したテストスタッフでのログインをシミュレートします
 */

const { PrismaClient } = require('../src/generated/prisma');
const crypto = require('crypto');
const prisma = new PrismaClient();

// 簡易的なパスワードハッシュ関数（実際のシステムではもっと安全な方法を使用）
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// JWTトークン生成の簡易シミュレーション（実際のシステムでは適切なJWTライブラリを使用）
function generateMockJwt(staff, tenantData) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: "hotel-common-auth",
    sub: staff.id,
    aud: ["hotel-member", "hotel-pms", "hotel-saas"],
    exp: now + (8 * 60 * 60), // 8時間
    nbf: now,
    iat: now,
    jti: `jwt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    
    tenant_id: tenantData.id,
    email: staff.email,
    role: staff.positionTitle,
    level: staff.baseLevel,
    permissions: generateMockPermissions(staff.positionTitle),
    
    origin_system: "hotel-common",
    source_systems: ["hotel-member", "hotel-pms", "hotel-saas"],
    
    session_id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
  };
  
  // 実際のJWTではこれらはBase64エンコードして署名しますが、ここではモックとして文字列化
  return {
    token: `${JSON.stringify(header)}.${JSON.stringify(payload)}.MOCK_SIGNATURE`,
    payload
  };
}

// 役割に基づく権限の簡易生成
function generateMockPermissions(role) {
  const basePermissions = ["profile.read"];
  
  switch(role) {
    case 'ADMIN':
      return [
        ...basePermissions,
        "customer.read", "customer.write", "customer.delete",
        "reservation.read", "reservation.write", "reservation.delete",
        "staff.read", "staff.write", "staff.delete",
        "room.read", "room.write", "room.delete",
        "system.admin"
      ];
    case 'MANAGER':
      return [
        ...basePermissions,
        "customer.read", "customer.write",
        "reservation.read", "reservation.write",
        "staff.read",
        "room.read", "room.write"
      ];
    case 'STAFF':
    default:
      return [
        ...basePermissions,
        "customer.read",
        "reservation.read",
        "room.read"
      ];
  }
}

async function testStaffLogin() {
  try {
    console.log('スタッフログインテストを開始します...');
    
    // テスト用のログイン情報
    const testCredentials = [
      { email: 'staff1@example.com', password: 'password123', description: '管理者権限' },
      { email: 'staff2@example.com', password: 'password123', description: '一般スタッフ権限' },
      { email: 'staff3@example.com', password: 'password123', description: 'マネージャー権限' },
      { email: 'invalid@example.com', password: 'wrongpassword', description: '無効なユーザー' }
    ];
    
    for (const cred of testCredentials) {
      console.log(`\n--- ${cred.description} でログインを試行 ---`);
      console.log(`Email: ${cred.email}, Password: ${cred.password}`);
      
      // メールアドレスでスタッフを検索
      const staff = await prisma.staff.findUnique({
        where: { email: cred.email }
      });
      
      if (!staff) {
        console.log('❌ ログイン失敗: ユーザーが見つかりません');
        continue;
      }
      
      // テナント情報を取得
      const tenant = await prisma.tenant.findUnique({
        where: { id: staff.tenantId }
      });
      
      if (!tenant) {
        console.log('❌ ログイン失敗: テナント情報が見つかりません');
        continue;
      }
      
      // パスワードの検証
      const hashedPassword = hashPassword(cred.password);
      if (hashedPassword !== staff.passwordHash) {
        console.log('❌ ログイン失敗: パスワードが一致しません');
        
        // 実際のシステムではここで失敗ログイン回数をインクリメント
        console.log(`失敗ログイン回数を更新: ${staff.failedLoginCount} → ${staff.failedLoginCount + 1}`);
        continue;
      }
      
      // ログイン成功処理
      console.log('✅ ログイン成功!');
      console.log('スタッフ情報:', {
        id: staff.id,
        name: staff.displayName,
        role: staff.positionTitle,
        level: staff.baseLevel,
        tenant: tenant.name
      });
      
      // 最終ログイン日時の更新をシミュレート
      console.log('最終ログイン日時を更新:', new Date().toISOString());
      
      // JWTトークンの生成をシミュレート
      const jwt = generateMockJwt(staff, tenant);
      console.log('JWTトークン生成 (ペイロード):', {
        sub: jwt.payload.sub,
        email: jwt.payload.email,
        role: jwt.payload.role,
        level: jwt.payload.level,
        exp: new Date(jwt.payload.exp * 1000).toISOString(),
        permissions: jwt.payload.permissions
      });
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
testStaffLogin();