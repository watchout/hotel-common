-- Ensure unique one-to-one on payments.transactionId
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'payments_transactionId_key'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId")';
  END IF;
END $$;

-- Add FK payments.transactionId -> transactions.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_transactionId_fkey' AND table_name = 'payments'
  ) THEN
    EXECUTE 'ALTER TABLE "payments" ADD CONSTRAINT "payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE';
  END IF;
END $$;
