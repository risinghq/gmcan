# Authorization

Everything under `/admin` except `/admin/auth/login` and `/admin/auth/logout`
needs a signed-in member. The public API (`/api/*`) needs nothing.

## Sign in and out

```console
$ curl -i -c cookies.txt -X POST http://localhost:3000/admin/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@gmcan.dev","password":"password123"}'
HTTP/1.1 200 OK
...
{"user":{"id":1,"email":"admin@gmcan.dev","roleCode":"administrator", ... "capabilities":["news.read","news.write", ...]}}

$ curl -b cookies.txt http://localhost:3000/admin/dashboard/summary
```

A successful login creates a row in the `session` table and sets the `sid`
cookie: `HttpOnly`, `SameSite=Strict`, `Secure` when `NODE_ENV` is `production`.
The logic is in [`middleware/session.ts`](../apps/api/middleware/session.ts).

| Limit        | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Lifetime     | 8 hours from login                                       |
| Idle timeout | 2 hours since the last request. Every request resets it. |

A missing, unknown or expired session gets a 401 `unauthorized` error with the
message `Unauthorized` or `Session expired`. An unknown email and a wrong
password both get a 401 `unauthorized` error with the message
`Invalid credentials`. All errors have the [envelope](api.md#errors).

`POST /admin/auth/logout` deletes the session and answers `204` with
`Clear-Site-Data: "cookies","storage"`. Login and logout are the only `/admin`
paths that skip the session check
([`middleware/auth-exempt.ts`](../apps/api/middleware/auth-exempt.ts)).
Passwords are stored as scrypt hashes (`N=16384, r=8, p=5`, a random salt per
password) in `scrypt$N$r$p$salt$key` form
([`lib/password.ts`](../apps/api/lib/password.ts)). Each hash records its own
parameters, so verification keeps working if the cost changes.

The API allows CORS with credentials for one origin, `FRONTEND_URL`
([configuration](configuration.md)).

## Roles and permissions

Each member has one role. Permissions are fixed per role in
[`authz/permissions.ts`](../apps/api/authz/permissions.ts).

| Permission                                | administrator | researcher | visitor |
| ----------------------------------------- | :-----------: | :--------: | :-----: |
| `news.read`, `news.write`                 |      yes      |    yes     |         |
| `projects.read`, `projects.write`         |      yes      |    yes     |         |
| `publications.read`, `publications.write` |      yes      |    yes     |         |
| `members.read`, `members.write`           |      yes      |            |         |
| `content.read`, `content.write`           |      yes      |            |         |
| `refs.read`, `refs.write`                 |      yes      |            |         |
| `analytics.read`                          |      yes      |            |         |
| `account.self.read`, `account.self.write` |      yes      |    yes     |   yes   |

`content` covers the group pages, research lines, methods, equipment, software
and file uploads. `refs` covers the reference data under `/admin/ref`.

The login response and `GET /admin/account/me` list the member's permissions as
`capabilities`. The dashboard menu shows entries according to that list
([`log-home.component.html`](../apps/web/src/app/dashboard/shell/log-home.component.html)).
The API enforces the permissions itself.

## How routes check permissions

[`middleware/authz.ts`](../apps/api/middleware/authz.ts) provides the guards:

- `loadActor` runs on `/admin`, except login and logout. It loads the member
  behind the session and puts `{ id, role }` on the request. It answers 401 if
  the member no longer exists.
- `requirePermission(permission)` answers a 403 `forbidden` error unless the
  actor's role has the permission.
- `requireSelfOrPermission({ resourceParam, selfPermission, elevatedPermission })`
  lets through an actor who has the elevated permission, or whose own id is the
  `:id` in the URL and who has the self permission. Member translations use it.

The news, publications, projects, events, research-line, method, group, asset
and reference-data routers apply one guard to `GET` requests (`<area>.read`) and
another to every other method (`<area>.write`). The members, account and
dashboard routes guard each endpoint, and `/admin/email` requires
`content.write` for every method.

The `account.self.*` permissions are checked by identity: `can()` in
[`authz/policy.ts`](../apps/api/authz/policy.ts) lets an actor use them on their
own record only.

When `requirePermission` or `requireSelfOrPermission` answers 403, it writes one
JSON line with `console.warn`: `"type":"authz_denied"`, `actorId`, `role`,
`path`, `method`, `permission` and `reason`. The 401 and 403 answers of
`requireSession` and `loadActor` are not logged.

## Password reset

Three public endpoints under `/api/email` implement the emailed reset:

| Endpoint                       | Behavior                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `POST /password-reset/request` | Emails a link with a random token valid for 24 hours. Answers `{"status":1}` whether or not the email is registered.   |
| `POST /password-reset/verify`  | Answers `{"status":1}` if the token is valid, else 400.                                                                |
| `POST /password-reset/confirm` | Sets a new password of at least 8 characters, spends the token and ends the member's sessions. Invalid token gets 400. |

The token reaches the member only in that email. No response carries it, and
only its SHA-256 digest is stored, in `password_reset`, one row per member. A
new request replaces the previous token. The lookup and the send run after the
response, so a registered and an unknown address are answered alike in time. The
scheduled sweep deletes expired rows.

An administrator who changes a member's password
(`PUT /admin/email/member-password`) ends that member's sessions too. Any
password change, by the member or an administrator, also voids an outstanding
reset link.

Without email configured ([configuration](configuration.md#email)) the request
endpoint answers `503` and stores no token.

A signed-in member changes their own password with
`PUT /admin/account/password`. An administrator sets any member's password with
`PUT /admin/email/member-password`.
