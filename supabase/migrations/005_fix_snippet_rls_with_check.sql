-- ============================================================================
-- Migration 005: Tighten snippet write policy (WITH CHECK)
-- Description: The "Enable all for users based on user_id" RLS policy used
--              WITH CHECK (true), which let an authenticated user INSERT or
--              UPDATE snippet rows with an arbitrary user_id — writing rows
--              into another user's account (broken access control / IDOR).
--              Bind the written row's owner to the caller so all writes are
--              scoped to auth.uid(), matching the snippet_version policy.
-- ============================================================================

ALTER POLICY "Enable all for users based on user_id"
  ON public.snippet
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
