"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelUnifiedApiClient = void 0;
exports.createUnifiedClient = createUnifiedClient;
const database_1 = require("../database");
const logger_1 = require("../utils/logger");
class HotelUnifiedApiClient {
    logger;
    config;
    db = database_1.hotelDb.getAdapter();
    constructor(config) {
        this.config = config;
        this.logger = logger_1.HotelLogger.getInstance();
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where = {
                tenant_id: this.config.tenantId,
                deleted_at: null
            };
            if (filters?.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    { phone: { contains: filters.search } }
                ];
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            if (filters?.memberOnly) {
                where.member_id = { not: null };
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    }
    async createCustomer(data) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        }
        catch (error) {
            this.logger.error('Failed to create customer', { error: error, data });
            return null;
        }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    async updateCustomer(customerId, data, restrictUpdatableFields = true) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
            const existing = await this.db.customers.findUnique({
                where: { id: customerId }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!existing) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // PMS更新可能フィールド制限チェック
            if (restrictUpdatableFields && this.config.source === 'hotel-pms') {
                const allowedFields = existing.pms_updatable_fields || [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updateData = {};
                Object.keys(data).forEach(key => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    if (allowedFields.includes(key) || ['updated_by_system', 'synced_at'].includes(key)) {
                        updateData[key] = data[key];
                    }
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data = updateData;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
            const updated = await this.db.customers.update({
                where: { id: customerId },
                data: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...data,
                    updated_by_system: this.config.source,
                    synced_at: new Date()
                }
            });
            await this.logSystemEvent('customer', 'update', customerId, data, existing);
            return updated;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.logger.error('Failed to update customer', { error: error, customerId, data });
            return null;
        }
    }
    // =========================================
    // 予約管理（hotel-pms中心）
    // =========================================
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getReservations(filters) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where = {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                tenant_id: this.config.tenantId,
                deleted_at: null
            };
            if (filters?.status?.length) {
                where.status = { in: filters.status };
            }
            if (filters?.dateFrom || filters?.dateTo) {
                where.AND = [];
                if (filters.dateFrom) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    where.AND.push({ checkin_date: { gte: filters.dateFrom } });
                }
                if (filters.dateTo) {
                    where.AND.push({ checkout_date: { lte: filters.dateTo } });
                }
            }
            if (filters?.customerId) {
                where.customer_id = filters.customerId;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
            const reservations = await this.db.reservation.findMany({
                where,
                take: filters?.limit || 100,
                skip: filters?.offset || 0,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                orderBy: { checkinDate: 'asc' }
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
            const reservation = await this.db.reservation.create({
                data: {
                    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // 必須フィールド
                    tenantId: this.config.tenantId,
                    // user_idフィールドはスキーマに存在しないため削除
                    // customer_idフィールドもスキーマに存在しないため削除
                    roomId: 'room-default', // 必須フィールド
                    checkinDate: data.checkin_date,
                    checkoutDate: data.checkout_date,
                    adults: 1, // デフォルト値
                    children: 0, // デフォルト値
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    guestName: data.guest_name || 'Guest', // 必須フィールド
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    guestPhone: data.guest_phone,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    guestEmail: data.guest_email,
                    totalAmount: data.total_amount,
                    // base_rateフィールドはスキーマに存在しないため削除
                    confirmationNumber: this.generateConfirmationCode(),
                    status: 'pending', // スキーマのデフォルト値と一致させる
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // payment_statusフィールドはスキーマに存在しないため削除
                    specialRequests: data.special_requests
                }
            });
            await this.logSystemEvent('reservation', 'create', reservation.id, data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return reservation;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.logger.error('Failed to create reservation', { error: error, data });
            return null;
        }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // =========================================
    // システムイベント・監査ログ
    // =========================================
    async logSystemEvent(entityType, action, entityId, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beforeData) {
        try {
            await this.db.systemEvent.create({
                data: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore - フィールド名の不一致
                    tenantId: this.config.tenantId,
                    userId: this.config.userId,
                    eventType: this.getEventType(entityType),
                    sourceSystem: this.config.source,
                    targetSystem: 'hotel-common',
                    entityType: entityType,
                    entityId: entityId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
exports.HotelUnifiedApiClient = HotelUnifiedApiClient;
// ファクトリー関数
function createUnifiedClient(config) {
    return new HotelUnifiedApiClient(config);
}
