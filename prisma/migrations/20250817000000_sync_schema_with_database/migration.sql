-- AlterTable: Staffモデルにパスワード関連フィールドを追加
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "failed_login_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3);
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMP(3);

-- CreateIndex: メールアドレスのインデックスを追加
CREATE INDEX IF NOT EXISTS "Staff_email_idx" ON "staff"("email");
