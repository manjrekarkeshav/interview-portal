/*
  # Add total_equity column to compensation table

  ## Changes

  ### Modified Tables
  - `compensation`: Added `total_equity` column (numeric, default 0) to store the total equity
    grant value (as opposed to `annual_equity` which is the annualized value).

  ## Notes
  - Non-destructive change: existing rows will default to 0
  - `annual_equity` remains unchanged (annualized equity)
  - `total_equity` is the total grant amount (e.g. 4-year cliff)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'compensation' AND column_name = 'total_equity'
  ) THEN
    ALTER TABLE public.compensation ADD COLUMN total_equity numeric DEFAULT 0;
  END IF;
END $$;
