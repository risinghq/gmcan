# Configuration

The API reads its settings from the Worker's bindings and variables.
[`config/env.ts`](../apps/api/config/env.ts) validates them with zod when the
Worker loads and fails with the list of problems if any value is invalid.

| Where                                                    | What it holds                                                |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `vars` in [`wrangler.jsonc`](../apps/api/wrangler.jsonc) | Non-secret settings, committed. Production values            |
| `apps/api/.dev.vars`                                     | Local overrides and secrets. Not committed                   |
| `wrangler secret put` or `--secrets-file`                | Secrets of the deployed Worker ([deployment](deployment.md)) |

[`.dev.vars.example`](../apps/api/.dev.vars.example) is the template for
`.dev.vars`. Copy it before the first `bun run dev`. Values in `.dev.vars`
override `vars` locally, which is how `NODE_ENV`, `BACKEND_URL` and
`FRONTEND_URL` take their local values instead of the production ones in
`wrangler.jsonc`.

## Variables

| Variable               | Default                 | Meaning                                                                                                        |
| ---------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`             | `development`           | `development`, `test` or `production`. Production requires `BACKEND_URL` and changes the default frontend URL. |
| `ASSET_SIGNING_SECRET` | none, required          | Key that signs temporary URLs for private files ([assets](assets.md#private-files)). A secret.                 |
| `EMAIL_FROM`           | none                    | Sender address. With `RESEND_API_KEY` it turns email on ([deployment](deployment.md#email)).                   |
| `RESEND_API_KEY`       | none                    | Resend API key. A secret.                                                                                      |
| `INSTITUTIONAL_EMAIL`  | none                    | Address that receives membership requests. Must be a valid email when set.                                     |
| `FRONTEND_URL`         | by `NODE_ENV`           | Origin allowed by CORS, and the base of password reset links.                                                  |
| `BACKEND_URL`          | `http://localhost:3000` | Public base URL of the API, used to build file URLs in responses. In production, the public site URL.          |
| `SUPPORTED_LOCALES`    | `es,en`                 | Comma-separated locale codes ([localization](localization.md)).                                                |
| `DEFAULT_LOCALE`       | first supported locale  | Locale used when a request names none that is supported.                                                       |
| `SEED_PASSWORD`        | generated               | Password the seed gives every sample member, at least 8 characters. Read only by the seed.                     |

`FRONTEND_URL` defaults per environment ([`config.ts`](../apps/api/config.ts)):

| `NODE_ENV`    | `FRONTEND_URL`               |
| ------------- | ---------------------------- |
| `development` | `http://localhost:4200`      |
| `test`        | `http://localhost:4200`      |
| `production`  | `https://gmcan.unmsm.edu.pe` |

## Email

[`lib/mail.ts`](../apps/api/lib/mail.ts) sends through Resend's HTTP API. It
needs `RESEND_API_KEY`, `EMAIL_FROM`, and for the contact form
`INSTITUTIONAL_EMAIL`. When any is missing, the contact form and
`POST /api/email/password-reset/request` answer a 503 `upstream_failure` error
with the message `Email is not configured` and change nothing. The password
reset request refuses before it looks up the address, so the answer does not
reveal which addresses are registered.

## Ports

`bun run dev` starts the API with `wrangler dev` on port 3000 and the web app
with `ng serve` on port 4200. The API's port is the `--port` flag of the `start`
script in [`apps/api/package.json`](../apps/api/package.json).

## Web app

The Angular build carries no deployment URLs in production. The web Worker
([`apps/web/src/server.ts`](../apps/web/src/server.ts)) sets the API and site
URL to its own origin on every request and serves them at `/config.json`. Set
the `APP_URL` variable on `gmcan-web` to use a different canonical origin.

In development, `ng serve` reads
[`src/environments/environment.ts`](../apps/web/src/environments/environment.ts)
(`http://localhost:3000` and `http://localhost:4200`); `ng build` in its
production configuration replaces it with
[`environment.prod.ts`](../apps/web/src/environments/environment.prod.ts).
Server-side rendering accepts the hosts listed under `security.allowedHosts` in
[`angular.json`](../apps/web/angular.json): `localhost` and `*.workers.dev`. Add
the host of a custom domain there.
