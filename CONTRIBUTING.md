# Contributing

## Set up

Follow [Run it](README.md#run-it) in the README. You need Bun 1.4.2 and a
valid `.env`. The Angular CLI and the Hono API both run from the repository
root with `bun run dev`. `bun run dev:web` and `bun run dev:api` start one of
them.

## Check your change

Run this before you open a pull request:

```sh
bun run check
```

It runs, in order:

| Step  | Command              | What it covers                                |
| ----- | -------------------- | --------------------------------------------- |
| Lint  | `bun run lint`       | oxlint over the whole repository              |
| Types | `bun run typecheck`  | `tsc --noEmit` for `apps/web` and `apps/api`  |
| Tests | `bun run check:test` | Web tests (vitest) and API tests (`bun test`) |

Format with `bun run format`. `bun run format:check` reports files it would
change. [oxfmt](oxfmt.config.ts) formats TypeScript and Markdown: print width
120, imports sorted with a blank line between groups. Lint rules are in
[`oxlint.config.ts`](oxlint.config.ts).

## Tests

API tests live in [`apps/api/test`](apps/api/test) and run with `bun test` from
`apps/api`. [`test/setup.ts`](apps/api/test/setup.ts) gives them a fresh libSQL
file in the system temp directory, creates the tables and seeds the lookup
tables, so tests run against a real database and never touch
`data/gmcan.db`. Write new API tests the same way: call the service or the
route, and assert on the stored result.

Web tests are `*.spec.ts` files next to the code and run by `ng test` (vitest).
`bun run check:test` runs them once with `--watch=false`.

## Where changes go

[ARCHITECTURE.md](ARCHITECTURE.md) says what each directory owns. Common
changes:

- **A new public or admin endpoint.** Add a router under
  [`apps/api/routes`](apps/api/routes), mount it in
  [`server.ts`](apps/api/server.ts), and guard admin routes with
  `requirePermission` ([authorization](docs/authorization.md)). Put a shape that
  the web app also reads in `packages/contracts`.
- **A new permission.** Add it to `Permission` in
  [`authz/types.ts`](apps/api/authz/types.ts) and to the roles that hold it in
  [`authz/permissions.ts`](apps/api/authz/permissions.ts). The web app's
  `Capability` type in
  [`shared/models/capabilities.ts`](apps/web/src/app/shared/models/capabilities.ts)
  mirrors the list.
- **A schema change.** Edit the table in [`db/schema.ts`](apps/api/db/schema.ts),
  its definition in [`db/ddl.ts`](apps/api/db/ddl.ts) and its entry in
  `EXPECTED_COLUMNS`. Existing databases are not migrated: delete your local
  file to pick up the change ([database](docs/database.md#reset-the-database)).
- **A new owner of uploaded files.** Create its `<owner>_asset` table (schema,
  DDL and `EXPECTED_COLUMNS`), add it to `OWNER_CONFIG` in
  [`services/assets/policy.ts`](apps/api/services/assets/policy.ts), and to the
  owner types in [`services/assets/types.ts`](apps/api/services/assets/types.ts)
  and [`validators.ts`](apps/api/services/assets/validators.ts)
  ([assets](docs/assets.md)).

## Documentation

Prose lives in the README, [ARCHITECTURE.md](ARCHITECTURE.md) and
[`docs/`](docs/README.md). Each fact belongs to one document; link to it from
the others. When you change behavior, change the document that owns it in the
same pull request.
