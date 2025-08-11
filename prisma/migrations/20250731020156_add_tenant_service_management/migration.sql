/*
  Warnings:

  - You are about to drop the `service_plan_restrictions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service_usage_statistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_services` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminLevel" AS ENUM ('chainadmin', 'groupadmin', 'superadmin');

-- DropForeignKey
ALTER TABLE "service_usage_statistics" DROP CONSTRAINT "service_usage_statistics_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_services" DROP CONSTRAINT "tenant_services_tenant_id_fkey";

-- DropTable
DROP TABLE "service_plan_restrictions";

-- DropTable
DROP TABLE "service_usage_statistics";

-- DropTable
DROP TABLE "tenant_services";

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

    CONSTRAINT "admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_event_tenant_id_idx" ON "system_event"("tenant_id");

-- CreateIndex
CREATE INDEX "system_event_event_type_idx" ON "system_event"("event_type");

-- CreateIndex
CREATE INDEX "system_event_status_idx" ON "system_event"("status");

-- CreateIndex
CREATE INDEX "system_event_created_at_idx" ON "system_event"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE INDEX "admin_log_admin_id_idx" ON "admin_log"("admin_id");

-- CreateIndex
CREATE INDEX "admin_log_action_idx" ON "admin_log"("action");

-- CreateIndex
CREATE INDEX "admin_log_created_at_idx" ON "admin_log"("created_at");

-- AddForeignKey
ALTER TABLE "admin_log" ADD CONSTRAINT "admin_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
