-- CreateEnum
CREATE TYPE "organization_type_enum" AS ENUM ('GROUP', 'BRAND', 'HOTEL', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "data_type_enum" AS ENUM ('CUSTOMER', 'RESERVATION', 'ANALYTICS', 'FINANCIAL', 'STAFF', 'INVENTORY');

-- CreateEnum
CREATE TYPE "sharing_scope_enum" AS ENUM ('GROUP', 'BRAND', 'HOTEL', 'DEPARTMENT', 'NONE');

-- CreateEnum
CREATE TYPE "access_level_enum" AS ENUM ('FULL', 'READ_ONLY', 'ANALYTICS_ONLY', 'SUMMARY_ONLY');

-- CreateEnum
CREATE TYPE "access_type_enum" AS ENUM ('FULL', 'PRIORITY', 'RESTRICTED', 'BLOCKED');

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "accessibility_features" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "grade_override_amenities" JSONB,
ADD COLUMN     "pricing_room_code" VARCHAR(50),
ADD COLUMN     "room_grade_id" TEXT,
ADD COLUMN     "special_features" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "view_type" VARCHAR(50);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hierarchy_permissions" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "organization_id" TEXT;

-- CreateTable
CREATE TABLE "organization_hierarchy" (
    "id" TEXT NOT NULL,
    "organization_type" "organization_type_enum" NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "parent_id" TEXT,
    "level" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_hierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_organization" (
    "tenant_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_organization_pkey" PRIMARY KEY ("tenant_id","organization_id")
);

-- CreateTable
CREATE TABLE "data_sharing_policy" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "data_type" "data_type_enum" NOT NULL,
    "sharing_scope" "sharing_scope_enum" NOT NULL,
    "access_level" "access_level_enum" NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sharing_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_grades" (
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

    CONSTRAINT "room_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_grade_access" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "room_grade_id" TEXT NOT NULL,
    "member_rank_id" VARCHAR(50) NOT NULL,
    "access_type" "access_type_enum" NOT NULL,
    "priority_booking_hours" INTEGER NOT NULL DEFAULT 0,
    "max_bookings_per_month" INTEGER,
    "min_stay_override" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_grade_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_hierarchy_level_organization_type_idx" ON "organization_hierarchy"("level", "organization_type");

-- CreateIndex
CREATE INDEX "organization_hierarchy_path_idx" ON "organization_hierarchy"("path");

-- CreateIndex
CREATE UNIQUE INDEX "organization_hierarchy_parent_id_code_key" ON "organization_hierarchy"("parent_id", "code");

-- CreateIndex
CREATE INDEX "tenant_organization_tenant_id_idx" ON "tenant_organization"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_organization_organization_id_idx" ON "tenant_organization"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_sharing_policy_organization_id_data_type_key" ON "data_sharing_policy"("organization_id", "data_type");

-- CreateIndex
CREATE INDEX "room_grades_tenant_id_grade_level_idx" ON "room_grades"("tenant_id", "grade_level");

-- CreateIndex
CREATE INDEX "room_grades_tenant_id_is_active_is_public_idx" ON "room_grades"("tenant_id", "is_active", "is_public");

-- CreateIndex
CREATE INDEX "room_grades_tenant_id_pricing_category_idx" ON "room_grades"("tenant_id", "pricing_category");

-- CreateIndex
CREATE UNIQUE INDEX "room_grades_tenant_id_grade_code_key" ON "room_grades"("tenant_id", "grade_code");

-- CreateIndex
CREATE UNIQUE INDEX "member_grade_access_tenant_id_room_grade_id_member_rank_id_key" ON "member_grade_access"("tenant_id", "room_grade_id", "member_rank_id");

-- CreateIndex
CREATE INDEX "rooms_tenant_id_room_grade_id_idx" ON "rooms"("tenant_id", "room_grade_id");

-- CreateIndex
CREATE INDEX "rooms_tenant_id_room_grade_id_status_idx" ON "rooms"("tenant_id", "room_grade_id", "status");

-- CreateIndex
CREATE INDEX "rooms_tenant_id_pricing_room_code_idx" ON "rooms"("tenant_id", "pricing_room_code");

-- AddForeignKey
ALTER TABLE "organization_hierarchy" ADD CONSTRAINT "organization_hierarchy_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "organization_hierarchy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_organization" ADD CONSTRAINT "tenant_organization_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_organization" ADD CONSTRAINT "tenant_organization_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization_hierarchy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sharing_policy" ADD CONSTRAINT "data_sharing_policy_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization_hierarchy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_grades" ADD CONSTRAINT "room_grades_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_grade_id_fkey" FOREIGN KEY ("room_grade_id") REFERENCES "room_grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_grade_access" ADD CONSTRAINT "member_grade_access_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_grade_access" ADD CONSTRAINT "member_grade_access_room_grade_id_fkey" FOREIGN KEY ("room_grade_id") REFERENCES "room_grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
