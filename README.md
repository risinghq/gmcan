# GMCAN

[![CI](https://github.com/risinghq/gmcan/actions/workflows/ci.yml/badge.svg)](https://github.com/risinghq/gmcan/actions/workflows/ci.yml)

The website of GMCAN, a research group at the Universidad Nacional Mayor de San
Marcos (UNMSM), live at <https://gmcan-web.empirical.workers.dev>. A public site
shows the group's publications, news, members, projects and research lines in
Spanish and English, and a dashboard lets members edit them. It runs as two
Cloudflare Workers: an Angular app and a Hono API on D1 and R2.

## Get started

You need [mise](https://mise.jdx.dev). No Cloudflare account is needed: wrangler
emulates the database and the file bucket locally.

```sh
mise install
bun run setup
bun run dev
```

Open <http://localhost:4200>. Sign in at <http://localhost:4200/login> as
`admin@gmcan.dev` with the password `bun run setup` printed.

```console
$ curl -s -H 'Accept-Language: en' 'http://localhost:3000/api/news?pageSize=1'
{"items":[{"id":60,"title":"Integration of Molecular Dynamics and Machine Learning with Electron Microscopy", ...}],"total":6,"page":1,"pageSize":1}
```

## Features

- Public pages for publications, news, members, projects, research lines,
  methods, software and equipment, rendered on the server and cached at the
  edge.
- One search across publications, members, news and projects, with full-text
  news search on SQLite FTS5.
- Content in Spanish and English, chosen by URL on the site and by
  `Accept-Language` in the API.
- A dashboard to write news and manage publications, projects, members and the
  group's own pages.
- Three roles, administrator, researcher and visitor, each with a fixed
  permission set.
- Photo and PDF uploads. Each upload is a new version, and deleted files can be
  restored.
- Password reset and membership-request email through Resend, once configured.

## Documentation

- [Manual](docs/README.md): development, deploy, configuration and every
  subsystem.
- [Architecture](docs/architecture.md): the path of a request through the code.
- [Contributing](.github/CONTRIBUTING.md): checks, tests and where changes go.
