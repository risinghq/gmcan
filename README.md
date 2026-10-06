# GMCAN

The website of GMCAN, a research group at the Universidad Nacional Mayor de San
Marcos (UNMSM). It has a public site for the group's publications, news,
members, projects and research lines, and a password-protected dashboard where
members edit that content. Pages and content are in Spanish and English.

The repository is a Bun workspace with three packages:

| Package                                    | What it is                                              |
| ------------------------------------------ | ------------------------------------------------------- |
| [`apps/web`](apps/web)                     | Angular 22 app, server-side rendered, served on `:4200` |
| [`apps/api`](apps/api)                     | Hono HTTP API on `:3000`, storing data in libSQL        |
| [`packages/contracts`](packages/contracts) | Zod schemas and types shared by the web app and the API |

## Run it

You need [Bun](https://bun.sh) 1.4.2 (`mise install` reads it from
[`mise.toml`](mise.toml)).

```sh
bun install
cp .env.example .env
```

Edit `.env` before the first start. The API refuses to start with an invalid
file, and the shipped template is invalid:

- Set `ASSET_SIGNING_SECRET` to any non-empty string.
- Set `RESEND_API_KEY` to any non-empty string. Only the contact form and the
  password reset email need a real Resend key.
- Delete the `INSTITUTIONAL_EMAIL=` line, or set it to an address.

Then start both apps:

```sh
bun run dev
```

The first start creates `apps/api/data/gmcan.db` and fills it with sample
content. Startup is complete when the API prints `[DB] Ready`.

Open <http://localhost:4200>. To sign in to the dashboard, go to
<http://localhost:4200/login> with `admin@gmcan.dev` and `password123`.

You can also query the API directly:

```console
$ curl -s -H 'Accept-Language: en' 'http://localhost:3000/api/news?pageSize=1'
{"items":[{"id":56,"title":"Nanomaterials Design and Simulation: From overview to applications","summary":"Workshop about nanomaterials design and simulation.","publishedAt":"2021-01-23","asset":"http://localhost:3000/api/assets/4","priority":null,"authorId":1,"newsKindCode":"event","authorName":"Admin Dev","authorPhotoUrl":"http://localhost:3000/api/placeholders/member-photo","authorPhotoAlt":"Profile photo of Admin Dev","newsKindName":"Event"}],"total":3,"page":1,"pageSize":1}
```

## Features

- Public pages for publications, news, members, projects, research lines,
  methods, software and equipment, plus one search across publications, members,
  news and projects.
- Every public response follows the request's `Accept-Language` header
  (`es` or `en`).
- A dashboard for members to write news, manage publications, projects and
  members, and edit the group's own pages.
- Three roles (administrator, researcher, visitor) with a fixed permission set
  each.
- File uploads for photos and PDFs. Each upload is a new version, and deleted
  files can be restored.
- Full-text news search backed by SQLite FTS5.
- Password reset and membership-request email through Resend.

## Documentation

- [Manual](docs/README.md): configuration, database, API, authorization,
  assets, localization.
- [Architecture](ARCHITECTURE.md): what each package and module owns.
- [Contributing](CONTRIBUTING.md): checks, tests and conventions.
