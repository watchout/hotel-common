/**
 * サービス別プラン制限の初期データを登録するスクリプト
 */
const { PrismaClient } = require('../src/generated/prisma');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function initializeServicePlanRestrictions() {
  console.log('サービス別プラン制限の初期データを登録します...');

  // hotel-saas (AIコンシェルジュ) プラン
  const saasPlans = [
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-saas',
      plan_type: 'economy',
      plan_category: 'omotenasuai',
      max_users: 5,
      max_devices: 3,
      max_monthly_orders: 500,
      enable_ai_concierge: false,
      enable_multilingual: false,
      monthly_price: 9800
    },
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-saas',
      plan_type: 'standard',
      plan_category: 'omotenasuai',
      max_users: 10,
      max_devices: 10,
      max_monthly_orders: 2000,
      enable_ai_concierge: true,
      enable_multilingual: false,
      monthly_price: 29800
    },
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-saas',
      plan_type: 'premium',
      plan_category: 'omotenasuai',
      max_users: 30,
      max_devices: 50,
      max_monthly_orders: 5000,
      enable_ai_concierge: true,
      enable_multilingual: true,
      monthly_price: 49800
    }
  ];

  // hotel-pms (AIマネジメント) プラン
  const pmsPlans = [
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-pms',
      plan_type: 'economy',
      plan_category: 'omotenasuai',
      max_users: 5,
      max_devices: 3,
      max_rooms: 30,
      enable_revenue_management: false,
      monthly_price: 19800
    },
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-pms',
      plan_type: 'standard',
      plan_category: 'omotenasuai',
      max_users: 15,
      max_devices: 10,
      max_rooms: 100,
      enable_revenue_management: false,
      monthly_price: 39800
    },
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-pms',
      plan_type: 'premium',
      plan_category: 'omotenasuai',
      max_users: 30,
      max_devices: 30,
      max_rooms: 300,
      enable_revenue_management: true,
      monthly_price: 59800
    }
  ];

  // hotel-member (AICRM) プラン
  const memberPlans = [
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-member',
      plan_type: 'economy',
      plan_category: 'omotenasuai',
      max_users: 3,
      max_devices: 3,
      max_monthly_ai_requests: 100,
      enable_ai_crm: false,
      monthly_price: 14800
    },
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-member',
      plan_type: 'standard',
      plan_category: 'omotenasuai',
      max_users: 10,
      max_devices: 10,
      max_monthly_ai_requests: 500,
      enable_ai_crm: true,
      monthly_price: 34800
    },
    {
      id: `spr_${uuidv4().substring(0, 8)}`,
      service_type: 'hotel-member',
      plan_type: 'premium',
      plan_category: 'omotenasuai',
      max_users: 30,
      max_devices: 30,
      max_monthly_ai_requests: 1000,
      enable_ai_crm: true,
      monthly_price: 54800
    }
  ];

  const allPlans = [...saasPlans, ...pmsPlans, ...memberPlans];

  try {
    // 一括登録
    for (const plan of allPlans) {
      await prisma.service_plan_restrictions.create({
        data: {
          ...plan,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log(`✅ ${plan.service_type} の ${plan.plan_type} プランを登録しました`);
    }

    console.log('サービス別プラン制限の初期データ登録が完了しました');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ 一部のプランはすでに登録されています');
    } else {
      console.error('エラーが発生しました:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
initializeServicePlanRestrictions();