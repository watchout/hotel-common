-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SystemPlanRestrictions" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TenantSystemPlan" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "admin_log" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "campaign_categories" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "campaign_category_relations" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "campaign_items" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "campaign_translations" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "campaign_usage_logs" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "device_rooms" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "device_video_caches" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "notification_templates" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "page_histories" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "response_trees" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "OrderItem_is_deleted_idx" ON "OrderItem"("is_deleted");

-- CreateIndex
CREATE INDEX "SystemPlanRestrictions_is_deleted_idx" ON "SystemPlanRestrictions"("is_deleted");

-- CreateIndex
CREATE INDEX "Tenant_is_deleted_idx" ON "Tenant"("is_deleted");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_is_deleted_idx" ON "TenantSystemPlan"("is_deleted");

-- CreateIndex
CREATE INDEX "admin_is_deleted_idx" ON "admin"("is_deleted");

-- CreateIndex
CREATE INDEX "admin_log_is_deleted_idx" ON "admin_log"("is_deleted");

-- CreateIndex
CREATE INDEX "campaign_categories_is_deleted_idx" ON "campaign_categories"("is_deleted");

-- CreateIndex
CREATE INDEX "campaign_category_relations_is_deleted_idx" ON "campaign_category_relations"("is_deleted");

-- CreateIndex
CREATE INDEX "campaign_items_is_deleted_idx" ON "campaign_items"("is_deleted");

-- CreateIndex
CREATE INDEX "campaign_translations_is_deleted_idx" ON "campaign_translations"("is_deleted");

-- CreateIndex
CREATE INDEX "campaign_usage_logs_is_deleted_idx" ON "campaign_usage_logs"("is_deleted");

-- CreateIndex
CREATE INDEX "campaigns_is_deleted_idx" ON "campaigns"("is_deleted");

-- CreateIndex
CREATE INDEX "device_video_caches_is_deleted_idx" ON "device_video_caches"("is_deleted");

-- CreateIndex
CREATE INDEX "notification_templates_is_deleted_idx" ON "notification_templates"("is_deleted");

-- CreateIndex
CREATE INDEX "page_histories_is_deleted_idx" ON "page_histories"("is_deleted");

-- CreateIndex
CREATE INDEX "pages_is_deleted_idx" ON "pages"("is_deleted");

-- CreateIndex
CREATE INDEX "response_trees_is_deleted_idx" ON "response_trees"("is_deleted");

-- CreateIndex
CREATE INDEX "staff_is_deleted_idx" ON "staff"("is_deleted");

