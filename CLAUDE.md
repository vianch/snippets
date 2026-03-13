# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This

Snippets — a personal code snippet manager. Users authenticate, then create/edit/tag/favorite/trash code snippets via an in-browser CodeMirror editor. Live at snippets.vianch.com.

## Commands

```bash
yarn install          # Install dependencies
yarn dev              # Start dev server (Next.js)
yarn build            # Production build
yarn lint             # Run all linters (ESLint + Stylelint + Prettier + next lint)
yarn lint:code-style  # ESLint only (with --fix)
yarn lint:style       # Stylelint only (CSS, with --fix)
yarn lint:formatting  # Prettier only (with --write)
```

Package manager is **yarn** (not npm/pnpm). The `yarn init` script nukes node_modules and lock files, then reinstalls — use sparingly.

## Git Hooks

- **pre-commit**: runs `yarn run lint` (all linters)
- **pre-push**: runs `yarn audit`

## Architecture

**Stack**: Next.js 14 (App Router) + TypeScript + Supabase + Zustand + CodeMirror + Vercel Analytics. Deployed on Vercel.

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

Supabase auth with middleware-based route protection (`middleware.ts`). Unauthenticated users hitting `/snippets` redirect to `/login`; authenticated users hitting `/login` redirect to `/snippets`.

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
- ESLint extends airbnb-base + airbnb-typescript + prettier
- `no-console` is an error
- Blank lines enforced between blocks, returns, control flow, and variable declarations (see `.eslintrc.js` padding rules)
- `react-hooks/exhaustive-deps` is disabled
- Global types live in `types/*.d.ts` — domain types like `Snippet`, `UUID`, `SnippetState`, `CurrentSnippet`, `TagItem` are globally available without imports

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
| `supabase.md`   | `app/lib/supabase/**/*.ts`, `middleware.ts`                                      |
| `utilities.md`  | `app/utils/**`, `app/lib/constants/**`, `app/lib/config/**`, `app/lib/models/**` |
