"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyApiManager = void 0;
const database_1 = require("../database");
const logger_1 = require("../utils/logger");
const permission_manager_1 = require("./permission-manager");
/**
 * Hotel Group階層管理API操作クラス
 *
 * 機能:
 * - 組織階層のCRUD操作
 * - データ共有ポリシー管理
 * - 階層変更イベント発行
 * - プリセット適用
 */
class HierarchyApiManager {
    static logger = logger_1.HotelLogger.getInstance();
    /**
     * 組織作成
     */
    static async createOrganization(data, userId) {
        try {
            this.logger.info(`組織作成開始: ${data.name} (${data.organization_type})`);
            // 1. 親組織検証
            let level = 1;
            let path = data.code;
            if (data.parent_id) {
                const parent = await database_1.hotelDb.organization_hierarchy.findUnique({
                    where: { id: data.parent_id },
                    select: { level: true, path: true }
                });
                if (!parent) {
                    throw new Error('親組織が見つかりません');
                }
                level = parent.level + 1;
                path = `${parent.path}/${data.code}`;
                if (level > 4) {
                    throw new Error('階層レベルが最大値を超えています（最大4階層）');
                }
            }
            // 2. 組織作成
            const organization = await database_1.hotelDb.organization_hierarchy.create({
                data: {
                    organization_type: data.organization_type,
                    name: data.name,
                    code: data.code,
                    parent_id: data.parent_id,
                    level,
                    path,
                    settings: data.settings || {}
                }
            });
            // 3. デフォルトデータ共有ポリシー作成
            await this.createDefaultDataPolicies(organization.id, data.organization_type);
            // 4. 変更イベント発行
            await this.publishHierarchyChangeEvent({
                operation: 'CREATE',
                organization_id: organization.id,
                user_id: userId,
                after_state: organization,
                affected_children: [],
                affected_tenants: []
            });
            this.logger.info(`組織作成完了: ${organization.id} (${data.name})`);
            return organization;
        }
        catch (error) {
            this.logger.error('組織作成エラー:', error);
            throw error;
        }
    }
    /**
     * 組織更新
     */
    static async updateOrganization(organizationId, data, userId) {
        try {
            // 1. 既存組織取得
            const beforeState = await database_1.hotelDb.organization_hierarchy.findUnique({
                where: { id: organizationId }
            });
            if (!beforeState) {
                throw new Error('組織が見つかりません');
            }
            // 2. パス更新が必要かチェック
            let updateData = { ...data };
            if (data.code && data.code !== beforeState.code) {
                const newPath = await this.calculateNewPath(organizationId, data.code);
                // @ts-ignore - 型定義が不完全
                updateData = { ...updateData, path: newPath };
            }
            // 3. 組織更新
            const organization = await database_1.hotelDb.organization_hierarchy.update({
                where: { id: organizationId },
                data: updateData
            });
            // 4. 子組織のパス更新（コード変更時）
            if (data.code && data.code !== beforeState.code) {
                await this.updateChildrenPaths(organizationId, organization.path);
            }
            // 5. 変更イベント発行
            await this.publishHierarchyChangeEvent({
                operation: 'UPDATE',
                organization_id: organizationId,
                user_id: userId,
                before_state: beforeState,
                after_state: organization,
                affected_children: await this.getAffectedChildren(organizationId),
                affected_tenants: await this.getAffectedTenants(organizationId)
            });
            // 6. キャッシュ無効化
            // @ts-ignore - 型定義が不完全
            await permission_manager_1.HierarchyPermissionManager.invalidateHierarchyCache(organizationId);
            this.logger.info(`組織更新完了: ${organizationId} (変更: ${Object.keys(data).join(', ')})`);
            return organization;
        }
        catch (error) {
            this.logger.error('組織更新エラー:', error);
            throw error;
        }
    }
    /**
     * 組織削除（論理削除）
     */
    static async deleteOrganization(organizationId, userId) {
        try {
            // 1. 子組織存在確認
            const childCount = await database_1.hotelDb.organization_hierarchy.count({
                where: {
                    parent_id: organizationId,
                    deleted_at: null
                }
            });
            if (childCount > 0) {
                throw new Error('子組織が存在するため削除できません');
            }
            // 2. 関連テナント確認
            const tenantCount = await database_1.hotelDb.tenant_organization.count({
                where: {
                    organization_id: organizationId,
                    effective_until: null
                }
            });
            if (tenantCount > 0) {
                throw new Error('関連するテナントが存在するため削除できません');
            }
            // 3. 削除前の状態保存
            const beforeState = await database_1.hotelDb.organization_hierarchy.findUnique({
                where: { id: organizationId }
            });
            // 4. 論理削除実行
            await database_1.hotelDb.organization_hierarchy.update({
                where: { id: organizationId },
                data: {
                    deleted_at: new Date()
                }
            });
            // 5. 変更イベント発行
            await this.publishHierarchyChangeEvent({
                operation: 'DELETE',
                organization_id: organizationId,
                user_id: userId,
                before_state: beforeState,
                affected_children: [],
                affected_tenants: []
            });
            // 6. キャッシュ無効化
            // @ts-ignore - 型定義が不完全
            await permission_manager_1.HierarchyPermissionManager.invalidateHierarchyCache(organizationId);
            this.logger.info(`組織削除完了: ${organizationId}`);
        }
        catch (error) {
            this.logger.error('組織削除エラー:', error);
            throw error;
        }
    }
    /**
     * データ共有ポリシー設定
     */
    static async setDataSharingPolicy(organizationId, policies, userId) {
        try {
            const results = [];
            for (const policy of policies) {
                const result = await database_1.hotelDb.data_sharing_policy.upsert({
                    where: {
                        organization_id_data_type: {
                            organization_id: organizationId,
                            data_type: policy.data_type
                        }
                    },
                    create: {
                        organization_id: organizationId,
                        data_type: policy.data_type,
                        sharing_scope: policy.sharing_scope,
                        access_level: policy.access_level,
                        conditions: policy.conditions || {}
                    },
                    update: {
                        sharing_scope: policy.sharing_scope,
                        access_level: policy.access_level,
                        conditions: policy.conditions || {},
                        updated_at: new Date()
                    }
                });
                results.push(result);
            }
            // キャッシュ無効化
            // @ts-ignore - 型定義が不完全
            await permission_manager_1.HierarchyPermissionManager.invalidateHierarchyCache(organizationId);
            this.logger.info(`データ共有ポリシー設定完了: ${organizationId} (ポリシー数: ${policies.length})`);
            return results;
        }
        catch (error) {
            this.logger.error('データ共有ポリシー設定エラー:', error);
            throw error;
        }
    }
    /**
     * プリセット適用
     */
    static async applyPreset(organizationId, presetId, userId) {
        try {
            const { HIERARCHY_PRESETS } = await Promise.resolve().then(() => __importStar(require('./types')));
            const preset = HIERARCHY_PRESETS[presetId];
            if (!preset) {
                throw new Error(`プリセットが見つかりません: ${presetId}`);
            }
            // プリセットのデータポリシーを適用
            const policies = Object.entries(preset.data_policies).map(([dataType, policy]) => ({
                data_type: dataType,
                sharing_scope: policy.sharing_scope,
                access_level: policy.access_level,
                conditions: policy.conditions || {}
            }));
            await this.setDataSharingPolicy(organizationId, policies, userId);
            // 組織設定更新
            await database_1.hotelDb.organization_hierarchy.update({
                where: { id: organizationId },
                data: {
                    settings: {
                        applied_preset: presetId,
                        preset_features: preset.features,
                        applied_at: new Date().toISOString(),
                        applied_by: userId
                    }
                }
            });
            this.logger.info(`プリセット適用完了: ${organizationId} (プリセット: ${preset.name})`);
        }
        catch (error) {
            this.logger.error('プリセット適用エラー:', error);
            throw error;
        }
    }
    /**
     * テナント-組織関係設定
     */
    static async linkTenantToOrganization(tenantId, organizationId, role = 'PRIMARY') {
        try {
            await database_1.hotelDb.tenant_organization.create({
                data: {
                    tenant_id: tenantId,
                    organization_id: organizationId,
                    role
                }
            });
            // キャッシュ無効化
            // @ts-ignore - 型定義が不完全
            await permission_manager_1.HierarchyPermissionManager.invalidateHierarchyCache(organizationId);
            this.logger.info(`テナント-組織関係設定完了: ${tenantId} -> ${organizationId} (${role})`);
        }
        catch (error) {
            this.logger.error('テナント-組織関係設定エラー:', error);
            throw error;
        }
    }
    /**
     * デフォルトデータポリシー作成
     */
    static async createDefaultDataPolicies(organizationId, organizationType) {
        const { HierarchicalJwtManager } = await Promise.resolve().then(() => __importStar(require('./jwt-extension')));
        const defaultPolicies = HierarchicalJwtManager['getDefaultDataPolicies'](organizationType);
        const policies = Object.entries(defaultPolicies).map(([dataType, policy]) => ({
            organization_id: organizationId,
            data_type: dataType,
            sharing_scope: policy.scope,
            access_level: policy.level,
            conditions: policy.conditions || {}
        }));
        await database_1.hotelDb.data_sharing_policy.createMany({
            data: policies
        });
    }
    /**
     * 新しいパス計算
     */
    static async calculateNewPath(organizationId, newCode) {
        const organization = await database_1.hotelDb.organization_hierarchy.findUnique({
            where: { id: organizationId },
            select: { parent_id: true, level: true }
        });
        if (!organization) {
            throw new Error('組織が見つかりません');
        }
        if (organization.level === 1) {
            return newCode;
        }
        const parent = await database_1.hotelDb.organization_hierarchy.findUnique({
            where: { id: organization.parent_id },
            select: { path: true }
        });
        return `${parent.path}/${newCode}`;
    }
    /**
     * 子組織のパス更新
     */
    static async updateChildrenPaths(organizationId, newParentPath) {
        const children = await database_1.hotelDb.organization_hierarchy.findMany({
            where: { parent_id: organizationId },
            select: { id: true, code: true }
        });
        for (const child of children) {
            const newChildPath = `${newParentPath}/${child.code}`;
            await database_1.hotelDb.organization_hierarchy.update({
                where: { id: child.id },
                data: { path: newChildPath }
            });
            // 再帰的に子の子も更新
            await this.updateChildrenPaths(child.id, newChildPath);
        }
    }
    /**
     * 影響を受ける子組織ID取得
     */
    static async getAffectedChildren(organizationId) {
        const children = await database_1.hotelDb.organization_hierarchy.findMany({
            where: {
                path: {
                    startsWith: await this.getOrganizationPath(organizationId)
                },
                deleted_at: null
            },
            select: { id: true }
        });
        return children.map((c) => c.id);
    }
    /**
     * 影響を受けるテナントID取得
     */
    static async getAffectedTenants(organizationId) {
        return await permission_manager_1.HierarchyPermissionManager.getAccessibleTenants(organizationId);
    }
    /**
     * 組織パス取得
     */
    static async getOrganizationPath(organizationId) {
        const org = await database_1.hotelDb.organization_hierarchy.findUnique({
            where: { id: organizationId },
            select: { path: true }
        });
        return org?.path || '';
    }
    /**
     * 階層変更イベント発行
     */
    static async publishHierarchyChangeEvent(event) {
        try {
            const { HotelEventPublisher } = await Promise.resolve().then(() => __importStar(require('../events/event-publisher')));
            const hierarchyEvent = {
                event_id: `hierarchy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                event_type: 'HIERARCHY_CHANGE',
                operation: event.operation,
                organization_id: event.organization_id,
                user_id: event.user_id,
                before_state: event.before_state,
                after_state: event.after_state,
                affected_children: event.affected_children || [],
                affected_tenants: event.affected_tenants || [],
                data_access_changes: {
                    added: [],
                    modified: [],
                    removed: []
                },
                timestamp: new Date(),
                reason: event.reason
            };
            // @ts-ignore - 型定義が不完全
            await HotelEventPublisher.publishEvent({
                type: 'system.hierarchy.changed',
                source_system: 'hotel-common',
                target_systems: ['hotel-member', 'hotel-pms', 'hotel-saas'],
                data: hierarchyEvent,
                priority: 'high',
                sync_mode: 'realtime'
            });
        }
        catch (error) {
            this.logger.error('階層変更イベント発行エラー:', error);
            // イベント発行失敗は非致命的なため、処理を継続
        }
    }
}
exports.HierarchyApiManager = HierarchyApiManager;
