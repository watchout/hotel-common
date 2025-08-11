-- テナントサービス利用管理テーブルの作成
CREATE TABLE "tenant_services" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "service_type" TEXT NOT NULL,
  "plan_type" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3),
  "service_config" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "tenant_services_pkey" PRIMARY KEY ("id")
);

-- サービス別プラン制限テーブルの作成
CREATE TABLE "service_plan_restrictions" (
  "id" TEXT NOT NULL,
  "service_type" TEXT NOT NULL,
  "plan_type" TEXT NOT NULL,
  "plan_category" TEXT NOT NULL,
  
  -- 共通制限
  "max_users" INTEGER NOT NULL DEFAULT 10,
  "max_devices" INTEGER NOT NULL DEFAULT 5,
  
  -- サービス固有制限
  -- hotel-saas固有
  "max_monthly_orders" INTEGER,
  "enable_ai_concierge" BOOLEAN,
  "enable_multilingual" BOOLEAN,
  
  -- hotel-pms固有
  "max_rooms" INTEGER,
  "enable_revenue_management" BOOLEAN,
  
  -- hotel-member固有
  "max_monthly_ai_requests" INTEGER,
  "enable_ai_crm" BOOLEAN,
  
  "monthly_price" INTEGER NOT NULL DEFAULT 9800,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "service_plan_restrictions_pkey" PRIMARY KEY ("id")
);

-- サービス利用統計テーブルの作成
CREATE TABLE "service_usage_statistics" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "service_type" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  
  -- 共通統計
  "active_users_count" INTEGER NOT NULL DEFAULT 0,
  "active_devices_count" INTEGER NOT NULL DEFAULT 0,
  
  -- サービス固有統計
  "usage_data" JSONB NOT NULL DEFAULT '{}',
  
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "service_usage_statistics_pkey" PRIMARY KEY ("id")
);

-- インデックスの作成
CREATE UNIQUE INDEX "tenant_services_tenant_id_service_type_key" ON "tenant_services"("tenant_id", "service_type");
CREATE UNIQUE INDEX "service_plan_restrictions_service_type_plan_type_plan_category_key" ON "service_plan_restrictions"("service_type", "plan_type", "plan_category");
CREATE UNIQUE INDEX "service_usage_statistics_tenant_id_service_type_month_key" ON "service_usage_statistics"("tenant_id", "service_type", "month");

-- 外部キー制約の追加
ALTER TABLE "tenant_services" ADD CONSTRAINT "tenant_services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_usage_statistics" ADD CONSTRAINT "service_usage_statistics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;