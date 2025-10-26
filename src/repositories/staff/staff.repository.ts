import { getHotelDb } from '../../database/prisma';
import { buildStaffSearchWhere, mapStaffToSummary, createPaginationInfo } from '../../utils/staff-helpers';

interface StaffListParams {
  tenantId: string;
  page: number;
  pageSize: number;
  search?: string;
  email?: string;
  departmentCode?: string;
  role?: string;
  employmentStatus?: string;
  baseLevel?: number;
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  sortBy: 'displayName' | 'staffCode' | 'departmentCode' | 'baseLevel' | 'lastLoginAt' | 'createdAt' | 'email' | 'role';
  sortOrder: 'asc' | 'desc';
}

export class StaffRepository {
  private adapter = getHotelDb().getAdapter();

  async list(params: StaffListParams) {
    const {
      tenantId,
      page,
      pageSize,
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
      lastLoginBefore,
      sortBy,
      sortOrder
    } = params;

    const where = buildStaffSearchWhere({
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

    let orderBy: any = {};
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
      items: rows.map(mapStaffToSummary),
      pagination: createPaginationInfo(total, page, pageSize),
      summary: {
        totalStaff: total,
        activeStaff: activeCount,
        inactiveStaff: inactiveCount,
        departmentCounts: {} as Record<string, number>
      }
    };
  }
}


