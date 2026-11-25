# State

State that more than one request can read or change at the same time. Each
section lists every state and who may move which transition.

## Members

`member.isActive` is `1` or `0`. The database refuses any other value
(`member_is_active_check`), and the admin member routes answer 400 to one.

| Value | State    | Meaning                                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------------------- |
| `1`   | active   | The member can sign in and appears on public pages.                                         |
| `0`   | inactive | The member cannot sign in and any session ends on its next request. Public pages hide them. |

Public pages also hide a member whose biography is empty in any one supported
locale, or whose dni, email, first name or last name is empty
([`member-read-model.ts`](../apps/api/services/member-read-model.ts)).

| Transition      | Who                        | Code                                                                                           |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| none to `1`/`0` | holders of `members.write` | `POST /admin/members`, `createMember`. The caller picks the value.                             |
| none to `1`     | the seed script            | `seedMembers`                                                                                  |
| `1` to `0`      | holders of `members.write` | `PUT /admin/members/:id`, `updateMember`                                                       |
| `0` to `1`      | holders of `members.write` | `PUT /admin/members/:id`, `updateMember`                                                       |
| any to deleted  | holders of `members.write` | `DELETE /admin/members/:id`, `deleteMember`. Sessions of the member end on their next request. |

Nothing else writes `isActive`, and no job does.

## Sessions and reset tokens

Two tables hold state that concurrent requests move: `session` (one row per
sign-in, named by the `sid` cookie) and `password_reset` (at most one row per
member, keyed by the SHA-256 digest of the token). Lifetimes are in
[authorization](authorization.md#sign-in-and-out) and
[password reset](authorization.md#password-reset). Each row is in one of the
states below, and only the owner listed may move it. D1 runs batches one after
another, so a batch is the unit that cannot interleave; a lookup followed by a
later write can.

| Row              | Transition               | Owner                                                                                                      | When                                                                                            |
| ---------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `session`        | none → live              | `createSession` ([`middleware/session.ts`](../apps/api/middleware/session.ts))                             | `POST /admin/auth/login` with the right password of an active member.                           |
| `session`        | live → live (idle clock) | `requireSession`                                                                                           | Every authenticated request: it sets `lastActiveAt`.                                            |
| `session`        | live → gone              | `requireSession`                                                                                           | The session is past its lifetime or idle limit, or its member is gone or inactive.              |
| `session`        | live → gone              | `destroySession`                                                                                           | `POST /admin/auth/logout`.                                                                      |
| `session`        | live → gone              | `passwordChangeQueries` ([`services/member.service.ts`](../apps/api/services/member.service.ts))           | A password change ([which sessions it spares](authorization.md#password-reset)).                |
| `session`        | live → gone              | `sweepExpiredSessions`                                                                                     | The hourly scheduled worker, for rows nobody presented again.                                   |
| `password_reset` | none or live → live      | `issueResetToken` ([`services/password-reset.service.ts`](../apps/api/services/password-reset.service.ts)) | A reset request for an active member. It replaces the member's previous row.                    |
| `password_reset` | live → gone, once        | `passwordChangeQueries`, through `resetPasswordWithToken` or a change below                                | Any password change: a confirm, a self-service change or an administrator's, in the same batch. |
| `password_reset` | live → gone              | `sweepExpiredResets`                                                                                       | The hourly scheduled worker, past the token's lifetime.                                         |

An ended session is a deleted row. No transition moves an ended session back to
live, so reactivating a member does not revive earlier sessions. The member must
sign in again. Deactivating a member does not touch their sessions: the next
request ends them, because `requireSession` reads `isActive` on every request.

Invariants:

- A reset token is spent at most once. The statements that change the password
  and the sessions carry a guard that the live token row exists, and the batch
  deletes the row last, so of two confirms with one token the second changes
  nothing and reports failure. Every password change deletes the member's reset
  row, so a link emailed before a change cannot override it. Deleting a member
  deletes both tables' rows by cascade.
- A password change and the end of the member's sessions happen in the same
  batch; no state has the new password with an old session alive.
- Only the digest of a token is stored, and no read selects `password_reset` for
  a response. The plain token exists in the email that carries it.
- Concurrent requests on one session are safe. Each one reads the row and the
  member, and deletes are idempotent. The last write to `lastActiveAt` wins.
- A login that races a password change may leave a session created after the
  change. It is bound by the same limits as any other and ends at the next
  change, logout or expiry.

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

| Transition             | Who                        | Code                                                                              |
| ---------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| none to active         | holders of `content.write` | `PUT /admin/assets`, `putAsset`. The seed script does the same for sample assets. |
| active to soft_deleted | holders of `content.write` | `PUT /admin/assets`, `putAsset`, for the asset the upload replaces                |
| active to soft_deleted | holders of `content.write` | `DELETE /admin/assets`, `deleteCurrentAsset`, for the current asset of a slot     |
| soft_deleted to active | holders of `content.write` | `POST /admin/assets/restore`, `restoreAsset`, by asset id                         |

Only `active` assets are served or linked. No code removes an asset row or its
file, and no job purges soft-deleted assets.
