# Configuration

```sh
cp apps/api/.dev.vars.example apps/api/.dev.vars   # bun run setup does this once
bunx wrangler secret put RESEND_API_KEY            # a secret of the deployed API, from apps/api
```

The API reads its settings from the Worker's bindings and variables.
[`config/env.ts`](../apps/api/config/env.ts) validates them when the Worker
loads and fails with the list of problems if any value is invalid.

| Where                                                    | What it holds                                        |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `vars` in [`wrangler.jsonc`](../apps/api/wrangler.jsonc) | Non-secret production settings, committed            |
| `apps/api/.dev.vars`                                     | Local overrides and secrets, not committed           |
| `wrangler secret put` or `--secrets-file`                | Secrets of the deployed Worker ([deploy](deploy.md)) |

Values in `.dev.vars` override `vars` locally.
[`.dev.vars.example`](../apps/api/.dev.vars.example) sets `NODE_ENV` and
`FRONTEND_URL` to their local values and gives a development
`ASSET_SIGNING_SECRET`.

## Variables

| Variable               | Default                 | Meaning                                                                                        |
| ---------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `NODE_ENV`             | `development`           | `development`, `test` or `production`. Production requires `FRONTEND_URL`.                     |
| `FRONTEND_URL`         | `http://localhost:4200` | The site's URL. The origin allowed by CORS, and the base of password reset links.              |
| `ASSET_SIGNING_SECRET` | none, required          | Key that signs temporary URLs for private files ([assets](assets.md#private-files)). A secret. |
| `EMAIL_FROM`           | none                    | Sender address. With `RESEND_API_KEY` it turns email on ([email](email.md)).                   |
| `RESEND_API_KEY`       | none                    | Resend API key. A secret.                                                                      |
| `INSTITUTIONAL_EMAIL`  | none                    | Address that receives membership requests. Must be a valid email when set.                     |
| `SUPPORTED_LOCALES`    | `es,en`                 | Comma-separated locale codes ([localization](localization.md)).                                |
| `DEFAULT_LOCALE`       | first supported locale  | Locale used when a request names none that is supported.                                       |
| `SEED_PASSWORD`        | generated               | Password the seed gives every sample member, at least 8 characters. Read only by the seed.     |

File URLs in API responses take the origin of the request
([assets](assets.md#serving-files)), so the API has no setting for its own URL.

## Web app

The Angular build carries no deployment URLs. The web Worker
([`apps/web/src/server.ts`](../apps/web/src/server.ts)) sets the API and site
URL to its own origin on every request and serves them at `/config.json`. Set
the `APP_URL` variable on `gmcan-web` to use a different canonical origin.

Under `bun run dev`, `ng serve` reads
[`src/environments/environment.ts`](../apps/web/src/environments/environment.ts):
the API at `http://localhost:3000` and the site at `http://localhost:4200`.
`ng build` replaces it with
[`environment.prod.ts`](../apps/web/src/environments/environment.prod.ts). Code
builds API addresses only with `GLOBAL.api(path)` and `GLOBAL.admin(path)`, and
site addresses with `GLOBAL.app(path)`
([`global.ts`](../apps/web/src/app/shared/services/global.ts)). These join the
base and the path with exactly one slash.

Server-side rendering accepts the hosts listed under `security.allowedHosts` in
[`angular.json`](../apps/web/angular.json): `localhost` and `*.workers.dev`. Add
the host of a custom domain there.
