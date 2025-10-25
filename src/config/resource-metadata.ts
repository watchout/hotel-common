/** @req: REQ-API-GEN-000 */
/**
 * 汎用CRUD メタデータ定義
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 *
 * 各リソースの権限・検索フィールド・デフォルトソート順を定義
 */

export interface ResourceMetadata {
  model: string; // Prismaモデル名
  perms: {
    list: string;    // 一覧表示権限
    view: string;    // 詳細表示権限
    write: string;   // 作成/更新/削除権限
  };
  searchFields: string[]; // 検索対象フィールド
  orderByDefault: Record<string, 'asc' | 'desc'>; // デフォルトソート
  tenantField?: string; // テナント分離フィールド名（デフォルト: tenant_id）
}

/**
 * サポート対象リソースのメタデータマップ
 */
export const resourceMetadata: Record<string, ResourceMetadata> = {
  staff: {
    model: 'staff',
    perms: {
      list: 'system:staff:view',
      view: 'system:staff:view',
      write: 'system:staff:manage'
    },
    searchFields: ['email', 'name'],
    orderByDefault: { created_at: 'desc' }
  }
  // 将来的に追加予定:
  // roles: { ... },
  // permissions: { ... },
};

/**
 * リソース名からメタデータを取得
 * @param resource リソース名（例: 'staff'）
 * @returns メタデータ（未サポートの場合はnull）
 */
export function getResourceMetadata(resource: string): ResourceMetadata | null {
  return resourceMetadata[resource] || null;
}

/**
 * サポート対象リソース一覧を取得
 */
export function getSupportedResources(): string[] {
  return Object.keys(resourceMetadata);
}
