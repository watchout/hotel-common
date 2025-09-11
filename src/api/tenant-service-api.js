/**
 * テナントサービス管理API
 * 
 * このファイルは、テナントのサービス利用状況を管理するためのAPIエンドポイントを提供します。
 */
const { PrismaClient } = require('../generated/prisma');

const prisma = /* 注意: PrismaClientの直接インスタンス化は避けてください。代わりにhotelDb.getAdapter()を使用してください */
  // hotelDb.getAdapter();

/**
 * テナントのサービス利用状況を取得
 * @param {string} tenantId テナントID
 */
async function getTenantServices(tenantId) {
  try {
    const services = await prisma.tenant_services.findMany({
      where: {
        tenant_id: tenantId
      }
    });
    
    return {
      success: true,
      data: services
    };
  } catch (error) {
    console.error('テナントサービス取得エラー:', error);
    return {
      success: false,
      error: 'テナントサービスの取得に失敗しました'
    };
  }
}

/**
 * テナントのサービス利用状況を更新
 * @param {string} tenantId テナントID
 * @param {string} serviceType サービスタイプ ('hotel-saas', 'hotel-pms', 'hotel-member')
 * @param {string} planType プランタイプ ('economy', 'standard', 'premium')
 * @param {boolean} isActive アクティブ状態
 */
async function updateTenantService(tenantId, serviceType, planType, isActive) {
  try {
    // サービスが既に存在するか確認
    const existingService = await prisma.tenant_services.findFirst({
      where: {
        tenant_id: tenantId,
        service_type: serviceType
      }
    });

    if (existingService) {
      // 既存サービスの更新
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

      console.log(`テナントサービス更新: ${tenantId}, ${serviceType}, ${planType}, ${isActive}`);
      return {
        success: true,
        data: updatedService
      };
    } else {
      // 新規サービスの登録
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

      console.log(`テナントサービス登録: ${tenantId}, ${serviceType}, ${planType}, ${isActive}`);
      return {
        success: true,
        data: newService
      };
    }
  } catch (error) {
    console.error('テナントサービス更新エラー:', error);
    return {
      success: false,
      error: 'テナントサービスの更新に失敗しました'
    };
  }
}

/**
 * サービスのプラン制限を取得
 * @param {string} serviceType サービスタイプ ('hotel-saas', 'hotel-pms', 'hotel-member')
 * @param {string} planType プランタイプ ('economy', 'standard', 'premium')
 * @param {string} planCategory プランカテゴリ ('omotenasuai', etc.)
 */
async function getServicePlanRestrictions(serviceType, planType, planCategory = 'omotenasuai') {
  try {
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
  } catch (error) {
    console.error('プラン制限取得エラー:', error);
    return {
      success: false,
      error: 'プラン制限の取得に失敗しました'
    };
  }
}

/**
 * テナントのサービス利用統計を記録
 * @param {string} tenantId テナントID
 * @param {string} serviceType サービスタイプ
 * @param {string} month 月 (YYYY-MM形式)
 * @param {Object} data 統計データ
 */
async function recordServiceUsage(tenantId, serviceType, month, data) {
  try {
    // 既存の統計データを確認
    const existingStat = await prisma.service_usage_statistics.findFirst({
      where: {
        tenant_id: tenantId,
        service_type: serviceType,
        month
      }
    });

    if (existingStat) {
      // 既存データの更新
      const updatedStat = await prisma.service_usage_statistics.update({
        where: {
          id: existingStat.id
        },
        data: {
          active_users_count: data.activeUsersCount ?? existingStat.active_users_count,
          active_devices_count: data.activeDevicesCount ?? existingStat.active_devices_count,
          usage_data: data.usageData ? data.usageData : existingStat.usage_data,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        data: updatedStat
      };
    } else {
      // 新規データの登録
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
  } catch (error) {
    console.error('サービス利用統計記録エラー:', error);
    return {
      success: false,
      error: 'サービス利用統計の記録に失敗しました'
    };
  }
}

/**
 * テナントのサービス利用状況を確認
 * @param {string} tenantId テナントID
 * @param {string} serviceType サービスタイプ
 */
async function checkServiceAccess(tenantId, serviceType) {
  try {
    const service = await prisma.tenant_services.findFirst({
      where: {
        tenant_id: tenantId,
        service_type: serviceType,
        is_active: true
      }
    });
    
    if (!service) {
      console.warn(`サービスアクセス拒否: ${tenantId}, ${serviceType}`);
      return {
        success: false,
        error: 'このテナントは指定されたサービスにアクセスできません'
      };
    }
    
    // プラン制限を取得
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
  } catch (error) {
    console.error('サービスアクセス確認エラー:', error);
    return {
      success: false,
      error: 'サービスアクセスの確認に失敗しました'
    };
  }
}

module.exports = {
  getTenantServices,
  updateTenantService,
  getServicePlanRestrictions,
  recordServiceUsage,
  checkServiceAccess
};