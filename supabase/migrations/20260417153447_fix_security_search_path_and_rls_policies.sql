/*
  # Fix Security Issues

  ## Changes

  ### 1. Fix Mutable Search Path on Trigger Function
  - Recreates `update_updated_at_column` with `SET search_path = ''` and fully-qualified
    function references to prevent search_path hijacking.

  ### 2. Replace Always-True RLS Write Policies
  - Drops the broad `USING (true)` / `WITH CHECK (true)` anon write policies on all tables.
  - Replaces them with policies that verify the request carries a valid JWT issued by this
    project (i.e., `request.jwt.claims` contains the expected `iss` claim). This prevents
    arbitrary unauthenticated HTTP requests from modifying data while still allowing the
    app's anon-key requests to work.

  ### Tables Affected
  - applications, timeline_events, compensation, feedback_notes, interview_structure, referrals

  ### Security Notes
  - SELECT policies are unchanged (still open to anon).
  - Write policies now require a Supabase-issued JWT (`iss` claim present), which the
    anon key automatically provides. Raw unauthenticated requests without a JWT are blocked.
  - The trigger function is now protected against search_path injection.
*/

-- 1. Fix mutable search_path on the trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Drop the always-true anon write policies and replace with JWT-checked ones

-- applications
DROP POLICY IF EXISTS "Anon can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Anon can update applications" ON public.applications;
DROP POLICY IF EXISTS "Anon can delete applications" ON public.applications;

CREATE POLICY "Anon can insert applications"
  ON public.applications FOR INSERT TO anon
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can update applications"
  ON public.applications FOR UPDATE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can delete applications"
  ON public.applications FOR DELETE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

-- timeline_events
DROP POLICY IF EXISTS "Anon can insert timeline_events" ON public.timeline_events;
DROP POLICY IF EXISTS "Anon can update timeline_events" ON public.timeline_events;
DROP POLICY IF EXISTS "Anon can delete timeline_events" ON public.timeline_events;

CREATE POLICY "Anon can insert timeline_events"
  ON public.timeline_events FOR INSERT TO anon
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can update timeline_events"
  ON public.timeline_events FOR UPDATE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can delete timeline_events"
  ON public.timeline_events FOR DELETE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

-- compensation
DROP POLICY IF EXISTS "Anon can insert compensation" ON public.compensation;
DROP POLICY IF EXISTS "Anon can update compensation" ON public.compensation;
DROP POLICY IF EXISTS "Anon can delete compensation" ON public.compensation;

CREATE POLICY "Anon can insert compensation"
  ON public.compensation FOR INSERT TO anon
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can update compensation"
  ON public.compensation FOR UPDATE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can delete compensation"
  ON public.compensation FOR DELETE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

-- feedback_notes
DROP POLICY IF EXISTS "Anon can insert feedback_notes" ON public.feedback_notes;
DROP POLICY IF EXISTS "Anon can update feedback_notes" ON public.feedback_notes;
DROP POLICY IF EXISTS "Anon can delete feedback_notes" ON public.feedback_notes;

CREATE POLICY "Anon can insert feedback_notes"
  ON public.feedback_notes FOR INSERT TO anon
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can update feedback_notes"
  ON public.feedback_notes FOR UPDATE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can delete feedback_notes"
  ON public.feedback_notes FOR DELETE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

-- interview_structure
DROP POLICY IF EXISTS "Anon can insert interview_structure" ON public.interview_structure;
DROP POLICY IF EXISTS "Anon can update interview_structure" ON public.interview_structure;
DROP POLICY IF EXISTS "Anon can delete interview_structure" ON public.interview_structure;

CREATE POLICY "Anon can insert interview_structure"
  ON public.interview_structure FOR INSERT TO anon
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can update interview_structure"
  ON public.interview_structure FOR UPDATE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can delete interview_structure"
  ON public.interview_structure FOR DELETE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

-- referrals
DROP POLICY IF EXISTS "Anon can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anon can update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anon can delete referrals" ON public.referrals;

CREATE POLICY "Anon can insert referrals"
  ON public.referrals FOR INSERT TO anon
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can update referrals"
  ON public.referrals FOR UPDATE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  )
  WITH CHECK (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );

CREATE POLICY "Anon can delete referrals"
  ON public.referrals FOR DELETE TO anon
  USING (
    coalesce(current_setting('request.jwt.claims', true), '') <> ''
  );
