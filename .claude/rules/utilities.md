---
paths:
  - "app/utils/**/*.ts"
  - "app/lib/constants/**/*.ts"
  - "app/lib/config/**/*.ts"
  - "app/lib/models/**/*.ts"
---

# Utility & Lib Rules

- Utils are pure functions — no side effects, no Supabase calls
- Global types (`Snippet`, `UUID`, `SnippetState`, etc.) are declared in `types/*.d.ts` — never redeclare or import them
- Zustand stores live in `app/lib/store/` and use the `use[Name]Store` naming convention
- Constants are organized by domain: `core.ts`, `toast.ts`, `form.ts`, `account.ts`, `codeMirror.ts`
