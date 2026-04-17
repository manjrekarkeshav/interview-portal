/*
  # Update status and outcome constraints (v2)

  ## Changes
  - Drops existing CHECK constraints on status and outcome
  - Migrates existing data to new values
  - Adds new CHECK constraints with updated allowed values

  ## Data Migration
  - status: Not Started/In Progress/Pending Response -> Active, Complete -> Closed
  - outcome: Offer -> Complete, Low Comp - No Go -> Withdrew, Active -> NULL
*/

-- Step 1: Drop old constraints first
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_outcome_check;

-- Step 2: Migrate existing status values
UPDATE applications SET status = 'Active'
  WHERE status IN ('Not Started', 'In Progress', 'Pending Response');

UPDATE applications SET status = 'Closed'
  WHERE status = 'Complete';

-- Step 3: Migrate existing outcome values
UPDATE applications SET outcome = 'Complete'
  WHERE outcome = 'Offer';

UPDATE applications SET outcome = 'Withdrew'
  WHERE outcome = 'Low Comp - No Go';

UPDATE applications SET outcome = NULL
  WHERE outcome = 'Active';

-- Step 4: Add new constraints
ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('Active', 'Closed'));

ALTER TABLE applications
  ADD CONSTRAINT applications_outcome_check
  CHECK (outcome IN ('Scheduled', 'Complete', 'Ghosted', 'Reject', 'Role Closed', 'Withdrew'));

-- Step 5: Update default
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'Active';
