# Contributing

## Set up

Follow [Run it](../README.md#run-it) in the README. You need Bun 1.4.3, an
`apps/api/.dev.vars` and a migrated, seeded local database. The Angular CLI and
the API under `wrangler dev` both run from the repository root with
`bun run dev`. `bun run dev:web` and `bun run dev:api` start one of them.

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
change. [oxfmt](../oxfmt.config.ts) formats TypeScript and Markdown: print width
120 for code, imports sorted with a blank line between groups. Lint rules are in
[`oxlint.config.ts`](../oxlint.config.ts).

## Tests

API tests live in [`apps/api/test`](../apps/api/test) and run with `bun test`
from `apps/api`. [`test/setup.ts`](../apps/api/test/setup.ts), preloaded by
[`bunfig.toml`](../apps/api/bunfig.toml), gives them a fresh local D1 and R2
emulation in the system temp directory, applies the migrations and seeds the
lookup tables, so tests run against a real database and never touch
`.wrangler/state`. Write new API tests the same way: call the service or the
route, and assert on the stored result.

Web tests are `*.spec.ts` files next to the code and run by `ng test` (vitest).
`bun run check:test` runs them once with `--watch=false`.

## Where changes go

[Architecture](../docs/architecture.md) says what each directory owns. Common
changes:

- **A new public or admin endpoint.** Add a router under
  [`apps/api/routes`](../apps/api/routes), mount it in
  [`app.ts`](../apps/api/app.ts), and guard admin routes with
  `requirePermission` ([authorization](../docs/authorization.md)). Put a shape
  that the web app also reads in `packages/contracts`.
- **A new permission.** Add it to `Permission` in
  [`authz/types.ts`](../apps/api/authz/types.ts) and to the roles that hold it
  in [`authz/permissions.ts`](../apps/api/authz/permissions.ts). The web app's
  `Capability` type in
  [`shared/models/capabilities.ts`](../apps/web/src/app/shared/models/capabilities.ts)
  mirrors the list.
- **A schema change.** See [database](../docs/database.md#migrations).
- **A write that touches several tables.** See
  [database](../docs/database.md#transactions).
- **A new owner of uploaded files.** Create its `<owner>_asset` table (a
  migration and `schema.ts`), add it to `OWNER_CONFIG` in
  [`services/assets/policy.ts`](../apps/api/services/assets/policy.ts), and to
  the owner types in
  [`services/assets/types.ts`](../apps/api/services/assets/types.ts) and
  [`validators.ts`](../apps/api/services/assets/validators.ts)
  ([assets](../docs/assets.md)).

## Documentation

Prose lives in the README and [`docs/`](../docs/README.md). Each fact belongs to
one document; link to it from the others. When you change behavior, change the
document that owns it in the same pull request.
