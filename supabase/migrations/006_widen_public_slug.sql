-- ============================================================================
-- Migration 006: Widen public_slug to match generated slug length
-- Description: generateSlug() in queries.ts produces a 22-character slug
--              (32-char UUID hex sliced to 22), but migration 002 created
--              public_slug as varchar(12). Any attempt to make a snippet
--              public failed with "22001 value too long for type character
--              varying(12)". Widen the column to 22 so the high-entropy,
--              hard-to-guess share slug (the only gate on a public snippet)
--              fits. The UNIQUE constraint and partial index are preserved.
-- ============================================================================

ALTER TABLE public.snippet
  ALTER COLUMN public_slug TYPE varchar(22);
