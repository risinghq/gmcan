# Deployment

Both apps run as Cloudflare Workers on one account:

```text
browser ──► gmcan-web (Angular app: static assets + proxy)
                │  service binding API
                └──► gmcan-api (Hono) ──► D1 database  gmcan
                                     └──► R2 bucket    gmcan-assets
```

| Worker      | Config                                                  | Serves                                                |
| ----------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `gmcan-web` | [`apps/web/wrangler.jsonc`](../apps/web/wrangler.jsonc) | Pages, static files, and `/api` and `/admin` by proxy |
| `gmcan-api` | [`apps/api/wrangler.jsonc`](../apps/api/wrangler.jsonc) | The API. Has no public URL of its own                 |

The site proxies `/api/*` and `/admin/*` to `gmcan-api` through the `API`
service binding, so the browser talks to one origin. This matters: the session
cookie is `SameSite=Strict`, and `workers.dev` is a public suffix, so a cookie
set by a second `*.workers.dev` host would not be sent back.
[`apps/web/src/server.ts`](../apps/web/src/server.ts) does the proxying, and it
also routes the server-side renderer's own `/api` calls to the binding, because
a Worker cannot fetch its own public URL.

`gmcan-api` runs in `aws:us-east-1` (`placement` in its `wrangler.jsonc`),
beside the D1 primary (`running_in_region` in `bunx wrangler d1 info gmcan`
names its region). A listing endpoint runs several rounds of dependent queries,
and a round from a distant Worker costs a full network round trip. Reads a
request knows up front go to D1 as one batch
([`readBatch`](../apps/api/db/client.ts)), so a round is one trip. Move the
placement if the database is recreated in another region.

The web Worker takes its API and site URLs from the origin of each request. See
[configuration](configuration.md#web-app).

## Prerequisites

- A Cloudflare account and `bunx wrangler login` (or `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID` in the environment).
- Free plan limits are enough: D1, R2, Workers and Workers Assets all have free
  tiers.

## First deployment

Run from `apps/api` unless noted.

1. Create the resources, then put the database id wrangler prints into
   `d1_databases[0].database_id` in
   [`wrangler.jsonc`](../apps/api/wrangler.jsonc):

   ```sh
   bunx wrangler d1 create gmcan
   bunx wrangler r2 bucket create gmcan-assets
   ```

2. Apply the schema ([database](database.md#migrations)):

   ```sh
   bun run migrate:remote
   ```

3. Set the public URL. `BACKEND_URL` and `FRONTEND_URL` in `wrangler.jsonc` are
   both the site's URL, for example `https://gmcan-web.<subdomain>.workers.dev`.
   Add the same host to `security.allowedHosts` in
   [`apps/web/angular.json`](../apps/web/angular.json) if it is not covered by
   `*.workers.dev`.

4. Deploy the API with its secret. The Worker validates its configuration when
   it loads, so the deploy itself needs the secret:

   ```sh
   echo "ASSET_SIGNING_SECRET=$(openssl rand -hex 32)" > secrets.env
   bunx wrangler deploy --secrets-file secrets.env
   rm secrets.env
   ```

   Later deploys are a plain `bun run deploy`; the secret stays on the Worker.

5. Deploy the web app, from `apps/web`. It must come after the API, because the
   service binding needs `gmcan-api` to exist:

   ```sh
   bun run deploy
   ```

6. Run the seed ([database](database.md#sample-data)). The migrations insert no
   rows, and only the seed creates the locales, roles, lookup values and the
   administrator you sign in as:

   ```sh
   SEED_PASSWORD=<at least 8 characters> bun run seed:remote
   ```

   The remote database and bucket must be empty. Without `SEED_PASSWORD` the
   seed generates a password and prints it.

   The seed also loads all the sample content and 20 sample accounts that share
   that password: one administrator, four researchers who can write news,
   projects and publications, and fifteen visitors. Delete the accounts you do
   not want from the dashboard, or change their passwords, before you publish
   the site.

Subsequent releases: `bun run migrate:remote` if a migration was added, then
`bun run deploy` in `apps/api` and in `apps/web`.

## Check a deployment

```sh
curl -s https://<site>/config.json
curl -s 'https://<site>/api/news?pageSize=1'
curl -s -o /dev/null -w '%{http_code}\n' https://<site>/
curl -si -X POST https://<site>/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@gmcan.dev","password":"<seed password>"}'
```

`bunx wrangler tail gmcan-web` and `bunx wrangler tail gmcan-api` stream logs.
Both Workers have Workers Logs turned on.

## Caching

The web Worker caches public API reads and refreshes them in the background, so
a dashboard edit does not show at once. [Caching](caching.md) has the rules and
the delay.

## Rendering

Every page renders in the browser. The Workers free plan stops a request at 10
ms of CPU and fails it with error 1102; the Workers Paid plan allows more. On
the Paid plan you can render public pages on the server: in
[`app.routes.server.ts`](../apps/web/src/app/app.routes.server.ts), replace the
single `**` route with `dashboard/**`, `login` and `reset-password` set to
`RenderMode.Client`, then `**` set to `RenderMode.Server`, and deploy the web
app again.

## Scheduled work

`gmcan-api` runs `17 * * * *` (hourly). Each run deletes expired sessions
([`sweepExpiredSessions`](../apps/api/middleware/session.ts)) and expired
password reset tokens
([`sweepExpiredResets`](../apps/api/services/password-reset.service.ts)); the
lifetimes are in [authorization](authorization.md#sign-in-and-out). Expired
sessions and tokens are also refused on every use, so the sweep only keeps the
tables small.

## Email

Mail goes through [Resend](https://resend.com). Until the settings in
[configuration](configuration.md#email) are complete, the contact form and the
password reset request answer 503 and everything else works.

`EMAIL_FROM` is `onboarding@resend.dev` in
[`apps/api/wrangler.jsonc`](../apps/api/wrangler.jsonc), Resend's shared test
sender. It delivers only to the address of the Resend account owner. To turn
email on with it:

1. Create a Resend API key (Resend dashboard, API Keys) and set it as a secret:

   ```sh
   cd apps/api
   bunx wrangler secret put RESEND_API_KEY
   ```

2. Set `INSTITUTIONAL_EMAIL`, the address that receives membership requests, to
   the Resend account owner's address under `vars` in `wrangler.jsonc`, then run
   `bun run deploy` in `apps/api`.

With the test sender a password reset reaches only a member whose email is the
owner's address. For other recipients, verify a domain in Resend (Domains, add
the DNS records it shows), set `EMAIL_FROM` to an address on it, and deploy
again. `lib/mail.ts` needs no change.

## Resetting

To start over, delete the database, empty and delete the bucket (R2 refuses to
delete a bucket that still holds objects), then repeat steps 1, 2 and 6:

```sh
bunx wrangler d1 delete gmcan
bunx wrangler r2 bucket delete gmcan-assets
```
