-- DropIndex
DROP INDEX "pages_IsDeleted_idx";

-- DropIndex
DROP INDEX "response_nodes_is_deleted_idx";

-- DropIndex
DROP INDEX "room_grades_is_deleted_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deleted_by";

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "DeletedAt",
DROP COLUMN "DeletedBy",
DROP COLUMN "IsDeleted";

-- AlterTable
ALTER TABLE "response_nodes" DROP COLUMN "deleted_at",
DROP COLUMN "deleted_by",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "room_grades" DROP COLUMN "deleted_at",
DROP COLUMN "deleted_by",
DROP COLUMN "is_deleted";

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

