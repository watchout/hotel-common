-- AlterTable
ALTER TABLE "response_node_translations" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "response_node_translations_is_deleted_idx" ON "response_node_translations"("is_deleted");

