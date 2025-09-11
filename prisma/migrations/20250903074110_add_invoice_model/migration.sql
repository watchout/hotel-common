-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "invoiceId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "processedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "isDeleted" SET NOT NULL,
ALTER COLUMN "deletedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "capacity" SET NOT NULL,
ALTER COLUMN "lastCleaned" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "isDeleted" SET NOT NULL,
ALTER COLUMN "deletedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "taxAmount" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "isDeleted" SET NOT NULL,
ALTER COLUMN "deletedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "billingAddress" JSONB,
    "items" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_createdAt_idx" ON "invoices"("createdAt");

-- CreateIndex
CREATE INDEX "invoices_isDeleted_idx" ON "invoices"("isDeleted");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_payments_createdat" RENAME TO "payments_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_payments_isdeleted" RENAME TO "payments_isDeleted_idx";

-- RenameIndex
ALTER INDEX "idx_payments_paymentmethod" RENAME TO "payments_paymentMethod_idx";

-- RenameIndex
ALTER INDEX "idx_payments_status" RENAME TO "payments_status_idx";

-- RenameIndex
ALTER INDEX "idx_payments_tenantid" RENAME TO "payments_tenantId_idx";

-- RenameIndex
ALTER INDEX "idx_rooms_floor" RENAME TO "rooms_floor_idx";

-- RenameIndex
ALTER INDEX "idx_rooms_isdeleted" RENAME TO "rooms_isDeleted_idx";

-- RenameIndex
ALTER INDEX "idx_rooms_roomtype" RENAME TO "rooms_roomType_idx";

-- RenameIndex
ALTER INDEX "idx_rooms_status" RENAME TO "rooms_status_idx";

-- RenameIndex
ALTER INDEX "idx_rooms_tenantid" RENAME TO "rooms_tenantId_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_createdat" RENAME TO "transactions_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_isdeleted" RENAME TO "transactions_isDeleted_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_status" RENAME TO "transactions_status_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_tenantid" RENAME TO "transactions_tenantId_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_type" RENAME TO "transactions_type_idx";

