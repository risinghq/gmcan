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
beside the D1 primary, which D1 placed in `ENAM` (see `running_in_region` in
`bunx wrangler d1 info gmcan`). A listing endpoint issues one query per row, and
a query from a distant Worker costs a full network round trip. Without the
placement, `/api/publications` took 3.6 s from South America; with it, 1.4 s.
Move the placement if the database is recreated in another region.

The web worker takes its API and site URLs from the origin of each request and
serves them to the browser at `/config.json`. Set `APP_URL` as a variable on
`gmcan-web` to pin a canonical origin instead.

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

6. Load sample content, or skip this and create content from the dashboard
   ([database](database.md#sample-data)):

   ```sh
   SEED_PASSWORD=<at least 8 characters> bun run seed:remote
   ```

   The remote database and bucket must be empty. Without `SEED_PASSWORD` the
   seed generates a password and prints it.

Subsequent releases: `bun run migrate:remote` if a migration was added, then
`bun run deploy` in `apps/api` and in `apps/web`.

## Check a deployment

```sh
curl -s https://<site>/config.json
curl -s 'https://<site>/api/news?pageSize=1'
curl -s -o /dev/null -w '%{http_code}\n' https://<site>/home
curl -si -X POST https://<site>/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@gmcan.dev","password":"<seed password>"}'
```

`bunx wrangler tail gmcan-web` and `bunx wrangler tail gmcan-api` stream logs.
Both Workers have Workers Logs turned on.

## Rendering

Every page renders in the browser. Rendering a page on the server takes about
100 to 300 ms of CPU, and the Workers free plan stops a request at 10 ms, so
server rendering fails there with error 1102. On the Workers Paid plan you can
render public pages on the server: in
[`app.routes.server.ts`](../apps/web/src/app/app.routes.server.ts), list
`dashboard/**`, `login` and `reset-password` with `RenderMode.Client`, then `**`
with `RenderMode.Server`, and deploy the web app again.

## Scheduled work

`gmcan-api` runs `17 * * * *` (hourly). Each run deletes sessions past their 8
hour life or idle for 2 hours
([`sweepExpiredSessions`](../apps/api/middleware/session.ts)). Expired sessions
are also refused on every request, so the sweep only keeps the table small.

## Email

Email is off in a fresh deployment. The contact form (`POST /api/email/contact`)
and the password reset request (`POST /api/email/password-reset/request`) answer
`503 {"error":{"message":"Email is not configured"}}`. Everything else works.

To turn it on, the sending domain must be on Cloudflare DNS:

1. Add the domain to the Cloudflare account and move its nameservers to
   Cloudflare.
2. Onboard the domain for Email Service in the dashboard (Compute, Email
   Service) and publish the DNS records it asks for.
3. In [`apps/api/wrangler.jsonc`](../apps/api/wrangler.jsonc), add the binding
   and the two variables:

   ```jsonc
   "send_email": [{ "name": "EMAIL" }],
   "vars": {
     // existing vars ...
     "EMAIL_FROM": "gmcan@your-domain.example",
     "INSTITUTIONAL_EMAIL": "gmcan@your-domain.example"
   }
   ```

   `EMAIL_FROM` is the sender, on the onboarded domain. `INSTITUTIONAL_EMAIL`
   receives membership requests.

4. If the site moves to the new domain, update `BACKEND_URL` and `FRONTEND_URL`
   to it (password reset links use `FRONTEND_URL`), and add its host to
   `security.allowedHosts` in `angular.json`. Attach the domain to `gmcan-web`
   as a custom domain.

5. Run `bun run deploy` in `apps/api` and in `apps/web`.

No code changes are needed: [`lib/mail.ts`](../apps/api/lib/mail.ts) sends
through the `EMAIL` binding as soon as it and `EMAIL_FROM` exist.

## Resetting

To start over, delete the database, empty and delete the bucket (R2 refuses to
delete a bucket that still holds objects), then repeat steps 1, 2 and 6:

```sh
bunx wrangler d1 delete gmcan
bunx wrangler r2 bucket delete gmcan-assets
```
