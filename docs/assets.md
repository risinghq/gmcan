# Assets

Assets are the uploaded photos and PDFs. They live on disk under
`apps/api/.storage`, relative to the directory the API starts in. The database
records each file in the `asset` table and binds it to the record that shows
it.

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

An upload stores the file as `<uuid-v7>.<ext>` in `.storage`, inserts an `asset`
row, and inserts a binding with the next `version` number for that owner and
slot. The binding with the highest version is the current file. The previous
file's asset is marked `soft_deleted` and stamped with a `deleteAfter` date 90
days ahead. Nothing in the API deletes files at that date.

Every upload, replace, delete and restore adds a row to `asset_audit`.

A soft-deleted asset is no longer served: its URL answers `404`.
The API answers `400` for an unsupported slot or file type, `404` when the owner
does not exist.

## Serving files

Responses carry file URLs built from `BACKEND_URL`
([configuration](configuration.md)). A slot's file is returned as a URL string,
or `null` when the slot is empty or soft-deleted. Publication files are returned
as `{ "inline": ..., "download": ... }` instead. A member with no photo gets
`/api/placeholders/member-photo`.

| Endpoint                       | Response                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| `GET /api/assets/:id`          | The file, with `Cache-Control: public, max-age=31536000, immutable` |
| `GET /api/assets/:id/download` | The file with `Content-Disposition: attachment`                     |

### Private files

An asset's `visibility` is `public` or `private`. Uploads through the API are
always `public`. A `private` asset is served only with `?expires=<unix seconds>&token=<hex>`,
where `token` is the HMAC-SHA256 of `<id>:<expires>` keyed with
`ASSET_SIGNING_SECRET`. The URLs the API puts in responses for private assets
expire after 300 seconds.

## Orphan files

At each start outside production, after seeding, the API moves every file in
`.storage` that no binding references into `.storage/.quarantine` and appends
`<time>\t<file>\t<reason>` to `.quarantine/report.tsv`. Files whose names begin
with a dot are skipped. Put new files in through the upload endpoint, not by
copying them into `.storage`.
