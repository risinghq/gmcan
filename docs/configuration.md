# Configuration

The API reads its settings from environment variables.
[`config/env.ts`](../apps/api/config/env.ts) validates them with zod when the
process starts and exits with the list of problems if any value is invalid.

`bun run dev:api` and `bun run start` in `apps/api` load `../../.env`, the
`.env` at the repository root. [`.env.example`](../.env.example) is the
template. It is not valid as shipped: `RESEND_API_KEY=` and
`INSTITUTIONAL_EMAIL=` are empty strings, and the schema rejects both.

## Variables

| Variable               | Default                    | Meaning                                                                                     |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| `NODE_ENV`             | `development`              | `development`, `test` or `production`. Production changes startup, cookies, URLs and email. |
| `LIBSQL_URL`           | `file:./data/gmcan.db`     | libSQL database. A `file:` path is relative to `apps/api`.                                  |
| `LIBSQL_AUTH_TOKEN`    | none                       | Auth token for a remote libSQL server such as sqld or Turso.                                |
| `ASSET_SIGNING_SECRET` | none, required             | Key that signs temporary URLs for private files ([assets](assets.md#private-files)).        |
| `RESEND_API_KEY`       | none, required in practice | Resend key. The API creates its email client at startup and fails without a value.          |
| `INSTITUTIONAL_EMAIL`  | none                       | Address that receives membership requests. Must be a valid email when set.                  |
| `FRONTEND_URL`         | by `NODE_ENV`              | Origin allowed by CORS, and the base of password reset links.                               |
| `BACKEND_URL`          | by `NODE_ENV`              | Public base URL of the API, used to build file URLs in responses.                           |
| `SUPPORTED_LOCALES`    | `es,en`                    | Comma-separated locale codes ([localization](localization.md)).                             |
| `DEFAULT_LOCALE`       | first supported locale     | Locale used when a request names none that is supported.                                    |

`FRONTEND_URL` and `BACKEND_URL` default per environment
([`config.ts`](../apps/api/config.ts)):

| `NODE_ENV`    | `FRONTEND_URL`               | `BACKEND_URL`                |
| ------------- | ---------------------------- | ---------------------------- |
| `development` | `http://localhost:4200`      | `http://localhost:3000`      |
| `test`        | `http://localhost:4200`      | `http://localhost:3000`      |
| `production`  | `https://gmcan.unmsm.edu.pe` | `http://161.35.230.134:3000` |

`.env.example` also lists `JWT_SECRET`. Nothing reads it.

## Email

[`routes/public/operational/email.ts`](../apps/api/routes/public/operational/email.ts)
sends through Resend. In `development` every message is sent from
`onboarding@resend.dev` and the membership request goes to
`delivered@resend.dev`, so no `INSTITUTIONAL_EMAIL` is needed. In any other
environment the sender is `gmcan@unmsm.edu.pe` and membership requests go to
`INSTITUTIONAL_EMAIL`.

## Ports

The API listens on port 3000 and the web server on 4200. Neither is
configurable by environment variable; they are set in
[`server.ts`](../apps/api/server.ts) and
[`apps/web/src/server.ts`](../apps/web/src/server.ts).

## Web app

The Angular app has no environment variables. It reads the API and site URLs
from [`src/environments/environment.ts`](../apps/web/src/environments/environment.ts).
`ng build` in its default production configuration replaces that file with
[`environment.prod.ts`](../apps/web/src/environments/environment.prod.ts).
Server-side rendering accepts the hosts listed under `security.allowedHosts` in
[`angular.json`](../apps/web/angular.json).
