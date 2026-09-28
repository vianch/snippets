# Application source

This directory contains Next.js App Router routes, route handlers, feature components, client libraries, global TypeScript declarations, and shared CSS. Routes compose feature UI under `components/`; data access and integrations belong in `lib/`.

## Routes

| Directory         | Route             | Responsibility                    |
| ----------------- | ----------------- | --------------------------------- |
| `page.tsx`        | `/`               | Public landing page               |
| `login/`          | `/login`          | Authentication                    |
| `snippets/`       | `/snippets`       | Main snippet workspace            |
| `notes/`          | `/notes`          | Sticky notes board                |
| `ai-assistant/`   | `/ai-assistant`   | AI workspace                      |
| `s/[slug]/`       | `/s/:slug`        | Public snippet view               |
| `reset-password/` | `/reset-password` | Password recovery                 |
| `admin/`          | `/admin`          | Admin workspace                   |
| `api/`            | `/api/*`          | Server-side integration endpoints |

Static legal routes live in `privacy-policy/` and `terms/`.

## Source areas

- `components/` holds feature components, shared UI primitives, admin pages, and landing-page sections. Most features have their own directory and styles.
- `lib/supabase/` provides browser/server clients, auth/role helpers, and database query modules.
- `lib/storage/` resolves a user's storage configuration and adapts snippet access across Supabase and supported SQL drivers.
- `lib/ai/`, `lib/markdown/`, and `lib/linkPreview/` isolate external or format-specific behavior.
- `lib/store/` holds shared Zustand state; `lib/constants/` and `lib/config/` hold domain values and static configuration.
- `utils/` contains shared helpers; global domain declarations live in the repository-root `types/` directory.
- `api/` endpoints include AI, link preview, storage, MFA recovery, and admin operations.

## Authentication boundary

`proxy.ts` is at the repository root and applies before matching routes. This folder defines routes, not authorization policy: protected page access and privileged API handlers must keep their server-side checks aligned with the proxy and Supabase row-level security.
