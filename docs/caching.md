# Caching

The web Worker keeps public API reads in the Cache API (`caches.default`) of the
data center that served the request, so a repeat read skips the hop to the API
Worker and every query behind it. [`server.ts`](../apps/web/src/server.ts) sends
every `/api/*` and `/admin/*` request through
[`api-cache.ts`](../apps/web/src/api-cache.ts).

| Aspect            | Rule                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is cached    | `GET` responses that are `200` and carry `Cache-Control: public` with a positive `max-age`. Other methods and `/api/email/*` skip the cache.                                 |
| Who marks them    | [`middleware/public-cache.ts`](../apps/api/middleware/public-cache.ts) adds `public, max-age=60` to successful public reads that set no policy of their own.                 |
| Not cached        | Admin responses and private files, which send no public policy or `private, no-store`.                                                                                       |
| Key               | The request URL, query string included, plus the `Accept-Language` header, because the API picks the content language from it.                                               |
| Expiry            | Fresh for 60 seconds, then stale for an hour, as the web Worker records on the stored copy. Asset copies are fresh for 60 seconds and never stale.                           |
| Who populates it  | The web Worker, with `cache.put` on a miss and when the background refresh of a stale entry gets a shareable answer. Nothing else writes to it.                              |
| What invalidates  | There is no purge. A refresh replaces an entry, or deletes it when the API's answer is not shareable, such as a 404. Otherwise an entry stays until its stale hour runs out. |
| Visible to client | `X-Cache: HIT`, `STALE` or `MISS` on a response that was shareable or came from the cache. Other API responses carry no `X-Cache` header.                                    |

Inline public files answer `public, max-age=31536000, immutable`
([`lib/upload.ts`](../apps/api/lib/upload.ts)). The edge still holds their copy
for 60 seconds only, but a browser that already loaded a file keeps it for a
year, so deleting a file does not remove it from that browser.

## Entry states

Each entry is in one of four states. It is absent until a request misses; it is
fresh from the `put` until 60 seconds later, and `HIT`s serve it unchanged; then
it is stale for an hour, and the next request gets it as `STALE` while the web
Worker fetches a new copy in the background; then the runtime treats it as
absent again. Only the web Worker moves an entry between states, and each data
center has its own copy, so two visitors in different cities can see different
versions during the same minute.

The web Worker also keeps a `refreshing` set of cache keys, in the module scope
of `api-cache.ts`. It stops a burst of requests for one stale entry from each
starting a refresh. It lives in the memory of one isolate, so it is not shared
with other isolates or other data centers, and it holds no data a visitor sees.
A key has two states:

| State  | Entered when                                          | Left when                                                               |
| ------ | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Absent | The isolate starts, or a refresh for the key finishes | A request finds the entry stale and starts its refresh                  |
| Held   | The request that found the entry stale adds the key   | The refresh ends: the API answered, the API call threw, or `put` failed |

While a key is held, other requests for it get the stale copy and start nothing.
The refresh removes the key in a `finally`, so every way it ends releases the
key. How it ends decides the entry:

- The API answers with a shareable response: the entry is replaced and is fresh
  again.
- The API answers with anything else, such as a 404: the entry is deleted, so
  the next request is a `MISS`.
- The refresh throws, for example because the API Worker is unavailable: the
  error reaches `waitUntil`, the old entry stays, and the next request after the
  failure finds the key absent and tries again. Visitors keep getting `STALE`
  copies until the stale hour ends.

When the runtime evicts the isolate, the set goes with it. The next request is
served by a new isolate with an empty set, finds the entry still stale in the
data center's cache, and starts one refresh. Two isolates can refresh the same
entry at once, and the second `put` overwrites the first with an equally recent
copy. A refresh that the runtime abandons without running its `finally` can
leave a key held in an isolate that stays alive. The entry then stays stale
until its retention runs out, after which the request is a `MISS`, which does
not use the set and writes a new entry.

## What a visitor sees after an edit

After an admin write, a public page can show the old content from the edge until
the first request after 60 seconds has refreshed the copy, and up to another 60
seconds if the visitor's browser holds its own copy of the response
(`max-age=60`). The browser that made the edit is no exception: its next read
goes through the same browser and edge copies. Server-side rendering reaches the
API through the service binding directly, so rendered HTML never comes from this
cache.

## Build files

The Angular build names its scripts, styles and fonts by content hash
(`chunk-*`, `main-*`, `polyfills-*`, `styles-*`, `media/*`), so a changed file
always gets a new name. [`public/_headers`](../apps/web/public/_headers) serves
them, at the root and under `/en`, with `public, max-age=31536000, immutable`,
and a returning visitor loads them without a request. Other static files, such
as `img/*` and `favicon.ico`, keep the Workers default
`public, max-age=0, must-revalidate`, because their names do not change when
their content does. Pages are rendered by the Worker and `_headers` does not
apply to them.

Angular copies `public/` into each locale's folder, so the build also holds
`en/_headers`. [`public/.assetsignore`](../apps/web/public/.assetsignore) keeps
that copy out of the upload; only the root `_headers` is read.
