/*
  # Revoke PUBLIC execute on update_updated_at_column

  The previous migration revoked EXECUTE from `anon` and `authenticated` by name,
  but the PUBLIC pseudo-role still held EXECUTE, which implicitly grants it to all
  roles including anon and authenticated. This migration revokes from PUBLIC to
  fully close the exposure.

  The function is a trigger helper only and requires no direct invocation rights.
*/

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
