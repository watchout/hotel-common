/**
 * テナントサービス管理API
 * 
 * このファイルは、テナントのサービス利用状況を管理するためのAPIエンドポイントを提供します。
 */
import { hotelDb } from '../database/prisma';
import { HotelLogger } from '../utils/logger';

// PrismaClientの直接インスタンス化は避け、hotelDb.getClient()を使用
const prisma = hotelDb.getClient();
const logger = new HotelLogger({ module: 'tenant-service-api' });

/**
 * テナントのサービス利用状況を取得
 * @param tenantId テナントID
 */
export async function getTenantServices(tenantId: string) {
  try {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    const services = await prisma.tenant_services.findMany({
      where: {
        tenant_id: tenantId
      }
    });
    
    return {
      success: true,
      data: services
    };
  } catch (error: unknown) {
    logger.error('テナントサービス取得エラー', { 
      tenantId, 
      error: error instanceof Error ? error : new Error(String(error)) 
    });
    return {
      success: false,
      error: 'テナントサービスの取得に失敗しました'
    };
  }
}

/**
 * テナントのサービス利用状況を更新
 * @param tenantId テナントID
 * @param serviceType サービスタイプ ('hotel-saas', 'hotel-pms', 'hotel-member')
 * @param planType プランタイプ ('economy', 'standard', 'premium')
 * @param isActive アクティブ状態
 */
export async function updateTenantService(
  tenantId: string,
  serviceType: string,
  planType: string,
  isActive: boolean
) {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  try {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // サービスが既に存在するか確認
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    const existingService = await prisma.tenant_services.findFirst({
      where: {
        tenant_id: tenantId,
        service_type: serviceType
      }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    if (existingService) {
      // 既存サービスの更新
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const updatedService = await prisma.tenant_services.update({
        where: {
          id: existingService.id
        },
        data: {
          plan_type: planType,
          is_active: isActive,
          updated_at: new Date()
        }
      });

      logger.info('テナントサービス更新', { 
        tenantId, 
        serviceType: serviceType, 
        planType, 
        isActive 
      });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      return {
        success: true,
        data: updatedService
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      };
    } else {
      // 新規サービスの登録
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const newService = await prisma.tenant_services.create({
        data: {
          id: `ts_${Math.random().toString(36).substring(2, 10)}`,
          tenant_id: tenantId,
          service_type: serviceType,
          plan_type: planType,
          is_active: isActive,
          activated_at: new Date(),
          service_config: {},
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      logger.info('テナントサービス登録', { 
        tenantId, 
        serviceType: serviceType, 
        planType, 
        isActive 
      });
      return {
        success: true,
        data: newService
      };
    }
  } catch (error: unknown) {
    logger.error('テナントサービス更新エラー', { 
      tenantId, 
      serviceType: serviceType, 
      planType, 
      isActive, 
      error: error instanceof Error ? error : new Error(String(error)) 
    });
    return {
      success: false,
      error: 'テナントサービスの更新に失敗しました'
    };
  }
}

/**
 * サービスのプラン制限を取得
 * @param serviceType サービスタイプ ('hotel-saas', 'hotel-pms', 'hotel-member')
 * @param planType プランタイプ ('economy', 'standard', 'premium')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
 * @param planCategory プランカテゴリ ('omotenasuai', etc.)
 */
export async function getServicePlanRestrictions(
  serviceType: string,
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  planType: string,
  planCategory = 'omotenasuai'
) {
  try {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    const planRestrictions = await prisma.service_plan_restrictions.findFirst({
      where: {
        service_type: serviceType,
        plan_type: planType,
        plan_category: planCategory
      }
    });
    
    if (!planRestrictions) {
      return {
        success: false,
        error: '指定されたプラン制限が見つかりません'
      };
    }
    
    return {
      success: true,
      data: planRestrictions
    };
  } catch (error: unknown) {
    logger.error('プラン制限取得エラー', { 
      serviceType: serviceType, 
      planType, 
      planCategory, 
      error: error instanceof Error ? error : new Error(String(error)) 
    });
    return {
      success: false,
      error: 'プラン制限の取得に失敗しました'
    };
  }
}

/**
 * テナントのサービス利用統計を記録
 * @param tenantId テナントID
 * @param serviceType サービスタイプ
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * @param month 月 (YYYY-MM形式)
 * @param data 統計データ
 */
export async function recordServiceUsage(
  tenantId: string,
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceType: string,
  month: string,
  data: {
    activeUsersCount?: number;
    activeDevicesCount?: number;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    usageData?: Record<string, any>;
  }
) {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  try {
    // 既存の統計データを確認
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    const existingStat = await prisma.service_usage_statistics.findFirst({
      where: {
        tenant_id: tenantId,
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        service_type: serviceType,
        month
      }
    });

    if (existingStat) {
      // 既存データの更新
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const updatedStat = await prisma.service_usage_statistics.update({
        where: {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
          id: existingStat.id
        },
        data: {
          active_users_count: data.activeUsersCount ?? existingStat.active_users_count,
          active_devices_count: data.activeDevicesCount ?? existingStat.active_devices_count,
          usage_data: data.usageData ? JSON.parse(JSON.stringify(data.usageData)) : existingStat.usage_data,
          updated_at: new Date()
        }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      });

      return {
        success: true,
        data: updatedStat
      };
    } else {
      // 新規データの登録
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
      const newStat = await prisma.service_usage_statistics.create({
        data: {
          id: `sus_${Math.random().toString(36).substring(2, 10)}`,
          tenant_id: tenantId,
          service_type: serviceType,
          month,
          active_users_count: data.activeUsersCount ?? 0,
          active_devices_count: data.activeDevicesCount ?? 0,
          usage_data: data.usageData ?? {},
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return {
        success: true,
        data: newStat
      };
    }
  } catch (error: unknown) {
    logger.error('サービス利用統計記録エラー', { 
      tenantId, 
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
      serviceType: serviceType, 
      month, 
      error: error instanceof Error ? error : new Error(String(error)) 
    });
    return {
      success: false,
      error: 'サービス利用統計の記録に失敗しました'
    };
  }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
}

/**
 * テナントのサービス利用状況を確認
 * @param tenantId テナントID
 * @param serviceType サービスタイプ
 */
export async function checkServiceAccess(tenantId: string, serviceType: string) {
  try {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const service = await prisma.tenant_services.findFirst({
      where: {
        tenant_id: tenantId,
        service_type: serviceType,
        is_active: true
      }
    });
    
    if (!service) {
      logger.warn('サービスアクセス拒否', { 
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        tenantId, 
        serviceType: serviceType 
      });
      return {
        success: false,
        error: 'このテナントは指定されたサービスにアクセスできません'
      };
    }
    
    // プラン制限を取得
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Prismaスキーマに存在するが型定義されていないモデル
    const planRestrictions = await prisma.service_plan_restrictions.findFirst({
      where: {
        service_type: serviceType,
        plan_type: service.plan_type
      }
    });
    
    return {
      success: true,
      data: {
        service,
        planRestrictions
      }
    };
  } catch (error: unknown) {
    logger.error('サービスアクセス確認エラー', { 
      tenantId, 
      serviceType: serviceType, 
      error: error instanceof Error ? error : new Error(String(error)) 
    });
    return {
      success: false,
      error: 'サービスアクセスの確認に失敗しました'
    };
  }
}