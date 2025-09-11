-- AlterTable: Add isDeleted column to Order table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Order' AND column_name = 'isDeleted'
  ) THEN
    ALTER TABLE "Order" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- CreateIndex: Create index on isDeleted and paidAt columns for better performance if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'Order_isDeleted_paidAt_idx'
  ) THEN
    CREATE INDEX "Order_isDeleted_paidAt_idx" ON "Order"("isDeleted", "paidAt");
  END IF;
END $$;

-- Create DatabaseChangeLog table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'DatabaseChangeLog'
  ) THEN
    CREATE TABLE "DatabaseChangeLog" (
      "id" SERIAL PRIMARY KEY,
      "changeType" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "details" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdBy" TEXT NOT NULL
    );
  END IF;
END $$;

-- Insert record into DatabaseChangeLog
INSERT INTO "DatabaseChangeLog" ("changeType", "description", "details", "createdBy")
VALUES ('SCHEMA_CHANGE', 'Added isDeleted column to Order table', '{"table": "Order", "columns": ["isDeleted"], "indexes": ["Order_isDeleted_paidAt_idx"]}', 'system');
