/*
  # Add Company Type and Industry to Applications

  1. Changes
    - Add `company_type` column to `applications` table
      - Type: text, nullable
      - Valid values: Series A, Series B, Series C, Series D, Series E, Pre-IPO, Public
    - Add `industry` column to `applications` table
      - Type: text, nullable
      - Valid values: Bank, FinTech, Tech, Health Tech, SaaS

  2. Notes
    - Both columns are nullable to preserve existing data
    - No destructive operations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'company_type'
  ) THEN
    ALTER TABLE applications ADD COLUMN company_type text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'industry'
  ) THEN
    ALTER TABLE applications ADD COLUMN industry text;
  END IF;
END $$;
