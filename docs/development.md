# Development

```sh
mise install
bun run setup
bun run dev
```

`mise install` installs the Bun, Node and gitleaks versions pinned in
[`mise.toml`](../mise.toml). `bun run setup` installs the dependencies, copies
[`apps/api/.dev.vars.example`](../apps/api/.dev.vars.example) to
`apps/api/.dev.vars` if it is missing, creates the tables and fills them with
sample content and files. `bun run dev` starts the API under `wrangler dev` on
<http://localhost:3000> and the web app under `ng serve` on
<http://localhost:4200>.

No Cloudflare account is needed. Wrangler emulates D1 and R2 under
`apps/api/.wrangler/state`.

## Sign in

The seed prints the password it gave every sample member:

```text
[seed] Seeded members sign in with the generated password: ...
```

Sign in at <http://localhost:4200/login> as `admin@gmcan.dev`. Set
`SEED_PASSWORD` to choose the password instead
([database](database.md#sample-data)).

## Preview the production build

```sh
bun run preview
```

It builds the web app and runs both Workers in one `wrangler dev` on
<http://localhost:4200>, as they run in production: pages render on the server,
and `/api` and `/admin` reach the API through the service binding. It reads the
same local database and bucket as `bun run dev`.

## Commands

Run from the repository root.

| Command                  | What it does                                                       |
| ------------------------ | ------------------------------------------------------------------ |
| `bun run setup`          | Install dependencies, write `.dev.vars`, migrate and seed          |
| `bun run dev`            | API on port 3000 and `ng serve` on port 4200                       |
| `bun run preview`        | Production build of both Workers on port 4200                      |
| `bun run check`          | Lint, typecheck, test, build and `styles:classes`, as CI runs them |
| `bun run styles:classes` | Fail on a template class that no built stylesheet defines          |
| `bun run test`           | Web tests (vitest) and API tests (`bun test`)                      |
| `bun run typecheck`      | `tsc --noEmit` for both apps                                       |
| `bun run lint`           | oxlint, oxfmt `--check`, the icon subset and a gitleaks scan       |
| `bun run fix`            | Apply safe oxlint fixes and format with oxfmt                      |
| `bun run build`          | The Angular build and a `wrangler deploy --dry-run` of the API     |

`bun --filter api start` and `bun --filter web start` start one app.

## Start over

```sh
rm -rf apps/api/.wrangler/state
bun run setup
```

Settings are in [configuration](configuration.md). Checks and conventions for a
change are in [contributing](../.github/CONTRIBUTING.md).
