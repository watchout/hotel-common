-- CreateEnum
CREATE TYPE "AdminLevel" AS ENUM ('chainadmin', 'groupadmin', 'superadmin');

-- CreateEnum
CREATE TYPE "CampaignCtaType" AS ENUM ('NONE', 'LINK', 'BUTTON', 'COUPON');

-- CreateEnum
CREATE TYPE "CampaignDisplayType" AS ENUM ('BANNER', 'POPUP', 'NOTIFICATION', 'FEATURED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'SCHEDULED');

-- CreateTable
CREATE TABLE "DatabaseChangeLog" (
    "id" SERIAL NOT NULL,
    "changeType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatabaseChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "placeId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'received',
    "items" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPlanRestrictions" (
    "id" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "planCategory" TEXT NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "maxDevices" INTEGER NOT NULL DEFAULT 30,
    "additionalDeviceCost" INTEGER NOT NULL DEFAULT 1200,
    "roomTerminalCost" INTEGER NOT NULL DEFAULT 1200,
    "frontDeskCost" INTEGER NOT NULL DEFAULT 5000,
    "kitchenCost" INTEGER NOT NULL DEFAULT 2000,
    "barCost" INTEGER NOT NULL DEFAULT 2000,
    "housekeepingCost" INTEGER NOT NULL DEFAULT 2000,
    "managerCost" INTEGER NOT NULL DEFAULT 5000,
    "commonAreaCost" INTEGER NOT NULL DEFAULT 3500,
    "enableAiConcierge" BOOLEAN NOT NULL DEFAULT false,
    "enableMultilingual" BOOLEAN NOT NULL DEFAULT false,
    "enableLayoutEditor" BOOLEAN NOT NULL DEFAULT false,
    "enableFacilityGuide" BOOLEAN NOT NULL DEFAULT false,
    "enableAiBusinessSupport" BOOLEAN NOT NULL DEFAULT false,
    "maxMonthlyOrders" INTEGER NOT NULL DEFAULT 1000,
    "maxMonthlyAiRequests" INTEGER NOT NULL DEFAULT 0,
    "maxStorageGB" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "multilingualUpgradePrice" INTEGER NOT NULL DEFAULT 3000,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "SystemPlanRestrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "features" TEXT[],
    "planType" TEXT,
    "settings" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSystemPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "monthlyPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "TenantSystemPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "admin_level" "AdminLevel" NOT NULL,
    "accessible_group_ids" TEXT[],
    "accessible_chain_ids" TEXT[],
    "accessible_tenant_ids" TEXT[],
    "last_login_at" TIMESTAMP(3),
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_log" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "campaign_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_category_relations" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "campaign_category_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_items" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "campaign_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_translations" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "languageCode" TEXT,
    "name" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "campaign_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_usage_logs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "campaign_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "displayType" "CampaignDisplayType" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "ctaType" "CampaignCtaType" NOT NULL DEFAULT 'NONE',
    "ctaAction" TEXT,
    "ctaLabel" TEXT,
    "discountType" TEXT,
    "discountValue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dayRestrictions" JSONB,
    "description" TEXT,
    "displayPriority" INTEGER NOT NULL DEFAULT 0,
    "maxUsageCount" INTEGER,
    "name" TEXT NOT NULL,
    "timeRestrictions" JSONB,
    "welcomeSettings" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_rooms" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomName" TEXT,
    "deviceId" TEXT,
    "deviceType" TEXT,
    "placeId" TEXT,
    "status" TEXT DEFAULT 'active',
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "device_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_video_caches" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "videoIds" TEXT[],
    "lastShownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastViewedAt" TIMESTAMP(3),
    "userId" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "device_video_caches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "html" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_histories" (
    "Id" TEXT NOT NULL,
    "PageId" TEXT NOT NULL,
    "Html" TEXT,
    "Css" TEXT,
    "Content" TEXT,
    "Template" TEXT,
    "Version" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "page_histories_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "pages" (
    "Id" TEXT NOT NULL,
    "TenantId" TEXT NOT NULL,
    "Slug" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Html" TEXT,
    "Css" TEXT,
    "Content" TEXT,
    "Template" TEXT,
    "IsPublished" BOOLEAN NOT NULL DEFAULT false,
    "PublishedAt" TIMESTAMP(3),
    "Version" INTEGER NOT NULL DEFAULT 1,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "response_node_translations" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answer" JSONB,
    "language" TEXT,
    "title" TEXT,

    CONSTRAINT "response_node_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_nodes" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "content" TEXT,
    "metadata" JSONB,
    "isRoot" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answer" JSONB,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "type" TEXT,

    CONSTRAINT "response_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_tree_history" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "response" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "response_tree_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_tree_mobile_links" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qrCodeData" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "connectedAt" TIMESTAMP(3),
    "deviceId" INTEGER,

    CONSTRAINT "response_tree_mobile_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_tree_sessions" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT,
    "currentNodeId" TEXT,
    "metadata" JSONB,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "interfaceType" TEXT,
    "language" TEXT,
    "lastActivityAt" TIMESTAMP(3),
    "roomId" TEXT,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "response_tree_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_tree_versions" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "data" JSONB,

    CONSTRAINT "response_tree_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_trees" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "response_trees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_grades" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_version" (
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rollback_sql" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_by" TEXT,

    CONSTRAINT "schema_version_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "service_plan_restrictions" (
    "id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "plan_category" TEXT NOT NULL,
    "max_users" INTEGER NOT NULL DEFAULT 10,
    "max_devices" INTEGER NOT NULL DEFAULT 5,
    "max_monthly_orders" INTEGER,
    "enable_ai_concierge" BOOLEAN,
    "enable_multilingual" BOOLEAN,
    "max_rooms" INTEGER,
    "enable_revenue_management" BOOLEAN,
    "max_monthly_ai_requests" INTEGER,
    "enable_ai_crm" BOOLEAN,
    "monthly_price" INTEGER NOT NULL DEFAULT 9800,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_plan_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_usage_statistics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "active_users_count" INTEGER NOT NULL DEFAULT 0,
    "active_devices_count" INTEGER NOT NULL DEFAULT 0,
    "usage_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_usage_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "last_login_at" TIMESTAMP(3),
    "locked_until" TIMESTAMP(3),
    "password_hash" TEXT,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_event" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "target_system" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "event_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "system_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_access_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_system" TEXT,

    CONSTRAINT "tenant_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateIndex
CREATE INDEX "DatabaseChangeLog_changeType_idx" ON "DatabaseChangeLog"("changeType");

-- CreateIndex
CREATE INDEX "DatabaseChangeLog_createdAt_idx" ON "DatabaseChangeLog"("createdAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_isDeleted_paidAt_idx" ON "Order"("isDeleted", "paidAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");

-- CreateIndex
CREATE INDEX "OrderItem_tenantId_idx" ON "OrderItem"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItem_is_deleted_idx" ON "OrderItem"("is_deleted");

-- CreateIndex
CREATE INDEX "SystemPlanRestrictions_is_deleted_idx" ON "SystemPlanRestrictions"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "SystemPlanRestrictions_systemType_businessType_planType_planCat" ON "SystemPlanRestrictions"("systemType", "businessType", "planType", "planCategory");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");

-- CreateIndex
CREATE INDEX "Tenant_is_deleted_idx" ON "Tenant"("is_deleted");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_isActive_idx" ON "TenantSystemPlan"("isActive");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_planId_idx" ON "TenantSystemPlan"("planId");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_systemType_idx" ON "TenantSystemPlan"("systemType");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_tenantId_idx" ON "TenantSystemPlan"("tenantId");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_is_deleted_idx" ON "TenantSystemPlan"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSystemPlan_tenantId_systemType_key" ON "TenantSystemPlan"("tenantId", "systemType");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE INDEX "admin_is_deleted_idx" ON "admin"("is_deleted");

-- CreateIndex
CREATE INDEX "admin_log_action_idx" ON "admin_log"("action");

-- CreateIndex
CREATE INDEX "admin_log_admin_id_idx" ON "admin_log"("admin_id");

-- CreateIndex
CREATE INDEX "admin_log_created_at_idx" ON "admin_log"("created_at");

-- CreateIndex
CREATE INDEX "admin_log_is_deleted_idx" ON "admin_log"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_categories_code_key" ON "campaign_categories"("code");

-- CreateIndex
CREATE INDEX "campaign_categories_tenantId_idx" ON "campaign_categories"("tenantId");

-- CreateIndex
CREATE INDEX "campaign_categories_is_deleted_idx" ON "campaign_categories"("is_deleted");

-- CreateIndex
CREATE INDEX "campaign_category_relations_is_deleted_idx" ON "campaign_category_relations"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_category_relations_campaignId_categoryId_key" ON "campaign_category_relations"("campaignId", "categoryId");

-- CreateIndex
CREATE INDEX "campaign_items_is_deleted_idx" ON "campaign_items"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_items_campaignId_itemId_itemType_key" ON "campaign_items"("campaignId", "itemId", "itemType");

-- CreateIndex
CREATE INDEX "campaign_translations_languageCode_idx" ON "campaign_translations"("languageCode");

-- CreateIndex
CREATE INDEX "campaign_translations_is_deleted_idx" ON "campaign_translations"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_translations_campaignId_locale_key" ON "campaign_translations"("campaignId", "locale");

-- CreateIndex
CREATE INDEX "campaign_usage_logs_campaignId_idx" ON "campaign_usage_logs"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_usage_logs_deviceId_idx" ON "campaign_usage_logs"("deviceId");

-- CreateIndex
CREATE INDEX "campaign_usage_logs_userId_idx" ON "campaign_usage_logs"("userId");

-- CreateIndex
CREATE INDEX "campaign_usage_logs_is_deleted_idx" ON "campaign_usage_logs"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_code_key" ON "campaigns"("code");

-- CreateIndex
CREATE INDEX "campaigns_startDate_endDate_idx" ON "campaigns"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_tenantId_idx" ON "campaigns"("tenantId");

-- CreateIndex
CREATE INDEX "campaigns_is_deleted_idx" ON "campaigns"("is_deleted");

-- CreateIndex
CREATE INDEX "device_rooms_deviceId_idx" ON "device_rooms"("deviceId");

-- CreateIndex
CREATE INDEX "device_rooms_placeId_idx" ON "device_rooms"("placeId");

-- CreateIndex
CREATE INDEX "device_rooms_roomId_idx" ON "device_rooms"("roomId");

-- CreateIndex
CREATE INDEX "device_rooms_status_idx" ON "device_rooms"("status");

-- CreateIndex
CREATE INDEX "device_rooms_tenantId_idx" ON "device_rooms"("tenantId");

-- CreateIndex
CREATE INDEX "device_rooms_is_deleted_idx" ON "device_rooms"("is_deleted");

-- CreateIndex
CREATE INDEX "device_video_caches_is_deleted_idx" ON "device_video_caches"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "device_video_caches_deviceId_userId_key" ON "device_video_caches"("deviceId", "userId");

-- CreateIndex
CREATE INDEX "notification_templates_tenant_id_idx" ON "notification_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "notification_templates_type_idx" ON "notification_templates"("type");

-- CreateIndex
CREATE INDEX "notification_templates_is_deleted_idx" ON "notification_templates"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_tenant_id_type_code_locale_key" ON "notification_templates"("tenant_id", "type", "code", "locale");

-- CreateIndex
CREATE INDEX "page_histories_PageId_idx" ON "page_histories"("PageId");

-- CreateIndex
CREATE INDEX "page_histories_Version_idx" ON "page_histories"("Version");

-- CreateIndex
CREATE INDEX "page_histories_is_deleted_idx" ON "page_histories"("is_deleted");

-- CreateIndex
CREATE INDEX "pages_is_deleted_idx" ON "pages"("is_deleted");

-- CreateIndex
CREATE INDEX "pages_IsPublished_idx" ON "pages"("IsPublished");

-- CreateIndex
CREATE INDEX "pages_Slug_idx" ON "pages"("Slug");

-- CreateIndex
CREATE INDEX "pages_TenantId_idx" ON "pages"("TenantId");

-- CreateIndex
CREATE UNIQUE INDEX "pages_TenantId_Slug_key" ON "pages"("TenantId", "Slug");

-- CreateIndex
CREATE UNIQUE INDEX "response_node_translations_nodeId_language_key" ON "response_node_translations"("nodeId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "response_node_translations_nodeId_locale_key" ON "response_node_translations"("nodeId", "locale");

-- CreateIndex
CREATE INDEX "response_nodes_isRoot_idx" ON "response_nodes"("isRoot");

-- CreateIndex
CREATE INDEX "response_nodes_parentId_idx" ON "response_nodes"("parentId");

-- CreateIndex
CREATE INDEX "response_nodes_treeId_idx" ON "response_nodes"("treeId");

-- CreateIndex
CREATE INDEX "response_tree_history_sessionId_idx" ON "response_tree_history"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "response_tree_mobile_links_code_key" ON "response_tree_mobile_links"("code");

-- CreateIndex
CREATE INDEX "response_tree_mobile_links_code_idx" ON "response_tree_mobile_links"("code");

-- CreateIndex
CREATE INDEX "response_tree_mobile_links_isActive_idx" ON "response_tree_mobile_links"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "response_tree_sessions_sessionId_key" ON "response_tree_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "response_tree_sessions_deviceId_idx" ON "response_tree_sessions"("deviceId");

-- CreateIndex
CREATE INDEX "response_tree_sessions_isComplete_idx" ON "response_tree_sessions"("isComplete");

-- CreateIndex
CREATE INDEX "response_tree_sessions_treeId_idx" ON "response_tree_sessions"("treeId");

-- CreateIndex
CREATE INDEX "response_tree_sessions_userId_idx" ON "response_tree_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "response_tree_versions_treeId_version_key" ON "response_tree_versions"("treeId", "version");

-- CreateIndex
CREATE INDEX "response_trees_isPublished_idx" ON "response_trees"("isPublished");

-- CreateIndex
CREATE INDEX "response_trees_tenantId_idx" ON "response_trees"("tenantId");

-- CreateIndex
CREATE INDEX "response_trees_is_deleted_idx" ON "response_trees"("is_deleted");

-- CreateIndex
CREATE INDEX "room_grades_tenant_id_idx" ON "room_grades"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_grades_tenant_id_code_key" ON "room_grades"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "service_plan_restrictions_service_type_plan_type_plan_category_" ON "service_plan_restrictions"("service_type", "plan_type", "plan_category");

-- CreateIndex
CREATE UNIQUE INDEX "service_usage_statistics_tenant_id_service_type_month_key" ON "service_usage_statistics"("tenant_id", "service_type", "month");

-- CreateIndex
CREATE INDEX "staff_is_deleted_idx" ON "staff"("is_deleted");

-- CreateIndex
CREATE INDEX "staff_email_idx" ON "staff"("email");

-- CreateIndex
CREATE INDEX "staff_role_idx" ON "staff"("role");

-- CreateIndex
CREATE INDEX "staff_tenant_id_idx" ON "staff"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_tenant_id_email_key" ON "staff"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "system_event_created_at_idx" ON "system_event"("created_at");

-- CreateIndex
CREATE INDEX "system_event_event_type_idx" ON "system_event"("event_type");

-- CreateIndex
CREATE INDEX "system_event_status_idx" ON "system_event"("status");

-- CreateIndex
CREATE INDEX "system_event_tenant_id_idx" ON "system_event"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_access_logs_created_at_idx" ON "tenant_access_logs"("created_at");

-- CreateIndex
CREATE INDEX "tenant_access_logs_tenant_id_idx" ON "tenant_access_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_access_logs_user_id_idx" ON "tenant_access_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_services_tenant_id_service_type_key" ON "tenant_services"("tenant_id", "service_type");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSystemPlan" ADD CONSTRAINT "TenantSystemPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SystemPlanRestrictions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSystemPlan" ADD CONSTRAINT "TenantSystemPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_log" ADD CONSTRAINT "admin_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_category_relations" ADD CONSTRAINT "campaign_category_relations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_category_relations" ADD CONSTRAINT "campaign_category_relations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "campaign_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_items" ADD CONSTRAINT "campaign_items_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_translations" ADD CONSTRAINT "campaign_translations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_usage_logs" ADD CONSTRAINT "campaign_usage_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_rooms" ADD CONSTRAINT "device_rooms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_histories" ADD CONSTRAINT "page_histories_PageId_fkey" FOREIGN KEY ("PageId") REFERENCES "pages"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_node_translations" ADD CONSTRAINT "response_node_translations_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "response_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_nodes" ADD CONSTRAINT "response_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "response_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_nodes" ADD CONSTRAINT "response_nodes_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "response_trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_tree_history" ADD CONSTRAINT "response_tree_history_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "response_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_tree_history" ADD CONSTRAINT "response_tree_history_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "response_tree_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_tree_mobile_links" ADD CONSTRAINT "response_tree_mobile_links_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "response_tree_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_tree_sessions" ADD CONSTRAINT "response_tree_sessions_currentNodeId_fkey" FOREIGN KEY ("currentNodeId") REFERENCES "response_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_tree_sessions" ADD CONSTRAINT "response_tree_sessions_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "response_trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_tree_versions" ADD CONSTRAINT "response_tree_versions_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "response_trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_usage_statistics" ADD CONSTRAINT "service_usage_statistics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_services" ADD CONSTRAINT "tenant_services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

