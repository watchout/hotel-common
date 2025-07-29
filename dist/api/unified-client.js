import { hotelDb } from '../database';
import { HotelLogger } from '../utils/logger';
export class HotelUnifiedApiClient {
    logger;
    config;
    db = hotelDb.getClient();
    constructor(config) {
        this.config = config;
        this.logger = HotelLogger.getInstance();
    }
    // =========================================
    // テナント管理
    // =========================================
    async getTenant() {
        try {
            return await this.db.tenant.findUnique({
                where: { id: this.config.tenantId }
            });
        }
        catch (error) {
            this.logger.error('Failed to get tenant', {
                tenantId: this.config.tenantId,
                error: error
            });
            return null;
        }
    }
    // =========================================
    // 顧客管理（hotel-member主管理）
    // =========================================
    async getCustomers(filters) {
        try {
            const where = {
                tenant_id: this.config.tenantId,
                deleted_at: null
            };
            if (filters?.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    { phone: { contains: filters.search } }
                ];
            }
            if (filters?.memberOnly) {
                where.member_id = { not: null };
            }
            const customers = await this.db.customers.findMany({
                where,
                take: filters?.limit || 50,
                skip: filters?.offset || 0,
                orderBy: { created_at: 'desc' }
            });
            // ソーストラッキング更新
            await this.updateSystemAccess('customer', 'read');
            return customers;
        }
        catch (error) {
            this.logger.error('Failed to get customers', { error: error });
            return [];
        }
    }
    async createCustomer(data) {
        try {
            const customer = await this.db.customers.create({
                data: {
                    id: `cust_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                    ...data,
                    tenant_id: this.config.tenantId,
                    origin_system: this.config.source,
                    updated_by_system: this.config.source,
                    updated_at: new Date()
                }
            });
            await this.logSystemEvent('customer', 'create', customer.id, data);
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to create customer', { error: error, data });
            return null;
        }
    }
    async updateCustomer(customerId, data, restrictUpdatableFields = true) {
        try {
            const existing = await this.db.customers.findUnique({
                where: { id: customerId }
            });
            if (!existing) {
                return null;
            }
            // PMS更新可能フィールド制限チェック
            if (restrictUpdatableFields && this.config.source === 'hotel-pms') {
                const allowedFields = existing.pms_updatable_fields || [];
                const updateData = {};
                Object.keys(data).forEach(key => {
                    if (allowedFields.includes(key) || ['updated_by_system', 'synced_at'].includes(key)) {
                        updateData[key] = data[key];
                    }
                });
                data = updateData;
            }
            const updated = await this.db.customers.update({
                where: { id: customerId },
                data: {
                    ...data,
                    updated_by_system: this.config.source,
                    synced_at: new Date()
                }
            });
            await this.logSystemEvent('customer', 'update', customerId, data, existing);
            return updated;
        }
        catch (error) {
            this.logger.error('Failed to update customer', { error: error, customerId, data });
            return null;
        }
    }
    // =========================================
    // 予約管理（hotel-pms中心）
    // =========================================
    async getReservations(filters) {
        try {
            const where = {
                tenant_id: this.config.tenantId,
                deleted_at: null
            };
            if (filters?.status?.length) {
                where.status = { in: filters.status };
            }
            if (filters?.dateFrom || filters?.dateTo) {
                where.AND = [];
                if (filters.dateFrom) {
                    where.AND.push({ checkin_date: { gte: filters.dateFrom } });
                }
                if (filters.dateTo) {
                    where.AND.push({ checkout_date: { lte: filters.dateTo } });
                }
            }
            if (filters?.customerId) {
                where.customer_id = filters.customerId;
            }
            const reservations = await this.db.reservation.findMany({
                where,
                include: {
                    customer: true
                },
                take: filters?.limit || 100,
                skip: filters?.offset || 0,
                orderBy: { checkin_date: 'asc' }
            });
            await this.updateSystemAccess('reservation', 'read');
            return reservations;
        }
        catch (error) {
            this.logger.error('Failed to get reservations', { error: error });
            return [];
        }
    }
    async createReservation(data) {
        try {
            const reservation = await this.db.reservation.create({
                data: {
                    ...data,
                    tenant_id: this.config.tenantId,
                    confirmation_code: this.generateConfirmationCode(),
                    origin_system: this.config.source,
                    updated_by_system: this.config.source,
                    status: 'PENDING'
                }
            });
            await this.logSystemEvent('reservation', 'create', reservation.id, data);
            return reservation;
        }
        catch (error) {
            this.logger.error('Failed to create reservation', { error: error, data });
            return null;
        }
    }
    // =========================================
    // システムイベント・監査ログ
    // =========================================
    async logSystemEvent(entityType, action, entityId, data, beforeData) {
        try {
            await this.db.systemEvent.create({
                data: {
                    tenantId: this.config.tenantId,
                    userId: this.config.userId,
                    eventType: this.getEventType(entityType),
                    sourceSystem: this.config.source,
                    targetSystem: 'hotel-common',
                    entityType: entityType,
                    entityId: entityId,
                    action: action.toUpperCase(),
                    eventData: data
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to log system event', { error: error });
        }
    }
    async updateSystemAccess(entityType, action) {
        // システム間アクセス追跡
        await this.logSystemEvent(entityType, action, 'system_access', {
            source_system: this.config.source,
            access_type: action,
            timestamp: new Date()
        });
    }
    getEventType(entityType) {
        const mapping = {
            'customer': 'CUSTOMER',
            'reservation': 'RESERVATION',
            'user': 'AUTH',
            'tenant': 'SYSTEM'
        };
        return mapping[entityType] || 'SYSTEM';
    }
    generateConfirmationCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
// ファクトリー関数
export function createUnifiedClient(config) {
    return new HotelUnifiedApiClient(config);
}
