# Codex project setup

This folder contains Codex-specific project configuration. The agent profiles in
`agents/` describe reusable task roles. They do not replace repository access controls or
the shared coding rules below.

This project shares its agent source of truth with Claude Code:

- `AGENTS.md` is the Codex entry point.
- `.claude/rules/` contains the project-wide and path-scoped rules.
- `.claude/memory/` contains the project memory and session history.
- `.codex/agents/` contains Codex-native versions of the Claude subagents.

Keep the Claude rules and memory shared rather than maintaining duplicate copies.

The repository `.mcp.json` defines the Supabase integration. Browser automation and
JavaScript REPL services are intentionally managed outside application dependencies.
