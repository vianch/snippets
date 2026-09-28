# Global TypeScript declarations

The `.d.ts` files in this directory declare shared application and database shapes for the TypeScript project. Domain declarations are grouped by feature, including snippets, notes, storage, AI, admin, MFA, UI, Markdown, and the Supabase database schema.

Add shared declarations to the matching file rather than duplicating a domain type in a component or utility. Keep these files declaration-only; runtime validators and factories belong under `app/lib/` or `app/utils/`.
