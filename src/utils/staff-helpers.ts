/**
 * Staff管理API用ヘルパー関数
 * 既存のstaffテーブル構造を活用したマッピング・権限管理
 */

import * as bcrypt from 'bcrypt';

import { HotelLogger } from './logger';

const logger = HotelLogger.getInstance();

/**
 * roleフィールドをbaseLevelにマッピング
 */
export const getRoleLevel = (role: string): number => {
  const roleLevelMap: Record<string, number> = {
    'staff': 1,
    'supervisor': 2, 
    'manager': 3,
    'admin': 4,
    'super_admin': 5,
    'owner': 5
  };
  
  const level = roleLevelMap[role?.toLowerCase()] || 1;
  logger.debug('Role level mapping', { role, level });
  return level;
};

/**
 * Staff API レスポンス用インターface
 */
export interface StaffApiResponse {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  departmentCode: string;
  role: string;
  baseLevel: number;
  
  // 自動生成・推定フィールド
  staffCode: string;
  staffNumber: string;
  firstName: string | null;
  lastName: string | null;
  positionTitle: string | null;
  employmentType: string;
  employmentStatus: string;
  
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Staff一覧用サマリーレスポンス
 */
export interface StaffSummaryResponse {
  id: string;
  staffCode: string;
  displayName: string;
  email: string;
  departmentCode: string;
  positionTitle: string | null;
  baseLevel: number;
  employmentStatus: string;
  lastLoginAt: string | null;
  createdAt: string;
}

/**
 * 既存staffテーブルのデータをAPI仕様に合わせてマッピング
 */
export const mapStaffToApiResponse = (staff: any): StaffApiResponse => {
  // displayNameから姓名を分割（簡易的）
  const nameParts = staff.name?.split(' ') || ['', ''];
  const lastName = nameParts[0] || null;
  const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
  
  // スタッフコード生成（IDの末尾3桁を使用）
  const staffCode = `S${staff.id.slice(-3).toUpperCase()}`;
  const staffNumber = staff.id.slice(-3);
  
  return {
    id: staff.id,
    tenantId: staff.tenant_id,
    email: staff.email,
    displayName: staff.name || `${lastName} ${firstName}`.trim(),
    departmentCode: staff.department || 'GENERAL',
    role: staff.role || 'staff', // roleフィールドを追加
    baseLevel: getRoleLevel(staff.role),
    
    staffCode,
    staffNumber,
    firstName,
    lastName,
    positionTitle: null, // 将来的に追加予定
    employmentType: 'full_time', // デフォルト値
    employmentStatus: staff.is_active ? 'active' : 'inactive',
    
    lastLoginAt: staff.last_login_at ? staff.last_login_at.toISOString() : null,
    createdAt: staff.created_at.toISOString(),
    updatedAt: staff.updated_at.toISOString()
  };
};

/**
 * Staff一覧用のサマリーマッピング
 */
export const mapStaffToSummary = (staff: any): StaffSummaryResponse => {
  const fullResponse = mapStaffToApiResponse(staff);
  
  return {
    id: fullResponse.id,
    staffCode: fullResponse.staffCode,
    displayName: fullResponse.displayName,
    email: fullResponse.email,
    departmentCode: fullResponse.departmentCode,
    positionTitle: fullResponse.positionTitle,
    baseLevel: fullResponse.baseLevel,
    employmentStatus: fullResponse.employmentStatus,
    lastLoginAt: fullResponse.lastLoginAt,
    createdAt: fullResponse.createdAt
  };
};

/**
 * 部門別カウント集計
 */
export const calculateDepartmentCounts = (staffList: any[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  staffList.forEach(staff => {
    const dept = staff.department || 'GENERAL';
    counts[dept] = (counts[dept] || 0) + 1;
  });
  
  return counts;
};

/**
 * 高度なスタッフ検索用のWhere条件生成
 */
export const buildStaffSearchWhere = (params: {
  tenantId: string;
  search?: string;
  departmentCode?: string;
  employmentStatus?: string;
  baseLevel?: number;
  // 新しい検索パラメータ
  email?: string;
  role?: string;
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}) => {
  const where: any = {
    tenant_id: params.tenantId,
    is_deleted: false
  };
  
  // 雇用ステータスフィルタ
  if (params.employmentStatus) {
    if (params.employmentStatus === 'active') {
      where.is_active = true;
    } else if (params.employmentStatus === 'inactive') {
      where.is_active = false;
    }
  }
  
  // is_activeの直接指定
  if (params.isActive !== undefined) {
    where.is_active = params.isActive;
  }
  
  // 部門フィルタ（複数部門対応）
  if (params.departmentCode && params.departmentCode !== 'ALL') {
    const departments = params.departmentCode.split(',');
    if (departments.length > 1) {
      where.department = { in: departments };
    } else {
      where.department = params.departmentCode;
    }
  }
  
  // 役職フィルタ
  if (params.role) {
    const roles = params.role.split(',');
    if (roles.length > 1) {
      where.role = { in: roles };
    } else {
      where.role = params.role;
    }
  }
  
  // メール検索（部分一致）
  if (params.email) {
    where.email = { contains: params.email, mode: 'insensitive' };
  }
  
  // 高度な検索条件（名前、メール、部門で検索）
  if (params.search) {
    const searchTerms = params.search.trim().split(/\s+/);
    const searchConditions = [];
    
    for (const term of searchTerms) {
      searchConditions.push(
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { department: { contains: term, mode: 'insensitive' } }
      );
    }
    
    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }
  }
  
  // 権限レベルフィルタ（roleベース）
  if (params.baseLevel) {
    const rolesByLevel: Record<number, string[]> = {
      1: ['staff'],
      2: ['supervisor'],
      3: ['manager'],
      4: ['admin'],
      5: ['super_admin', 'owner']
    };
    
    const targetRoles = rolesByLevel[params.baseLevel] || [];
    if (targetRoles.length > 0) {
      where.role = { in: targetRoles };
    }
  }
  
  // 作成日範囲フィルタ
  if (params.createdAfter || params.createdBefore) {
    where.created_at = {};
    if (params.createdAfter) {
      where.created_at.gte = new Date(params.createdAfter);
    }
    if (params.createdBefore) {
      where.created_at.lte = new Date(params.createdBefore);
    }
  }
  
  // 最終ログイン日範囲フィルタ
  if (params.lastLoginAfter || params.lastLoginBefore) {
    where.last_login_at = {};
    if (params.lastLoginAfter) {
      where.last_login_at.gte = new Date(params.lastLoginAfter);
    }
    if (params.lastLoginBefore) {
      where.last_login_at.lte = new Date(params.lastLoginBefore);
    }
  }
  
  return where;
};

/**
 * ページネーション情報生成
 */
export const createPaginationInfo = (
  total: number,
  page: number,
  pageSize: number
) => ({
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize)
});

/**
 * パスワードハッシュ化
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * メールアドレス重複チェック
 */
export const checkEmailExists = async (
  prisma: any,
  email: string,
  tenantId: string,
  excludeId?: string
): Promise<boolean> => {
  const where: any = {
    email,
    tenant_id: tenantId,
    is_deleted: false
  };
  
  if (excludeId) {
    where.id = { not: excludeId };
  }
  
  const existingStaff = await prisma.staff.findFirst({ where });
  return !!existingStaff;
};

/**
 * 権限レベルチェック（自分より上位レベルの操作を防ぐ）
 */
export const canManageStaff = (
  managerRole: string,
  targetRole: string
): boolean => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // 自分と同じかそれより下のレベルのみ管理可能
  return managerLevel >= targetLevel;
};

/**
 * スタッフ作成用データ準備
 */
export const prepareStaffCreateData = async (data: {
  email: string;
  password: string;
  name: string;
  role: string;
  department?: string;
  tenantId: string;
  createdBy: string;
}) => {
  const passwordHash = await hashPassword(data.password);
  
  return {
    id: `staff-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tenant_id: data.tenantId,
    email: data.email,
    name: data.name,
    role: data.role,
    department: data.department || null,
    password_hash: passwordHash,
    is_active: true,
    is_deleted: false,
    failed_login_count: 0,
    created_at: new Date(),
    updated_at: new Date()
  };
};
