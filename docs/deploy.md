# Deploy

```sh
git push origin master
```

A push to `master` deploys the site to
<https://gmcan-web.empirical.workers.dev>. After the checks pass, the `deploy`
job in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs, in order:

1. `bun run migrate:remote` in `apps/api`, which applies new migrations
   ([database](database.md#migrations)).
2. `bun run deploy` in `apps/api`.
3. `bun run deploy` in `apps/web`, which binds the `gmcan-api` service.
4. `bun scripts/smoke.ts <site>`, which fails the run unless every public page
   answers 200 with one `<h1>` and an unknown path answers 404. It opens the
   first news item and member when they exist.

The job reads the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets of
the `production` environment. The same steps run by hand after
`bunx wrangler login`.

## Topology

```text
browser ──► gmcan-web (pages, static files, /api and /admin proxy)
                │  service binding API
                └──► gmcan-api (Hono) ──► D1 database  gmcan
                                     └──► R2 bucket    gmcan-assets
```

| Worker      | Config                                                  | Serves                                                |
| ----------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `gmcan-web` | [`apps/web/wrangler.jsonc`](../apps/web/wrangler.jsonc) | Pages, static files, and `/api` and `/admin` by proxy |
| `gmcan-api` | [`apps/api/wrangler.jsonc`](../apps/api/wrangler.jsonc) | The API. It has no public URL                         |

The browser talks to one origin, so the `SameSite=Strict` session cookie is sent
on every API call. `gmcan-api` runs in `aws:us-east-1` (`placement` in its
`wrangler.jsonc`), beside the D1 primary. `bunx wrangler d1 info gmcan` names
the primary's region in `running_in_region`; move the placement with it.

## First deployment

Run from `apps/api` unless noted. The Workers free plan is enough.

1. Create the resources, then put the database id wrangler prints into
   `d1_databases[0].database_id` in
   [`wrangler.jsonc`](../apps/api/wrangler.jsonc):

   ```sh
   bunx wrangler d1 create gmcan
   bunx wrangler r2 bucket create gmcan-assets
   ```

2. Apply the schema:

   ```sh
   bun run migrate:remote
   ```

3. Set `FRONTEND_URL` in `wrangler.jsonc` to the site's URL, for example
   `https://gmcan-web.<subdomain>.workers.dev`. Add a custom domain's host to
   `security.allowedHosts` in
   [`apps/web/angular.json`](../apps/web/angular.json).

4. Deploy the API with its signing secret. The Worker validates its
   configuration when it loads, so the first deploy needs the secret:

   ```sh
   echo "ASSET_SIGNING_SECRET=$(openssl rand -hex 32)" > secrets.env
   bunx wrangler deploy --secrets-file secrets.env
   rm secrets.env
   ```

5. Deploy the web app, from `apps/web`:

   ```sh
   bun run deploy
   ```

6. Seed the database ([database](database.md#sample-data)). The migrations
   insert no rows; the seed creates the locales, roles, lookup values and the
   administrator. The remote database and bucket must be empty.

   ```sh
   SEED_PASSWORD=<at least 8 characters> bun run seed:remote
   ```

   The seed also creates 20 sample accounts that share the password: one
   administrator, four researchers and fifteen visitors. Delete or change them
   from the dashboard before you publish the site.

7. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to the `production`
   environment of the GitHub repository.

Email stays off until you configure it ([email](email.md)).

## Check a deployment

```sh
bun scripts/smoke.ts https://<site>
curl -s https://<site>/config.json
curl -s 'https://<site>/api/news?pageSize=1'
curl -s -o /dev/null -w '%{http_code}\n' https://<site>/
curl -si -X POST https://<site>/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@gmcan.dev","password":"<seed password>"}'
```

`bunx wrangler tail gmcan-web` and `bunx wrangler tail gmcan-api` stream logs.

Public reads and pages are cached at the edge, so an edit shows within about a
minute ([caching](caching.md)).

## Scheduled work

`gmcan-api` runs hourly at `17 * * * *`. Each run deletes expired sessions
([`sweepExpiredSessions`](../apps/api/middleware/session.ts)) and expired
password reset tokens
([`sweepExpiredResets`](../apps/api/services/password-reset.service.ts)).

## Start over

Delete the database, then empty and delete the bucket. R2 refuses to delete a
bucket that still holds objects. Then repeat steps 1, 2 and 6.

```sh
bunx wrangler d1 delete gmcan
bunx wrangler r2 bucket delete gmcan-assets
```
