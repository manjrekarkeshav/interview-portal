/*
  # Add RLS policies for authenticated users

  ## Problem
  All existing RLS policies only cover the `anon` role.
  When a user logs in, they become `authenticated` role and are blocked from all tables.

  ## Changes
  - Add SELECT, INSERT, UPDATE, DELETE policies for `authenticated` role on all tables:
    - applications
    - timeline_events
    - compensation
    - feedback_notes
    - interview_structure
    - referrals
*/

-- applications
CREATE POLICY "Authenticated can select applications"
  ON public.applications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert applications"
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete applications"
  ON public.applications FOR DELETE TO authenticated
  USING (true);

-- timeline_events
CREATE POLICY "Authenticated can select timeline_events"
  ON public.timeline_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert timeline_events"
  ON public.timeline_events FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update timeline_events"
  ON public.timeline_events FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete timeline_events"
  ON public.timeline_events FOR DELETE TO authenticated
  USING (true);

-- compensation
CREATE POLICY "Authenticated can select compensation"
  ON public.compensation FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert compensation"
  ON public.compensation FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update compensation"
  ON public.compensation FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete compensation"
  ON public.compensation FOR DELETE TO authenticated
  USING (true);

-- feedback_notes
CREATE POLICY "Authenticated can select feedback_notes"
  ON public.feedback_notes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert feedback_notes"
  ON public.feedback_notes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update feedback_notes"
  ON public.feedback_notes FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete feedback_notes"
  ON public.feedback_notes FOR DELETE TO authenticated
  USING (true);

-- interview_structure
CREATE POLICY "Authenticated can select interview_structure"
  ON public.interview_structure FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert interview_structure"
  ON public.interview_structure FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update interview_structure"
  ON public.interview_structure FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete interview_structure"
  ON public.interview_structure FOR DELETE TO authenticated
  USING (true);

-- referrals
CREATE POLICY "Authenticated can select referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update referrals"
  ON public.referrals FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete referrals"
  ON public.referrals FOR DELETE TO authenticated
  USING (true);
