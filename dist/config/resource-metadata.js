"use strict";
/** @req: REQ-API-GEN-000 */
/**
 * 汎用CRUD メタデータ定義
 * SSOT: SSOT_GENERIC_RESOURCES_API.md v1.0.0
 *
 * 各リソースの権限・検索フィールド・デフォルトソート順を定義
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceMetadata = void 0;
exports.getResourceMetadata = getResourceMetadata;
exports.getSupportedResources = getSupportedResources;
/**
 * サポート対象リソースのメタデータマップ
 */
exports.resourceMetadata = {
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
function getResourceMetadata(resource) {
    return exports.resourceMetadata[resource] || null;
}
/**
 * サポート対象リソース一覧を取得
 */
function getSupportedResources() {
    return Object.keys(exports.resourceMetadata);
}
