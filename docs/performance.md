# Performance

How to measure the time a visitor waits for the first byte, and how to decide
whether a change made it shorter. Run the measurement before and after the
change, with the same method, and keep the change only if it clears the
run-to-run spread.

## What is measured

Time to first byte (TTFB) from the end of the TLS handshake to the first
response byte, as `curl` reports it (`time_starttransfer - time_appconnect`),
for these routes:

- Every public API route. The list comes from the code, see
  [Which routes](#which-routes).
- Two admin routes that need no session: `POST /admin/auth/login` with an
  unknown email, which answers 401, and `GET /admin/dashboard/summary` without a
  session. The dashboard route is session-protected and also answers 401 here,
  so that sample times the session check that rejects the request, not the
  dashboard query. The other admin routes are not measured, because they need a
  signed-in session.
- The site's own routes: `/config.json`, the `/home` page shell, and
  `/api/lookup` through the web Worker's data center cache.

Each route is measured twice per sample:

- **Cold**: the first request after the Worker was redeployed, so it reaches a
  new isolate that has to load and run the whole bundle.
- **Warm**: the request right after it, on the same isolate.

The difference between the two is the cost of starting the isolate. A warm time
that is already high points at the work of the request itself, such as database
rounds, and no change to the bundle can lower it.

Measure on the deployed app, not on a dev server: the network, the placement
next to D1, and the isolate start only exist there.

## Method

[`scripts/ttfb.ts`](../scripts/ttfb.ts) deploys throwaway copies of both Workers
(`gmcan-api-perf-<arm>` and `gmcan-web-perf-<arm>`) from a bundle of this
checkout. The copies use the production D1 database and R2 bucket through the
bindings in the `wrangler.jsonc` files, but only read them. Run the measurement
against a database whose read load you accept. It needs `wrangler` logged in to
the account.

```sh
bun scripts/ttfb.ts stage <code>          # bundle this checkout as <code>
bun scripts/ttfb.ts up <arm> <code>       # deploy the two copies of an arm
bun scripts/ttfb.ts run <arm>[,<arm>]     # measure, 30 samples per route
bun scripts/ttfb.ts report <file>...      # p50, p95 and spread per route
bun scripts/ttfb.ts down <arm>            # delete the copies
```

The scratch files go to `.perf/`, which git ignores. `down` exits non-zero and
names each Worker it could not delete, so a copy is never left running
unnoticed.

### Which routes

[`scripts/public-routes.ts`](../scripts/public-routes.ts) loads the API's Hono
app and lists its routes, so the measurement follows the code: a route added to
`apps/api` is measured without editing the list. It leaves out `/admin` and the
middleware layers. `ttfb.ts` then gives each route a request:

- A path parameter takes the id of the first row of the matching listing, or `1`
  for the research group, or the file of the first publication for
  `/api/assets/:assetId`.
- `/api/search` gets `?q=nano`.
- A public POST route needs an entry in `POST_FIXTURES` in `ttfb.ts`. A route
  with no value or no entry stops the run with the name of the route.

The four public `POST /api/email/*` routes are measured on the throwaway copy
without sending any mail. The copy has no `RESEND_API_KEY` and no
`INSTITUTIONAL_EMAIL`, so `contact` and `password-reset/request` answer 503 at
their configuration check, before the send. That is the choice made here: they
time routing, validation and the check, not a Resend call.
`password-reset/verify` and `password-reset/confirm` look up a token no member
holds, and would answer 400 without a write. The database they read, which is
production's, has no `password_reset` table, so on the copy both answered 500 in
all 30 samples. They have no timing row for that reason: `report` lists each as
`failed: 500`, and the times of those 500 answers (a failed query, not the
lookup) are only in the dropped-samples table. Once the table exists they answer
400 and get a row. A run that includes these routes refuses to start when the
copy holds a `RESEND_API_KEY` secret.

A cold sample costs one deploy, so a full run takes hours. Split it with
`--part 1/5` and run the parts at once on separate arms, or measure only some
routes with `--routes "/api/projects,/api/search"`. A run keeps its rows in the
`--out` file and skips the samples already there, so restart it after any
interruption.

### Comparing two versions

To compare a change with the code before it, stage both, deploy each as its own
arm, and give both to one run:

```sh
git switch --detach <old commit>
bun scripts/ttfb.ts stage base
git switch -
bun scripts/ttfb.ts stage change
bun scripts/ttfb.ts up a base && bun scripts/ttfb.ts up b change
bun scripts/ttfb.ts run a,b --routes "/api/projects" --out .perf/projects.jsonl
bun scripts/ttfb.ts report .perf/projects.jsonl
```

Arms in one run are redeployed together and requested one after the other, and
the order alternates with the sample number. The route also rotates with the
sample number. A slow minute on the network or in the data center then lands on
both versions and on every route alike, and a version never gets the lucky slot
every time. Never compare numbers from two separate runs hours apart.

Cache: every API `GET` carries a fresh `cb` query string so no cache answers it.
`POST` routes are never cached. The web Worker's `/config.json` and `/home` are
requested without a query string, and `/api/lookup` through the web Worker is
requested with the same URL every time, on purpose, to time the data center
cache; it is requested once beforehand to fill it.

A sample whose route answers with another status than expected is dropped from
the timing columns. `report` counts them and lists each affected route under the
table with the statuses it answered and its times. A route whose every sample
was dropped keeps its row in the table, with `failed: <status>` in place of the
times.

### Reading the report

`n` is the number of kept samples. `p50` and `p95` are the median and the 95th
percentile in milliseconds, for cold and warm. `spread` is the run-to-run
spread: the samples are split into three runs by sample number (0, 3, 6, ...
then 1, 4, 7, ... then 2, 5, 8, ...), and the spread is the largest median minus
the smallest. Three runs interleaved through the whole measurement see the same
drift, so what still differs between them is noise.

Keep a change only when its p50 gain is larger than the spread of the slower of
the two versions, and the gain shows in both the cold and the warm column when
the change should affect both. A gain inside the spread is not a result, even
when the medians differ. One change can serve several routes through one code
path: the asset streaming in `serveAsset` is kept although `/api/assets/:id` in
the cold column falls short of the base spread, because three of the four
columns clear it, both routes share that path, and all three interleaved runs
show the same sign.
