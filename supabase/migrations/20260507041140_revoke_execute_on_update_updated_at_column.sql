/*
  # Revoke public execute on update_updated_at_column trigger function

  ## Security Fix
  Revokes EXECUTE privilege on `public.update_updated_at_column()` from the `anon`
  and `authenticated` roles. This function is a trigger helper and should never be
  callable directly via the REST API. It requires no direct invocation rights.
*/

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
