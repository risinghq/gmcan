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
([deployment](docs/deployment.md)). In development the browser calls the API on
`:3000` directly from the app on `:4200`. Every page renders in the browser. The
build can also render public pages on the server, which costs more CPU than the
Workers free plan allows
([`app.routes.server.ts`](apps/web/src/app/app.routes.server.ts),
[deployment](docs/deployment.md#rendering)).

## `packages/contracts`

`packages/contracts` contains the Zod schemas and inferred types that both sides
import. Its three entry points are listed in
[`package.json`](packages/contracts/package.json):

| Import                    | Holds                                                               |
| ------------------------- | ------------------------------------------------------------------- |
| `@gmcan/contracts/public` | Query and response shapes of the public API                         |
| `@gmcan/contracts/admin`  | Shapes of the admin publication endpoints                           |
| `@gmcan/contracts/error`  | The error envelope and its codes ([API errors](docs/api.md#errors)) |

## `apps/api`

[`worker.ts`](apps/api/worker.ts) is the Worker entry: `fetch` serves the Hono
app built in [`app.ts`](apps/api/app.ts), and `scheduled` sweeps expired
sessions and password reset tokens. A request passes through these layers, top
to bottom:

| Layer        | Directory                                | Owns                                                             |
| ------------ | ---------------------------------------- | ---------------------------------------------------------------- |
| Middleware   | [`middleware/`](apps/api/middleware)     | Locale, session, actor loading, permission guards, error mapping |
| Routes       | [`routes/`](apps/api/routes)             | URL, input validation (zod), status codes                        |
| Services     | [`services/`](apps/api/services)         | Business rules and response shaping, one file per aggregate      |
| Repositories | [`repositories/`](apps/api/repositories) | Reusable queries for members, news, projects and publications    |
| Database     | [`db/`](apps/api/db)                     | Kysely client on D1, schema types, seed, shared column lists     |

The layers are not strict. The reference-data routes in
[`routes/admin/ref-basic.ts`](apps/api/routes/admin/ref-basic.ts) query the
database directly, and services that need a query nobody else reuses write it
inline.

### Route tree

[`app.ts`](apps/api/app.ts) mounts three trees:

| Mount        | Directory                                                         | Middleware                            |
| ------------ | ----------------------------------------------------------------- | ------------------------------------- |
| `/api/email` | [`routes/public/operational`](apps/api/routes/public/operational) | none                                  |
| `/api/*`     | [`routes/public/content`](apps/api/routes/public/content)         | `requireRequestLocale`                |
| `/admin/*`   | [`routes/admin`](apps/api/routes/admin)                           | locale, `requireSession`, `loadActor` |

`/api/placeholders` is mounted after `/api`, from the same directory, and the
`/api/*` locale middleware matches it. `/admin/auth/login` and
`/admin/auth/logout` skip `requireSession`
([`middleware/auth-exempt.ts`](apps/api/middleware/auth-exempt.ts)).

Each route file default-exports one Hono router for its resource. Endpoints are
listed in [docs/api.md](docs/api.md).

### Authorization

Roles map to permission sets in
[`authz/permissions.ts`](apps/api/authz/permissions.ts). `can()` in
[`authz/policy.ts`](apps/api/authz/policy.ts) answers a check, and
[`middleware/authz.ts`](apps/api/middleware/authz.ts) turns it into route
guards. Admin routers apply a guard in their own file. See
[docs/authorization.md](docs/authorization.md).

### Database

[`db/schema.ts`](apps/api/db/schema.ts) types every table for Kysely. The tables
themselves are created by the SQL files in [`migrations/`](apps/api/migrations).
Translatable content lives in a `<table>_translation` table keyed by locale. D1
has no interactive transactions, so multi-statement writes run as one `atomic()`
batch ([database](docs/database.md#transactions)).

[`db/projections.ts`](apps/api/db/projections.ts) holds the column lists that
decide which `member` fields leave the database layer (`MEMBER_PUBLIC`,
`MEMBER_ACTIVE`, `MEMBER_NAME`). They keep `passwordHash` out of responses.
[`db/views.ts`](apps/api/db/views.ts) composes them into the joined reads that
build a member profile and a publication with its authors.

News search is an FTS5 table with triggers, created by the first migration and
queried from [`repositories/news.ts`](apps/api/repositories/news.ts). Migrations
and seeding are in [docs/database.md](docs/database.md).

### Sessions and reset tokens

Two tables hold state that concurrent requests move: `session` (one row per
sign-in) and `password_reset` (at most one row per member, keyed by the SHA-256
digest of the token). Each row is in one of the states below, and only the owner
listed may move it. D1 runs batches one after another, so a batch is the unit
that cannot interleave; a lookup followed by a later write can.

| Row              | Transition               | Owner                                                                                                   | When                                                                                            |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `session`        | none → live              | `createSession` ([`middleware/session.ts`](apps/api/middleware/session.ts))                             | A login with a correct password of an active member.                                            |
| `session`        | live → live (idle clock) | `requireSession`                                                                                        | Every authenticated request.                                                                    |
| `session`        | live → gone              | `requireSession`                                                                                        | Past 8 hours, idle for 2 hours, or the member is gone or inactive.                              |
| `session`        | live → gone              | `destroySession`                                                                                        | Logout.                                                                                         |
| `session`        | live → gone              | `passwordChangeQueries` ([`services/member.service.ts`](apps/api/services/member.service.ts))           | Any password change: all the member's sessions, except the one that made a self-service change. |
| `session`        | live → gone              | `sweepExpiredSessions`                                                                                  | The scheduled worker, for rows nobody presented again.                                          |
| `password_reset` | none or live → live      | `issueResetToken` ([`services/password-reset.service.ts`](apps/api/services/password-reset.service.ts)) | A reset request for an active member; it replaces the member's previous row.                    |
| `password_reset` | live → gone, once        | `passwordChangeQueries`, through `resetPasswordWithToken` or a change below                             | Any password change: a confirm, a self-service change or an administrator's, in the same batch. |
| `password_reset` | live → gone              | `sweepExpiredResets`                                                                                    | The scheduled worker, past the 24 hours.                                                        |

Invariants:

- A reset token is spent at most once. The statements that change the password
  and the sessions carry a guard that the live token row exists, and the batch
  deletes the row last, so of two confirms with one token the second changes
  nothing and reports failure. Every password change deletes the member's reset
  row, so a link emailed before a change cannot override it. Deleting a member
  deletes both tables' rows by cascade.
- A password change and the end of the member's sessions happen in the same
  batch; no state has the new password with an old session alive.
- Only the digest of a token is stored, and no read selects `password_reset` for
  a response. The plain token exists in the email that carries it.
- A login that races a password change may leave a session created after the
  change. It is bound by the same limits as any other and ends at the next
  change, logout or expiry.

### Assets

Files are stored in an R2 bucket. The database holds one `asset` row per file
and a per-owner binding table (`member_asset`, `news_asset`, and so on) that
says which file fills which slot of which record.
[`services/assets/`](apps/api/services/assets) owns the rules, and
[`lib/upload.ts`](apps/api/lib/upload.ts) owns the bucket. See
[docs/assets.md](docs/assets.md).

### Locale

[`middleware/public-locale.ts`](apps/api/middleware/public-locale.ts) picks a
locale from `Accept-Language` and stores it on the request context. Services
join the matching `*_translation` rows. See
[docs/localization.md](docs/localization.md).

### Configuration

[`config/env.ts`](apps/api/config/env.ts) parses the Worker's bindings and
variables with zod when the Worker loads and throws on invalid input.
[`config.ts`](apps/api/config.ts) derives the frontend and backend URLs.
Variables are listed in [docs/configuration.md](docs/configuration.md).

### Tests

[`test/setup.ts`](apps/api/test/setup.ts) is preloaded by
[`bunfig.toml`](apps/api/bunfig.toml). It applies the migrations to a fresh
local D1 and R2 emulation in a temporary directory, so tests never touch
`.wrangler/state`.

## `apps/web`

An Angular application with standalone components, zoneless change detection and
lazy-loaded routes. Source is in [`apps/web/src/app`](apps/web/src/app), with
the `@app/*` path alias.

| Directory                                              | Owns                                                      |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [`public/`](apps/web/src/app/public)                   | Public pages, routed under `/home`, each with a resolver  |
| [`dashboard/`](apps/web/src/app/dashboard)             | Dashboard pages, routed under `/dashboard`                |
| [`auth/`](apps/web/src/app/auth)                       | Login and password reset pages                            |
| [`shared/services/`](apps/web/src/app/shared/services) | One HTTP service per API resource, plus session and authz |
| [`shared/models/`](apps/web/src/app/shared/models)     | Client-side types for API payloads                        |
| [`shared/guards/`](apps/web/src/app/shared/guards)     | Dashboard route guards                                    |

[`token.interceptor.ts`](apps/web/src/app/token.interceptor.ts) sends every
request with credentials, adds `Accept-Language` to public API calls, and clears
the session state when an admin call returns 401, redirecting to `/login` if the
user is on a dashboard page. API base URLs come from
[`environments/`](apps/web/src/environments), read through `GLOBAL` in
[`shared/services/global.ts`](apps/web/src/app/shared/services/global.ts). The
production build swaps in `environment.prod.ts`.

### Edge cache

[`server.ts`](apps/web/src/server.ts) is the web Worker's entry point, and
[`api-cache.ts`](apps/web/src/api-cache.ts) holds the cache. It keeps public API
reads in the Cache API (`caches.default`) of the data center that served the
request, so a repeat read skips the hop to the API Worker and every query behind
it.

| Aspect            | Rule                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is cached    | `GET` responses under `/api/` that are `200` and carry `Cache-Control: public` with a positive `max-age`. `/api/email/*` and all `/admin/*` calls are not. |
| Who marks them    | [`middleware/public-cache.ts`](apps/api/middleware/public-cache.ts) adds `public, max-age=60` to public content reads. Private files send `no-store`.      |
| Key               | The request URL, query string included, plus the `Accept-Language` header, because the API picks the content language from it.                             |
| Expiry            | Fresh for 60 seconds, then stale for an hour, as the web Worker records on the stored copy. Asset copies are fresh for a minute and never stale.           |
| Who populates it  | The web Worker, on a miss, with `ctx.waitUntil(cache.put(...))` after the API answers. Nothing else writes to it.                                          |
| What invalidates  | Nothing. There is no purge. A refresh replaces an entry, and an entry leaves the cache when its stale hour runs out.                                       |
| Visible to client | `X-Cache: HIT`, `STALE` or `MISS` on every API response that went through the cache.                                                                       |

Each entry is in one of four states. It is absent until a request misses; it is
fresh from the `put` until 60 seconds later, and `HIT`s serve it unchanged; then
it is stale for an hour, and the next request gets it as `STALE` while the web
Worker fetches a new copy in the background; then the runtime treats it as
absent again. Only the web Worker moves an entry between states, and each data
center has its own copy, so two visitors in different cities can see different
versions during the same minute.

The web Worker also keeps a `refreshing` set of cache keys, in the module scope
of `api-cache.ts`. It stops a burst of requests for one stale entry from each
starting a refresh. It lives in the memory of one isolate, so it is not shared
with other isolates or other data centers, and it holds no data a visitor sees.
A key has two states:

| State  | Entered when                                          | Left when                                                               |
| ------ | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Absent | The isolate starts, or a refresh for the key finishes | A request finds the entry stale and starts its refresh                  |
| Held   | The request that found the entry stale adds the key   | The refresh ends: the API answered, the API call threw, or `put` failed |

While a key is held, other requests for it get the stale copy and start nothing.
The refresh removes the key in a `finally`, so every way it ends releases the
key. How it ends decides the entry:

- The API answers with a shareable response: the entry is replaced and is fresh
  again.
- The API answers with anything else, such as a 404: the entry is deleted, so
  the next request is a `MISS`.
- The refresh throws, for example because the API Worker is unavailable: the
  error reaches `waitUntil`, the old entry stays, and the next request after the
  failure finds the key absent and tries again. Visitors keep getting `STALE`
  copies until the stale hour ends.

When the runtime evicts the isolate, the set goes with it. The next request is
served by a new isolate with an empty set, finds the entry still stale in the
data center's cache, and starts one refresh. Two isolates can refresh the same
entry at once, and the second `put` overwrites the first with an equally recent
copy. A refresh that the runtime abandons without running its `finally` can
leave a key held in an isolate that stays alive. The entry then stays stale
until its retention runs out, after which the request is a `MISS`, which does
not use the set and writes a new entry.

After an admin write, a public page can show the old content from the edge until
the first request after 60 seconds has refreshed the copy, and up to another 60
seconds if the visitor's browser holds its own copy of the response
(`max-age=60`). The browser that made the edit is the exception: `GroupService`
drops its own per-language cache after each write. Server-side rendering reaches
the API through the service binding directly, so rendered HTML never comes from
this cache.
