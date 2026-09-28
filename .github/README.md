<h1 align="center">Snippets</h1>

<p align="center"><i>A personal workspace for code, notes, and ideas.</i></p>

<p align="center">
	<a href="https://github.com/vianch/snippets/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT license" /></a>
	<a href="https://snippets.vianch.com"><img src="https://img.shields.io/badge/live-snippets.vianch.com-7c3aed?style=flat-square" alt="Open Snippets" /></a>
</p>

Snippets is a personal code library that pairs a syntax-highlighted editor with search, folders, tags, version history, previews, and shareable public links. The same workspace also includes a sticky-notes board and an AI assistant for working with saved code.

## What you can do

- Save, edit, search, tag, favorite, folder, archive, and restore code snippets.
- Edit code with CodeMirror, language-aware highlighting, Markdown support, and an HTML preview.
- Keep named versions of snippets and share selected snippets through public links.
- Export a snippet as an image or data, and connect supported external SQL databases for snippet storage.
- Create a separate sticky note board and link notes to snippets with wiki-style links.
- Ask a configured AI provider about snippets, code, and refactoring, with chat history and model selection.
- Customize editor themes, keyboard shortcuts, autosave, account security, and the animated SnipPet companion.
- Use authenticator-based multi-factor authentication; administrators also have protected user and database tools.

## Screenshots

The checked-in screenshots predate the current workspace features. Replace them with fresh captures after reviewing them for account names, emails, snippet content, tokens, and connection details.

## Application routes

| Route                       | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `/`                         | Public landing page                          |
| `/login`                    | Sign in and complete multi-factor challenges |
| `/snippets`                 | Protected snippet library and code editor    |
| `/notes`                    | Protected sticky notes board                 |
| `/ai-assistant`             | Protected AI workspace                       |
| `/s/[slug]`                 | Publicly shared snippet                      |
| `/reset-password`           | Password recovery                            |
| `/admin`                    | Administrator-only tools                     |
| `/privacy-policy`, `/terms` | Legal information                            |

Route checks are implemented in `proxy.ts`; the user session and role are checked before protected pages are served. Public snippet pages use a slug rather than exposing the private workspace.

## Architecture

The app uses the Next.js App Router. Route pages compose feature components; browser-side workspaces own interactive UI state, while data access is kept in library modules.

```text
app/
├── [routes]                 App Router pages, layouts, and route metadata
├── api/                     AI, link-preview, storage, MFA, and admin endpoints
├── components/              Feature UI, editor, notes, settings, and shared controls
├── lib/
│   ├── supabase/            Auth clients, role checks, and database queries
│   ├── storage/             Storage adapters, server drivers, and export/configuration
│   ├── ai/                  Provider and model integration
│   ├── store/               Shared Zustand state
│   ├── constants/           Shared domain and UI constants
│   └── config/              Static configuration, including editor languages/themes
└── utils/                   Pure shared helpers
types/                       Global TypeScript declarations
supabase/migrations/          Database schema and policy changes
scripts/                      Pet asset synchronization and focused checks
public/assets/                Images, icons, and SnipPet sprite data
docs/                         Project design and performance notes
```

### Main data flow

1. `proxy.ts` synchronizes Supabase cookies, checks sessions and MFA assurance, and guards workspace and admin routes.
2. `app/components/SnippetsWorkspace/` coordinates the snippet workspace and composes the list, editor, navigation, and supporting panels.
3. Supabase query modules provide user-scoped snippet, note, account, and admin access. Storage adapters can resolve the configured backend for supported SQL storage.
4. Route handlers provide server-side boundaries for AI requests, external link previews, storage configuration/export, and privileged admin/MFA operations.
5. `supabase/migrations/` records database structure, row-level security, public sharing, roles, snippet versions, and storage configuration.

## Technology

- Next.js 16, React 19, and TypeScript
- Supabase Auth, Postgres, and row-level security
- CodeMirror, Shiki, and Markdown rendering
- Zustand for shared client state
- Optional PostgreSQL, MySQL, Turso/libSQL, and local SQLite storage adapters
- Vercel Analytics and Sentry

## Development setup

The repository has `pnpm-lock.yaml`; use pnpm so installs follow the committed lockfile. Use the Node.js release supported by the installed Next.js version.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Set the required Supabase project values in `.env.local`:

| Variable                        | Purpose                    |
| ------------------------------- | -------------------------- |
| `NEXT_PUBLIC_BASE_URL`          | Canonical application URL  |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project endpoint  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key |

Optional integrations use provider-specific server variables documented with placeholders in `.env.example`. Keep credentials in the local environment, never in tracked files.

```bash
pnpm dev
```

The application runs at [http://localhost:3000](http://localhost:3000). Supabase migrations are in `supabase/migrations/`; apply them to a development project before using routes that rely on newer tables or policies.

## Commands

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Start the Next.js development server           |
| `pnpm build`     | Sync pet assets and create a production build  |
| `pnpm start`     | Serve a production build                       |
| `pnpm pets:sync` | Synchronize pet catalog assets                 |
| `pnpm lint`      | Run ESLint, Stylelint, and Prettier with fixes |

The current package scripts do not define a test or typecheck command. Focused check scripts exist under `scripts/` for table and pet utilities. `pnpm init` is a destructive reset script that removes dependencies and lockfiles; use `pnpm install` for normal setup.

## Recent feature history

Recent repository changes have expanded the original snippet editor into a broader personal workspace. The current branch history includes sticky notes (2026-09-28), snippet URL deep-linking, pet companion/chat updates, mobile editor improvements, and snippet query and index performance work (2026-08). See `git log` for the full change history.

## Project guidance

`AGENTS.md` and `CLAUDE.md` describe coding conventions and repository structure. Some older setup details in those files predate the checked-in pnpm lockfile and current package scripts; use `package.json` and `pnpm-lock.yaml` as the source of truth for commands.

## License

Snippets is released under the [MIT License](./LICENSE).

## Author

Developed by [vianch](https://vianch.com).
