/*
  Warnings:

  - You are about to drop the `data_sharing_policy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member_grade_access` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization_hierarchy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room_grades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schema_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CreditCategory" AS ENUM ('CONCIERGE', 'MARKETING_ANALYSIS', 'PAGE_AUTOGEN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'store_admin', 'staff');

-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "data_sharing_policy" DROP CONSTRAINT "data_sharing_policy_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "member_grade_access" DROP CONSTRAINT "member_grade_access_room_grade_id_fkey";

-- DropForeignKey
ALTER TABLE "member_grade_access" DROP CONSTRAINT "member_grade_access_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_hierarchy" DROP CONSTRAINT "organization_hierarchy_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "room_grades" DROP CONSTRAINT "room_grades_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_room_grade_id_fkey";

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "system_events" DROP CONSTRAINT "system_events_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "system_events" DROP CONSTRAINT "system_events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_organization" DROP CONSTRAINT "tenant_organization_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_organization" DROP CONSTRAINT "tenant_organization_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_id_fkey";

-- DropTable
DROP TABLE "data_sharing_policy";

-- DropTable
DROP TABLE "member_grade_access";

-- DropTable
DROP TABLE "organization_hierarchy";

-- DropTable
DROP TABLE "reservations";

-- DropTable
DROP TABLE "room_grades";

-- DropTable
DROP TABLE "rooms";

-- DropTable
DROP TABLE "schema_versions";

-- DropTable
DROP TABLE "system_events";

-- DropTable
DROP TABLE "tenant_organization";

-- DropTable
DROP TABLE "tenants";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "access_level_enum";

-- DropEnum
DROP TYPE "access_type_enum";

-- DropEnum
DROP TYPE "data_type_enum";

-- DropEnum
DROP TYPE "event_action";

-- DropEnum
DROP TYPE "event_type";

-- DropEnum
DROP TYPE "organization_type_enum";

-- DropEnum
DROP TYPE "reservation_origin";

-- DropEnum
DROP TYPE "reservation_status";

-- DropEnum
DROP TYPE "room_status";

-- DropEnum
DROP TYPE "sharing_scope_enum";

-- DropEnum
DROP TYPE "tenant_status";

-- DropEnum
DROP TYPE "user_role";

-- CreateTable
CREATE TABLE "AdminAccessLog" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roomId" TEXT,
    "deviceId" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'ja',

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCreditPlan" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "baseCreditsUsd" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "AiCreditPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCreditTopUp" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "amountUsd" DECIMAL(65,30) NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "AiCreditTopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCreditUsage" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER,
    "modelId" INTEGER NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "costUsd" DECIMAL(65,30) NOT NULL,
    "category" "CreditCategory" NOT NULL DEFAULT 'CONCIERGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiKnowledgeBase" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ja',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vectorized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiKnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "promptPriceUsd" DECIMAL(65,30) NOT NULL,
    "completionPriceUsd" DECIMAL(65,30) NOT NULL,
    "autoMargin" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "creditOverride" INTEGER,
    "description" TEXT,
    "useCase" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsageLimit" (
    "id" SERIAL NOT NULL,
    "deviceType" TEXT,
    "maxQueriesPerHour" INTEGER NOT NULL,
    "maxQueriesPerDay" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiUsageLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAdjustmentLog" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "adjustmentType" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "originalValue" TEXT NOT NULL,
    "adjustedValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingAdjustmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingSetting" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "baseFeeYen" INTEGER NOT NULL DEFAULT 20000,
    "includedDevices" INTEGER NOT NULL DEFAULT 20,
    "extraDeviceFeeYen" INTEGER NOT NULL DEFAULT 1000,
    "includedAiCredits" INTEGER NOT NULL DEFAULT 100,
    "extraAiCreditAmount" INTEGER NOT NULL DEFAULT 100,
    "extraAiCreditFeeYen" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ja" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboMeta" (
    "id" SERIAL NOT NULL,
    "structureType" TEXT NOT NULL,
    "categoryTagId" INTEGER,
    "fixedItemId" INTEGER,
    "requiredOpts" JSONB,
    "addonOpts" JSONB,

    CONSTRAINT "ComboMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConciergeCharacter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "friendly" INTEGER NOT NULL DEFAULT 70,
    "humor" INTEGER NOT NULL DEFAULT 50,
    "politeness" INTEGER NOT NULL DEFAULT 60,
    "toneTemplate" TEXT NOT NULL DEFAULT '敬語',
    "endingPhrase" TEXT NOT NULL DEFAULT 'です。',
    "rawDescription" TEXT,
    "promptSummary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConciergeCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceAccessLog" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "accessTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pagePath" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "DeviceAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceRoom" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "macAddress" TEXT,
    "ipAddress" TEXT,
    "deviceName" TEXT NOT NULL,
    "roomId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "deviceType" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "placeId" INTEGER,

    CONSTRAINT "DeviceRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSecret" (
    "id" SERIAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DeviceSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GooglePlayApp" (
    "id" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "category" TEXT NOT NULL,
    "deepLinkUrl" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GooglePlayApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "roomStatusId" INTEGER NOT NULL,
    "guestNumber" INTEGER NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelApp" (
    "id" TEXT NOT NULL,
    "placeId" INTEGER NOT NULL,
    "appId" TEXT NOT NULL,
    "customLabel" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoArticle" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "customCss" TEXT,
    "customJs" TEXT,
    "coverImg" TEXT,
    "category" TEXT NOT NULL,
    "tags" JSONB,
    "lang" TEXT NOT NULL DEFAULT 'ja',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InfoArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoMediaFile" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoMediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoRevision" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "customCss" TEXT,
    "customJs" TEXT,
    "changeLog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoSearchLog" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "topScore" DOUBLE PRECISION,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoSearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoTranslation" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'auto',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layout" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'page',
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "data" JSONB NOT NULL,
    "settings" JSONB,
    "previewUrl" TEXT,
    "publishedUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "templateId" INTEGER,
    "isPublicPage" BOOLEAN NOT NULL DEFAULT false,
    "publicPageActivatedAt" TIMESTAMP(3),
    "publicPageActivatedBy" TEXT,
    "previousPublicPageId" INTEGER,
    "displayStartAt" TIMESTAMP(3),
    "displayEndAt" TIMESTAMP(3),
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "seasonTag" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Layout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutAppBlock" (
    "id" TEXT NOT NULL,
    "layoutId" INTEGER NOT NULL,
    "blockId" TEXT NOT NULL,
    "appConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LayoutAppBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutAsset" (
    "id" SERIAL NOT NULL,
    "layoutId" INTEGER,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LayoutAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutRevision" (
    "id" SERIAL NOT NULL,
    "layoutId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "settings" JSONB,
    "changeLog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LayoutRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutSetting" (
    "id" SERIAL NOT NULL,
    "layoutId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'string',

    CONSTRAINT "LayoutSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGradeAccess" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "room_grade_id" TEXT NOT NULL,
    "member_rank_id" VARCHAR(50) NOT NULL,
    "access_type" TEXT NOT NULL,
    "priority_booking_hours" INTEGER NOT NULL DEFAULT 0,
    "max_bookings_per_month" INTEGER,
    "min_stay_override" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberGradeAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAsset" (
    "id" SERIAL NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuComboItem" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER NOT NULL,
    "childId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuComboItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ja" TEXT NOT NULL,
    "description" TEXT,
    "description_ja" TEXT,
    "price" INTEGER NOT NULL,
    "taxRate" INTEGER NOT NULL DEFAULT 10,
    "categoryId" INTEGER,
    "imageUrl" TEXT,
    "stockAvailable" BOOLEAN NOT NULL DEFAULT true,
    "stockQty" INTEGER,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "secretCode" TEXT,
    "isSet" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "showFrom" TIMESTAMP(3),
    "showTo" TIMESTAMP(3),
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "showRankingDay" BOOLEAN NOT NULL DEFAULT true,
    "showRankingWeek" BOOLEAN NOT NULL DEFAULT true,
    "showRankingMonth" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "costPrice" INTEGER,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationLog" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" TEXT,
    "staffName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationLog_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placeTypeId" INTEGER NOT NULL,
    "description" TEXT,
    "attributes" JSONB,
    "floor" INTEGER,
    "capacity" INTEGER,
    "area" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlaceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceGroupMember" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceType" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlaceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingLog" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RankingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "placeId" INTEGER NOT NULL,
    "receiptData" JSONB NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "room_id" TEXT NOT NULL,
    "check_in_date" TIMESTAMP(3) NOT NULL,
    "check_out_date" TIMESTAMP(3) NOT NULL,
    "guest_name" VARCHAR(100) NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "origin" VARCHAR(50) NOT NULL,
    "total_amount" DECIMAL(10,2),
    "paid_amount" DECIMAL(10,2) DEFAULT 0,
    "special_requests" TEXT,
    "internal_notes" TEXT,
    "checked_in_at" TIMESTAMP(3),
    "checked_out_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "room_number" VARCHAR(50) NOT NULL,
    "room_grade_id" TEXT,
    "floor" INTEGER,
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "status" VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    "accessibility_features" JSONB NOT NULL DEFAULT '[]',
    "grade_override_amenities" JSONB,
    "pricing_room_code" VARCHAR(50),
    "special_features" JSONB NOT NULL DEFAULT '{}',
    "view_type" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "maintenance_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomGrade" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "grade_code" VARCHAR(50) NOT NULL,
    "grade_name" VARCHAR(100) NOT NULL,
    "grade_name_en" VARCHAR(100),
    "description" TEXT,
    "grade_level" INTEGER NOT NULL,
    "default_capacity" INTEGER NOT NULL DEFAULT 2,
    "max_capacity" INTEGER NOT NULL DEFAULT 4,
    "room_size_sqm" DECIMAL(6,2),
    "standard_amenities" JSONB NOT NULL DEFAULT '[]',
    "premium_amenities" JSONB NOT NULL DEFAULT '[]',
    "included_services" JSONB NOT NULL DEFAULT '[]',
    "member_only" BOOLEAN NOT NULL DEFAULT false,
    "min_stay_nights" INTEGER NOT NULL DEFAULT 1,
    "advance_booking_days" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "pricing_category" VARCHAR(50),
    "origin_system" VARCHAR(50) NOT NULL DEFAULT 'hotel-common',
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_system" VARCHAR(50) NOT NULL DEFAULT 'hotel-common',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "RoomGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomGradeMedia" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "room_grade_id" TEXT NOT NULL,
    "media_type" VARCHAR(20) NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "display_order" INTEGER DEFAULT 1,
    "title" VARCHAR(200),
    "description" TEXT,
    "is_primary" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "RoomGradeMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMemo" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "staffName" TEXT NOT NULL,
    "assignedTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RoomMemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMemoComment" (
    "id" SERIAL NOT NULL,
    "memoId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "commentType" TEXT NOT NULL DEFAULT 'comment',
    "statusFrom" TEXT,
    "statusTo" TEXT,
    "parentCommentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RoomMemoComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMemoStatusLog" (
    "id" SERIAL NOT NULL,
    "memoId" INTEGER NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "comment" TEXT,
    "staffName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMemoStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomStatus" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "checkinAt" TIMESTAMP(3),
    "checkoutAt" TIMESTAMP(3),
    "guestCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockUpdateLog" (
    "id" SERIAL NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "oldQuantity" INTEGER,
    "newQuantity" INTEGER,
    "updatedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockUpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name_ja" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "aliases" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "planType" TEXT NOT NULL DEFAULT 'economy',
    "planCategory" TEXT NOT NULL DEFAULT 'omotenasuai',
    "planSelectedAt" TIMESTAMP(3),
    "planChangeable" BOOLEAN NOT NULL DEFAULT true,
    "planLockReason" TEXT,
    "maxDevices" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'active',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contractStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 29800,
    "agentId" TEXT,
    "agentCommissionRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "staff_code" TEXT NOT NULL,
    "staff_number" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name_kana" TEXT,
    "first_name_kana" TEXT,
    "display_name" TEXT NOT NULL,
    "employee_id" TEXT,
    "email" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "pin_hash" TEXT,
    "password_hash" TEXT,
    "password_changed_at" TIMESTAMP(3),
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "backup_codes" JSONB,
    "default_role_id" TEXT,
    "base_level" INTEGER NOT NULL DEFAULT 1,
    "department_code" TEXT,
    "position_title" TEXT,
    "hire_date" TIMESTAMP(3),
    "employment_type" TEXT NOT NULL DEFAULT 'full_time',
    "employment_status" TEXT NOT NULL DEFAULT 'active',
    "termination_date" TIMESTAMP(3),
    "termination_reason" TEXT,
    "phone_number" TEXT,
    "emergency_contact" JSONB,
    "address" JSONB,
    "photo_url" TEXT,
    "bio" TEXT,
    "skills" JSONB,
    "shift_pattern" TEXT,
    "hourly_rate" DECIMAL(10,2),
    "salary" DECIMAL(10,2),
    "supervisor_id" TEXT,
    "access_restrictions" JSONB NOT NULL DEFAULT '{}',
    "notification_settings" JSONB NOT NULL DEFAULT '{}',
    "ui_preferences" JSONB NOT NULL DEFAULT '{}',
    "security_clearance" TEXT,
    "access_card_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system_user" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "hotel_common_user_id" TEXT,
    "legacy_user_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "staff_number" TEXT NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "clock_in_time" TIMESTAMP(3) NOT NULL,
    "clock_out_time" TIMESTAMP(3),
    "break_start_time" TIMESTAMP(3),
    "break_end_time" TIMESTAMP(3),
    "work_duration_minutes" INTEGER,
    "overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "break_duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "attendance_status" TEXT NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "approved_by_staff_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "staff_number" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "shift_type" TEXT NOT NULL DEFAULT 'full_day',
    "is_working_day" BOOLEAN NOT NULL DEFAULT true,
    "is_holiday" BOOLEAN NOT NULL DEFAULT false,
    "is_paid_leave" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverNote" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "from_staff_id" TEXT NOT NULL,
    "to_staff_id" TEXT,
    "to_department" TEXT,
    "shift_handover_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "related_reservation_id" TEXT,
    "related_room_id" TEXT,
    "related_customer_id" TEXT,
    "photo_urls" JSONB NOT NULL DEFAULT '[]',
    "video_urls" JSONB NOT NULL DEFAULT '[]',
    "document_urls" JSONB NOT NULL DEFAULT '[]',
    "media_metadata" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by_staff_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "requires_immediate_action" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "HandoverNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffNotification" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "from_staff_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "related_handover_id" TEXT,
    "related_attendance_id" TEXT,
    "related_schedule_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "is_delivered" BOOLEAN NOT NULL DEFAULT false,
    "delivered_at" TIMESTAMP(3),
    "delivery_methods" JSONB NOT NULL DEFAULT '["in_app"]',
    "scheduled_for" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "StaffNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "staff_id" TEXT,
    "staff_number" TEXT,
    "staff_name" TEXT,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_fields" JSONB,
    "session_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MenuItemToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MenuItemToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "additional_devices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "location" TEXT,
    "monthlyCost" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "setupDate" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "additional_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "rank" TEXT NOT NULL DEFAULT 'bronze',
    "status" TEXT NOT NULL DEFAULT 'active',
    "firstYearMargin" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "continuingMargin" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_layout_assets" (
    "id" SERIAL NOT NULL,
    "contentLayoutId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "alt" TEXT,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_layout_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_layout_revisions" (
    "id" SERIAL NOT NULL,
    "layoutId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "elements" JSONB NOT NULL,
    "styles" JSONB,
    "content" TEXT,
    "changeLog" TEXT,
    "changeType" TEXT NOT NULL DEFAULT 'update',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_layout_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_layout_translations" (
    "id" SERIAL NOT NULL,
    "contentLayoutId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "excerpt" TEXT,
    "translatedBy" TEXT,
    "translatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_layout_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_layouts" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "elements" JSONB NOT NULL,
    "styles" JSONB NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishAt" TIMESTAMP(3),
    "expireAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'ja',
    "seo" JSONB,
    "permissions" JSONB,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "templateId" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "content_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_billings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "billingMonth" TEXT NOT NULL,
    "basePlanCost" INTEGER NOT NULL,
    "additionalDevices" INTEGER NOT NULL,
    "additionalDeviceCost" INTEGER NOT NULL,
    "multilingualCost" INTEGER NOT NULL DEFAULT 0,
    "overageCost" INTEGER NOT NULL DEFAULT 0,
    "subtotal" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "taxAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "agentCommission" DOUBLE PRECISION,
    "agentCommissionAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_change_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "previousPlanType" TEXT NOT NULL,
    "previousPlanCategory" TEXT NOT NULL,
    "previousMonthlyPrice" INTEGER NOT NULL,
    "newPlanType" TEXT NOT NULL,
    "newPlanCategory" TEXT NOT NULL,
    "newMonthlyPrice" INTEGER NOT NULL,
    "changeReason" TEXT NOT NULL,
    "changeDescription" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedByRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_restrictions" (
    "id" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "planCategory" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "agentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "referralType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "monthlyAmount" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_statistics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalOrderValue" INTEGER NOT NULL DEFAULT 0,
    "aiConciergeRequests" INTEGER NOT NULL DEFAULT 0,
    "aiBusinessRequests" INTEGER NOT NULL DEFAULT 0,
    "activeDevices" INTEGER NOT NULL DEFAULT 0,
    "roomDevices" INTEGER NOT NULL DEFAULT 0,
    "additionalDevices" INTEGER NOT NULL DEFAULT 0,
    "storageUsedGB" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isOrderLimitExceeded" BOOLEAN NOT NULL DEFAULT false,
    "isAiLimitExceeded" BOOLEAN NOT NULL DEFAULT false,
    "isDeviceLimitExceeded" BOOLEAN NOT NULL DEFAULT false,
    "isStorageLimitExceeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAccessLog_createdAt_idx" ON "AdminAccessLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiConversation_sessionId_key" ON "AiConversation"("sessionId");

-- CreateIndex
CREATE INDEX "AiConversation_deviceId_idx" ON "AiConversation"("deviceId");

-- CreateIndex
CREATE INDEX "AiConversation_language_idx" ON "AiConversation"("language");

-- CreateIndex
CREATE INDEX "AiConversation_roomId_idx" ON "AiConversation"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "AiCreditPlan_month_key" ON "AiCreditPlan"("month");

-- CreateIndex
CREATE INDEX "AiCreditPlan_month_idx" ON "AiCreditPlan"("month");

-- CreateIndex
CREATE INDEX "AiCreditTopUp_planId_idx" ON "AiCreditTopUp"("planId");

-- CreateIndex
CREATE INDEX "AiCreditTopUp_purchasedAt_idx" ON "AiCreditTopUp"("purchasedAt");

-- CreateIndex
CREATE INDEX "AiCreditUsage_createdAt_idx" ON "AiCreditUsage"("createdAt");

-- CreateIndex
CREATE INDEX "AiCreditUsage_modelId_idx" ON "AiCreditUsage"("modelId");

-- CreateIndex
CREATE INDEX "AiKnowledgeBase_isActive_idx" ON "AiKnowledgeBase"("isActive");

-- CreateIndex
CREATE INDEX "AiKnowledgeBase_language_idx" ON "AiKnowledgeBase"("language");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AiMessage_timestamp_idx" ON "AiMessage"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "AiModel_name_key" ON "AiModel"("name");

-- CreateIndex
CREATE INDEX "AiModel_isActive_idx" ON "AiModel"("isActive");

-- CreateIndex
CREATE INDEX "AiUsageLimit_deviceType_idx" ON "AiUsageLimit"("deviceType");

-- CreateIndex
CREATE INDEX "AiUsageLimit_isActive_idx" ON "AiUsageLimit"("isActive");

-- CreateIndex
CREATE INDEX "BillingAdjustmentLog_adjustmentType_idx" ON "BillingAdjustmentLog"("adjustmentType");

-- CreateIndex
CREATE INDEX "BillingAdjustmentLog_createdAt_idx" ON "BillingAdjustmentLog"("createdAt");

-- CreateIndex
CREATE INDEX "BillingAdjustmentLog_orderId_idx" ON "BillingAdjustmentLog"("orderId");

-- CreateIndex
CREATE INDEX "BillingAdjustmentLog_placeId_idx" ON "BillingAdjustmentLog"("placeId");

-- CreateIndex
CREATE INDEX "Category_isAvailable_idx" ON "Category"("isAvailable");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "ComboMeta_categoryTagId_idx" ON "ComboMeta"("categoryTagId");

-- CreateIndex
CREATE INDEX "ComboMeta_fixedItemId_idx" ON "ComboMeta"("fixedItemId");

-- CreateIndex
CREATE INDEX "DeviceAccessLog_accessTime_idx" ON "DeviceAccessLog"("accessTime");

-- CreateIndex
CREATE INDEX "DeviceAccessLog_deviceId_idx" ON "DeviceAccessLog"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceAccessLog_pagePath_idx" ON "DeviceAccessLog"("pagePath");

-- CreateIndex
CREATE INDEX "DeviceAccessLog_sessionId_idx" ON "DeviceAccessLog"("sessionId");

-- CreateIndex
CREATE INDEX "DeviceRoom_placeId_idx" ON "DeviceRoom"("placeId");

-- CreateIndex
CREATE INDEX "DeviceRoom_tenantId_idx" ON "DeviceRoom"("tenantId");

-- CreateIndex
CREATE INDEX "DeviceRoom_tenantId_isActive_idx" ON "DeviceRoom"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSecret_roomId_key" ON "DeviceSecret"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "GooglePlayApp_packageName_key" ON "GooglePlayApp"("packageName");

-- CreateIndex
CREATE INDEX "GooglePlayApp_category_idx" ON "GooglePlayApp"("category");

-- CreateIndex
CREATE INDEX "GooglePlayApp_isApproved_idx" ON "GooglePlayApp"("isApproved");

-- CreateIndex
CREATE INDEX "Guest_ageGroup_idx" ON "Guest"("ageGroup");

-- CreateIndex
CREATE INDEX "Guest_gender_idx" ON "Guest"("gender");

-- CreateIndex
CREATE INDEX "Guest_roomStatusId_idx" ON "Guest"("roomStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_roomStatusId_guestNumber_key" ON "Guest"("roomStatusId", "guestNumber");

-- CreateIndex
CREATE INDEX "HotelApp_isEnabled_idx" ON "HotelApp"("isEnabled");

-- CreateIndex
CREATE INDEX "HotelApp_placeId_idx" ON "HotelApp"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "HotelApp_placeId_appId_key" ON "HotelApp"("placeId", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "InfoArticle_slug_key" ON "InfoArticle"("slug");

-- CreateIndex
CREATE INDEX "InfoArticle_authorRole_idx" ON "InfoArticle"("authorRole");

-- CreateIndex
CREATE INDEX "InfoArticle_category_idx" ON "InfoArticle"("category");

-- CreateIndex
CREATE INDEX "InfoArticle_featured_idx" ON "InfoArticle"("featured");

-- CreateIndex
CREATE INDEX "InfoArticle_lang_startAt_idx" ON "InfoArticle"("lang", "startAt");

-- CreateIndex
CREATE INDEX "InfoArticle_status_idx" ON "InfoArticle"("status");

-- CreateIndex
CREATE INDEX "InfoMediaFile_articleId_idx" ON "InfoMediaFile"("articleId");

-- CreateIndex
CREATE INDEX "InfoMediaFile_fileType_idx" ON "InfoMediaFile"("fileType");

-- CreateIndex
CREATE INDEX "InfoRevision_articleId_version_idx" ON "InfoRevision"("articleId", "version");

-- CreateIndex
CREATE INDEX "InfoSearchLog_createdAt_idx" ON "InfoSearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "InfoSearchLog_query_idx" ON "InfoSearchLog"("query");

-- CreateIndex
CREATE INDEX "InfoTranslation_lang_idx" ON "InfoTranslation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "InfoTranslation_articleId_lang_key" ON "InfoTranslation"("articleId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "Layout_slug_key" ON "Layout"("slug");

-- CreateIndex
CREATE INDEX "Layout_authorId_idx" ON "Layout"("authorId");

-- CreateIndex
CREATE INDEX "Layout_category_idx" ON "Layout"("category");

-- CreateIndex
CREATE INDEX "Layout_category_isPublicPage_idx" ON "Layout"("category", "isPublicPage");

-- CreateIndex
CREATE INDEX "Layout_isActive_priority_idx" ON "Layout"("isActive", "priority");

-- CreateIndex
CREATE INDEX "Layout_isPublicPage_idx" ON "Layout"("isPublicPage");

-- CreateIndex
CREATE INDEX "Layout_isScheduled_displayStartAt_displayEndAt_idx" ON "Layout"("isScheduled", "displayStartAt", "displayEndAt");

-- CreateIndex
CREATE INDEX "Layout_isTemplate_idx" ON "Layout"("isTemplate");

-- CreateIndex
CREATE INDEX "Layout_seasonTag_idx" ON "Layout"("seasonTag");

-- CreateIndex
CREATE INDEX "Layout_slug_idx" ON "Layout"("slug");

-- CreateIndex
CREATE INDEX "Layout_status_idx" ON "Layout"("status");

-- CreateIndex
CREATE INDEX "Layout_type_idx" ON "Layout"("type");

-- CreateIndex
CREATE INDEX "LayoutAppBlock_layoutId_idx" ON "LayoutAppBlock"("layoutId");

-- CreateIndex
CREATE UNIQUE INDEX "LayoutAppBlock_layoutId_blockId_key" ON "LayoutAppBlock"("layoutId", "blockId");

-- CreateIndex
CREATE INDEX "LayoutAsset_fileType_idx" ON "LayoutAsset"("fileType");

-- CreateIndex
CREATE INDEX "LayoutAsset_isPublic_idx" ON "LayoutAsset"("isPublic");

-- CreateIndex
CREATE INDEX "LayoutAsset_layoutId_idx" ON "LayoutAsset"("layoutId");

-- CreateIndex
CREATE INDEX "LayoutRevision_createdAt_idx" ON "LayoutRevision"("createdAt");

-- CreateIndex
CREATE INDEX "LayoutRevision_layoutId_idx" ON "LayoutRevision"("layoutId");

-- CreateIndex
CREATE UNIQUE INDEX "LayoutRevision_layoutId_version_key" ON "LayoutRevision"("layoutId", "version");

-- CreateIndex
CREATE INDEX "LayoutSetting_layoutId_idx" ON "LayoutSetting"("layoutId");

-- CreateIndex
CREATE UNIQUE INDEX "LayoutSetting_layoutId_key_key" ON "LayoutSetting"("layoutId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MemberGradeAccess_tenant_id_room_grade_id_member_rank_id_key" ON "MemberGradeAccess"("tenant_id", "room_grade_id", "member_rank_id");

-- CreateIndex
CREATE INDEX "MenuAsset_menuItemId_idx" ON "MenuAsset"("menuItemId");

-- CreateIndex
CREATE INDEX "MenuComboItem_childId_idx" ON "MenuComboItem"("childId");

-- CreateIndex
CREATE INDEX "MenuComboItem_parentId_idx" ON "MenuComboItem"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuComboItem_parentId_childId_key" ON "MenuComboItem"("parentId", "childId");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_categoryOrder_idx" ON "MenuItem"("categoryId", "categoryOrder");

-- CreateIndex
CREATE INDEX "OperationLog_createdAt_idx" ON "OperationLog"("createdAt");

-- CreateIndex
CREATE INDEX "OperationLog_placeId_idx" ON "OperationLog"("placeId");

-- CreateIndex
CREATE INDEX "OperationLog_type_idx" ON "OperationLog"("type");

-- CreateIndex
CREATE INDEX "Order_placeId_idx" ON "Order"("placeId");

-- CreateIndex
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");

-- CreateIndex
CREATE INDEX "Order_tenantId_status_idx" ON "Order"("tenantId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_tenantId_idx" ON "OrderItem"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItem_tenantId_status_idx" ON "OrderItem"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Place_code_key" ON "Place"("code");

-- CreateIndex
CREATE INDEX "Place_isActive_idx" ON "Place"("isActive");

-- CreateIndex
CREATE INDEX "Place_placeTypeId_idx" ON "Place"("placeTypeId");

-- CreateIndex
CREATE INDEX "Place_tenantId_code_idx" ON "Place"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Place_tenantId_idx" ON "Place"("tenantId");

-- CreateIndex
CREATE INDEX "PlaceGroup_isActive_idx" ON "PlaceGroup"("isActive");

-- CreateIndex
CREATE INDEX "PlaceGroup_order_idx" ON "PlaceGroup"("order");

-- CreateIndex
CREATE INDEX "PlaceGroupMember_groupId_idx" ON "PlaceGroupMember"("groupId");

-- CreateIndex
CREATE INDEX "PlaceGroupMember_placeId_idx" ON "PlaceGroupMember"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceGroupMember_placeId_groupId_key" ON "PlaceGroupMember"("placeId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceType_name_key" ON "PlaceType"("name");

-- CreateIndex
CREATE INDEX "PlaceType_isActive_idx" ON "PlaceType"("isActive");

-- CreateIndex
CREATE INDEX "PlaceType_tenantId_idx" ON "PlaceType"("tenantId");

-- CreateIndex
CREATE INDEX "PlaceType_tenantId_order_idx" ON "PlaceType"("tenantId", "order");

-- CreateIndex
CREATE INDEX "RankingLog_day_idx" ON "RankingLog"("day");

-- CreateIndex
CREATE INDEX "RankingLog_menuItemId_idx" ON "RankingLog"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingLog_day_menuItemId_key" ON "RankingLog"("day", "menuItemId");

-- CreateIndex
CREATE INDEX "Receipt_createdAt_idx" ON "Receipt"("createdAt");

-- CreateIndex
CREATE INDEX "Receipt_placeId_idx" ON "Receipt"("placeId");

-- CreateIndex
CREATE INDEX "Reservation_customer_id_idx" ON "Reservation"("customer_id");

-- CreateIndex
CREATE INDEX "Reservation_tenant_id_check_in_date_check_out_date_idx" ON "Reservation"("tenant_id", "check_in_date", "check_out_date");

-- CreateIndex
CREATE INDEX "Reservation_tenant_id_status_idx" ON "Reservation"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "Room_tenant_id_pricing_room_code_idx" ON "Room"("tenant_id", "pricing_room_code");

-- CreateIndex
CREATE INDEX "Room_tenant_id_room_grade_id_idx" ON "Room"("tenant_id", "room_grade_id");

-- CreateIndex
CREATE INDEX "Room_tenant_id_room_grade_id_status_idx" ON "Room"("tenant_id", "room_grade_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Room_tenant_id_room_number_key" ON "Room"("tenant_id", "room_number");

-- CreateIndex
CREATE INDEX "RoomGrade_tenant_id_grade_level_idx" ON "RoomGrade"("tenant_id", "grade_level");

-- CreateIndex
CREATE INDEX "RoomGrade_tenant_id_is_active_is_public_idx" ON "RoomGrade"("tenant_id", "is_active", "is_public");

-- CreateIndex
CREATE INDEX "RoomGrade_tenant_id_pricing_category_idx" ON "RoomGrade"("tenant_id", "pricing_category");

-- CreateIndex
CREATE UNIQUE INDEX "RoomGrade_tenant_id_grade_code_key" ON "RoomGrade"("tenant_id", "grade_code");

-- CreateIndex
CREATE INDEX "idx_room_grade_media_order" ON "RoomGradeMedia"("room_grade_id", "display_order");

-- CreateIndex
CREATE INDEX "idx_room_grade_media_tenant_grade" ON "RoomGradeMedia"("tenant_id", "room_grade_id");

-- CreateIndex
CREATE INDEX "idx_room_grade_media_type" ON "RoomGradeMedia"("media_type", "is_active");

-- CreateIndex
CREATE INDEX "RoomMemo_category_idx" ON "RoomMemo"("category");

-- CreateIndex
CREATE INDEX "RoomMemo_createdAt_idx" ON "RoomMemo"("createdAt");

-- CreateIndex
CREATE INDEX "RoomMemo_placeId_idx" ON "RoomMemo"("placeId");

-- CreateIndex
CREATE INDEX "RoomMemo_status_idx" ON "RoomMemo"("status");

-- CreateIndex
CREATE INDEX "RoomMemoComment_commentType_idx" ON "RoomMemoComment"("commentType");

-- CreateIndex
CREATE INDEX "RoomMemoComment_createdAt_idx" ON "RoomMemoComment"("createdAt");

-- CreateIndex
CREATE INDEX "RoomMemoComment_memoId_idx" ON "RoomMemoComment"("memoId");

-- CreateIndex
CREATE INDEX "RoomMemoComment_parentCommentId_idx" ON "RoomMemoComment"("parentCommentId");

-- CreateIndex
CREATE INDEX "RoomMemoStatusLog_createdAt_idx" ON "RoomMemoStatusLog"("createdAt");

-- CreateIndex
CREATE INDEX "RoomMemoStatusLog_memoId_idx" ON "RoomMemoStatusLog"("memoId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomStatus_placeId_key" ON "RoomStatus"("placeId");

-- CreateIndex
CREATE INDEX "RoomStatus_placeId_idx" ON "RoomStatus"("placeId");

-- CreateIndex
CREATE INDEX "RoomStatus_status_idx" ON "RoomStatus"("status");

-- CreateIndex
CREATE INDEX "StockUpdateLog_createdAt_idx" ON "StockUpdateLog"("createdAt");

-- CreateIndex
CREATE INDEX "StockUpdateLog_menuItemId_idx" ON "StockUpdateLog"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_path_key" ON "Tag"("path");

-- CreateIndex
CREATE INDEX "Tag_tenantId_idx" ON "Tag"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_employee_id_key" ON "Staff"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_tenant_id_idx" ON "Staff"("tenant_id");

-- CreateIndex
CREATE INDEX "Staff_email_idx" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_department_code_idx" ON "Staff"("department_code");

-- CreateIndex
CREATE INDEX "Staff_employment_status_idx" ON "Staff"("employment_status");

-- CreateIndex
CREATE INDEX "Staff_is_active_idx" ON "Staff"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_tenant_id_staff_code_key" ON "Staff"("tenant_id", "staff_code");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_tenant_id_staff_number_key" ON "Staff"("tenant_id", "staff_number");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_tenant_id_employee_id_key" ON "Staff"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "Attendance_tenant_id_idx" ON "Attendance"("tenant_id");

-- CreateIndex
CREATE INDEX "Attendance_work_date_idx" ON "Attendance"("work_date");

-- CreateIndex
CREATE INDEX "Attendance_attendance_status_idx" ON "Attendance"("attendance_status");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_staff_id_work_date_key" ON "Attendance"("staff_id", "work_date");

-- CreateIndex
CREATE INDEX "WorkSchedule_tenant_id_idx" ON "WorkSchedule"("tenant_id");

-- CreateIndex
CREATE INDEX "WorkSchedule_schedule_date_idx" ON "WorkSchedule"("schedule_date");

-- CreateIndex
CREATE INDEX "WorkSchedule_shift_type_idx" ON "WorkSchedule"("shift_type");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_staff_id_schedule_date_key" ON "WorkSchedule"("staff_id", "schedule_date");

-- CreateIndex
CREATE INDEX "HandoverNote_tenant_id_idx" ON "HandoverNote"("tenant_id");

-- CreateIndex
CREATE INDEX "HandoverNote_from_staff_id_idx" ON "HandoverNote"("from_staff_id");

-- CreateIndex
CREATE INDEX "HandoverNote_to_staff_id_idx" ON "HandoverNote"("to_staff_id");

-- CreateIndex
CREATE INDEX "HandoverNote_category_idx" ON "HandoverNote"("category");

-- CreateIndex
CREATE INDEX "HandoverNote_priority_idx" ON "HandoverNote"("priority");

-- CreateIndex
CREATE INDEX "HandoverNote_status_idx" ON "HandoverNote"("status");

-- CreateIndex
CREATE INDEX "HandoverNote_created_at_idx" ON "HandoverNote"("created_at");

-- CreateIndex
CREATE INDEX "StaffNotification_tenant_id_idx" ON "StaffNotification"("tenant_id");

-- CreateIndex
CREATE INDEX "StaffNotification_staff_id_idx" ON "StaffNotification"("staff_id");

-- CreateIndex
CREATE INDEX "StaffNotification_type_idx" ON "StaffNotification"("type");

-- CreateIndex
CREATE INDEX "StaffNotification_is_read_idx" ON "StaffNotification"("is_read");

-- CreateIndex
CREATE INDEX "StaffNotification_created_at_idx" ON "StaffNotification"("created_at");

-- CreateIndex
CREATE INDEX "AuditLog_tenant_id_idx" ON "AuditLog"("tenant_id");

-- CreateIndex
CREATE INDEX "AuditLog_staff_id_idx" ON "AuditLog"("staff_id");

-- CreateIndex
CREATE INDEX "AuditLog_table_name_idx" ON "AuditLog"("table_name");

-- CreateIndex
CREATE INDEX "AuditLog_operation_idx" ON "AuditLog"("operation");

-- CreateIndex
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- CreateIndex
CREATE INDEX "_MenuItemToTag_B_index" ON "_MenuItemToTag"("B");

-- CreateIndex
CREATE INDEX "additional_devices_status_idx" ON "additional_devices"("status");

-- CreateIndex
CREATE INDEX "additional_devices_tenantId_idx" ON "additional_devices"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE INDEX "content_layout_revisions_layoutId_idx" ON "content_layout_revisions"("layoutId");

-- CreateIndex
CREATE UNIQUE INDEX "content_layout_revisions_layoutId_version_key" ON "content_layout_revisions"("layoutId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "content_layout_translations_contentLayoutId_language_key" ON "content_layout_translations"("contentLayoutId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "content_layouts_slug_key" ON "content_layouts"("slug");

-- CreateIndex
CREATE INDEX "content_layouts_isDeleted_idx" ON "content_layouts"("isDeleted");

-- CreateIndex
CREATE INDEX "content_layouts_language_idx" ON "content_layouts"("language");

-- CreateIndex
CREATE INDEX "content_layouts_status_publishAt_idx" ON "content_layouts"("status", "publishAt");

-- CreateIndex
CREATE INDEX "content_layouts_type_category_idx" ON "content_layouts"("type", "category");

-- CreateIndex
CREATE INDEX "monthly_billings_billingMonth_idx" ON "monthly_billings"("billingMonth");

-- CreateIndex
CREATE INDEX "monthly_billings_status_idx" ON "monthly_billings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_billings_tenantId_billingMonth_key" ON "monthly_billings"("tenantId", "billingMonth");

-- CreateIndex
CREATE INDEX "plan_change_logs_effectiveDate_idx" ON "plan_change_logs"("effectiveDate");

-- CreateIndex
CREATE INDEX "plan_change_logs_tenantId_idx" ON "plan_change_logs"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_restrictions_planType_planCategory_key" ON "plan_restrictions"("planType", "planCategory");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referralCode_key" ON "referrals"("referralCode");

-- CreateIndex
CREATE INDEX "usage_statistics_month_idx" ON "usage_statistics"("month");

-- CreateIndex
CREATE UNIQUE INDEX "usage_statistics_tenantId_month_key" ON "usage_statistics"("tenantId", "month");

-- CreateIndex
CREATE INDEX "customers_origin_system_idx" ON "customers"("origin_system");

-- CreateIndex
CREATE INDEX "customers_rank_id_idx" ON "customers"("rank_id");

-- CreateIndex
CREATE INDEX "customers_tenant_id_idx" ON "customers"("tenant_id");

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "DeviceRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCreditTopUp" ADD CONSTRAINT "AiCreditTopUp_planId_fkey" FOREIGN KEY ("planId") REFERENCES "AiCreditPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCreditUsage" ADD CONSTRAINT "AiCreditUsage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCreditUsage" ADD CONSTRAINT "AiCreditUsage_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboMeta" ADD CONSTRAINT "ComboMeta_id_fkey" FOREIGN KEY ("id") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceAccessLog" ADD CONSTRAINT "DeviceAccessLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "DeviceRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceRoom" ADD CONSTRAINT "DeviceRoom_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_roomStatusId_fkey" FOREIGN KEY ("roomStatusId") REFERENCES "RoomStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelApp" ADD CONSTRAINT "HotelApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "GooglePlayApp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelApp" ADD CONSTRAINT "HotelApp_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoMediaFile" ADD CONSTRAINT "InfoMediaFile_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "InfoArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoRevision" ADD CONSTRAINT "InfoRevision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "InfoArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoTranslation" ADD CONSTRAINT "InfoTranslation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "InfoArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Layout" ADD CONSTRAINT "Layout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Layout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutAppBlock" ADD CONSTRAINT "LayoutAppBlock_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutAsset" ADD CONSTRAINT "LayoutAsset_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutRevision" ADD CONSTRAINT "LayoutRevision_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutSetting" ADD CONSTRAINT "LayoutSetting_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGradeAccess" ADD CONSTRAINT "MemberGradeAccess_room_grade_id_fkey" FOREIGN KEY ("room_grade_id") REFERENCES "RoomGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGradeAccess" ADD CONSTRAINT "MemberGradeAccess_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAsset" ADD CONSTRAINT "MenuAsset_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuComboItem" ADD CONSTRAINT "MenuComboItem_childId_fkey" FOREIGN KEY ("childId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuComboItem" ADD CONSTRAINT "MenuComboItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationLog" ADD CONSTRAINT "OperationLog_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_placeTypeId_fkey" FOREIGN KEY ("placeTypeId") REFERENCES "PlaceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceGroupMember" ADD CONSTRAINT "PlaceGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PlaceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceGroupMember" ADD CONSTRAINT "PlaceGroupMember_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_room_grade_id_fkey" FOREIGN KEY ("room_grade_id") REFERENCES "RoomGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGrade" ADD CONSTRAINT "RoomGrade_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomGradeMedia" ADD CONSTRAINT "RoomGradeMedia_room_grade_id_fkey" FOREIGN KEY ("room_grade_id") REFERENCES "RoomGrade"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RoomMemo" ADD CONSTRAINT "RoomMemo_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMemoComment" ADD CONSTRAINT "RoomMemoComment_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES "RoomMemo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMemoComment" ADD CONSTRAINT "RoomMemoComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "RoomMemoComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMemoStatusLog" ADD CONSTRAINT "RoomMemoStatusLog_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES "RoomMemo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomStatus" ADD CONSTRAINT "RoomStatus_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_approved_by_staff_id_fkey" FOREIGN KEY ("approved_by_staff_id") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverNote" ADD CONSTRAINT "HandoverNote_from_staff_id_fkey" FOREIGN KEY ("from_staff_id") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverNote" ADD CONSTRAINT "HandoverNote_to_staff_id_fkey" FOREIGN KEY ("to_staff_id") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverNote" ADD CONSTRAINT "HandoverNote_acknowledged_by_staff_id_fkey" FOREIGN KEY ("acknowledged_by_staff_id") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNotification" ADD CONSTRAINT "StaffNotification_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNotification" ADD CONSTRAINT "StaffNotification_from_staff_id_fkey" FOREIGN KEY ("from_staff_id") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNotification" ADD CONSTRAINT "StaffNotification_related_handover_id_fkey" FOREIGN KEY ("related_handover_id") REFERENCES "HandoverNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNotification" ADD CONSTRAINT "StaffNotification_related_attendance_id_fkey" FOREIGN KEY ("related_attendance_id") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNotification" ADD CONSTRAINT "StaffNotification_related_schedule_id_fkey" FOREIGN KEY ("related_schedule_id") REFERENCES "WorkSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToTag" ADD CONSTRAINT "_MenuItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuItemToTag" ADD CONSTRAINT "_MenuItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_devices" ADD CONSTRAINT "additional_devices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_layout_assets" ADD CONSTRAINT "content_layout_assets_contentLayoutId_fkey" FOREIGN KEY ("contentLayoutId") REFERENCES "content_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_layout_revisions" ADD CONSTRAINT "content_layout_revisions_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "content_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_layout_translations" ADD CONSTRAINT "content_layout_translations_contentLayoutId_fkey" FOREIGN KEY ("contentLayoutId") REFERENCES "content_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_layouts" ADD CONSTRAINT "content_layouts_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "content_layouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_billings" ADD CONSTRAINT "monthly_billings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_change_logs" ADD CONSTRAINT "plan_change_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_statistics" ADD CONSTRAINT "usage_statistics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
