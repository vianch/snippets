# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project-wide rules for AI coding agents. Detailed guidance lives in `.claude/rules/`.
All code Claude produces must conform to **every** rule below.

| Topic                        | Rule file                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------- |
| File naming                  | [.claude/rules/file-naming.md](.claude/rules/file-naming.md)                 |
| TypeScript                   | [.claude/rules/typescript.md](.claude/rules/typescript.md)                   |
| Naming (no abbreviations)    | [.claude/rules/naming.md](.claude/rules/naming.md)                           |
| Code style (braces, helpers) | [.claude/rules/code-style.md](.claude/rules/code-style.md)                   |
| Enums and constants          | [.claude/rules/enums-and-constants.md](.claude/rules/enums-and-constants.md) |
| Types location               | [.claude/rules/types-location.md](.claude/rules/types-location.md)           |
| Components                   | [.claude/rules/components.md](.claude/rules/components.md)                   |
| Supabase                     | [.claude/rules/supabase.md](.claude/rules/supabase.md)                       |
| Internationalization         | [.claude/rules/i18n.md](.claude/rules/i18n.md)                               |
| Imports                      | [.claude/rules/imports.md](.claude/rules/imports.md)                         |
| Utilities                    | [.claude/rules/utilities.md](.claude/rules/utilities.md)                     |
| Verification                 | [.claude/rules/verification.md](.claude/rules/verification.md)               |

## What Is This

Snippets — a personal code snippet manager. Users authenticate, then create/edit/tag/favorite/trash code snippets via an in-browser CodeMirror editor. Live at snippets.vianch.com.

## Commands

```bash
yarn install          # Install dependencies
yarn dev              # Start dev server (Next.js)
yarn build            # Production build
yarn lint             # Run all linters (ESLint + Stylelint + Prettier)
yarn lint:code-style  # ESLint only (with --fix)
yarn lint:style       # Stylelint only (CSS, with --fix)
yarn lint:formatting  # Prettier only (with --write)
```

Package manager is **yarn** (not npm/pnpm). The `yarn init` script nukes node_modules and lock files, then reinstalls — use sparingly.

## Git Hooks

- **pre-commit**: runs `yarn run lint` (all linters)
- **pre-push**: runs `yarn audit`

## Architecture

**Stack**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Supabase + Zustand 5 + CodeMirror + Vercel Analytics. Deployed on Vercel.

### Path Aliases (tsconfig)

| Alias            | Maps to            |
| ---------------- | ------------------ |
| `@/components/*` | `app/components/*` |
| `@/models/*`     | `app/models/*`     |
| `@/lib/*`        | `app/lib/*`        |
| `@/utils/*`      | `app/utils/*`      |

### Key Directories

- `app/lib/supabase/` — Supabase client (`client.ts` for browser, `server.ts` for middleware), all DB queries in `queries.ts`
- `app/lib/store/` — Zustand stores (`menu.store`, `toast.store`, `viewPort.store`, `user.store`)
- `app/lib/constants/` — App constants (menu items, toast types, form config, CodeMirror settings)
- `app/lib/config/languages.ts` — CodeMirror language extension mappings
- `app/lib/models/Snippet.ts` — Snippet value object (factory for new snippets)
- `app/components/` — React components, each in its own directory (e.g., `CodeEditor/CodeEditor.tsx`)
- `app/components/ui/` — Reusable UI primitives (Button, Input, Modal, Select, Alert, Badge, icons)
- `app/utils/` — Pure utility functions (array, date, string, meta, ui, account)
- `types/` — Global TypeScript declaration files (`.d.ts`) for domain types (Snippet, Toast, UI, etc.)

### Data Flow

The main app page (`app/snippets/page.tsx`) is a client component that owns all snippet state. It fetches from Supabase via `queries.ts`, manages snippet CRUD, and passes data down to `Aside`, `SnippetList`, `CodeEditor`, and `ResizableLayout` via props. There is no server-side data fetching beyond auth in the middleware.

### Auth

Supabase auth with proxy-based route protection (`proxy.ts`, renamed from `middleware.ts` in Next.js 16). Unauthenticated users hitting `/snippets` redirect to `/login`; authenticated users hitting `/login` redirect to `/snippets`.

### Routes

- `/` — Landing page
- `/login` — Auth form
- `/snippets` — Main app (protected)
- `/privacy-policy`, `/terms` — Static legal pages
- `/tools` — Tools section

## Environment Variables

Copy `.env.example` → `.env.local`. Required:

- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Style

- Tabs for indentation, double quotes, trailing commas (`es5`), semicolons
- ESLint 9 flat config (`eslint.config.mjs`) with typescript-eslint, next/core-web-vitals, and prettier
- `no-console` is an error
- Blank lines enforced between blocks, returns, control flow, and variable declarations (see `eslint.config.mjs` padding rules)
- `react-hooks/exhaustive-deps` and `react-hooks/set-state-in-effect` are disabled
- Global types live in `types/*.d.ts` — domain types like `Snippet`, `UUID`, `SnippetState`, `CurrentSnippet`, `TagItem` are globally available without imports
- No single-letter or abbreviated variable names — use descriptive names (`versions` not `v`, `snippet` not `s`, `index` not `i`). Exception: standard loop counters in `Array.from` or `.map` where the variable is unused (`_`)

## Memory & Rules System

This project uses Claude Code's persistent memory and path-scoped rules:

### Auto-Memory (cross-session learning)

Stored at `~/.claude/projects/-Users-victorchavarro-Documents-dev-personal-snippets/memory/`. Claude reads `MEMORY.md` (the index) at the start of every session and loads topic files on demand.

| File                  | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `MEMORY.md`           | Index of all memory files (first 200 lines loaded every session) |
| `project_overview.md` | Architecture patterns and key decisions                          |
| `session_log.md`      | Running log of changes, decisions, and discoveries per session   |

**Maintenance rules:**

- After significant work, append a dated entry to `session_log.md`
- When discovering new patterns or making architectural decisions, update `project_overview.md`
- When receiving correction or feedback, create a `feedback_*.md` memory file
- Keep `MEMORY.md` under 200 lines — it gets truncated beyond that

### Path-Scoped Rules (`.claude/rules/`)

Loaded automatically when Claude works with matching file paths:

| Rule file       | Applies to                                                                       |
| --------------- | -------------------------------------------------------------------------------- |
| `components.md` | `app/components/**/*.tsx`                                                        |
| `supabase.md`   | `app/lib/supabase/**/*.ts`, `proxy.ts`                                           |
| `utilities.md`  | `app/utils/**`, `app/lib/constants/**`, `app/lib/config/**`, `app/lib/models/**` |

## Quick reference (the rules that get violated most often)

- **All shared constants live in `lib/constants/`** — grouped by responsibility (one file per topic). See [enums-and-constants.md](.claude/rules/enums-and-constants.md).
- **All types live in `types/**/\*.d.ts`** — never inline `export type ...` in a util, hook, store, or worker file. See [types-location.md](.claude/rules/types-location.md).
- **No hardcoded string/number literals in conditionals or switch cases** — compare against a `const enum` member or `as const` value from `lib/constants/`. See [enums-and-constants.md](.claude/rules/enums-and-constants.md).
- **No re-implementing UI primitives** — import from `components/ui/<Primitive>/<Primitive>.tsx`. Add missing variants there. See [components.md](.claude/rules/components.md).
- **One exported component per file** — no sibling subview declarations (e.g. `const EmptyView = ...` inside `Workspace.tsx`). Split into its own file in the same feature folder.
- **All user-facing copy goes through `t(...)`** — `react-i18next` namespaces, locale JSON in `public/locales/{language}/{namespace}.json`. No `Copy` const objects, no hardcoded user-visible strings. See [i18n.md](.claude/rules/i18n.md).
- **No single-letter or abbreviated identifiers** — `store` not `s`, `event` not `e`, `error` not `err`. See [naming.md](.claude/rules/naming.md).
- **No `let`, no in-place mutation.** Enforced by ESLint (`prefer-const`, `no-var`, `no-param-reassign`).
- **No `any`.** Enforced by `@typescript-eslint/no-explicit-any`.
- **One named export per file** (with the single exception of `types/index.d.ts`).
- **Branded IDs** (`SequenceId`, `FrameIndex`) — never raw `string`/`number` outside their factories in `lib/ids.ts`.
