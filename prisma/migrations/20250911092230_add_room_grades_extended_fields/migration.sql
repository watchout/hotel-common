-- AlterTable
ALTER TABLE "room_grades" 
ADD COLUMN IF NOT EXISTS "base_rate_multiplier" DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS "priority_order" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "created_by" TEXT,
ADD COLUMN IF NOT EXISTS "created_by_system" TEXT DEFAULT 'hotel-common',
ADD COLUMN IF NOT EXISTS "updated_by" TEXT,
ADD COLUMN IF NOT EXISTS "updated_by_system" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "room_grades_is_active_idx" ON "room_grades"("is_active");
