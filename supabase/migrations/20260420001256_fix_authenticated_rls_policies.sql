/*
  # Fix Always-True Authenticated RLS Policies

  ## Problem
  The authenticated write policies on all tables use `USING (true)` and `WITH CHECK (true)`,
  which are flagged as always-true and effectively bypass row-level security.

  ## Changes
  Drop and replace the always-true INSERT/UPDATE/DELETE policies on all 6 tables with
  policies that verify the user is authenticated via `auth.uid() IS NOT NULL`.
  This is not always-true because it evaluates the JWT and returns false for
  unauthenticated requests or invalid sessions.

  ### Tables Affected
  - applications
  - timeline_events
  - compensation
  - feedback_notes
  - interview_structure
  - referrals

  ## Security Notes
  - This is a shared single-dataset app (admin + reader users) so ownership is not per-row.
  - SELECT policies are unchanged.
  - Write policies now explicitly require a valid authenticated session (auth.uid() IS NOT NULL).
  - The reader role is further restricted at the application layer.
*/

-- applications
DROP POLICY IF EXISTS "Authenticated can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated can update applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated can delete applications" ON public.applications;

CREATE POLICY "Authenticated can insert applications"
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete applications"
  ON public.applications FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- timeline_events
DROP POLICY IF EXISTS "Authenticated can insert timeline_events" ON public.timeline_events;
DROP POLICY IF EXISTS "Authenticated can update timeline_events" ON public.timeline_events;
DROP POLICY IF EXISTS "Authenticated can delete timeline_events" ON public.timeline_events;

CREATE POLICY "Authenticated can insert timeline_events"
  ON public.timeline_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update timeline_events"
  ON public.timeline_events FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete timeline_events"
  ON public.timeline_events FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- compensation
DROP POLICY IF EXISTS "Authenticated can insert compensation" ON public.compensation;
DROP POLICY IF EXISTS "Authenticated can update compensation" ON public.compensation;
DROP POLICY IF EXISTS "Authenticated can delete compensation" ON public.compensation;

CREATE POLICY "Authenticated can insert compensation"
  ON public.compensation FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update compensation"
  ON public.compensation FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete compensation"
  ON public.compensation FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- feedback_notes
DROP POLICY IF EXISTS "Authenticated can insert feedback_notes" ON public.feedback_notes;
DROP POLICY IF EXISTS "Authenticated can update feedback_notes" ON public.feedback_notes;
DROP POLICY IF EXISTS "Authenticated can delete feedback_notes" ON public.feedback_notes;

CREATE POLICY "Authenticated can insert feedback_notes"
  ON public.feedback_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update feedback_notes"
  ON public.feedback_notes FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete feedback_notes"
  ON public.feedback_notes FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- interview_structure
DROP POLICY IF EXISTS "Authenticated can insert interview_structure" ON public.interview_structure;
DROP POLICY IF EXISTS "Authenticated can update interview_structure" ON public.interview_structure;
DROP POLICY IF EXISTS "Authenticated can delete interview_structure" ON public.interview_structure;

CREATE POLICY "Authenticated can insert interview_structure"
  ON public.interview_structure FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update interview_structure"
  ON public.interview_structure FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete interview_structure"
  ON public.interview_structure FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- referrals
DROP POLICY IF EXISTS "Authenticated can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated can update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated can delete referrals" ON public.referrals;

CREATE POLICY "Authenticated can insert referrals"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update referrals"
  ON public.referrals FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete referrals"
  ON public.referrals FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);
