/*
  # Pipeline Job Tracker - Initial Schema

  ## Summary
  Creates all tables needed for the Pipeline job application tracking app.
  This is a single-user app with no authentication - all data is accessible via anon role.

  ## Tables Created

  ### 1. applications
  Core table for job applications. Tracks company, role, priority, status, stage, recruiter info, and sponsorship status.

  ### 2. timeline_events
  Many-per-application event log. Tracks scheduled events, completions, rejections, ghosting, etc.

  ### 3. compensation
  One-per-application compensation data. Tracks base, bonus, equity with computed total.

  ### 4. feedback_notes
  Many-per-application interviewer feedback. Supports markdown content.

  ### 5. interview_structure
  One-per-application interview loop structure.

  ### 6. referrals
  Contact/referral tracking, optionally linked to an application.

  ## Security
  RLS enabled on all tables. Anon role has full CRUD access since this is a single-user local app with no authentication.

  ## Notes
  - All foreign keys cascade delete for data integrity
  - updated_at columns use triggers for automatic updates
*/

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  priority text NOT NULL DEFAULT 'P1' CHECK (priority IN ('P0', 'P0.5', 'P1', 'P2')),
  status text NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Pending Response', 'Complete')),
  outcome text CHECK (outcome IN ('Reject', 'Ghosted', 'Role Closed', 'Withdrew', 'Offer', 'Low Comp - No Go', 'Active')),
  current_stage text NOT NULL DEFAULT 'Recruiter Outreach' CHECK (current_stage IN ('Recruiter Outreach', 'Recruiter Screen', 'Hiring Manager', 'Product Sense', 'Onsite', 'Post Onsite', 'Offer', 'Sign-on')),
  recruiter_name text DEFAULT '',
  recruiter_contact text DEFAULT '',
  referral_source text DEFAULT '',
  h1b_sponsorship text NOT NULL DEFAULT 'Unknown' CHECK (h1b_sponsorship IN ('Confirmed', 'Not Offered', 'Unknown')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Timeline events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  event_type text NOT NULL CHECK (event_type IN ('Scheduled', 'Completed', 'Rejected', 'Ghosted', 'Withdrew', 'Outreach', 'Note')),
  stage text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Compensation table (one per application)
CREATE TABLE IF NOT EXISTS compensation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  base numeric DEFAULT 0,
  bonus numeric DEFAULT 0,
  annual_equity numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feedback notes table
CREATE TABLE IF NOT EXISTS feedback_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  interviewer_name text DEFAULT '',
  date date DEFAULT CURRENT_DATE,
  round text DEFAULT '',
  content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Interview structure table (one per application)
CREATE TABLE IF NOT EXISTS interview_structure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  rounds text[] DEFAULT '{}',
  general_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  poc_name text NOT NULL,
  status text NOT NULL DEFAULT 'Reached out' CHECK (status IN ('Reached out', 'In progress', 'Closed')),
  referred boolean DEFAULT false,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_application_id ON timeline_events(application_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(date);
CREATE INDEX IF NOT EXISTS idx_feedback_notes_application_id ON feedback_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_priority ON applications(priority);
CREATE INDEX IF NOT EXISTS idx_applications_current_stage ON applications(current_stage);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compensation_updated_at ON compensation;
CREATE TRIGGER update_compensation_updated_at
  BEFORE UPDATE ON compensation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_structure_updated_at ON interview_structure;
CREATE TRIGGER update_interview_structure_updated_at
  BEFORE UPDATE ON interview_structure
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referrals_updated_at ON referrals;
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: grant full access to anon role (single-user app, no auth)
CREATE POLICY "Anon can select applications" ON applications FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert applications" ON applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update applications" ON applications FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete applications" ON applications FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can select timeline_events" ON timeline_events FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert timeline_events" ON timeline_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update timeline_events" ON timeline_events FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete timeline_events" ON timeline_events FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can select compensation" ON compensation FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert compensation" ON compensation FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update compensation" ON compensation FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete compensation" ON compensation FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can select feedback_notes" ON feedback_notes FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert feedback_notes" ON feedback_notes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update feedback_notes" ON feedback_notes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete feedback_notes" ON feedback_notes FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can select interview_structure" ON interview_structure FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert interview_structure" ON interview_structure FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update interview_structure" ON interview_structure FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete interview_structure" ON interview_structure FOR DELETE TO anon USING (true);

CREATE POLICY "Anon can select referrals" ON referrals FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert referrals" ON referrals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update referrals" ON referrals FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete referrals" ON referrals FOR DELETE TO anon USING (true);
