-- CreateTable: DeviceRoomテーブルの作成
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

  CONSTRAINT "device_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: インデックスの作成
CREATE INDEX "device_rooms_tenantId_idx" ON "device_rooms"("tenantId");
CREATE INDEX "device_rooms_roomId_idx" ON "device_rooms"("roomId");
CREATE INDEX "device_rooms_deviceId_idx" ON "device_rooms"("deviceId");
CREATE INDEX "device_rooms_placeId_idx" ON "device_rooms"("placeId");
CREATE INDEX "device_rooms_status_idx" ON "device_rooms"("status");

-- AddForeignKey: 外部キー制約の追加
ALTER TABLE "device_rooms" ADD CONSTRAINT "device_rooms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert record into DatabaseChangeLog
INSERT INTO "DatabaseChangeLog" ("changeType", "description", "details", "createdBy")
VALUES (
  'SCHEMA_CHANGE', 
  'Added DeviceRoom table for hotel-saas device management', 
  '{"table": "device_rooms", "columns": ["id", "tenantId", "roomId", "roomName", "deviceId", "deviceType", "placeId", "status", "ipAddress", "macAddress", "lastUsedAt", "isActive", "createdAt", "updatedAt"], "indexes": ["device_rooms_tenantId_idx", "device_rooms_roomId_idx", "device_rooms_deviceId_idx", "device_rooms_placeId_idx", "device_rooms_status_idx"]}',
  'database_admin'
);
