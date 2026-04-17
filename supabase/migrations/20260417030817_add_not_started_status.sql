/*
  # Add 'Not Started' as a valid status

  ## Changes
  - Drops the current status CHECK constraint
  - Adds a new constraint including 'Not Started', 'Active', 'Pending Response', and 'Closed'
*/

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('Not Started', 'Active', 'Pending Response', 'Closed'));
