"use strict";
// Hotel Group階層権限管理 - 型定義
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIERARCHY_PRESETS = void 0;
/**
 * よく使用されるプリセット定義
 */
exports.HIERARCHY_PRESETS = {
    'complete-integration': {
        id: 'complete-integration',
        name: '完全統合型（星野リゾート型）',
        description: 'グループ全体でデータ完全共有、統一運営',
        organization_type: 'GROUP',
        data_policies: {
            CUSTOMER: { sharing_scope: 'GROUP', access_level: 'FULL' },
            RESERVATION: { sharing_scope: 'GROUP', access_level: 'FULL' },
            ANALYTICS: { sharing_scope: 'GROUP', access_level: 'FULL' },
            FINANCIAL: { sharing_scope: 'GROUP', access_level: 'FULL' },
            STAFF: { sharing_scope: 'GROUP', access_level: 'FULL' },
            INVENTORY: { sharing_scope: 'GROUP', access_level: 'FULL' }
        },
        features: {
            cross_brand_loyalty: true,
            unified_pricing: true
        }
    },
    'brand-separation': {
        id: 'brand-separation',
        name: 'ブランド別管理型（アパグループ型）',
        description: 'ブランド単位でデータ管理、グループ分析のみ共有',
        organization_type: 'BRAND',
        data_policies: {
            CUSTOMER: { sharing_scope: 'BRAND', access_level: 'FULL' },
            RESERVATION: { sharing_scope: 'BRAND', access_level: 'FULL' },
            ANALYTICS: { sharing_scope: 'GROUP', access_level: 'SUMMARY_ONLY' },
            FINANCIAL: { sharing_scope: 'BRAND', access_level: 'FULL' },
            STAFF: { sharing_scope: 'BRAND', access_level: 'FULL' },
            INVENTORY: { sharing_scope: 'BRAND', access_level: 'FULL' }
        },
        features: {
            brand_independent_pricing: true,
            separate_loyalty_programs: true
        }
    },
    'hotel-independence': {
        id: 'hotel-independence',
        name: '完全分離型（単独店舗型）',
        description: '店舗完全独立、最小限のグループ集計のみ',
        organization_type: 'HOTEL',
        data_policies: {
            CUSTOMER: { sharing_scope: 'HOTEL', access_level: 'FULL' },
            RESERVATION: { sharing_scope: 'HOTEL', access_level: 'FULL' },
            ANALYTICS: { sharing_scope: 'HOTEL', access_level: 'FULL' },
            FINANCIAL: { sharing_scope: 'HOTEL', access_level: 'FULL' },
            STAFF: { sharing_scope: 'HOTEL', access_level: 'FULL' },
            INVENTORY: { sharing_scope: 'HOTEL', access_level: 'FULL' }
        },
        features: {
            independent_operation: true
        }
    }
};
