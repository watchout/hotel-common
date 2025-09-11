-- レスポンスツリーセッション管理のためのマイグレーション
-- 必要なテーブルが存在しない場合は先に作成します

-- ResponseNodeテーブルが存在しない場合は作成
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ResponseNode') THEN
    CREATE TABLE "ResponseNode" (
      "id" TEXT NOT NULL,
      "treeId" TEXT NOT NULL,
      "nodeType" TEXT NOT NULL,
      "parentId" TEXT,
      "position" INTEGER NOT NULL,
      "conditions" JSONB,
      "metadata" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      
      CONSTRAINT "ResponseNode_pkey" PRIMARY KEY ("id")
    );
    
    CREATE INDEX "ResponseNode_treeId_idx" ON "ResponseNode"("treeId");
    CREATE INDEX "ResponseNode_parentId_idx" ON "ResponseNode"("parentId");
  END IF;
END $$;

-- セッション管理テーブル
CREATE TABLE "ResponseTreeSession" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "deviceId" INTEGER,
  "roomId" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "language" TEXT NOT NULL DEFAULT 'ja',
  "interfaceType" TEXT NOT NULL DEFAULT 'tv',
  "currentNodeId" TEXT,

  CONSTRAINT "ResponseTreeSession_pkey" PRIMARY KEY ("id")
);

-- セッション履歴テーブル
CREATE TABLE "ResponseTreeHistory" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "nodeId" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" TEXT NOT NULL,

  CONSTRAINT "ResponseTreeHistory_pkey" PRIMARY KEY ("id")
);

-- モバイル連携テーブル
CREATE TABLE "ResponseTreeMobileLink" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "linkCode" TEXT NOT NULL,
  "deviceId" INTEGER,
  "roomId" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isValid" BOOLEAN NOT NULL DEFAULT true,
  "connectionId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "connectedAt" TIMESTAMP(3),
  "deviceInfo" JSONB,

  CONSTRAINT "ResponseTreeMobileLink_pkey" PRIMARY KEY ("id")
);

-- インデックス
CREATE UNIQUE INDEX "ResponseTreeSession_sessionId_key" ON "ResponseTreeSession"("sessionId");
CREATE INDEX "ResponseTreeSession_deviceId_idx" ON "ResponseTreeSession"("deviceId");
CREATE INDEX "ResponseTreeSession_roomId_idx" ON "ResponseTreeSession"("roomId");
CREATE INDEX "ResponseTreeSession_language_idx" ON "ResponseTreeSession"("language");
CREATE INDEX "ResponseTreeSession_interfaceType_idx" ON "ResponseTreeSession"("interfaceType");
CREATE INDEX "ResponseTreeSession_currentNodeId_idx" ON "ResponseTreeSession"("currentNodeId");

CREATE INDEX "ResponseTreeHistory_sessionId_idx" ON "ResponseTreeHistory"("sessionId");
CREATE INDEX "ResponseTreeHistory_nodeId_idx" ON "ResponseTreeHistory"("nodeId");
CREATE INDEX "ResponseTreeHistory_timestamp_idx" ON "ResponseTreeHistory"("timestamp");

CREATE UNIQUE INDEX "ResponseTreeMobileLink_linkCode_key" ON "ResponseTreeMobileLink"("linkCode");
CREATE INDEX "ResponseTreeMobileLink_sessionId_idx" ON "ResponseTreeMobileLink"("sessionId");
CREATE INDEX "ResponseTreeMobileLink_deviceId_idx" ON "ResponseTreeMobileLink"("deviceId");
CREATE INDEX "ResponseTreeMobileLink_roomId_idx" ON "ResponseTreeMobileLink"("roomId");
CREATE INDEX "ResponseTreeMobileLink_userId_idx" ON "ResponseTreeMobileLink"("userId");
CREATE INDEX "ResponseTreeMobileLink_status_idx" ON "ResponseTreeMobileLink"("status");

-- 外部キー制約
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'DeviceRoom') THEN
    ALTER TABLE "ResponseTreeSession" ADD CONSTRAINT "ResponseTreeSession_deviceId_fkey" 
      FOREIGN KEY ("deviceId") REFERENCES "DeviceRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ResponseNode') THEN
    ALTER TABLE "ResponseTreeSession" ADD CONSTRAINT "ResponseTreeSession_currentNodeId_fkey" 
      FOREIGN KEY ("currentNodeId") REFERENCES "ResponseNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "ResponseTreeHistory" ADD CONSTRAINT "ResponseTreeHistory_sessionId_fkey" 
  FOREIGN KEY ("sessionId") REFERENCES "ResponseTreeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ResponseNode') THEN
    ALTER TABLE "ResponseTreeHistory" ADD CONSTRAINT "ResponseTreeHistory_nodeId_fkey" 
      FOREIGN KEY ("nodeId") REFERENCES "ResponseNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "ResponseTreeMobileLink" ADD CONSTRAINT "ResponseTreeMobileLink_sessionId_fkey" 
  FOREIGN KEY ("sessionId") REFERENCES "ResponseTreeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'DeviceRoom') THEN
    ALTER TABLE "ResponseTreeMobileLink" ADD CONSTRAINT "ResponseTreeMobileLink_deviceId_fkey" 
      FOREIGN KEY ("deviceId") REFERENCES "DeviceRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
