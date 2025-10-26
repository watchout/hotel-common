-- Purpose: Align table name casing from "Staff" (created in early migrations) to lower-case staff used by later migrations and Prisma schema.
-- Safe: No-op if staff already exists or Staff does not exist.
DO $$
BEGIN
  IF to_regclass('public.staff') IS NULL AND to_regclass('public."Staff"') IS NOT NULL THEN
    ALTER TABLE "Staff" RENAME TO staff;
  END IF;
END $$;
