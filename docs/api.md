# API

The API is a Hono app, a Cloudflare Worker that listens on port 3000 under
`wrangler dev`. [`app.ts`](../apps/api/app.ts) mounts every route; each resource
is one file under [`routes/`](../apps/api/routes). Responses are JSON unless
noted. Translated text in the public content endpoints follows `Accept-Language`
([localization](localization.md)).

```console
$ curl -s 'http://localhost:3000/api/search?q=nano&types=news' | head -c 160
{"publications":[],"members":[],"news":[{"id":56,"title":"Diseño y simulación de nanomateriales: Fundamento teórico y aplicaciones", ...
```

## Public endpoints

These endpoints require no sign-in. All paths start with `/api`.

| Endpoint                                      | Returns                                                                           |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| `GET /home`                                   | What the home page shows: recent items, counts, lines, methods, services          |
| `GET /publications`                           | Publications. Filters: `kindCode`, `event`, `journal`, `university`               |
| `GET /publications/:id`                       | One publication with its authors and file links                                   |
| `GET /members`, `GET /members/:id`            | Members, and one profile with projects and publications                           |
| `GET /projects`, `GET /projects/:id`          | Projects. Filter: `statusCode` (`planned`, `active`, `completed`, `archived`)     |
| `GET /news`                                   | Paged news. See below                                                             |
| `GET /news/:id`                               | One news item with its body                                                       |
| `GET /events`, `GET /events/:id`              | Conferences and workshops                                                         |
| `GET /research-lines`, `GET /methods`         | Research lines and methods, each also at `/:id`                                   |
| `GET /software`, `GET /equipment`             | Software and computing equipment                                                  |
| `GET /group`, `GET /group/:id/about`          | The research group's page text, and its about section                             |
| `GET /group/:groupId/software`                | The software of one group                                                         |
| `GET /group/:groupId/equipment`               | The equipment of one group                                                        |
| `GET /lookup`                                 | Reference lists the pages need (kinds, types, journals, and so on)                |
| `GET /search?q=&types=`                       | Search across publications, members, news and projects                            |
| `GET /assets/:id`, `GET /assets/:id/download` | A file ([assets](assets.md))                                                      |
| `GET /placeholders/member-photo`              | The image shown for a member with no photo                                        |
| `POST /email/contact`                         | Emails a membership request. Body: `name`, `reason`, `email`, `phone`             |
| `POST /email/password-reset/*`                | `request`, `verify`, `confirm` ([authorization](authorization.md#password-reset)) |

`GET /news` takes `q`, `newsKindCode`, `sortBy` (`publishedAt` or `title`),
`sortOrder` (`asc` or `desc`), `page` (default 1) and `pageSize` (default 10).
It lists `published` items only and answers `{ items, total, page, pageSize }`.
The query schema is in
[`packages/contracts/src/public/news.ts`](../packages/contracts/src/public/news.ts).

Public endpoints never return a member's dni, email, birth date or gender.
`GET /group` returns only the group's own contact email.

`GET /search` needs `q` of at least 2 characters after trimming; with less it
answers four empty lists. `types` is a comma-separated subset of
`publications,members,news,projects` and defaults to all four.

## Admin endpoints

All paths start with `/admin`. Every path except `/auth/login` and
`/auth/logout` needs the `sid` cookie ([authorization](authorization.md)).
Writes use JSON bodies, except file uploads.

| Path              | Permission (read / write)                  | Resource                                                                                                                                  |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/auth`           | none                                       | `POST /login`, `POST /logout`                                                                                                             |
| `/account`        | `account.self.read` / `account.self.write` | `GET /me`, `GET` and `PUT /profile`, `PUT /profile/photo`, `GET /profile/publishability`, `PUT /password`                                 |
| `/dashboard`      | `analytics.read`                           | `GET /summary`: counts of members and publications by type                                                                                |
| `/news`           | `news.read` / `news.write`                 | Paged list with filters, get, create, update, delete                                                                                      |
| `/publications`   | `publications.read` / `publications.write` | List, get, create, update, delete, `PUT /:id/authors`                                                                                     |
| `/projects`       | `projects.read` / `projects.write`         | List, create, update, delete, `PUT /:id/end`, `PUT /:id/restart`, `GET` and `POST /:id/members`, `DELETE /:id/members/:memberId`          |
| `/members`        | `members.read` / `members.write`           | List, get, create, update, delete, groups, publishability, email check, author search                                                     |
| `/research-lines` | `content.read` / `content.write`           | List, get, create, update, delete                                                                                                         |
| `/methods`        | `content.read` / `content.write`           | List, get, create, update, delete                                                                                                         |
| `/group`          | `content.read` / `content.write`           | Group page text, about section, software, equipment                                                                                       |
| `/assets`         | `content.read` / `content.write`           | `PUT`, `DELETE`, `POST /restore` ([assets](assets.md))                                                                                    |
| `/email`          | `content.write`                            | `PUT /member-password`: set any member's password                                                                                         |
| `/events`         | `refs.read` / `refs.write`                 | List, get, create, update, delete                                                                                                         |
| `/ref/*`          | `refs.read` / `refs.write`                 | Reference data: genders, prefixes, roles, member, publication, thesis and news kinds, journals, universities, funding sources, currencies |

Create endpoints answer `201 { "id": <number> }`. Update and delete answer
`{ "status": 1 }`.

## Errors

Every error answer of the API, from a route, a guard, the validator or an
unknown path, has the envelope defined in
[`packages/contracts/src/common/error.ts`](../packages/contracts/src/common/error.ts):

```json
{
  "ok": false,
  "error": {
    "code": "not_found",
    "status": 404,
    "message": "Not found",
    "traceId": "…"
  }
}
```

Code throws an `AppError` (`badRequest`, `unauthorized`, `forbidden`, `notFound`
in [`lib/errors/app-error.ts`](../apps/api/lib/errors/app-error.ts)), and
`onError` and `onNotFound` in
[`middleware/error.ts`](../apps/api/middleware/error.ts) turn it into the
envelope. Input that fails validation answers 400 `invalid_request` with the zod
issues in `details`.

`code` is one of `invalid_request`, `unauthorized`, `forbidden`, `not_found`,
`conflict`, `upstream_failure`, `invariant_violation` and `internal_error`.
`traceId` is a fresh UUID per error response. The web app turns the envelope
into its error page
([`shared/errors/app-error.ts`](../apps/web/src/app/shared/errors/app-error.ts)).
