# Architecture

State that more than one request can read or change at the same time. Each
section lists every state and who may move which transition.

## Members

`member.isActive` is `1` or `0`. The database refuses any other value
(`member_is_active_check`), and the admin member routes answer 400 to one.

| Value | State    | Meaning                                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------------------- |
| `1`   | active   | The member can sign in and appears on public pages.                                         |
| `0`   | inactive | The member cannot sign in and any session ends on its next request. Public pages hide them. |

| Transition      | Who                        | Code                                                                                           |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| none to `1`/`0` | holders of `members.write` | `POST /admin/members`, `createMember`. The caller picks the value.                             |
| none to `1`     | the dev seed               | `seedMembers`, outside production only                                                         |
| `1` to `0`      | holders of `members.write` | `PATCH /admin/members/:id`, `updateMember`                                                     |
| `0` to `1`      | holders of `members.write` | `PATCH /admin/members/:id`, `updateMember`                                                     |
| any to deleted  | holders of `members.write` | `DELETE /admin/members/:id`, `deleteMember`. Sessions of the member end on their next request. |

Nothing else writes `isActive`, and no job does.

Public routes never return personal data (dni, email, birth date, gender).

## Sessions

A session is a row in `session` named by the `sid` cookie. It expires 8 hours
after sign-in and after 2 hours without a request.

| From   | To     | Who and when                                                                |
| ------ | ------ | --------------------------------------------------------------------------- |
| none   | active | `POST /admin/auth/login`, only for an active member with the right password |
| active | active | `requireSession`, on every authenticated request: it sets `lastActiveAt`    |
| active | ended  | the holder, through `POST /admin/auth/logout`                               |
| active | ended  | `requireSession`, when the session is past 8 hours or idle for 2 hours      |
| active | ended  | `requireSession`, when its member no longer exists or is inactive           |
| active | ended  | the hourly cron, which deletes sessions past 8 hours or idle for 2 hours    |

An ended session is a deleted row. No transition moves an ended session back to
active, so reactivating a member does not revive earlier sessions. The member
must sign in again.

Deactivating a member does not touch their sessions. The next request ends them,
because `requireSession` reads `isActive` on every request.

Concurrent requests on one session are safe. Each one reads the row and the
member, and deletes are idempotent. The last write to `lastActiveAt` wins.

## News

`news.statusCode` is `draft`, `published` or `archived`.

| Transition | Who                     | How                          |
| ---------- | ----------------------- | ---------------------------- |
| any to any | holders of `news.write` | admin news create and update |

Public routes (list, detail, global search) return `published` items only. Admin
routes return every status.

## Assets

`asset.lifecycleStatus` is `active` or `soft_deleted`. The database refuses any
other value (`asset_lifecycle_status_check`). `deletedAt` is set exactly when
the asset is `soft_deleted`.

| Value          | Meaning                                                       |
| -------------- | ------------------------------------------------------------- |
| `active`       | The asset is served and can be the current asset of a slot.   |
| `soft_deleted` | The asset is no longer served. The row and the file are kept. |

| Transition             | Who                        | Code                                                                           |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| none to active         | holders of `content.write` | `PUT /admin/assets`, `putAsset`. The dev seed does the same for sample assets. |
| active to soft_deleted | holders of `content.write` | `PUT /admin/assets`, `putAsset`, for the asset the upload replaces             |
| active to soft_deleted | holders of `content.write` | `DELETE /admin/assets`, `deleteCurrentAsset`, for the current asset of a slot  |
| soft_deleted to active | holders of `content.write` | `POST /admin/assets/restore`, `restoreAsset`, by asset id                      |

Only `active` assets are served or linked. No code removes an asset row or its
file, and no job purges soft-deleted assets. Someone removes them by hand.

## Web server configuration

The production web build carries no deployment URLs. The web Worker sets the API
and site URL to the origin of each request and serves them to the browser at
`/config.json` ([configuration](configuration.md#web-app)).

The URLs are accepted with or without a trailing slash. Code builds API
addresses only with `GLOBAL.api(path)` and `GLOBAL.admin(path)`, and site
addresses with `GLOBAL.app(path)`. These join the base and the path with exactly
one slash. Never append a path to `GLOBAL.url` by hand.
