-- ============================================================================
-- Migration 001: Add snippet versioning
-- Description: Creates snippet_version table to store historical versions
--              of snippets. A new version is created on each save.
-- ============================================================================

-- Version history table
CREATE TABLE public.snippet_version (
  version_id uuid NOT NULL DEFAULT gen_random_uuid(),
  snippet_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  content text NOT NULL,
  language varchar NOT NULL,
  name varchar NOT NULL,
  tags text,
  version_number integer NOT NULL DEFAULT 1,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (version_id),
  CONSTRAINT fk_snippet_version_snippet
    FOREIGN KEY (snippet_id) REFERENCES public.snippet(snippet_id) ON DELETE CASCADE,
  CONSTRAINT fk_snippet_version_user
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Indexes for fast lookups
CREATE INDEX idx_snippet_version_snippet_id
  ON public.snippet_version (snippet_id);

CREATE INDEX idx_snippet_version_created_at
  ON public.snippet_version (snippet_id, created_at DESC);

CREATE INDEX idx_snippet_version_user_id
  ON public.snippet_version (user_id);

-- Unique constraint: one version number per snippet
CREATE UNIQUE INDEX idx_snippet_version_unique
  ON public.snippet_version (snippet_id, version_number);

-- RLS: users can only see/manage their own versions
ALTER TABLE public.snippet_version ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own snippet versions"
  ON public.snippet_version
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
