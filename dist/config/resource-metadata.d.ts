/** @req: REQ-API-GEN-000 */
/**
 * 汎用CRUD メタデータ定義
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 *
 * 各リソースの権限・検索フィールド・デフォルトソート順を定義
 */
export interface ResourceMetadata {
    model: string;
    perms: {
        list: string;
        view: string;
        write: string;
    };
    searchFields: string[];
    orderByDefault: Record<string, 'asc' | 'desc'>;
    tenantField?: string;
}
/**
 * サポート対象リソースのメタデータマップ
 */
export declare const resourceMetadata: Record<string, ResourceMetadata>;
/**
 * リソース名からメタデータを取得
 * @param resource リソース名（例: 'staff'）
 * @returns メタデータ（未サポートの場合はnull）
 */
export declare function getResourceMetadata(resource: string): ResourceMetadata | null;
/**
 * サポート対象リソース一覧を取得
 */
export declare function getSupportedResources(): string[];
