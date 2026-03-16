-- ============================================================================
-- ROLLBACK Migration 001: Remove snippet versioning
-- Run this to revert migration 001
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own snippet versions" ON public.snippet_version;
DROP TABLE IF EXISTS public.snippet_version CASCADE;
