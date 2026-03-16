-- ============================================================================
-- Migration 002: Add public/shareable snippets
-- Description: Adds is_public and public_slug columns to snippet table.
--              Public snippets are accessible via /s/:public_slug without auth.
-- ============================================================================

-- Add columns to existing snippet table
ALTER TABLE public.snippet
  ADD COLUMN is_public boolean NOT NULL DEFAULT false;

ALTER TABLE public.snippet
  ADD COLUMN public_slug varchar(12) UNIQUE;

-- Index for fast public snippet lookups
CREATE INDEX idx_snippet_public_slug
  ON public.snippet (public_slug)
  WHERE public_slug IS NOT NULL;

CREATE INDEX idx_snippet_is_public
  ON public.snippet (is_public)
  WHERE is_public = true;

-- Allow anonymous users to read public snippets (for the /s/:slug route)
-- TO public = both anon and authenticated roles
CREATE POLICY "Anyone can read public snippets"
  ON public.snippet
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (is_public = true AND state IN ('active', 'favorite'));
