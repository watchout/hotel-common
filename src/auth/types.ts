/**
 * 階層型JWT認証ペイロード
 */
export interface HierarchicalJWTPayload {
  user_id: string;
  id?: string; // 後方互換性のため
  email: string; // 必須に変更
  name?: string;
  role: 'STAFF' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'OWNER' | 'SYSTEM'; // USERを削除、SUPER_ADMINを追加
  tenant_id: string;
  hierarchy_context: { // 必須に変更
    organization_id: string;
    organization_level: 1 | 2 | 3 | 4; // HierarchyLevel型と互換性を持たせる
    organization_type: 'GROUP' | 'BRAND' | 'HOTEL' | 'DEPARTMENT'; // OrganizationType型と互換性を持たせる
    level?: number; // 後方互換性のため
    path?: string; // 後方互換性のため
    organization_path: string; // hierarchy/typesとの互換性のため
    access_scope: string[]; // hierarchy/typesとの互換性のため
    data_access_policies: Record<string, any>; // hierarchy/typesとの互換性のため
  };
  permissions: string[]; // 必須に変更
  iat: number; // 必須に変更
  exp: number; // 必須に変更
  jti: string; // 必須に変更
  level: number; // 必須に変更
  accessible_tenants: string[]; // 必須に変更
  type?: 'access' | 'refresh'; // トークンタイプ（リフレッシュトークン用）
}

/**
 * JWT設定オプション
 */
export interface JWTOptions {
  secret: string;
  expiresIn: string | number;
}
