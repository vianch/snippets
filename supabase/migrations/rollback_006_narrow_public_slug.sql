-- ============================================================================
-- Rollback 006: Narrow public_slug back to varchar(12)
-- WARNING: This reverts to the broken state where the app cannot make a
--          snippet public (generated slugs are 22 chars). It will also FAIL if
--          any stored public_slug already exceeds 12 characters — clear or
--          truncate those rows first. Only run to revert migration 006.
-- ============================================================================

ALTER TABLE public.snippet
  ALTER COLUMN public_slug TYPE varchar(12);
