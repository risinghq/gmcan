# Database

The API stores data in Cloudflare D1, which speaks the SQLite dialect. It
reaches the database through Kysely with a small D1 dialect
([`db/d1.ts`](../apps/api/db/d1.ts),
[`db/client.ts`](../apps/api/db/client.ts)). The binding is `DB` in
[`wrangler.jsonc`](../apps/api/wrangler.jsonc). Locally, `wrangler dev` emulates
D1 in `apps/api/.wrangler/state`.

## Migrations

The schema is the SQL files in [`apps/api/migrations`](../apps/api/migrations),
applied in order and recorded by wrangler:

```sh
bun run --filter api migrate          # the local database
bun run --filter api migrate:remote   # the deployed database
```

To change the schema, add the next numbered file (`0002_<name>.sql`) and update
the matching interface in [`db/schema.ts`](../apps/api/db/schema.ts), which only
types the queries. Edit no applied migration. While the data is disposable, you
can instead delete `apps/api/.wrangler/state` and migrate again.

## Transactions

D1 has no interactive transactions, so `db.transaction()` throws. Write a
multi-statement change as one batch with `atomic()` from
[`db/client.ts`](../apps/api/db/client.ts): the queries run in order in one
implicit transaction, and any failure rolls all of them back. A statement that
needs the id of a row inserted earlier in the batch uses `lastInsertId(table)`,
and the caller reads ids back with `insertedId(results, index)`. A batch cannot
branch on an earlier result, so decide in code before building it.

D1 allows 100 bound parameters per statement. Insert many rows with
[`insertInChunks`](../apps/api/db/seed/chunks.ts).

## Sample data

The seed fills lookup tables (genders, prefixes, roles, member, publication and
news kinds, currencies), the research group, its research lines, methods,
equipment and software, members, news, journals, universities, events, a project
and publications, then uploads sample files to R2 and binds them
([assets](assets.md)).

```sh
SEED_PASSWORD=password123 bun run --filter api seed          # local
SEED_PASSWORD=<password> bun run --filter api seed:remote    # the deployed database and bucket
```

Every seeded member gets the password in `SEED_PASSWORD`, or a generated one the
seed prints. `admin@gmcan.dev` is the administrator; seeded researchers and a
visitor sign in the same way. Run the seed on a migrated, empty database. For
`seed:remote` the data and files are built locally, then pushed with
`wrangler d1 execute --remote` and `wrangler r2 object put --remote`.

## Tables

[`db/schema.ts`](../apps/api/db/schema.ts) declares one TypeScript interface per
table, and the `Database` interface that Kysely uses to type queries. Groups:

| Group        | Tables                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Lookups      | `locale`, `gender`, `prefix`, `role`, `member_type`, `publication_kind`, `news_kind`, `thesis_kind`, `currency`, `funding_source` |
| Content      | `news`, `publication`, `journal_article`, `conference_paper`, `thesis`, `project`, `event`, `journal`, `university`               |
| Group pages  | `research_group`, `research_line`, `method`, `equipment`, `software`, `about`                                                     |
| People       | `member`, `session`, and the links `member_group`, `project_member`, `publication_author`                                         |
| Files        | `asset`, `asset_audit` and one `<owner>_asset` binding table per owner type                                                       |
| Translations | `<table>_translation` for each table with localized text                                                                          |
| Search       | `news_fts`, an FTS5 virtual table kept current by triggers. It is not in `schema.ts`; the first migration creates it.             |

Dates are stored as text, either `YYYY-MM-DD` or an ISO 8601 timestamp. Flags
such as `member.isActive` are integers, 0 or 1.

## News search

`news_fts` indexes the title, summary, author name and kind name of each news
translation, one row per locale. Triggers on `news_translation`, `news`,
`member` and `news_kind_translation` keep it in step with edits.

[`lib/fts.ts`](../apps/api/lib/fts.ts) turns user input into a word-prefix
match. It quotes each word, so FTS5 operators in the input are plain text.
Matching ignores diacritics. Global search over publications, members and
projects uses `LIKE` instead; only news uses FTS5.
