import { config } from 'dotenv';
import * as jwt from 'jsonwebtoken';

config();

const JWT_SECRET = process.env.JWT_SECRET || 'hotel-common-secret-change-in-production';

/**
 * 開発用JWTトークン生成ユーティリティ
 * 本番同等の有効なトークンを生成
 */
export class DevTokenGenerator {
  
  /**
   * 開発用管理者トークン生成
   */
  static generateAdminToken(tenantId = 'default'): string {
    const payload = {
      user_id: 'dev-admin-001',
      tenant_id: tenantId,
      email: 'admin@hotel-common.dev',
      role: 'ADMIN',
      level: 1,
      permissions: ['admin:all', 'tenant:read', 'tenant:write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24時間有効
      jti: `dev-admin-${Date.now()}`,
      accessible_tenants: [tenantId],
      hierarchy_context: {
        organization_id: 'dev-org',
        organization_level: 1 as const,
        organization_type: 'GROUP' as const,
        organization_path: '/dev-org',
        access_scope: ['all'],
        data_access_policies: {}
      }
    };

    return jwt.sign(payload, JWT_SECRET);
  }

  /**
   * 開発用スタッフトークン生成
   */
  static generateStaffToken(tenantId = 'default'): string {
    const payload = {
      user_id: 'dev-staff-001',
      tenant_id: tenantId,
      email: 'staff@hotel-common.dev',
      role: 'STAFF',
      level: 3,
      permissions: ['tenant:read', 'tenant:write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24時間有効
      jti: `dev-staff-${Date.now()}`,
      accessible_tenants: [tenantId],
      hierarchy_context: {
        organization_id: 'dev-org',
        organization_level: 3 as const,
        organization_type: 'HOTEL' as const,
        organization_path: '/dev-org/hotel',
        access_scope: ['tenant'],
        data_access_policies: {}
      }
    };

    return jwt.sign(payload, JWT_SECRET);
  }

  /**
   * 開発用ゲストトークン生成
   */
  static generateGuestToken(tenantId = 'default'): string {
    const payload = {
      user_id: 'dev-guest-001',
      tenant_id: tenantId,
      email: 'guest@hotel-common.dev',
      role: 'GUEST',
      level: 5,
      permissions: ['guest:read'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24時間有効
      jti: `dev-guest-${Date.now()}`,
      accessible_tenants: [tenantId],
      hierarchy_context: {
        organization_id: 'dev-org',
        organization_level: 5 as const,
        organization_type: 'ROOM' as const,
        organization_path: '/dev-org/hotel/room',
        access_scope: ['self'],
        data_access_policies: {}
      }
    };

    return jwt.sign(payload, JWT_SECRET);
  }

  /**
   * トークンの検証・デコード
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error(`Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 開発用トークン一覧表示
   */
  static displayDevTokens(tenantId = 'default'): void {
    const adminToken = this.generateAdminToken(tenantId);
    const staffToken = this.generateStaffToken(tenantId);
    const guestToken = this.generateGuestToken(tenantId);

    console.log('🔑 開発用JWTトークン一覧');
    console.log('================================');
    console.log(`テナントID: ${tenantId}`);
    console.log('');
    console.log('👑 管理者トークン (ADMIN):');
    console.log(adminToken);
    console.log('');
    console.log('👨‍💼 スタッフトークン (STAFF):');
    console.log(staffToken);
    console.log('');
    console.log('👤 ゲストトークン (GUEST):');
    console.log(guestToken);
    console.log('');
    console.log('📋 使用例:');
    console.log(`curl -H "Authorization: Bearer ${adminToken}" http://localhost:3400/api/v1/sessions`);
  }
}

// CLI実行時の処理
if (require.main === module) {
  const tenantId = process.argv[2] || 'default';
  DevTokenGenerator.displayDevTokens(tenantId);
}

export default DevTokenGenerator;

