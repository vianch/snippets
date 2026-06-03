-- ============================================================================
-- Rollback 005: Restore the original snippet write policy
-- WARNING: WITH CHECK (true) lets authenticated users write snippet rows with
--          an arbitrary user_id (into other accounts). Only run this to revert
--          migration 005; the original state is insecure.
-- ============================================================================

ALTER POLICY "Enable all for users based on user_id"
  ON public.snippet
  USING (auth.uid() = user_id)
  WITH CHECK (true);
