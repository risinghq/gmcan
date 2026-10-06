# Database

The API stores data in libSQL, which speaks the SQLite dialect. It reaches the
database through Kysely, with `@libsql/client` as the driver
([`db/client.ts`](../apps/api/db/client.ts)). The default is a local file,
`apps/api/data/gmcan.db`. Set `LIBSQL_URL` and `LIBSQL_AUTH_TOKEN` to use a
remote libSQL server ([configuration](configuration.md)).

## Startup

[`bootstrap()`](../apps/api/db/bootstrap.ts) runs before the server accepts
requests. What it does depends on `NODE_ENV`.

Outside production, it:

1. Turns on foreign keys.
2. Creates any missing table and index (`createTables` in
   [`db/ddl.ts`](../apps/api/db/ddl.ts)).
3. Compares the columns of every table with `EXPECTED_COLUMNS` in the same
   file. On any difference it prints the drift and exits with status 1.
4. Seeds sample data ([`db/seed.ts`](../apps/api/db/seed.ts)).
5. Deletes expired sessions, then repeats the cleanup every 6 hours.
6. Prints `[DB] Ready`.

In production, it creates no tables, runs no seed and does no drift check. It
only builds the news search index if it is missing. If that fails, the API logs
the error and keeps running, and news search fails until it is fixed. The
production database must already hold the schema.

## Reset the database

Stop the API, delete the file, start it again:

```sh
rm apps/api/data/gmcan.db*
bun run dev:api
```

Do this after the drift check fails. The tables use `CREATE TABLE IF NOT EXISTS`,
so a changed table definition never alters a database that already has the table.
There are no migrations.

The first start also copies the sample files from
[`apps/api/assets/seed-src`](../apps/api/assets/seed-src) into `.storage`. Seeding
takes a while on a slow disk; wait for `[DB] Ready`.

## Sample data

The seed fills lookup tables (genders, prefixes, roles, member, publication and
news kinds, currencies), the research group, its research lines, methods,
equipment and software, members, news, journals, universities, events, a
project and publications, then binds sample files to them. Last, it
quarantines unreferenced files in `apps/api/.storage`
([assets](assets.md#orphan-files)).

Every seeded member has the password `password123`. `admin@gmcan.dev` is the
administrator; seeded researchers and a visitor sign in the same way.

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
| Search       | `news_fts`, an FTS5 virtual table kept current by triggers. It is not in `schema.ts`; `ddl.ts` creates it.                        |

Dates are stored as text, either `YYYY-MM-DD` or an ISO 8601 timestamp. Flags
such as `member.isActive` are integers, 0 or 1.

## News search

`news_fts` indexes the title, summary, author name and kind name of each news
translation, one row per locale. Triggers on `news_translation`, `news`,
`member` and `news_kind_translation` keep it in step with edits.
`ensureNewsSearchIndex` creates the table and triggers if they are missing and
fills the index when the table is new.

[`lib/fts.ts`](../apps/api/lib/fts.ts) turns user input into a word-prefix
match. It quotes each word, so FTS5 operators in the input are plain text.
Matching ignores diacritics. Global search over publications, members and
projects uses `LIKE` instead; only news uses FTS5.
