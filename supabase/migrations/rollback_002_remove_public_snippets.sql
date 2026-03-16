-- ============================================================================
-- ROLLBACK Migration 002: Remove public snippets
-- Run this to revert migration 002
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can read public snippets" ON public.snippet;
DROP INDEX IF EXISTS idx_snippet_is_public;
DROP INDEX IF EXISTS idx_snippet_public_slug;
ALTER TABLE public.snippet DROP COLUMN IF EXISTS public_slug;
ALTER TABLE public.snippet DROP COLUMN IF EXISTS is_public;
