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

## A request

A visitor opens `/en/projects`:

1. [`server.ts`](../apps/web/src/server.ts), the web Worker, answers
   `/config.json`, `/robots.txt` and `/sitemap.xml` itself, and old URLs with a
   301 ([`moved-url.ts`](../apps/web/src/moved-url.ts)).
2. It looks the page up in the edge cache
   ([`edge-cache.ts`](../apps/web/src/edge-cache.ts), [caching](caching.md)).
3. On a miss, Angular renders the page on the server
   ([`app.routes.server.ts`](../apps/web/src/app/app.routes.server.ts)). The
   page's route resolver
   ([`projects/resolver.ts`](../apps/web/src/app/public/projects/resolver.ts))
   calls `GET /api/projects`, which `server.ts` sends straight to the API Worker
   through the `API` service binding.
4. In the API, [`app.ts`](../apps/api/app.ts) picks the locale, the route
   validates the query, and the projects service reads D1 and returns JSON with
   file URLs on the site's origin.
5. The browser receives the HTML, then loads the app, which reads further data
   from `/api` and `/admin` on the same origin. `server.ts` proxies those calls
   to the API Worker, through the edge cache for public reads.

Under `bun run dev` the app runs under `ng serve` on `:4200` and calls the API
on `:3000` directly ([development](development.md)).

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

| Layer      | Directory                               | Owns                                                                 |
| ---------- | --------------------------------------- | -------------------------------------------------------------------- |
| Middleware | [`middleware/`](../apps/api/middleware) | Locale, session, actor loading, permission guards, error mapping     |
| Routes     | [`routes/`](../apps/api/routes)         | URL, input validation (zod), status codes                            |
| Services   | [`services/`](../apps/api/services)     | Queries, business rules and response shaping, one file per aggregate |
| Database   | [`db/`](../apps/api/db)                 | Kysely client on D1, schema types, seed, shared column lists         |

The layers are strict: a route calls services, and a service calls `db/`. A
route never imports `db/`. The `no-restricted-imports` override for
`apps/api/routes/**` in [`.oxlintrc.json`](../.oxlintrc.json) fails the lint on
such an import; a type-only import is allowed. Each service owns every query of
its aggregate. Another service that needs one of them calls the owning service,
as search calls `newsSearchFilter` from the news service.

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

News search is an FTS5 table with triggers, created by the first migration and
queried from [`services/news.service.ts`](../apps/api/services/news.service.ts).
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
[`config.ts`](../apps/api/config.ts) gives the site URL and the origin of the
current request, the base of every file URL the API returns. Variables are
listed in [configuration](configuration.md).

## `apps/web`

An Angular application with standalone components, zoneless change detection and
lazy-loaded routes. Source is in [`apps/web/src/app`](../apps/web/src/app), with
the `@app/*` path alias.

| Directory                                                 | Owns                                                      |
| --------------------------------------------------------- | --------------------------------------------------------- |
| [`public/`](../apps/web/src/app/public)                   | Public pages, routed at the root (`/`, `/news`, …)        |
| [`dashboard/`](../apps/web/src/app/dashboard)             | Dashboard pages, routed under `/dashboard`                |
| [`auth/`](../apps/web/src/app/auth)                       | Login and password reset pages                            |
| [`shared/services/`](../apps/web/src/app/shared/services) | One HTTP service per API resource, plus session and authz |
| [`shared/models/`](../apps/web/src/app/shared/models)     | Client-side types for API payloads                        |
| [`shared/guards/`](../apps/web/src/app/shared/guards)     | Dashboard route guards                                    |
| [`shared/routing/`](../apps/web/src/app/shared/routing)   | Page title strategy and route-derived data                |

### Rendering without zone.js

Angular re-renders a view only when a signal it reads changes or when an event
fires inside it. A plain field assigned in a `subscribe` callback, a timer or a
`FileReader` callback updates the component without re-rendering it, so the page
shows stale values. In development, that also raises NG0100.

- Hold any state that an asynchronous callback writes in a `signal`, and hold
  state derived from it in a `computed`.
- Load the data a page needs before it renders, with a route resolver. The
  component then reads `route.snapshot.data` synchronously in `ngOnInit`.
- Resolvers on one route run concurrently and cannot read each other's results.
  Put a value that depends on resolved data, such as a page title or a toolbar
  badge, in static route `data` as a `Derive<T>` function from
  [`derived-data.ts`](../apps/web/src/app/shared/routing/derived-data.ts). The
  title strategy and the dashboard shell evaluate it after navigation ends.

To find stale bindings, add
`provideCheckNoChangesConfig({ exhaustive: true, interval: 500 })` to
`app.config.ts` while developing. Each NG0100 in the console names the stale
binding. Do not commit the setting.

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
renderer or the static assets. Old URLs answer 301 with one hop
([`moved-url.ts`](../apps/web/src/moved-url.ts)): public pages that sat under
`/home`, `?lang=` links, and English URLs of the Spanish-only dashboard.
