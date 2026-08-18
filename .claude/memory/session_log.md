---
name: session_log
description: Running log of what was done in each session — changes, decisions, and discoveries
type: project
---

## 2025-07-21 — Initial Setup

**What happened:**

- Created `CLAUDE.md` for the project with full architecture docs, commands, auth flow, path aliases, and code style rules
- Set up the auto-memory system (this file + MEMORY.md index + project overview)
- Created `.claude/rules/` directory with path-scoped rules for components, Supabase, and utilities

**Key discoveries:**

- Project uses yarn (not npm/pnpm)
- Pre-commit hook runs all linters (`yarn run lint`), pre-push runs `yarn audit`
- All snippet state is managed in a single client page component (`app/snippets/page.tsx`)
- Global types in `types/*.d.ts` are available without imports
- Supabase has two clients: browser (`client.ts`) and server (`server.ts` for middleware only)

## 2026-08-17 — Codex Initialization

**What happened:**

- Initialized Codex from the existing Claude project setup.
- Kept `.claude/rules/` and `.claude/memory/` as the shared source of truth.
- Added `.codex/README.md` and retained the Codex-native agent definitions in `.codex/agents/`.
- Removed the globally configured `node_repl` MCP server and disabled the global `apps` feature to prevent interrupted MCP startup.
- Disabled unused document, spreadsheet, presentation, PDF, visualization, Anthropic, and TTG plugins; retained engineering and browser plugins.
