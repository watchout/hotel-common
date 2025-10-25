"use strict";
/**
 * Staff管理API用ヘルパー関数
 * 既存のstaffテーブル構造を活用したマッピング・権限管理
 */
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
exports.prepareStaffCreateData = exports.canManageStaff = exports.checkEmailExists = exports.hashPassword = exports.createPaginationInfo = exports.buildStaffSearchWhere = exports.calculateDepartmentCounts = exports.mapStaffToSummary = exports.mapStaffToApiResponse = exports.getRoleLevel = void 0;
const logger_1 = require("./logger");
const bcrypt = __importStar(require("bcrypt"));
const logger = logger_1.HotelLogger.getInstance();
/**
 * roleフィールドをbaseLevelにマッピング
 */
const getRoleLevel = (role) => {
    const roleLevelMap = {
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
exports.getRoleLevel = getRoleLevel;
/**
 * 既存staffテーブルのデータをAPI仕様に合わせてマッピング
 */
const mapStaffToApiResponse = (staff) => {
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
        baseLevel: (0, exports.getRoleLevel)(staff.role),
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
exports.mapStaffToApiResponse = mapStaffToApiResponse;
/**
 * Staff一覧用のサマリーマッピング
 */
const mapStaffToSummary = (staff) => {
    const fullResponse = (0, exports.mapStaffToApiResponse)(staff);
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
exports.mapStaffToSummary = mapStaffToSummary;
/**
 * 部門別カウント集計
 */
const calculateDepartmentCounts = (staffList) => {
    const counts = {};
    staffList.forEach(staff => {
        const dept = staff.department || 'GENERAL';
        counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
};
exports.calculateDepartmentCounts = calculateDepartmentCounts;
/**
 * 高度なスタッフ検索用のWhere条件生成
 */
const buildStaffSearchWhere = (params) => {
    const where = {
        tenant_id: params.tenantId,
        is_deleted: false
    };
    // 雇用ステータスフィルタ
    if (params.employmentStatus) {
        if (params.employmentStatus === 'active') {
            where.is_active = true;
        }
        else if (params.employmentStatus === 'inactive') {
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
        }
        else {
            where.department = params.departmentCode;
        }
    }
    // 役職フィルタ
    if (params.role) {
        const roles = params.role.split(',');
        if (roles.length > 1) {
            where.role = { in: roles };
        }
        else {
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
            searchConditions.push({ name: { contains: term, mode: 'insensitive' } }, { email: { contains: term, mode: 'insensitive' } }, { department: { contains: term, mode: 'insensitive' } });
        }
        if (searchConditions.length > 0) {
            where.OR = searchConditions;
        }
    }
    // 権限レベルフィルタ（roleベース）
    if (params.baseLevel) {
        const rolesByLevel = {
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
exports.buildStaffSearchWhere = buildStaffSearchWhere;
/**
 * ページネーション情報生成
 */
const createPaginationInfo = (total, page, pageSize) => ({
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
});
exports.createPaginationInfo = createPaginationInfo;
/**
 * パスワードハッシュ化
 */
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 * メールアドレス重複チェック
 */
const checkEmailExists = async (prisma, email, tenantId, excludeId) => {
    const where = {
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
exports.checkEmailExists = checkEmailExists;
/**
 * 権限レベルチェック（自分より上位レベルの操作を防ぐ）
 */
const canManageStaff = (managerRole, targetRole) => {
    const managerLevel = (0, exports.getRoleLevel)(managerRole);
    const targetLevel = (0, exports.getRoleLevel)(targetRole);
    // 自分と同じかそれより下のレベルのみ管理可能
    return managerLevel >= targetLevel;
};
exports.canManageStaff = canManageStaff;
/**
 * スタッフ作成用データ準備
 */
const prepareStaffCreateData = async (data) => {
    const passwordHash = await (0, exports.hashPassword)(data.password);
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
exports.prepareStaffCreateData = prepareStaffCreateData;
