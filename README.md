# GMCAN

The website of GMCAN, a research group at the Universidad Nacional Mayor de San
Marcos (UNMSM). It has a public site for the group's publications, news,
members, projects and research lines, and a password-protected dashboard where
members edit that content. Pages and content are in Spanish and English.

The repository is a Bun workspace with three packages:

| Package                                    | What it is                                                   |
| ------------------------------------------ | ------------------------------------------------------------ |
| [`apps/web`](apps/web)                     | Angular 22 app, served by a Cloudflare Worker                |
| [`apps/api`](apps/api)                     | Hono HTTP API, a Cloudflare Worker storing data in D1 and R2 |
| [`packages/contracts`](packages/contracts) | Zod schemas and types shared by the web app and the API      |

Both apps run on Cloudflare Workers, locally under `wrangler dev` and in
production. See [Deployment](docs/deployment.md).

## Run it

You need [Bun](https://bun.sh) 1.4.2 (`mise install` reads it from
[`mise.toml`](mise.toml)). No Cloudflare account is needed to run locally:
wrangler emulates D1 and R2 under `apps/api/.wrangler/state`.

```sh
bun install
cp apps/api/.dev.vars.example apps/api/.dev.vars
bun run --filter api migrate
SEED_PASSWORD=password123 bun run --filter api seed
bun run dev
```

`migrate` creates the tables in the local database and `seed` fills it with
sample content and files. Without `SEED_PASSWORD` the seed generates a password
and prints it. `bun run dev` starts the API on <http://localhost:3000> and the
web app on <http://localhost:4200>.

Open <http://localhost:4200>. To sign in to the dashboard, go to
<http://localhost:4200/login> with `admin@gmcan.dev` and the seed password.

You can also query the API directly:

```console
$ curl -s -H 'Accept-Language: en' 'http://localhost:3000/api/news?pageSize=1'
{"items":[{"id":56,"title":"Nanomaterials Design and Simulation: From overview to applications","summary":"Workshop about nanomaterials design and simulation.","publishedAt":"2021-01-23","asset":"http://localhost:3000/api/assets/4","priority":null,"authorId":1,"newsKindCode":"event","authorName":"Admin Dev","authorPhotoUrl":"http://localhost:3000/api/placeholders/member-photo","authorPhotoAlt":"Profile photo of Admin Dev","newsKindName":"Event"}],"total":3,"page":1,"pageSize":1}
```

## Features

- Public pages for publications, news, members, projects, research lines,
  methods, software and equipment, plus one search across publications, members,
  news and projects.
- Public content endpoints choose the language of translated text from the
  request's `Accept-Language` header (`es` or `en`). File and email endpoints
  return the same content in either language.
- A dashboard for members to write news, manage publications, projects and
  members, and edit the group's own pages.
- Three roles (administrator, researcher, visitor) with a fixed permission set
  each.
- File uploads for photos and PDFs. Each upload is a new version, and deleted
  files can be restored.
- Full-text news search backed by SQLite FTS5.
- Password reset and membership-request email through Resend once
  `RESEND_API_KEY` is set. Until then both answer `503 Email is not configured`.

## Documentation

- [Manual](docs/README.md): deployment, configuration, database, API,
  authorization, assets, localization.
- [Architecture](ARCHITECTURE.md): what each package and module owns.
- [Contributing](CONTRIBUTING.md): checks, tests and conventions.
