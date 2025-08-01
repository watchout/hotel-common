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

  CONSTRAINT "SystemPlanRestrictions_pkey" PRIMARY KEY ("id")
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

  CONSTRAINT "TenantSystemPlan_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "SystemPlanRestrictions_systemType_businessType_planType_planCat_key" ON "SystemPlanRestrictions"("systemType", "businessType", "planType", "planCategory");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_tenantId_idx" ON "TenantSystemPlan"("tenantId");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_systemType_idx" ON "TenantSystemPlan"("systemType");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_planId_idx" ON "TenantSystemPlan"("planId");

-- CreateIndex
CREATE INDEX "TenantSystemPlan_isActive_idx" ON "TenantSystemPlan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSystemPlan_tenantId_systemType_key" ON "TenantSystemPlan"("tenantId", "systemType");

-- CreateIndex
CREATE INDEX "DatabaseChangeLog_changeType_idx" ON "DatabaseChangeLog"("changeType");

-- CreateIndex
CREATE INDEX "DatabaseChangeLog_createdAt_idx" ON "DatabaseChangeLog"("createdAt");

-- AddForeignKey
ALTER TABLE "TenantSystemPlan" ADD CONSTRAINT "TenantSystemPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSystemPlan" ADD CONSTRAINT "TenantSystemPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SystemPlanRestrictions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert first record into DatabaseChangeLog
INSERT INTO "DatabaseChangeLog" ("changeType", "description", "details", "createdBy")
VALUES ('SCHEMA_CHANGE', 'Added system plan management tables', '{"tables": ["SystemPlanRestrictions", "TenantSystemPlan", "DatabaseChangeLog"]}', 'system');