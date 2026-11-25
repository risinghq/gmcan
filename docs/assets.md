# Assets

Assets are the uploaded photos and PDFs. They live in an R2 bucket, the
`STORAGE` binding in [`wrangler.jsonc`](../apps/api/wrangler.jsonc)
(`gmcan-assets` in production, emulated under `apps/api/.wrangler/state` by
`wrangler dev`). The database records each file in the `asset` table and binds
it to the record that shows it.

## Owners and slots

A binding names an owner type, an owner id and a slot. Each owner type has its
own binding table and a fixed set of slots, defined in
[`services/assets/policy.ts`](../apps/api/services/assets/policy.ts).

| Owner type       | Slots                            | File kind                                                        |
| ---------------- | -------------------------------- | ---------------------------------------------------------------- |
| `member`         | `photo`                          | image                                                            |
| `news`           | `photo`                          | image                                                            |
| `method`         | `photo`                          | image                                                            |
| `research_line`  | `photo`                          | image                                                            |
| `about`          | `photo`                          | image                                                            |
| `publication`    | `file`                           | document                                                         |
| `research_group` | `facilities`, `header`, `footer` | `facilities` is an image; `header` and `footer` are brand images |

Allowed extensions per kind, checked on the uploaded file's name
([`lib/upload.ts`](../apps/api/lib/upload.ts)):

| Kind        | Extensions                   |
| ----------- | ---------------------------- |
| image       | `png`, `jpg`, `jpeg`, `webp` |
| brand image | `png`, `svg`                 |
| document    | `pdf`                        |

## Upload, replace, delete

All three need the `content.write` permission
([`routes/admin/assets.ts`](../apps/api/routes/admin/assets.ts)).

```sh
# Upload, or replace the current file of a slot
curl -b cookies.txt -X PUT http://localhost:3000/admin/assets \
  -F ownerType=news -F ownerId=56 -F slot=photo -F file=@photo.jpg

# Soft-delete the current file of a slot
curl -b cookies.txt -X DELETE http://localhost:3000/admin/assets \
  -H 'Content-Type: application/json' \
  -d '{"ownerType":"news","ownerId":56,"slot":"photo"}'

# Restore a soft-deleted asset by id
curl -b cookies.txt -X POST http://localhost:3000/admin/assets/restore \
  -H 'Content-Type: application/json' -d '{"assetId":4}'
```

An upload stores the file as `<uuid>.<ext>` in the bucket, inserts an `asset`
row, and inserts a binding with the next `version` number for that owner and
slot. The binding with the highest version is the current file. The previous
file's asset is marked `soft_deleted` and gets a `deletedAt` time. The row and
the file stay in place ([state](state.md#assets)).

Every upload, replace, delete and restore adds a row to `asset_audit`.

A soft-deleted asset is no longer served: its URL answers `404`. The API answers
`400` for an unsupported slot or file type, `404` when the owner does not exist.

## Serving files

Responses carry absolute file URLs on the origin the request reached: the site
in production and under `bun run preview`, the API on port 3000 under
`bun run dev` ([`config.ts`](../apps/api/config.ts)). A slot's file is returned
as a URL string, or `null` when the slot is empty or soft-deleted. Publication
files are returned as `{ "inline": ..., "download": ... }` instead. A member
with no photo gets `/api/placeholders/member-photo`.

| Endpoint                       | Response                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| `GET /api/assets/:id`          | The file, with `Cache-Control: public, max-age=31536000, immutable` |
| `GET /api/assets/:id/download` | The file with `Content-Disposition: attachment`                     |

### Private files

An asset's `visibility` is `public` or `private`. Uploads through the API are
always `public`. A `private` asset is served only with
`?expires=<unix seconds>&token=<hex>`, where `token` is the HMAC-SHA256 of
`<id>:<expires>` keyed with `ASSET_SIGNING_SECRET`. A missing, expired or
invalid token answers `401`. The URLs the API puts in responses for private
assets expire after 300 seconds.

## Orphan files

Nothing reconciles the bucket with the `asset` table. An object that no row
references stays in the bucket. `wrangler r2 object delete` removes it.
