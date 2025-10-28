/**
 * Staff管理API用ヘルパー関数
 * 既存のstaffテーブル構造を活用したマッピング・権限管理
 */
/**
 * roleフィールドをbaseLevelにマッピング
 */
export declare const getRoleLevel: (role: string) => number;
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
export declare const mapStaffToApiResponse: (staff: any) => StaffApiResponse;
/**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * Staff一覧用のサマリーマッピング
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
export declare const mapStaffToSummary: (staff: any) => StaffSummaryResponse;
/**
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * 部門別カウント集計
 */
export declare const calculateDepartmentCounts: (staffList: any[]) => Record<string, number>;
/**
 * 高度なスタッフ検索用のWhere条件生成
 */
export declare const buildStaffSearchWhere: (params: {
    tenantId: string;
    search?: string;
    departmentCode?: string;
    employmentStatus?: string;
    baseLevel?: number;
    email?: string;
    role?: string;
    isActive?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    lastLoginAfter?: string;
    lastLoginBefore?: string;
}) => any;
/**
 * ページネーション情報生成
 */
export declare const createPaginationInfo: (total: number, page: number, pageSize: number) => {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};
/**
// eslint-disable-next-line no-return-await
 * パスワードハッシュ化
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * メールアドレス重複チェック
 */
export declare const checkEmailExists: (prisma: any, email: string, tenantId: string, excludeId?: string) => Promise<boolean>;
/**
 * 権限レベルチェック（自分より上位レベルの操作を防ぐ）
 */
export declare const canManageStaff: (managerRole: string, targetRole: string) => boolean;
/**
 * スタッフ作成用データ準備
 */
export declare const prepareStaffCreateData: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    department?: string;
    tenantId: string;
    createdBy: string;
}) => Promise<{
    id: string;
    tenant_id: string;
    email: string;
    name: string;
    role: string;
    department: string | null;
    password_hash: string;
    is_active: boolean;
    is_deleted: boolean;
    failed_login_count: number;
    created_at: Date;
    updated_at: Date;
}>;
