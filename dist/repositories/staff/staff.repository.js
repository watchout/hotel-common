"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRepository = void 0;
const prisma_1 = require("../../database/prisma");
const staff_helpers_1 = require("../../utils/staff-helpers");
class StaffRepository {
    adapter = (0, prisma_1.getHotelDb)().getAdapter();
    async list(params) {
        const { tenantId, page, pageSize, search, email, departmentCode, role, employmentStatus, baseLevel, isActive, createdAfter, createdBefore, lastLoginAfter, lastLoginBefore, sortBy, sortOrder } = params;
        const where = (0, staff_helpers_1.buildStaffSearchWhere)({
            tenantId,
            search,
            email,
            departmentCode,
            role,
            employmentStatus,
            baseLevel,
            isActive,
            createdAfter,
            createdBefore,
            lastLoginAfter,
            lastLoginBefore
        });
        let orderBy = {};
        switch (sortBy) {
            case 'displayName':
                orderBy = { name: sortOrder };
                break;
            case 'email':
                orderBy = { email: sortOrder };
                break;
            case 'lastLoginAt':
                orderBy = { last_login_at: sortOrder };
                break;
            case 'createdAt':
                orderBy = { created_at: sortOrder };
                break;
            case 'staffCode':
                orderBy = { id: sortOrder };
                break;
            // role / departmentCode / baseLevel はスキーマにないため name へフォールバック
            case 'role':
            case 'departmentCode':
            case 'baseLevel':
            default:
                orderBy = { name: 'asc' };
        }
        const [rows, total, activeCount, inactiveCount] = await Promise.all([
            this.adapter.staff.findMany({
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            this.adapter.staff.count({ where }),
            this.adapter.staff.count({ where: { ...where, is_active: true } }),
            this.adapter.staff.count({ where: { ...where, is_active: false } })
        ]);
        return {
            items: rows.map(staff_helpers_1.mapStaffToSummary),
            pagination: (0, staff_helpers_1.createPaginationInfo)(total, page, pageSize),
            summary: {
                totalStaff: total,
                activeStaff: activeCount,
                inactiveStaff: inactiveCount,
                departmentCounts: {}
            }
        };
    }
}
exports.StaffRepository = StaffRepository;
