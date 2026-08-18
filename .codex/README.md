# Codex project setup

This project shares its agent source of truth with Claude Code:

- `AGENTS.md` is the Codex entry point.
- `.claude/rules/` contains the project-wide and path-scoped rules.
- `.claude/memory/` contains the project memory and session history.
- `.codex/agents/` contains Codex-native versions of the Claude subagents.

Keep the Claude rules and memory shared rather than maintaining duplicate copies.

The repository `.mcp.json` only defines Supabase. Browser automation and JavaScript
REPL services are intentionally not project dependencies; they are managed globally.
