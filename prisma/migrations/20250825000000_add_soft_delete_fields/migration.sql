-- ソフトデリート対応のためのマイグレーション
-- 各テーブルにis_deleted、deleted_at、deleted_byフィールドを追加

-- 既に対応済みのテーブルはスキップ
-- Order テーブルは既に isDeleted と deletedAt フィールドがあるため、deleted_by のみ追加
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;

-- device_rooms テーブルはisActiveフィールドがあるため、標準フィールドを追加
ALTER TABLE "public"."device_rooms" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."device_rooms" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."device_rooms" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "device_rooms_is_deleted_idx" ON "public"."device_rooms"("is_deleted");

-- customers テーブル
ALTER TABLE "public"."customers" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."customers" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."customers" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "customers_is_deleted_idx" ON "public"."customers"("is_deleted");

-- reservations テーブル
ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "reservations_is_deleted_idx" ON "public"."reservations"("is_deleted");

-- campaigns テーブル
ALTER TABLE "public"."campaigns" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."campaigns" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."campaigns" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "campaigns_is_deleted_idx" ON "public"."campaigns"("is_deleted");

-- response_trees テーブル
ALTER TABLE "public"."response_trees" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."response_trees" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."response_trees" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "response_trees_is_deleted_idx" ON "public"."response_trees"("is_deleted");

-- response_nodes テーブル
ALTER TABLE "public"."response_nodes" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."response_nodes" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."response_nodes" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "response_nodes_is_deleted_idx" ON "public"."response_nodes"("is_deleted");

-- pages テーブル
ALTER TABLE "public"."pages" ADD COLUMN IF NOT EXISTS "IsDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."pages" ADD COLUMN IF NOT EXISTS "DeletedAt" TIMESTAMP;
ALTER TABLE "public"."pages" ADD COLUMN IF NOT EXISTS "DeletedBy" TEXT;
CREATE INDEX IF NOT EXISTS "pages_IsDeleted_idx" ON "public"."pages"("IsDeleted");

-- room_grades テーブル
ALTER TABLE "public"."room_grades" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."room_grades" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."room_grades" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "room_grades_is_deleted_idx" ON "public"."room_grades"("is_deleted");

-- staff テーブル
ALTER TABLE "public"."staff" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."staff" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."staff" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "staff_is_deleted_idx" ON "public"."staff"("is_deleted");

-- Tenant テーブル
ALTER TABLE "public"."Tenant" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."Tenant" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;
ALTER TABLE "public"."Tenant" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
CREATE INDEX IF NOT EXISTS "Tenant_is_deleted_idx" ON "public"."Tenant"("is_deleted");

-- スキーマバージョン更新
INSERT INTO "public"."schema_version" ("version", "description", "applied_at", "applied_by")
VALUES ('20250825000000', 'Add soft delete fields to tables', NOW(), 'hotel-common-migration');



