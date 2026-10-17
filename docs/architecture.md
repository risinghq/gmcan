# Architecture

GMCAN is a Bun workspace. The web app and the API are two Cloudflare Workers
that talk over HTTP and share types through `packages/contracts`.

```text
browser ──► apps/web (Angular app on a Worker)
                │  service binding
                └──► apps/api (Hono Worker) ──► D1 database
                                           └──► R2 bucket (uploaded files)
                                           └──► Resend (when configured)
```

In production the browser talks only to the web Worker, which serves pages and
static files and proxies `/api` and `/admin` to the API Worker
([deployment](deployment.md)). In development the browser calls the API on
`:3000` directly from the app on `:4200`. [Deployment](deployment.md#rendering)
says where pages render.

## `packages/contracts`

`packages/contracts` contains the Zod schemas and inferred types that both sides
import. Its three entry points are listed in
[`package.json`](../packages/contracts/package.json):

| Import                    | Holds                                                          |
| ------------------------- | -------------------------------------------------------------- |
| `@gmcan/contracts/public` | Query and response shapes of the public API                    |
| `@gmcan/contracts/admin`  | Shapes of the admin publication endpoints                      |
| `@gmcan/contracts/error`  | The error envelope and its codes ([API errors](api.md#errors)) |

## `apps/api`

[`worker.ts`](../apps/api/worker.ts) is the Worker entry: `fetch` serves the
Hono app built in [`app.ts`](../apps/api/app.ts), and `scheduled` sweeps expired
sessions and password reset tokens. A request passes through these layers, top
to bottom:

| Layer        | Directory                                   | Owns                                                             |
| ------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| Middleware   | [`middleware/`](../apps/api/middleware)     | Locale, session, actor loading, permission guards, error mapping |
| Routes       | [`routes/`](../apps/api/routes)             | URL, input validation (zod), status codes                        |
| Services     | [`services/`](../apps/api/services)         | Business rules and response shaping, one file per aggregate      |
| Repositories | [`repositories/`](../apps/api/repositories) | Reusable queries for members, news, projects and publications    |
| Database     | [`db/`](../apps/api/db)                     | Kysely client on D1, schema types, seed, shared column lists     |

The layers are not strict. The reference-data routes in
[`routes/admin/ref-basic.ts`](../apps/api/routes/admin/ref-basic.ts) query the
database directly, and services that need a query nobody else reuses write it
inline.

### Route tree

[`app.ts`](../apps/api/app.ts) applies CORS and the error handlers to every
request, then mounts three trees:

| Mount        | Directory                                                            | Middleware                            |
| ------------ | -------------------------------------------------------------------- | ------------------------------------- |
| `/api/email` | [`routes/public/operational`](../apps/api/routes/public/operational) | none                                  |
| `/api/*`     | [`routes/public/content`](../apps/api/routes/public/content)         | `requireRequestLocale`, `publicCache` |
| `/admin/*`   | [`routes/admin`](../apps/api/routes/admin)                           | locale, `requireSession`, `loadActor` |

`/api/placeholders` is mounted after `/api`, from the same directory, and the
`/api/*` middleware matches it. `/admin/auth/login` and `/admin/auth/logout`
skip `requireSession`
([`middleware/auth-exempt.ts`](../apps/api/middleware/auth-exempt.ts)).

Each route file default-exports one Hono router for its resource. Endpoints are
listed in [API](api.md).

### Authorization

Roles map to permission sets in
[`authz/permissions.ts`](../apps/api/authz/permissions.ts). `can()` in
[`authz/policy.ts`](../apps/api/authz/policy.ts) answers a check, and
[`middleware/authz.ts`](../apps/api/middleware/authz.ts) turns it into route
guards. Admin routers apply a guard in their own file. See
[authorization](authorization.md).

### Database

[`db/schema.ts`](../apps/api/db/schema.ts) types every table for Kysely. The
tables themselves are created by the SQL files in
[`migrations/`](../apps/api/migrations). Translatable content lives in a
`<table>_translation` table keyed by locale. D1 has no interactive transactions,
so multi-statement writes run as one `atomic()` batch
([database](database.md#transactions)).

[`db/projections.ts`](../apps/api/db/projections.ts) holds the column list of
the `member` table that keeps `passwordHash` out of responses (`MEMBER_NAME`).
[`db/views.ts`](../apps/api/db/views.ts) holds the joined reads for the projects
and publications of a member.

News search is an FTS5 table with triggers, created by the first migration and
queried from [`repositories/news.ts`](../apps/api/repositories/news.ts).
Migrations and seeding are in [database](database.md).

### Sessions and reset tokens

Sessions and password reset tokens are rows that concurrent requests move. Who
may move them is in [state](state.md#sessions-and-reset-tokens).

### Assets

Files are stored in an R2 bucket. The database holds one `asset` row per file
and a per-owner binding table (`member_asset`, `news_asset`, and so on) that
says which file fills which slot of which record.
[`services/assets/`](../apps/api/services/assets) owns the rules, and
[`lib/upload.ts`](../apps/api/lib/upload.ts) owns the bucket. See
[assets](assets.md).

### Locale

[`middleware/public-locale.ts`](../apps/api/middleware/public-locale.ts) picks a
locale from `Accept-Language` and stores it on the request context. Services
join the matching `*_translation` rows. See [localization](localization.md).

### Configuration

[`config/env.ts`](../apps/api/config/env.ts) parses the Worker's bindings and
variables with zod when the Worker loads and throws on invalid input.
[`config.ts`](../apps/api/config.ts) derives the frontend and backend URLs.
Variables are listed in [configuration](configuration.md).

## `apps/web`

An Angular application with standalone components, zoneless change detection and
lazy-loaded routes. Source is in [`apps/web/src/app`](../apps/web/src/app), with
the `@app/*` path alias.

| Directory                                                 | Owns                                                      |
| --------------------------------------------------------- | --------------------------------------------------------- |
| [`public/`](../apps/web/src/app/public)                   | Public pages, routed under `/home`                        |
| [`dashboard/`](../apps/web/src/app/dashboard)             | Dashboard pages, routed under `/dashboard`                |
| [`auth/`](../apps/web/src/app/auth)                       | Login and password reset pages                            |
| [`shared/services/`](../apps/web/src/app/shared/services) | One HTTP service per API resource, plus session and authz |
| [`shared/models/`](../apps/web/src/app/shared/models)     | Client-side types for API payloads                        |
| [`shared/guards/`](../apps/web/src/app/shared/guards)     | Dashboard route guards                                    |

[`token.interceptor.ts`](../apps/web/src/app/token.interceptor.ts) sends every
request with credentials, adds `Accept-Language` to public API calls, and clears
the session state when an admin call returns 401, redirecting to `/login` if the
user is on a dashboard page. API base URLs come from
[`environments/`](../apps/web/src/environments), read through `GLOBAL` in
[`shared/services/global.ts`](../apps/web/src/app/shared/services/global.ts), as
[configuration](configuration.md#web-app) describes.

[`server.ts`](../apps/web/src/server.ts) is the web Worker's entry point. It
serves `/config.json`, sends `/api/*` and `/admin/*` through the edge cache
([caching](caching.md)), and hands everything else to the Angular server
renderer or the static assets.
